import React, { useEffect, useRef, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

const VCamera = Camera as any;

import { subscribeVoiceAction } from '../../../services/voiceActionBus';
import { speak } from '../../../services/ttsService';
import { useWorkoutStore } from '../../../store/workoutStore';
import { useAiStore } from '../../../store/aiStore';
import { useAiPipeline } from '../../../hooks/useAiPipeline';
import { useFocusEffect } from '@react-navigation/native';
import {
  Alert,
  Animated,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { WorkoutStackParamList } from '../../../navigation/types';
import { WT } from '../../../theme/workoutTheme';
import PrimaryWorkoutButton from '../components/PrimaryWorkoutButton';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'Tracking'>;

const TrackingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { exercise } = route.params;

  // Zustand Stores
  const isActive = useWorkoutStore(s => s.isActive);
  const startWorkout = useWorkoutStore(s => s.startWorkout);
  const completeWorkout = useWorkoutStore(s => s.completeWorkout);
  const tick = useWorkoutStore(s => s.tick);
  const elapsedSeconds = useWorkoutStore(s => s.elapsedSeconds);
  const caloriesBurned = useWorkoutStore(s => s.caloriesBurned);

  // AI Store access
  const resetAi = useAiStore(s => s.reset);
  const landmarks = useAiStore(s => s.landmarks);
  const ghostSkeleton = useAiStore(s => s.guideOverlay);
  const deviationScore = useAiStore(s => s.deviationScore);
  const detectedExercise = useAiStore(s => s.detectedExercise);

  const [isPaused, setIsPaused] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // AI Pipeline Hook
  const { frameProcessor } = useAiPipeline();
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();

  // On mount: prepare session
  useEffect(() => {
    startPulse();
    const timer = setInterval(() => {
      if (!isPaused && !isCalibrating) tick();
    }, 1000);

    return () => {
      clearInterval(timer);
      resetAi();
    };
  }, [exercise]);

  // Handle Calibration -> Start
  useEffect(() => {
    if (isCalibrating && cameraEnabled && landmarks && deviationScore < 0.15) {
      // User is aligned, start workout
      const startSession = async () => {
        setIsCalibrating(false);
        await startWorkout(exercise.targetMuscles[0] || 'GENERAL', exercise.name);
        void speak('Calibration complete. Starting workout.');
      };
      startSession();
    }
  }, [landmarks, deviationScore, isCalibrating, cameraEnabled]);

  // Handle voice actions
  useEffect(() => {
    const unsubscribe = subscribeVoiceAction((action) => {
      if (action === 'end_workout') {
        void speak('Ending workout');
        void endWorkout();
      }
      if (action === 'start_workout' && isPaused) {
        void speak('Resuming workout');
        togglePause();
      }
    });
    return unsubscribe;
  }, [isPaused]);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  };

  const togglePause = () => setIsPaused(!isPaused);

  const endWorkout = async () => {
    const { formScore, fatigueLevel } = useAiStore.getState();
    try {
      await completeWorkout({
        formScore,
        fatigue: fatigueLevel,
      });
      navigation.navigate('WorkoutComplete', { workoutType: exercise.targetMuscles });
    } catch (error) {
      console.error('[TrackingScreen] Failed to complete workout:', error);
      Alert.alert('Error', 'Failed to save workout session. Please try again.');
    }
  };

  const toggleCamera = async () => {
    if (cameraEnabled) {
      setCameraEnabled(false);
      return;
    }
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert('Permission Denied', 'Camera access is required for AI tracking.');
        return;
      }
    }
    setCameraEnabled(true);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1A0E2A" />
      <SafeAreaView edges={['top']} style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.cameraBox}>
            {cameraEnabled && device ? (
              <View style={styles.cameraInnerContainer}>
                <VCamera
                  style={StyleSheet.absoluteFill}
                  device={device}
                  isActive={!isPaused}
                  frameProcessor={frameProcessor}
                />
                
                {/* Calibration Overlay */}
                {isCalibrating && (
                  <View style={styles.calibrationOverlay}>
                    <Ionicons name="scan-outline" size={80} color={deviationScore < 0.2 ? '#69C36D' : '#FFF'} />
                    <Text style={styles.calibrationText}>
                      {deviationScore < 0.2 ? 'Hold position...' : 'Align your body with the camera'}
                    </Text>
                  </View>
                )}

                {/* Ghost Skeleton Overlay */}
                {ghostSkeleton && !isPaused && (
                  <View style={styles.ghostContainer} pointerEvents="none">
                    <Svg width="100%" height="100%" viewBox="0 0 1 1">
                      {ghostSkeleton.map((p, i) => {
                        if (!p || (p as any).visibility < 0.5) return null;
                        return (
                          <Circle
                            key={i}
                            cx={(p as any).x}
                            cy={(p as any).y}
                            r="0.015"
                            fill="rgba(255, 255, 255, 0.4)"
                          />
                        );
                      })}
                    </Svg>
                  </View>
                )}

                <View style={styles.metricsOverlay} pointerEvents="none">
                  <OverlayMetric label="Reps" selector={s => s.reps} />
                  <OverlayMetric label="Form" selector={s => s.formScore} suffix="%" />
                  <OverlayMetric label="Fatigue" selector={s => s.fatigueLevel} />
                  <OverlayMetric label="Type" selector={s => (s.detectedExercise || 'Detecting...').replace('_', ' ')} />
                </View>

                <TouchableOpacity
                  style={styles.floatingCameraButton}
                  onPress={toggleCamera}
                >
                  <Ionicons name="camera-reverse" size={16} color="white" />
                  <Text style={styles.floatingButtonText}>Turn Off Camera</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.placeholderInner}>
                <Animated.View style={[styles.cameraInner, { transform: [{ scale: pulseAnim }] }]}>
                  <Ionicons
                    name="body-outline"
                    size={56}
                    color={isPaused ? '#888' : 'rgba(255,255,255,0.7)'}
                  />
                </Animated.View>
                <Text style={styles.cameraTitle}>{isPaused ? 'Paused' : 'Tracking Active'}</Text>
                <Text style={styles.cameraSub}>{formatTime(elapsedSeconds)} elapsed</Text>
                <View style={styles.sensorBadge}>
                  <View style={[styles.sensorDot, { backgroundColor: isPaused ? '#E56B6B' : '#69C36D' }]} />
                  <Text style={styles.sensorText}>{isPaused ? 'Paused' : 'AI Processing'}</Text>
                </View>
                <TouchableOpacity style={styles.inlineEnableBtn} onPress={toggleCamera}>
                  <Text style={styles.inlineEnableText}>Enable Camera Engine</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Text style={styles.exLabel}>{exercise.name}</Text>

          <View style={styles.statsCard}>
            <View style={styles.repSection}>
              <RepDisplay />
              <Text style={styles.repHint}>REPS</Text>
            </View>
            <View style={styles.statsRight}>
              <MotivationDisplay />
              <Text style={styles.timeVal}>{formatTime(elapsedSeconds)}</Text>
            </View>
          </View>

          <View style={styles.metricsCard}>
            <Text style={styles.metricsTitle}>Real-time Analysis</Text>
            <LiveAnalysis />
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity
              onPress={togglePause}
              style={[styles.pauseBtn, isPaused && styles.resumeBtn]}
              activeOpacity={0.85}
            >
              <Ionicons
                name={isPaused ? 'play' : 'pause'}
                size={20}
                color={WT.colors.textLight}
              />
              <Text style={styles.pauseLabel}>{isPaused ? 'Resume' : 'Pause'}</Text>
            </TouchableOpacity>

            <PrimaryWorkoutButton
              label="Finish"
              variant="white"
              style={styles.endBtn}
              onPress={endWorkout}
            />
          </View>

          <View style={styles.ghostTempoRow}>
            <TouchableOpacity
              style={styles.ghostTempoBtn}
              onPress={() => navigation.navigate('GhostGuideTest')}
              activeOpacity={0.9}
            >
              <Text style={styles.ghostTempoBtnText}>Ghost Guide</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ghostTempoBtnAlt}
              onPress={() => navigation.navigate('TempoClassifierTest')}
              activeOpacity={0.9}
            >
              <Text style={styles.ghostTempoBtnText}>Tempo</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1A0E2A' },
  safe: { flex: 1 },
  content: { padding: WT.spacing.lg, paddingBottom: 40 },
  cameraBox: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: WT.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    height: 320,
    width: '100%',
    overflow: 'hidden',
    marginBottom: WT.spacing.lg,
  },
  placeholderInner: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  cameraInnerContainer: { flex: 1, backgroundColor: '#000' },
  cameraInner: { marginBottom: 4 },
  cameraTitle: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.80)' },
  cameraSub: { fontSize: 12, color: 'rgba(255,255,255,0.55)' },
  sensorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  sensorDot: { width: 7, height: 7, borderRadius: 4 },
  sensorText: { fontSize: 12, color: 'rgba(255,255,255,0.80)' },
  exLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: WT.colors.textLight,
    marginBottom: WT.spacing.md,
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: WT.colors.card,
    borderRadius: WT.radius.md,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    padding: WT.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: WT.spacing.md,
    shadowColor: '#6B3FA0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  repSection: { flex: 1, alignItems: 'center', gap: 4 },
  repCount: { fontSize: 72, fontWeight: '900', color: WT.colors.primary, lineHeight: 76 },
  repHint: { fontSize: 14, fontWeight: '800', color: WT.colors.textMuted },
  statsRight: { flex: 1, alignItems: 'center', gap: 4 },
  motivation: { fontWeight: '800', fontSize: 16, color: WT.colors.primary, textAlign: 'center', lineHeight: 24 },
  timeVal: { fontSize: 24, fontWeight: '700', color: WT.colors.textDark, marginTop: 4 },
  metricsCard: {
    backgroundColor: WT.colors.card,
    borderRadius: WT.radius.md,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    padding: WT.spacing.lg,
    marginBottom: WT.spacing.lg,
    shadowColor: '#6B3FA0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  metricsTitle: { fontSize: 14, fontWeight: '700', color: WT.colors.textDark, marginBottom: WT.spacing.sm },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: WT.colors.cardBorder,
  },
  metricLabel: { fontSize: 14, color: WT.colors.textMuted },
  metricValue: { fontSize: 14, fontWeight: '700' },
  btnRow: { flexDirection: 'row', gap: WT.spacing.md, alignItems: 'center' },

  calibrationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    zIndex: 10,
  },
  calibrationText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  ghostContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },

  ghostTempoRow: {
    flexDirection: 'row',
    gap: WT.spacing.md,
    alignItems: 'center',
    marginTop: WT.spacing.md,
  },
  ghostTempoBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: WT.radius.xl,
    backgroundColor: 'rgba(140, 92, 196, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(140, 92, 196, 0.35)',
    alignItems: 'center',
  },
  ghostTempoBtnAlt: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: WT.radius.xl,
    backgroundColor: 'rgba(255, 122, 89, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255, 122, 89, 0.35)',
    alignItems: 'center',
  },
  ghostTempoBtnText: {
    color: WT.colors.textLight,
    fontSize: 12,
    fontWeight: '800',
  },
  pauseBtn: {
    flex: 1,
    height: 54,
    borderRadius: WT.radius.xl,
    backgroundColor: 'rgba(255,255,255,0.15)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  resumeBtn: { backgroundColor: WT.colors.success + 'BB', borderColor: WT.colors.success },
  pauseLabel: { fontSize: 14, fontWeight: '700', color: WT.colors.textLight },
  endBtn: { flex: 1 },
  floatingCameraButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(140, 92, 196, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  floatingButtonText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  metricsOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 140,
  },
  overlayCard: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overlayLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  overlayValue: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '800',
  },
  inlineEnableBtn: {
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  inlineEnableText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  errorContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  errorText: {
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
});

