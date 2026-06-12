import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  GhostGuideCore,
  ProcessResult,
} from 'react-native-ghost-guide';
import { PoseLandmarks } from 'react-native-pose-landmarks';
import Svg, { Circle, Line } from 'react-native-svg';

import AppText from '../../../components/AppText';
import AppButton from '../../../components/AppButton';
import { WT } from '../../../theme/workoutTheme';

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
  const insets = useSafeAreaInsets();
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [repCount, setRepCount] = useState(0);
  const [checkpoint, setCheckpoint] = useState(0);
  const [isAligned, setIsAligned] = useState(false);
  const [status, setStatus] = useState('Initializing...');
  const [exerciseKey, setExerciseKey] = useState<keyof typeof EXERCISES>(
    'bicep_curl'
  );
  const [showExerciseDropdown, setShowExerciseDropdown] = useState(false);

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

  useEffect(() => {
    try {
      const reference = GhostGuideCore.createReferenceFromFrames(
        exerciseConfig.frames,
        exerciseKey
      );
      GhostGuideCore.loadReference(reference);
      setStatus(`Reference loaded: ${totalFrames} frames`);
      currentFrameRef.current = 0;
      _setCurrentFrameIndex(0);
      applyGhostPoseRef.current = false;
    } catch (e) {
      setStatus(`Error: ${e}`);
    }
  }, [exerciseConfig.frames, exerciseKey, totalFrames]);

  useEffect(() => {
    const initialized = PoseLandmarks.initPoseLandmarker();
    if (initialized) {
      setStatus('Pose detection initialized');
    }

    const interval = setInterval(() => {
      const buffer = PoseLandmarks.getLandmarksBuffer();
      if (buffer.length === 33 * 4) {
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
          setRepCount(res.repCount);
          setCheckpoint(res.currentCheckpointIndex);
          setIsAligned(res.isAligned);
        } catch (e) {
          console.error('Process frame error:', e);
        }
      }
    }, 100);

    return () => {
      clearInterval(interval);
      PoseLandmarks.closePoseLandmarker();
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

  const handleSliderChange = (value: number) => {
    stopPlayback();
    setCurrentFrameIndex(value);
    applyGhostPoseRef.current = true;
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={WT.colors.header} />
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <AppText variant="h2" color={WT.colors.textLight} style={styles.headerTitle}>
              Ghost Guide 👻
            </AppText>
            <AppText variant="body" color="rgba(255,255,255,0.80)">
              Reference pose alignment test
            </AppText>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.skeletonContainer}>
        <Svg width="100%" height="100%" viewBox="0 0 1 1">
           {landmarksBufferRef.current.length === 33 * 4 && (
             <>
               {[
                 [11,13],[13,15],[12,14],[14,16],
                 [11,12],[23,24],
                 [11,23],[12,24],
               ].map(([i, j], idx) => {
                  const x1 = landmarksBufferRef.current[i * 4];
                  const y1 = landmarksBufferRef.current[i * 4 + 1];
                  const x2 = landmarksBufferRef.current[j * 4];
                  const y2 = landmarksBufferRef.current[j * 4 + 1];
                  const vis1 = landmarksBufferRef.current[i * 4 + 3];
                  const vis2 = landmarksBufferRef.current[j * 4 + 3];
                 if (vis1 < 0.5 || vis2 < 0.5) return null;
                 return (
                   <Line
                     key={`live-conn-${idx}`}
                     x1={x1}
                     y1={y1}
                     x2={x2}
                     y2={y2}
                     stroke={isAligned ? WT.colors.success : WT.colors.primary}
                     strokeWidth="0.005"
                   />
                 );
               })}
               {Array.from({ length: 33 }, (_, i) => {
                  const x = landmarksBufferRef.current[i * 4];
                  const y = landmarksBufferRef.current[i * 4 + 1];
                  const vis = landmarksBufferRef.current[i * 4 + 3];
                 if (vis < 0.5) return null;
                 return (
                   <Circle
                     key={`live-lm-${i}`}
                     cx={x}
                     cy={y}
                     r="0.01"
                     fill={i >= 11 && i <= 16 ? WT.colors.primary : WT.colors.warning}
                   />
                 );
               })}
             </>
           )}

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
                  if (typeof p1.visibility === 'number' && p1.visibility < 0.5) return null;
                  if (typeof p2.visibility === 'number' && p2.visibility < 0.5) return null;
                  return (
                    <Line
                      key={`ghost-conn-${idx}`}
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke="rgba(255, 101, 132, 0.8)"
                      strokeWidth="0.012"
                    />
                  );
                })}

                {ghostLandmarks
                  .map((p, i) => ({ p, i }))
                  .filter(({ p, i }) => ghostUpperBodyIndices.has(i) && !!p)
                  .map(({ p, i }) => {
                    if (!p) return null;
                    if (typeof p.visibility === 'number' && p.visibility < 0.5) return null;
                    return (
                      <Circle
                        key={`ghost-lm-${i}`}
                        cx={p.x}
                        cy={p.y}
                        r="0.02"
                        fill="rgba(255, 101, 132, 0.6)"
                      />
                    );
                  })}
              </>
            )}
         </Svg>
      </View>

      <ScrollView
        style={styles.infoOverlay}
        contentContainerStyle={styles.infoContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <AppText variant="caption" style={styles.sectionLabel}>STATUS</AppText>
          <AppText variant="bodySmall" color={WT.colors.textDark}>{status}</AppText>
          
          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <AppText variant="caption" color={WT.colors.textMuted}>Reps</AppText>
              <AppText variant="h3" color={WT.colors.textDark}>{repCount}</AppText>
            </View>
            <View style={styles.statItem}>
              <AppText variant="caption" color={WT.colors.textMuted}>Checkpoint</AppText>
              <AppText variant="h3" color={WT.colors.textDark}>{checkpoint}</AppText>
            </View>
            <View style={styles.statItem}>
              <AppText variant="caption" color={WT.colors.textMuted}>Aligned</AppText>
              <AppText variant="h3" color={isAligned ? WT.colors.success : WT.colors.danger}>
                {isAligned ? 'YES' : 'NO'}
              </AppText>
            </View>
          </View>

          <View style={styles.divider} />

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

            <View style={styles.sliderSection}>
              <View style={styles.sliderHeader}>
                <AppText variant="caption" color={WT.colors.textMuted}>Frame Progress</AppText>
                <AppText variant="caption" color={WT.colors.textMuted}>
                  {currentFrameRef.current + 1} / {totalFrames}
                </AppText>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={Math.max(0, totalFrames - 1)}
                value={currentFrameRef.current}
                onValueChange={handleSliderChange}
                step={1}
                minimumTrackTintColor={WT.colors.primary}
                maximumTrackTintColor={WT.colors.cardBorder}
                thumbTintColor={WT.colors.primary}
              />
            </View>
          </View>
        </View>
      </ScrollView>
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
  skeletonContainer: {
    flex: 1,
    backgroundColor: '#000',
    margin: WT.spacing.md,
    borderRadius: WT.radius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: WT.colors.cardBorder,
  },
  infoOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
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
  },
  sliderSection: {
    marginTop: WT.spacing.md,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});

export default GhostGuideTestScreen;