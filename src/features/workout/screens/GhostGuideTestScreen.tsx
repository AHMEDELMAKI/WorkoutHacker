import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  SafeAreaView,
} from 'react-native-safe-area-context';
import {
  GhostGuideCore,
  ProcessResult,
} from '../../../lib/ghostGuide';
import { callback } from 'react-native-nitro-modules';
import { PoseLandmarksView } from 'react-native-pose-landmarks';
import Svg, { Circle, Line } from 'react-native-svg';

import AppText from '../../../components/AppText';
import AppButton from '../../../components/AppButton';
import { WT } from '../../../theme/workoutTheme';
import { useAiPipeline } from '../../../hooks/useAiPipeline';
import { useIMUPackets } from '@workout-hacker/esp-connection';
import { WiFiSensorService } from '@workout-hacker/esp-connection';
import { useAiStore } from '../../../store/aiStore';
import { useWorkoutStore } from '../../../store/workoutStore';

import bicepCurlFrames from '../../../assets/ghost-guide/bicep_curl_frames.json';
import shoulderPressFrames from '../../../assets/ghost-guide/shoulder_press_frames.json';
import frontRaiseFrames from '../../../assets/ghost-guide/front_raise_frames.json';
import lateralRaiseFrames from '../../../assets/ghost-guide/lateral_raise_frames.json';
import tricepsExtensionFrames from '../../../assets/ghost-guide/triceps_extension_frames.json';

const EXERCISES = {
  bicep_curl: {
    label: 'Bicep Curl',
    frames: bicepCurlFrames,
  },
  shoulder_press: {
    label: 'Shoulder Press',
    frames: shoulderPressFrames,
  },
  front_raise: {
    label: 'Front Raise',
    frames: frontRaiseFrames,
  },
  lateral_raise: {
    label: 'Lateral Raise',
    frames: lateralRaiseFrames,
  },
  triceps_extension: {
    label: 'Triceps Extension',
    frames: tricepsExtensionFrames,
  },
} as const;

type GhostPoint = { x: number; y: number; visibility?: number } | null;

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function normalizeGhostPointsToLandmarkIndex(points: any): GhostPoint[] | null {
  if (!points) return null;

  const normalizePt = (p: any): GhostPoint => {
    if (!p) return null;
    if (typeof p.x === 'number' && typeof p.y === 'number') {
      const v = typeof p.visibility === 'number' ? p.visibility : undefined;
      return { x: clamp01(p.x), y: clamp01(p.y), visibility: v };
    }
    if (Array.isArray(p) && p.length >= 2) {
      const x = Number(p[0]);
      const y = Number(p[1]);
      const v = p.length >= 3 ? Number(p[2]) : undefined;
      if (Number.isFinite(x) && Number.isFinite(y)) {
        return { x: clamp01(x), y: clamp01(y), visibility: v };
      }
    }
    return null;
  };

  if (Array.isArray(points)) {
    const out: GhostPoint[] = new Array(33).fill(null);
    if (points.length === 33) {
      for (let i = 0; i < 33; i++) {
        out[i] = normalizePt(points[i]);
      }
      return out;
    }
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const idx =
        typeof p?.index === 'number'
          ? p.index
          : typeof p?.id === 'number'
            ? p.id
            : typeof p?.landmarkId === 'number'
              ? p.landmarkId
              : null;

      if (typeof idx === 'number' && idx >= 0 && idx < 33) {
        out[idx] = normalizePt(p);
      }
    }
    if (out.some(Boolean)) return out;
    for (let i = 0; i < Math.min(points.length, 33); i++) {
      out[i] = normalizePt(points[i]);
    }
    return out;
  }

  if (typeof points === 'object') {
    const out: GhostPoint[] = new Array(33).fill(null);
    for (const [k, v] of Object.entries(points)) {
      const idx = Number(k);
      if (Number.isNaN(idx) || idx < 0 || idx >= 33) continue;
      out[idx] = normalizePt(v);
    }
    return out;
  }
  return null;
}

