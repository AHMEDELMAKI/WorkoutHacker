import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { callback } from 'react-native-nitro-modules';
import { PoseLandmarksView } from 'react-native-pose-landmarks';
import { exerciseRecognition } from 'react-native-exercise-recognition';
import { createRepCounter } from 'react-native-rep-counter';
import { tempoClassifier } from 'react-native-tempo-classifier';

import AppText from '../../../components/AppText';
import AppButton from '../../../components/AppButton';
import { WT } from '../../../theme/workoutTheme';

const LANDMARK_COUNT = 33;
const VALUES_PER_LANDMARK = 4;
const DEFAULT_SIZE = Dimensions.get('window');

const TempoClassifierTestScreen: React.FC = () => {
  const [sessionActive, setSessionActive] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [landmarksCount, setLandmarksCount] = useState(0);

  const [currentExercise, setCurrentExercise] = useState<string | null>(null);
  const [exerciseConfidence, setExerciseConfidence] = useState(0);

  const [phase, setPhase] = useState('UNKNOWN');
  const [reps, setReps] = useState(0);
  const [repConfidence, setRepConfidence] = useState(0);
  const [activeArm, setActiveArm] = useState<string | null>(null);

  const [tempo, setTempo] = useState('unknown');
  const [quality, setQuality] = useState(0);

  const [inferenceMs, setInferenceMs] = useState(-1);
  const [classifierInferenceMs, setClassifierInferenceMs] = useState(-1);

  const poseLandmarksRef = useRef<any>(null);
  const repCounterRef = useRef<any>(null);
  const hasLoadedModel = useRef(false);
  const tempoRepCountRef = useRef(0);

  useEffect(() => {
    if (!sessionActive) return;
    console.log('[Pipeline] session active, initializing pipeline');

    if (!hasLoadedModel.current) {
      const loaded = exerciseRecognition.loadModelFromAsset('exercise_classifier_rf.json');
      hasLoadedModel.current = loaded;
      setModelLoaded(loaded);
      console.log('[Pipeline] loadModel:', loaded);
      if (!loaded) return;

      const tempoLoaded = tempoClassifier.loadModelFromAsset('tempo_classifier.json');
      console.log('[Pipeline] tempo loadModel:', tempoLoaded);
    }

    repCounterRef.current = createRepCounter();
    repCounterRef.current.startSession({ exercise: null });
    console.log('[Pipeline] repCounter started');

    const interval = setInterval(() => {
      const ref = poseLandmarksRef.current;
      if (!ref) return;

      const buffer = ref.getLandmarksBuffer();
      setInferenceMs(ref.getLastInferenceTimeMs());

      if (!Array.isArray(buffer) || buffer.length !== LANDMARK_COUNT * VALUES_PER_LANDMARK) {
        return;
      }

      setLandmarksCount(Math.floor(buffer.length / VALUES_PER_LANDMARK));

      exerciseRecognition.ingestLandmarksBuffer(buffer);
      const exercise = exerciseRecognition.getCurrentExercise() ?? null;
      const exConfidence = exerciseRecognition.getCurrentConfidence();
      setCurrentExercise(exercise);
      setExerciseConfidence(exConfidence);
      setClassifierInferenceMs(exerciseRecognition.getLastClassifierInferenceTimeMs());

      if (!repCounterRef.current) return;

      const state = repCounterRef.current.update(buffer, exercise);
      setPhase(state.phase);
      setReps(state.reps);
      setRepConfidence(state.confidence);
      setActiveArm(state.activeArm);

      if (state.phase === 'UP' || state.phase === 'DOWN') {
        tempoClassifier.update(state.phase, 30);
        setTempo(tempoClassifier.getCurrentTempo());
        setQuality(tempoClassifier.getCurrentQuality());
        console.log('[Pipeline] tempo update:', state.phase, tempoClassifier.getCurrentTempo(), tempoClassifier.getCurrentQuality());
      }

      if (exercise != null) {
        tempoClassifier.setExercise(exercise);
        console.log('[Pipeline] setExercise:', exercise);
      }
    }, 66);

    return () => {
      clearInterval(interval);
      console.log('[Pipeline] interval cleared');
    };
  }, [sessionActive]);

  const onStart = useCallback(async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        return;
      }
    }
    exerciseRecognition.startSession({ enterConfidence: 0.40, exitConfidence: 0.30, enterFrames: 3 });
    setSessionActive(true);
  }, []);

  const onStop = useCallback(() => {
    setSessionActive(false);
    setTempo('unknown');
    setQuality(0);
    setPhase('UNKNOWN');
    setReps(0);
    setRepConfidence(0);
    setActiveArm(null);
    setCurrentExercise(null);
    setExerciseConfidence(0);
    tempoRepCountRef.current = 0;
    if (repCounterRef.current) {
      repCounterRef.current.stopSession();
      repCounterRef.current = null;
    }
    exerciseRecognition.stopSession();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={WT.colors.header} />
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerInner}>
            <AppText variant="h2" color={WT.colors.textLight} style={styles.headerTitle}>
              Tempo Classifier 🎵
            </AppText>
            <AppText variant="body" color="rgba(255,255,255,0.80)">
              Real-time rep tempo & quality analysis
            </AppText>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hud}>
          <View style={styles.tempoSection}>
            <AppText variant="caption" style={styles.sectionLabel}>TEMPO</AppText>
            <AppText style={styles.tempoText}>{tempo.toUpperCase()}</AppText>
            <AppText variant="h3" color={WT.colors.success} style={styles.qualityText}>
              Confidence: {quality}%
            </AppText>
          </View>

          <View style={styles.divider} />

          <View style={styles.statSection}>
            <AppText variant="caption" style={styles.sectionLabel}>EXERCISE</AppText>
            <AppText variant="h2" color={WT.colors.textDark} style={styles.exerciseName}>
              {currentExercise?.replace(/_/g, ' ') ?? 'detecting...'}
            </AppText>
            <AppText variant="bodySmall" color={WT.colors.textMuted}>
              Confidence: {(exerciseConfidence * 100).toFixed(1)}%
            </AppText>
          </View>

          <View style={styles.divider} />

          <View style={styles.statSection}>
            <AppText variant="caption" style={styles.sectionLabel}>REP COUNTER</AppText>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <AppText variant="bodySmall" color={WT.colors.textMuted}>Phase</AppText>
                <AppText variant="h3" color={WT.colors.textDark}>{phase}</AppText>
              </View>
              <View style={styles.statItem}>
                <AppText variant="bodySmall" color={WT.colors.textMuted}>Reps</AppText>
                <AppText variant="h3" color={WT.colors.textDark}>{reps}</AppText>
              </View>
              <View style={styles.statItem}>
                <AppText variant="bodySmall" color={WT.colors.textMuted}>Arm</AppText>
                <AppText variant="h3" color={WT.colors.textDark}>{activeArm ?? '--'}</AppText>
              </View>
            </View>
            <AppText variant="bodySmall" color={WT.colors.textMuted} style={{ marginTop: 4 }}>
              Confidence: {(repConfidence * 100).toFixed(0)}%
            </AppText>
          </View>

          <View style={styles.divider} />

          <View style={styles.statSection}>
            <AppText variant="caption" style={styles.sectionLabel}>PERFORMANCE</AppText>
            <View style={styles.perfGrid}>
              <View style={styles.perfItem}>
                <AppText variant="caption" color={WT.colors.textMuted}>Landmark</AppText>
                <AppText variant="bodySmall" bold color={WT.colors.textDark}>
                  {inferenceMs >= 0 ? `${inferenceMs.toFixed(0)}ms` : '--'}
                </AppText>
              </View>
              <View style={styles.perfItem}>
                <AppText variant="caption" color={WT.colors.textMuted}>Classifier</AppText>
                <AppText variant="bodySmall" bold color={WT.colors.textDark}>
                  {classifierInferenceMs >= 0 ? `${classifierInferenceMs.toFixed(1)}ms` : '--'}
                </AppText>
              </View>
              <View style={styles.perfItem}>
                <AppText variant="caption" color={WT.colors.textMuted}>Model</AppText>
                <AppText variant="bodySmall" bold color={modelLoaded ? WT.colors.success : WT.colors.danger}>
                  {modelLoaded ? 'Ready' : 'Pending'}
                </AppText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.viewport}>
          <PoseLandmarksView
            hybridRef={callback((ref: any) => { poseLandmarksRef.current = ref })}
            style={StyleSheet.absoluteFill}
            isActive={sessionActive}
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
            width={DEFAULT_SIZE.width - WT.spacing.lg * 2}
            height={280}
          />
          {!sessionActive ? (
            <View style={styles.placeholderContainer}>
              <AppText variant="h3" color={WT.colors.textMuted} center>
                Tap Start Session to begin
              </AppText>
            </View>
          ) : null}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              sessionActive ? styles.actionButtonInactive : styles.actionButtonActive
            ]}
            onPress={onStart}
            disabled={sessionActive}
            activeOpacity={0.85}
          >
            <AppText style={styles.actionButtonText}>Start Session  →</AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              sessionActive ? styles.stopButtonActive : styles.stopButtonInactive
            ]}
            onPress={onStop}
            disabled={!sessionActive}
            activeOpacity={0.85}
          >
            <AppText style={[
              styles.secondaryBtnText,
              sessionActive && styles.stopButtonTextActive
            ]}>Stop Session</AppText>
          </TouchableOpacity>
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
  },
  headerInner: {
    paddingTop: WT.spacing.md,
  },
  headerTitle: {
    fontWeight: '800',
    marginBottom: 4,
  },
  content: {
    padding: WT.spacing.lg,
  },
  hud: {
    backgroundColor: WT.colors.card,
    borderRadius: WT.radius.md,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    padding: WT.spacing.lg,
    marginBottom: WT.spacing.lg,
    ...WT.shadow.card,
  },
  sectionLabel: {
    fontWeight: '700',
    color: WT.colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  tempoSection: {
    alignItems: 'center',
    marginBottom: WT.spacing.sm,
  },
  tempoText: {
    fontSize: 56,
    fontWeight: '900',
    color: WT.colors.primary,
    lineHeight: 64,
  },
  qualityText: {
    marginTop: -4,
  },
  statSection: {
    marginVertical: WT.spacing.xs,
  },
  exerciseName: {
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
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
  perfGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  perfItem: {
    alignItems: 'flex-start',
  },
  viewport: {
    height: 280,
    borderRadius: WT.radius.md,
    overflow: 'hidden',
    backgroundColor: WT.colors.card,
    borderWidth: 1,
    borderColor: WT.colors.cardBorder,
    marginBottom: WT.spacing.lg,
    ...WT.shadow.card,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: WT.spacing.xl,
  },
  controls: {
    gap: WT.spacing.sm,
    marginBottom: WT.spacing.xl,
  },
  actionButton: {
    borderRadius: WT.radius.xl,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonActive: {
    backgroundColor: WT.colors.primary,
    shadowColor: '#4A2878',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  actionButtonInactive: {
    backgroundColor: WT.colors.primary,
    opacity: 0.3,
    elevation: 0,
    shadowOpacity: 0,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: WT.colors.textLight,
  },
  secondaryBtn: {
    borderRadius: WT.radius.xl,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  stopButtonActive: {
    backgroundColor: '#4B5563', // Gray
    borderColor: '#4B5563',
  },
  stopButtonInactive: {
    borderColor: WT.colors.primary,
    backgroundColor: 'rgba(140,92,196,0.08)',
    opacity: 0.3,
  },
  stopButtonTextActive: {
    color: '#FFFFFF',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: WT.colors.primary,
  },
});

export default TempoClassifierTestScreen;