const OverlayMetric: React.FC<{ label: string; selector: (s: any) => any; suffix?: string }> = React.memo(({ label, selector, suffix = '' }) => {
  const value = useAiStore(selector);
  return (
    <View style={styles.overlayCard}>
      <Text style={styles.overlayLabel}>{label}</Text>
      <Text style={styles.overlayValue}>{value}{suffix}</Text>
    </View>
  );
});

const RepDisplay = React.memo(() => {
  const reps = useAiStore(s => s.reps);
  return <Text style={styles.repCount}>{reps}</Text>;
});

const MotivationDisplay = React.memo(() => {
  const motivation = useAiStore(s => (s as any).motivation);
  return <Text style={styles.motivation}>{motivation || 'Keep Pushing'}</Text>;
});

const LiveAnalysis = React.memo(() => {
  const formScore = useAiStore(s => s.formScore);
  const tempo = useAiStore(s => s.tempo);
  const caloriesBurned = useWorkoutStore(s => s.caloriesBurned);

  return (
    <>
      {[
        { label: 'Form Score', value: `${formScore}%`, color: formScore > 80 ? WT.colors.success : WT.colors.warning },
        { label: 'Tempo', value: tempo || 'Analyzing...', color: WT.colors.primary },
        { label: 'Burned', value: `${Math.round(caloriesBurned)} kcal`, color: WT.colors.danger },
      ].map(metric => (
        <View key={metric.label} style={styles.metricRow}>
          <Text style={styles.metricLabel}>{metric.label}</Text>
          <Text style={[styles.metricValue, { color: metric.color }]}>{metric.value}</Text>
        </View>
      ))}
    </>
  );
});

export default TrackingScreen;