const GhostGuideTestScreen: React.FC = () => {
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [exerciseKey, setExerciseKey] = useState<keyof typeof EXERCISES>(
    'bicep_curl'
  );
  const [showExerciseDropdown, setShowExerciseDropdown] = useState(false);
  const [cameraRect, setCameraRect] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const exerciseConfig = useMemo(() => EXERCISES[exerciseKey], [exerciseKey]);
  const totalFrames = exerciseConfig.frames.length;

  const [isPlaying, setIsPlaying] = useState(false);
  const applyGhostPoseRef = useRef(false);

  const [currentFrameIndex, _setCurrentFrameIndex] = useState(0);
  const currentFrameRef = useRef(currentFrameIndex);

  const setCurrentFrameIndex = useCallback((value: any) => {
    const newVal =
      typeof value === 'function' ? value(currentFrameRef.current) : value;
    const clamped = Math.max(0, Math.min(totalFrames - 1, Math.round(newVal)));
    currentFrameRef.current = clamped;
    _setCurrentFrameIndex(clamped);
  }, [totalFrames]);

  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const playbackInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const landmarksBufferRef = useRef<number[]>([]);
  const poseLandmarksRef = useRef<any>(null);

  // AI Pipeline & ESP IMU Integration
  const { feedIMU } = useAiPipeline();

  useIMUPackets((packet: any) => {
    feedIMU(packet);
  });

  const imuClassification = useAiStore(s => s.imuClassification);

  // Sync exercise selection to workout store so predictIMUForm can pick it up
  useEffect(() => {
    useWorkoutStore.getState().startExercise(exerciseConfig.label);
  }, [exerciseKey]);

  // Auto-connect ESP on mount, cleanup on unmount
  useEffect(() => {
    WiFiSensorService.configure({ baseUrl: 'http://192.168.4.1', pollIntervalMs: 50 });
    WiFiSensorService.start();
    return () => {
      if (WiFiSensorService.isRunning()) {
        WiFiSensorService.stop();
      }
    };
  }, []);

  useEffect(() => {
    try {
      const reference = GhostGuideCore.createReferenceFromFrames(
        exerciseConfig.frames,
        exerciseKey
      );
      GhostGuideCore.loadReference(reference);
      currentFrameRef.current = 0;
      _setCurrentFrameIndex(0);
      applyGhostPoseRef.current = true;
    } catch (e) {
      console.error('Reference load error:', e);
    }
  }, [exerciseConfig.frames, exerciseKey, totalFrames]);

  useEffect(() => {
    const interval = setInterval(() => {
      const ref = poseLandmarksRef.current;
      if (!ref) return;
      const buffer = ref.getLandmarksBuffer();
      if (buffer && buffer.length === 33 * 4) {
        landmarksBufferRef.current = buffer;
        try {
          const res = GhostGuideCore.processLandmarksBufferWithReference(
            buffer,
            exerciseConfig.frames,
            {
              applyReferencePose: applyGhostPoseRef.current,
              frameIndex: currentFrameRef.current,
            }
          );
          if (!res) return;
          setResult(res);
        } catch (e) {
          console.error('Process frame error:', e);
        }
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [exerciseConfig.frames]);

  const startPlayback = () => {
    if (playbackInterval.current) return;
    setIsPlaying(true);
    applyGhostPoseRef.current = true;
    playbackInterval.current = setInterval(() => {
      const next = currentFrameRef.current + 1;
      if (next >= totalFrames) {
        currentFrameRef.current = 0;
        _setCurrentFrameIndex(0);
      } else {
        currentFrameRef.current = next;
        _setCurrentFrameIndex(next);
      }
    }, (1000 / 30) / playbackSpeed);
  };

  const stopPlayback = () => {
    if (playbackInterval.current) {
      clearInterval(playbackInterval.current);
      playbackInterval.current = null;
    }
    setIsPlaying(false);
  };

  const resetPlayback = () => {
    stopPlayback();
    currentFrameRef.current = 0;
    _setCurrentFrameIndex(0);
    applyGhostPoseRef.current = false;
  };

  useEffect(() => {
    return () => {
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current);
      }
    };
  }, []);

  const ghostPointsForRender = result?.ghostSkeleton?.points ?? null;
  const ghostLandmarks = useMemo(() => {
    return normalizeGhostPointsToLandmarkIndex(ghostPointsForRender);
  }, [ghostPointsForRender]);

  const ghostUpperBodyIndices = new Set([11, 12, 13, 14, 15, 16, 23, 24]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={WT.colors.header} />
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <AppText variant="h2" color={WT.colors.textLight} style={styles.headerTitle}>
              Ghost Guide
            </AppText>
            <AppText variant="body" color="rgba(255,255,255,0.80)">
              Reference pose alignment test
            </AppText>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.body}>
        <View
          style={styles.cameraContainer}
          onLayout={e => {
            const { x, y, width, height } = e.nativeEvent.layout;
            setCameraRect({ x, y, w: width, h: height });
          }}
        >
          <PoseLandmarksView
            hybridRef={callback((ref: any) => { poseLandmarksRef.current = ref; })}
            style={StyleSheet.absoluteFill}
            isActive={true}
            enableSkeleton={true}
            skeletonColor={WT.colors.primary}
            skeletonBoneThickness={3}
            landmarkColor={WT.colors.warning}
            minVisibilityConfidence={0.5}
            modelSelection={0}
            delegateSelection={0}
            inferenceSampleRateHz={15}
            enableVisibilityRecovery={true}
            enableOneEuroFilter={true}
            enableMotionPrediction={true}
            oneEuroMinCutoff={1}
            oneEuroBeta={0.5}
            width={Dimensions.get('window').width - WT.spacing.lg * 2}
            height={320}
          />
        </View>

        {cameraRect.w > 0 && (
          <Svg
            width={cameraRect.w}
            height={cameraRect.h}
            viewBox="0 0 1 1"
            style={[
              styles.ghostRootOverlay,
              {
                top: cameraRect.y,
                left: cameraRect.x,
                width: cameraRect.w,
                height: cameraRect.h,
              },
            ]}
            pointerEvents="none"
          >
            {ghostLandmarks && (
              <>
                {[
                  [11, 13], [13, 15], [12, 14], [14, 16],
                  [11, 12], [11, 23], [12, 24], [23, 24],
                ].map(([i, j], idx) => {
                  const p1 = ghostLandmarks[i];
                  const p2 = ghostLandmarks[j];
                  if (!ghostUpperBodyIndices.has(i) || !ghostUpperBodyIndices.has(j)) return null;
                  if (!p1 || !p2) return null;
                  return (
                    <Line
                      key={`ghost-conn-${idx}`}
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="rgba(255, 101, 132, 0.85)"
                      strokeWidth="0.03"
                    />
                  );
                })}

                {ghostLandmarks
                  .map((p, i) => ({ p, i }))
                  .filter(({ p, i }) => ghostUpperBodyIndices.has(i) && !!p)
                  .map(({ p, i }) => {
                    if (!p) return null;
                    return (
                      <Circle
                        key={`ghost-lm-${i}`}
                        cx={p.x}
                        cy={p.y}
                        r="0.025"
                        fill="rgba(255, 101, 132, 0.7)"
                      />
                    );
                  })}
              </>
            )}
          </Svg>
        )}

        <ScrollView
          style={styles.infoOverlay}
          contentContainerStyle={styles.infoContent}
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.card}>
          <View style={styles.dropdownSection}>
            <AppText variant="caption" style={styles.sectionLabel}>EXERCISE</AppText>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => setShowExerciseDropdown(!showExerciseDropdown)}
            >
              <AppText variant="body" bold color={WT.colors.primary}>
                {exerciseConfig.label}
              </AppText>
              <AppText variant="body" color={WT.colors.primary}>
                {showExerciseDropdown ? '▲' : '▼'}
              </AppText>
            </TouchableOpacity>
            {showExerciseDropdown && (
              <View style={styles.dropdownList}>
                {Object.entries(EXERCISES).map(([key, config]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.dropdownOption,
                      exerciseKey === key && styles.dropdownOptionActive,
                    ]}
                    onPress={() => {
                      setExerciseKey(key as keyof typeof EXERCISES)
                      setShowExerciseDropdown(false)
                    }}
                  >
                    <AppText style={[
                      styles.dropdownOptionText,
                      exerciseKey === key && styles.dropdownOptionTextActive,
                    ]}>
                      {config.label}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.playbackSection}>
            <AppText variant="caption" style={styles.sectionLabel}>PLAYBACK CONTROLS</AppText>
            <View style={styles.buttonRow}>
              <AppButton
                title="Reset"
                onPress={resetPlayback}
                variant="outline"
                style={styles.actionButton}
              />
              <AppButton
                title={isPlaying ? "Stop" : "Play"}
                onPress={isPlaying ? stopPlayback : startPlayback}
                variant={isPlaying ? "danger" : "primary"}
                style={styles.actionButton}
              />
              <AppButton
                title={`${playbackSpeed}x`}
                onPress={() => setPlaybackSpeed(s => s === 1 ? 2 : s === 2 ? 0.5 : 1)}
                variant="outline"
                style={styles.actionButton}
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.formSection}>
            <AppText variant="caption" style={styles.sectionLabel}>FORM</AppText>
            <AppText variant="h1" color={
              imuClassification === 'Good' ? WT.colors.success
                : imuClassification ? WT.colors.warning
                : WT.colors.textMuted
            }>
              {imuClassification || '--'}
            </AppText>
          </View>
        </View>
      </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: WT.colors.background,
  },
  header: {
    backgroundColor: WT.colors.header,
    borderBottomLeftRadius: WT.radius.lg,
    borderBottomRightRadius: WT.radius.lg,
    paddingHorizontal: WT.spacing.lg,
    paddingBottom: WT.spacing.lg,
    ...WT.shadow.card,
    zIndex: 10,
  },
  headerInner: {
    paddingTop: WT.spacing.md,
  },
  headerTitle: {
    fontWeight: '800',
    marginBottom: 4,
  },
  body: {
    flex: 1,
  },
  cameraContainer: {
    width: Dimensions.get('window').width - WT.spacing.lg * 2,
    height: 320,
    alignSelf: 'center',
    backgroundColor: '#000',
    marginTop: WT.spacing.md,
    borderRadius: WT.radius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: WT.colors.cardBorder,
  },
  ghostRootOverlay: {
    position: 'absolute',
    zIndex: 100,
    elevation: 100,
  },
  infoOverlay: {
    maxHeight: '55%',
  },
  infoContent: {
    padding: WT.spacing.lg,
    paddingTop: 0,
  },
  card: {
    backgroundColor: WT.colors.card,
    borderRadius: WT.radius.md,
    padding: WT.spacing.lg,
    ...WT.shadow.card,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
  },
  sectionLabel: {
    fontWeight: '700',
    color: WT.colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: WT.colors.cardBorder,
    marginVertical: WT.spacing.md,
    opacity: 0.5,
  },
  dropdownSection: {
    zIndex: 100,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: WT.colors.card,
    paddingVertical: WT.spacing.sm,
    paddingHorizontal: WT.spacing.md,
    borderRadius: WT.radius.sm,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
  },
  dropdownList: {
    backgroundColor: WT.colors.card,
    borderRadius: WT.radius.sm,
    marginTop: 4,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    ...WT.shadow.card,
  },
  dropdownOption: {
    padding: WT.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: WT.colors.cardBorder,
  },
  dropdownOptionActive: {
    backgroundColor: WT.colors.cardBorder + '33',
  },
  dropdownOptionText: {
    fontSize: 15,
    color: WT.colors.textDark,
  },
  dropdownOptionTextActive: {
    color: WT.colors.primary,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: WT.spacing.sm,
    marginTop: WT.spacing.sm,
  },
  actionButton: {
    flex: 1,
    height: 44,
    paddingHorizontal: 6,
  },
  playbackSection: {
    marginBottom: WT.spacing.sm,
  },
  formSection: {
    alignItems: 'center',
    paddingVertical: WT.spacing.md,
  },
});

export default GhostGuideTestScreen;