import React, { useEffect, useRef, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PoseLandmarksView } from 'react-native-pose-landmarks';
import { callback } from 'react-native-nitro-modules';
import { Dimensions } from 'react-native';

import { subscribeVoiceAction } from '../../../services/voiceActionBus';
import { speak } from '../../../services/ttsService';
import { useWorkoutStore } from '../../../store/workoutStore';
import { useAiStore } from '../../../store/aiStore';
import { useAiPipeline } from '../../../hooks/useAiPipeline';
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
import { Svg, Circle } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { WorkoutStackParamList } from '../../../navigation/types';
import { WT } from '../../../theme/workoutTheme';
import PrimaryWorkoutButton from '../components/PrimaryWorkoutButton';

type Props = NativeStackScreenProps<WorkoutStackParamList, 'Tracking'>;

const CAMERA_BOX_HEIGHT = 320;
const LANDMARK_COUNT = 33;
const VALUES_PER_LANDMARK = 4;

// ─── Styles ──────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1A0E2A' },
  safe: { flex: 1 },
  content: { padding: WT.spacing.lg, paddingBottom: 40 },
  cameraBox: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: WT.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    height: CAMERA_BOX_HEIGHT,
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
  metricsOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 140,
  },
  tempoHud: {
    position: 'absolute',
    top: 16,
    right: 16,
    alignItems: 'flex-end',
  },
  tempoOverlayContent: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  tempoOverlayValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 4,
  },
  tempoQualityBar: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  tempoQualityFill: {
    height: '100%',
  },
  repOverlay: {
    position: 'absolute',
    bottom: 60,
    left: 16,
  },
  repOverlayContent: {
    backgroundColor: 'rgba(107, 63, 160, 0.7)',
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  repOverlayValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
  },
  repOverlayLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.8)',
    marginTop: -2,
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
});

// ─── Sub-Components ──────────────────────────────────────

const OverlayMetric: React.FC<{ 
  label: string; 
  selector: (s: any) => string | number | null; 
  suffix?: string 
}> = React.memo(({ label, selector, suffix = '' }) => {
  const value = useAiStore(selector);
  return (
    <View style={styles.overlayCard}>
      <Text style={styles.overlayLabel}>{label}</Text>
      <Text style={styles.overlayValue}>{value ?? '--'}{suffix}</Text>
    </View>
  );
});

const RepOverlay = React.memo(() => {
  const reps = useAiStore(s => s.reps);
  return (
    <View style={styles.repOverlayContent}>
      <Text style={styles.repOverlayValue}>{reps}</Text>
      <Text style={styles.repOverlayLabel}>REPS</Text>
    </View>
  );
});

const TempoOverlay = React.memo(() => {
  const tempo = useAiStore(s => s.tempo);
  const quality = useAiStore(s => s.tempoQuality);

  if (!tempo || tempo === 'unknown') return null;

  return (
    <View style={styles.tempoOverlayContent}>
      <Text style={styles.tempoOverlayValue}>{tempo.toUpperCase()}</Text>
      <View style={styles.tempoQualityBar}>
        <View style={[styles.tempoQualityFill, { width: `${quality}%`, backgroundColor: quality > 70 ? '#69C36D' : '#FFD700' }]} />
      </View>
    </View>
  );
});

const LiveAnalysis = React.memo(() => {
  const reps = useAiStore(s => s.reps);
  const formScore = useAiStore(s => s.formScore);
  const tempo = useAiStore(s => s.tempo);
  const tempoQuality = useAiStore(s => s.tempoQuality);
  const detectedExercise = useAiStore(s => s.detectedExercise);
  const caloriesBurned = useWorkoutStore(s => s.caloriesBurned);

  return (
    <>
      {[
        { label: 'Reps', value: `${reps}`, color: WT.colors.primary },
        { label: 'Exercise', value: (detectedExercise || 'Detecting...').replace(/_/g, ' '), color: WT.colors.primary },
        { label: 'Form Score', value: `${formScore}%`, color: formScore > 80 ? WT.colors.success : WT.colors.warning },
        { label: 'Tempo', value: tempo ? `${tempo}` : 'Analyzing...', color: WT.colors.primary },
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

const RepDisplay = React.memo(() => {
  const reps = useAiStore(s => s.reps);
  return <Text style={styles.repCount}>{reps}</Text>;
});

const MotivationDisplay = React.memo(() => {
  const formScore = useAiStore(s => s.formScore);
  const reps = useAiStore(s => s.reps);
  
  let message = "Keep it up!";
  if (reps === 0) message = "Get ready!";
  else if (formScore > 90) message = "Perfect form!";
  else if (formScore > 75) message = "Great job!";
  else if (formScore > 50) message = "Keep pushing!";
  else message = "Watch your form!";
  
  return <Text style={styles.motivation}>{message}</Text>;
});

// ─── Main Screen ──────────────────────────────────────────

const TrackingScreen: React.FC<Props> = ({ route, navigation }) => {
  const params = route.params || {};
  const exercise = params.exercise;
  const cameraWidth = Dimensions.get('window').width - WT.spacing.lg * 2;

  // Zustand Stores
  const startWorkout = useWorkoutStore(s => s.startWorkout);
  const completeWorkout = useWorkoutStore(s => s.completeWorkout);
  const startExercise = useWorkoutStore(s => s.startExercise);
  const tick = useWorkoutStore(s => s.tick);
  const elapsedSeconds = useWorkoutStore(s => s.elapsedSeconds);

  // AI Store access
  const resetAi = useAiStore(s => s.reset);
  const setLandmarks = useAiStore(s => s.setLandmarks);
  const ghostSkeleton = useAiStore(s => s.guideOverlay);

  const [isPaused, setIsPaused] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const poseLandmarksRef = useRef<any>(null);

  // AI Pipeline Hook
  const { processBuffer } = useAiPipeline();

  // On mount: prepare session
  useEffect(() => {
    if (!exercise) {
        Alert.alert('Error', 'No exercise data provided.', [{ text: 'Go Back', onPress: () => navigation.goBack() }]);
        return;
    }
    
    startPulse();
    const timer = setInterval(() => {
      if (!isPaused) tick();
    }, 1000);

    return () => {
      clearInterval(timer);
      resetAi();
    };
  }, [exercise]);

  // Start workout when camera is enabled
  useEffect(() => {
    if (!cameraEnabled || !exercise) return;
    const init = async () => {
      await startWorkout('strength', exercise.name);
      startExercise(exercise.name);
    };
    init();
  }, [cameraEnabled, exercise]);

  // Polling loop: reads landmarks from PoseLandmarksView and runs AI inference
  useEffect(() => {
    if (!cameraEnabled) return;

    const interval = setInterval(() => {
      const ref = poseLandmarksRef.current;
      if (!ref) return;

      const buffer = ref.getLandmarksBuffer();
      if (!buffer || buffer.length !== LANDMARK_COUNT * VALUES_PER_LANDMARK) return;

      // Store landmarks for overlay usage
      const landmarks = [];
      for (let i = 0; i < LANDMARK_COUNT; i++) {
        landmarks.push({
          x: buffer[i * VALUES_PER_LANDMARK],
          y: buffer[i * VALUES_PER_LANDMARK + 1],
          z: buffer[i * VALUES_PER_LANDMARK + 2],
          visibility: buffer[i * VALUES_PER_LANDMARK + 3],
        });
      }
      setLandmarks(landmarks);

      // Run AI inference
      processBuffer(buffer);
    }, 66);

    return () => clearInterval(interval);
  }, [cameraEnabled]);

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
      if (action === 'pause_workout' && !isPaused) {
        void speak('Pausing workout');
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
    const { formScore, fatigueLevel, reps } = useAiStore.getState();
    const { elapsedSeconds, caloriesBurned, completedExercises, currentExercise } = useWorkoutStore.getState();
    
    const allExercises = [...completedExercises];
    if (currentExercise) allExercises.push(currentExercise);
    const totalReps = allExercises.reduce((acc, curr) => acc + curr.reps, 0) + reps;
    const setsCompleted = allExercises.length || 1;

    try {
      await completeWorkout({
        formScore,
        fatigue: fatigueLevel as any,
      });
      navigation.navigate('WorkoutComplete', { 
          workoutType: exercise.targetMuscles,
          duration: elapsedSeconds,
          calories: caloriesBurned,
          reps: totalReps,
          sets: setsCompleted,
          score: formScore,
          fatigue: fatigueLevel
      });
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
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
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
            {cameraEnabled ? (
              <View style={styles.cameraInnerContainer}>
                <PoseLandmarksView
                  hybridRef={callback((ref: any) => { poseLandmarksRef.current = ref })}
                  style={StyleSheet.absoluteFill}
                  isActive={!isPaused}
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
                  width={cameraWidth}
                  height={CAMERA_BOX_HEIGHT}
                />

                {/* Ghost Skeleton Overlay (hidden) */}

                <View style={styles.metricsOverlay} pointerEvents="none">
                  <OverlayMetric label="Reps" selector={s => s.reps} />
                  <OverlayMetric label="Tempo" selector={s => s.tempo || 'Analyzing...'} />
                  <OverlayMetric label="Form" selector={s => s.formScore} suffix="%" />
                  <OverlayMetric label="Fatigue" selector={s => s.fatigueLevel} />
                  <OverlayMetric label="Type" selector={s => (s.detectedExercise || 'Detecting...').replace('_', ' ')} />
                </View>

                {/* Prominent Overlay HUDs */}
                <View style={styles.tempoHud} pointerEvents="none">
                  <TempoOverlay />
                </View>
                <View style={styles.repOverlay} pointerEvents="none">
                  <RepOverlay />
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
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default TrackingScreen;
