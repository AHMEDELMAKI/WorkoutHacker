/**
 * @module react-native/WorkoutFatigueSystem
 *
 * Lightweight on-device fatigue and recovery monitor for the full mobile pipeline.
 * No backend, no WebSocket loop, no HTTP ingest.
 *
 * Data flow:
 *   CameraHeartRateComponent -> DataAggregator -> FatigueAssessment
 *   WiFi sensor hooks         -> DataAggregator -> FatigueAssessment
 *   IMU readings              -> lightweight local velocity estimator
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { DataAggregator, SignalCollectionStatus, SignalSnapshot } from '../aggregator';
import {
  EngineState,
  FatigueAssessment,
  GOAL_PRESETS,
  ReadinessResult,
  RestProgressEvent,
  StateEvent,
  TrainingGoal,
} from '../fatigue-engine';
import { BarbellVelocityTracker, VelocityReading } from '../barbell';
import { EMGProcessor } from '../emg';
import { HeartRateMeasurement } from '../heart-rate/ppg-processor';
import { EMAFilter } from '../utils/filters';
import {
  SensorPacket,
  useEMGPackets,
  useIMUPackets,
  useWiFiSensorStatus,
} from '../../../ESP-connection-main/src';
import { CameraHeartRateComponent } from './CameraHeartRateComponent';

export interface WorkoutFatigueSystemProps {
  hrMax: number;
  initialTrainingGoal?: TrainingGoal;
  onStateChange?: (event: StateEvent) => void;
  onProgressUpdate?: (event: RestProgressEvent) => void;
  onSnapshot?: (snapshot: SignalSnapshot) => void;
  onAssessment?: (result: ReadinessResult) => void;
  onError?: (error: string) => void;
  onVelocityReading?: (reading: VelocityReading) => void;
  autoStart?: boolean;
  useTorch?: boolean;
  showControls?: boolean;
}

type EMGPacket = Extract<SensorPacket, { sensor: 'emg' }>;
type IMUPacket = Extract<SensorPacket, { sensor: 'imu' }>;

interface WorkoutState {
  connected: boolean;
  sessionActive: boolean;
  currentState: EngineState;
  setNumber: number;
  currentHR: number | null;
  currentFatigue: number | null;
  currentEMGRMS: number | null;
  currentVelocity: number | null;
  currentVelocityLoss: number | null;
  message: string;
  restProgress: RestProgressEvent | null;
  lastSnapshot: SignalSnapshot | null;
  lastAssessment: ReadinessResult | null;
  assessmentDataStatus: SignalCollectionStatus | null;
  trainingGoal: TrainingGoal | null;
  goalSelectionRequired: boolean;
  error: string | null;
}

const DEFAULT_VELOCITY_SCALE = 0.08;
const VELOCITY_START_THRESHOLD = 0.75;
const VELOCITY_STOP_THRESHOLD = 0.35;
const VELOCITY_SAMPLE_TIMEOUT_MS = 250;
const MIN_ASSESSMENT_DATA_MS = 30_000;
const DEFAULT_HR_RATIO_THRESHOLD = 0.7;
const TRAINING_GOAL_OPTIONS: Array<{ key: TrainingGoal; label: string; description: string }> = [
  { key: 'strength', label: 'Strength', description: 'Longer recovery for high force output.' },
  { key: 'hypertrophy', label: 'Hypertrophy', description: 'Moderate rest to keep muscular stress high.' },
  { key: 'endurance', label: 'Endurance', description: 'Shorter rest to build fatigue resistance.' },
  { key: 'hiit', label: 'HIIT', description: 'Recovery bias for repeated high-intensity intervals.' },
  { key: 'fat_loss', label: 'Fat Loss', description: 'Short rest to keep effort density and calorie demand high.' },
];

export const WorkoutFatigueSystem: React.FC<WorkoutFatigueSystemProps> = ({
  hrMax,
  initialTrainingGoal,
  onStateChange,
  onProgressUpdate,
  onSnapshot,
  onAssessment,
  onError,
  onVelocityReading,
  autoStart = false,
  useTorch = true,
  showControls = true,
}) => {
  const aggregatorRef = useRef(
    new DataAggregator({
      hrMax,
      snapshotIntervalMs: 1000,
      hrStalenessMs: 3000,
      emgStalenessMs: 2500,
      velocityStalenessMs: 15000,
    })
  );
  const assessmentRef = useRef(
    new FatigueAssessment(initialTrainingGoal ? GOAL_PRESETS[initialTrainingGoal].fatigue : undefined)
  );
  const emgProcessorRef = useRef(
    new EMGProcessor({
      sampleRateHz: 1000,
      baselineRMS: 100,
      baselineMedianFreq: 80,
      epochSize: 200,
    })
  );
  const velocityTrackerRef = useRef(new BarbellVelocityTracker({ velocityLossThreshold: 20 }));
  const velocityEmaRef = useRef(new EMAFilter(0.35));
  const lastImuRef = useRef<IMUPacket | null>(null);
  const movementActiveRef = useRef(false);
  const peakVelocityRef = useRef(0);
  const lastMovementTimeRef = useRef(0);
  const restStartTimeRef = useRef<number | null>(null);

  const [state, setState] = useState<WorkoutState>({
    connected: false,
    sessionActive: false,
    currentState: 'idle',
    setNumber: 0,
    currentHR: null,
    currentFatigue: null,
    currentEMGRMS: null,
    currentVelocity: null,
    currentVelocityLoss: null,
    message: 'Ready to begin fatigue monitoring',
    restProgress: null,
    lastSnapshot: null,
    lastAssessment: null,
    assessmentDataStatus: null,
    trainingGoal: initialTrainingGoal ?? null,
    goalSelectionRequired: false,
    error: null,
  });

  const updateLocalState = useCallback((patch: Partial<WorkoutState>) => {
    setState(prev => ({ ...prev, ...patch }));
  }, []);

  const handleSnapshotEvent = useCallback((snapshot: SignalSnapshot) => {
    updateLocalState({
      currentHR: snapshot.heartRate,
      currentFatigue: snapshot.emgFatigue,
      currentEMGRMS: snapshot.emgRMS,
      currentVelocity: snapshot.velocityMps,
      currentVelocityLoss: snapshot.velocityLossPct,
      lastSnapshot: snapshot,
    });
    onSnapshot?.(snapshot);
  }, [onSnapshot, updateLocalState]);

  const handleAssessmentData = useCallback((status: SignalCollectionStatus) => {
    updateLocalState({ assessmentDataStatus: status });
  }, [updateLocalState]);

  const emitStateEvent = useCallback((nextState: EngineState, message: string, data?: unknown) => {
    const event: StateEvent = {
      state: nextState,
      setNumber: 0,
      message,
      data,
    };

    updateLocalState({
      currentState: nextState,
      setNumber: 0,
      message,
      sessionActive: nextState !== 'idle' && nextState !== 'done',
      goalSelectionRequired: nextState === 'goal-selection',
      error: null,
    });

    if (data) {
      const result = data as ReadinessResult;
      updateLocalState({ lastAssessment: result });
      onAssessment?.(result);
    }

    onStateChange?.(event);
  }, [onAssessment, onStateChange, updateLocalState]);

  useEffect(() => {
    const aggregator = aggregatorRef.current;

    aggregator.on('snapshot', handleSnapshotEvent);

    return () => {
      aggregator.destroy();
    };
  }, [handleSnapshotEvent]);

  const setError = useCallback((error: string) => {
    updateLocalState({ error });
    onError?.(error);
  }, [onError, updateLocalState]);

  const handleHeartRate = useCallback((reading: HeartRateMeasurement) => {
    try {
      aggregatorRef.current.ingestHeartRate(reading);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to ingest heart rate');
    }
  }, [setError]);

  const handleEMG = useCallback((packet: EMGPacket) => {
    try {
      const sample = emgProcessorRef.current.push(packet.rawValues ?? [packet.rawSignal]);
      if (sample) {
        aggregatorRef.current.ingestEMG(sample);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to ingest EMG sample');
    }
  }, [setError]);

  const emitVelocityReading = useCallback((reading: VelocityReading) => {
    velocityTrackerRef.current = velocityTrackerRef.current;
    aggregatorRef.current.ingestVelocity(reading);
    onVelocityReading?.(reading);
  }, [onVelocityReading]);

  const finalizeMovement = useCallback(() => {
    if (peakVelocityRef.current <= 0) return;

    const reading = velocityTrackerRef.current.push(peakVelocityRef.current);
    emitVelocityReading(reading);

    peakVelocityRef.current = 0;
    movementActiveRef.current = false;
  }, [emitVelocityReading]);

  const handleIMU = useCallback((imu: IMUPacket) => {
    try {
      aggregatorRef.current.noteVelocitySignal(imu.timestamp);

      const previous = lastImuRef.current;
      lastImuRef.current = imu;

      if (!previous) return;

      const deltaMs = Math.max(16, imu.timestamp - previous.timestamp);
      const deltaSeconds = deltaMs / 1000;
      const angularDelta = Math.abs(imu.roll - previous.roll) + Math.abs(imu.pitch - previous.pitch) + Math.abs(imu.yaw - previous.yaw);
      const rawVelocity = Math.max(0, (angularDelta / deltaSeconds) * DEFAULT_VELOCITY_SCALE);
      const smoothedVelocity = velocityEmaRef.current.update(rawVelocity);

      if (smoothedVelocity >= VELOCITY_START_THRESHOLD) {
        movementActiveRef.current = true;
        peakVelocityRef.current = Math.max(peakVelocityRef.current, smoothedVelocity);
        lastMovementTimeRef.current = imu.timestamp;
        updateLocalState({ currentVelocity: smoothedVelocity });
        return;
      }

      if (movementActiveRef.current) {
        peakVelocityRef.current = Math.max(peakVelocityRef.current, smoothedVelocity);
        const shouldFinalize = smoothedVelocity <= VELOCITY_STOP_THRESHOLD || (imu.timestamp - lastMovementTimeRef.current) > VELOCITY_SAMPLE_TIMEOUT_MS;

        if (shouldFinalize) {
          finalizeMovement();
        } else {
          updateLocalState({ currentVelocity: smoothedVelocity });
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to estimate velocity');
    }
  }, [finalizeMovement, setError, updateLocalState]);

  const applyTrainingGoal = useCallback((goal: TrainingGoal) => {
    assessmentRef.current = new FatigueAssessment(GOAL_PRESETS[goal].fatigue);
    updateLocalState({
      trainingGoal: goal,
      goalSelectionRequired: false,
      message: state.sessionActive
        ? `Monitoring tuned for ${goal.replace('_', ' ')}. Rest recommendations will now use this goal.`
        : 'Ready to begin standalone fatigue monitoring',
      error: null,
    });
  }, [state.sessionActive, updateLocalState]);

  // Subscribe to global WiFi sensor data after handlers are defined
  useEMGPackets(handleEMG);
  useIMUPackets(handleIMU);
  const wifiStatus = useWiFiSensorStatus();

  useEffect(() => {
    const isConnected = wifiStatus === 'connected';
    updateLocalState({ connected: isConnected });
  }, [wifiStatus, updateLocalState]);

  useEffect(() => {
    if (!initialTrainingGoal) return;
    applyTrainingGoal(initialTrainingGoal);
  }, [applyTrainingGoal, initialTrainingGoal]);

  const evaluateMonitoringSnapshot = useCallback((snapshot: SignalSnapshot) => {
    if (!state.sessionActive) {
      return;
    }

    const status = aggregatorRef.current.getCollectionStatus(MIN_ASSESSMENT_DATA_MS);
    handleAssessmentData(status);

    if (!status.ready) {
      restStartTimeRef.current = null;
      updateLocalState({ restProgress: null, lastAssessment: null });

      const minSeconds = Math.ceil(MIN_ASSESSMENT_DATA_MS / 1000);
      const remainingSeconds = Math.max(
        0,
        Math.ceil(
          Math.max(
            MIN_ASSESSMENT_DATA_MS - status.durationsMs.hr,
            MIN_ASSESSMENT_DATA_MS - status.durationsMs.emg,
            MIN_ASSESSMENT_DATA_MS - status.durationsMs.velocity,
          ) / 1000,
        ),
      );
      const missingSignals = [
        !status.hasSamples.hr ? 'HR' : null,
        !status.hasSamples.emg ? 'EMG' : null,
        !status.hasSamples.velocity ? 'IMU' : null,
      ].filter(Boolean);

      const message = missingSignals.length > 0
        ? `Waiting for live signals before analysis. Need ${missingSignals.join(', ')} data.`
        : `Collecting ${minSeconds}s of HR, EMG, and IMU data. ${remainingSeconds}s remaining before the first fatigue estimate.`;

      emitStateEvent('assessing', message);
      return;
    }

    const result = assessmentRef.current.evaluate(snapshot);

    if (result.ready) {
      restStartTimeRef.current = null;
      updateLocalState({ restProgress: null });
      emitStateEvent('assessing', 'Fatigue is within acceptable limits. Continuing live monitoring.', result);
      return;
    }

    if (!state.trainingGoal) {
      updateLocalState({ restProgress: null });
      emitStateEvent(
        'goal-selection',
        'Fatigue detected. Choose a goal to personalize the rest recommendation.',
        result,
      );
      return;
    }

    if (restStartTimeRef.current === null) {
      restStartTimeRef.current = Date.now();
    }

    const preset = GOAL_PRESETS[state.trainingGoal];
    const targetRatio = preset.fatigue?.hrRatioThreshold ?? DEFAULT_HR_RATIO_THRESHOLD;
    const targetHR = Math.round(hrMax * targetRatio);
    const currentHR = snapshot.heartRate;
    const elapsedSec = Math.round((Date.now() - restStartTimeRef.current) / 1000);
    const recoveryRange = Math.max(1, hrMax - targetHR);
    const percentRecovered = currentHR !== null
      ? Math.max(0, Math.min(100, Math.round((1 - ((currentHR - targetHR) / recoveryRange)) * 100)))
      : 0;

    updateLocalState({
      restProgress: {
        currentHR,
        targetHR,
        elapsedSec,
        percentRecovered,
      },
    });
    onProgressUpdate?.({
      currentHR,
      targetHR,
      elapsedSec,
      percentRecovered,
    });

    const totalRestSec = preset.baseRestSec + result.additionalRestSec;
    emitStateEvent(
      'resting',
      `Recovery advised for ${state.trainingGoal.replace('_', ' ')}: rest ${totalRestSec}s total (${preset.baseRestSec}s base + ${result.additionalRestSec}s extra).`,
      result,
    );
  }, [emitStateEvent, handleAssessmentData, hrMax, state.sessionActive, state.trainingGoal, updateLocalState]);

  useEffect(() => {
    evaluateMonitoringSnapshot(state.lastSnapshot ?? aggregatorRef.current.snapshot());
  }, [evaluateMonitoringSnapshot, state.lastSnapshot]);

  const startMonitoring = useCallback(() => {
    restStartTimeRef.current = null;
    updateLocalState({
      error: null,
      restProgress: null,
      lastAssessment: null,
      assessmentDataStatus: null,
      message: 'Monitoring fatigue and recovery signals.',
      sessionActive: true,
      connected: true,
      currentState: 'assessing',
      trainingGoal: initialTrainingGoal ?? state.trainingGoal,
      goalSelectionRequired: false,
    });
    emitStateEvent('assessing', 'Monitoring fatigue and recovery signals.');
  }, [emitStateEvent, initialTrainingGoal, state.trainingGoal, updateLocalState]);

  const stopMonitoring = useCallback(() => {
    restStartTimeRef.current = null;
    updateLocalState({
      sessionActive: false,
      currentState: 'done',
      goalSelectionRequired: false,
      restProgress: null,
      assessmentDataStatus: null,
      message: 'Standalone fatigue monitoring stopped.',
    });
    onStateChange?.({
      state: 'done',
      setNumber: 0,
      message: 'Standalone fatigue monitoring stopped.',
    });
  }, [onStateChange, updateLocalState]);

  useEffect(() => {
    if (autoStart) {
      startMonitoring();
    }
  }, [autoStart, startMonitoring]);

  const getStateColor = () => {
    switch (state.currentState) {
      case 'resting':
        return '#FF9800';
      case 'goal-selection':
        return '#FFC857';
      case 'set':
        return '#2196F3';
      case 'assessing':
        return '#9C27B0';
      case 'done':
        return '#4CAF50';
      default:
        return '#757575';
    }
  };

  const getStateLabel = () => {
    switch (state.currentState) {
      case 'resting':
        return 'RECOVERY';
      case 'goal-selection':
        return 'GOAL NEEDED';
      case 'assessing':
        return 'MONITORING';
      case 'set':
        return 'ACTIVE';
      case 'done':
        return 'STOPPED';
      default:
        return 'IDLE';
    }
  };

  const hasLiveInputs =
    state.currentHR !== null ||
    state.currentFatigue !== null ||
    state.currentVelocity !== null ||
    state.lastSnapshot !== null;
  const selectedGoalOption = state.trainingGoal
    ? TRAINING_GOAL_OPTIONS.find(option => option.key === state.trainingGoal) ?? null
    : null;
  const selectedGoalBaseRest = state.trainingGoal ? GOAL_PRESETS[state.trainingGoal].baseRestSec : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <CameraHeartRateComponent
        headless
        useTorch={useTorch}
        onReading={handleHeartRate}
        onError={setError}
        onReady={() => updateLocalState({ connected: true })}
      />

      <View style={styles.statusBar}>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: state.connected ? '#4CAF50' : '#F44336' },
          ]}
        />
        <Text style={styles.statusText}>{state.connected ? 'Sensors active' : 'Waiting for sensors'}</Text>
      </View>

      {state.error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{state.error}</Text>
        </View>
      )}

      <View style={[styles.stateCard, { borderLeftColor: getStateColor(), borderLeftWidth: 4 }]}>
        <Text style={styles.stateTitle}>{getStateLabel()}</Text>
        <Text style={styles.stateMessage}>{state.message}</Text>
        <Text style={styles.setNumber}>
          {selectedGoalOption ? `Goal: ${selectedGoalOption.label}` : 'Goal: not selected'}
        </Text>
      </View>

      <View style={styles.assessmentBox}>
        <Text style={styles.progressTitle}>
          {state.goalSelectionRequired ? 'Choose Recovery Goal' : 'Recovery Goal'}
        </Text>
        <Text style={styles.progressText}>
          {state.goalSelectionRequired
            ? 'Fatigue was detected. Pick the goal that matches the type of recovery guidance you want.'
            : selectedGoalOption
              ? `Current goal: ${selectedGoalOption.label}. ${selectedGoalOption.description}`
              : 'No goal selected yet. You can set one now, or the app will ask when fatigue is detected.'}
        </Text>
        <View style={styles.goalButtonGrid}>
          {TRAINING_GOAL_OPTIONS.map(option => {
            const isSelected = state.trainingGoal === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.goalButton,
                  isSelected ? styles.goalButtonSelected : null,
                ]}
                onPress={() => applyTrainingGoal(option.key)}
              >
                <Text style={[
                  styles.goalButtonText,
                  isSelected ? styles.goalButtonTextSelected : null,
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {!hasLiveInputs ? (
        <View style={styles.inputStatusBox}>
          <Text style={styles.progressTitle}>Waiting for input</Text>
          <Text style={styles.progressText}>Camera, flash, EMG, and IMU are starting.</Text>
          <Text style={styles.progressText}>Once data arrives, live fatigue cards will appear here.</Text>
        </View>
      ) : (
        <View style={styles.signalGrid}>
          <View style={styles.signalBox}>
            <Text style={styles.signalLabel}>Heart Rate</Text>
            <Text style={styles.signalValue}>{state.currentHR ? `${state.currentHR} bpm` : '--'}</Text>
            <Text style={styles.signalSmall}>{state.lastSnapshot?.quality.hrFresh ? 'Fresh' : 'Waiting'}</Text>
          </View>

          <View style={styles.signalBox}>
            <Text style={styles.signalLabel}>Muscle Fatigue</Text>
            <Text style={styles.signalValue}>
              {state.currentFatigue !== null ? `${(state.currentFatigue * 100).toFixed(0)}%` : '--'}
            </Text>
            <Text style={styles.signalSmall}>{state.currentEMGRMS !== null ? `${state.currentEMGRMS.toFixed(1)} μV RMS` : 'No signal'}</Text>
          </View>

          <View style={styles.signalBox}>
            <Text style={styles.signalLabel}>Movement</Text>
            <Text style={styles.signalValue}>
              {state.currentVelocity !== null ? `${state.currentVelocity.toFixed(2)} m/s` : '--'}
            </Text>
            <Text style={styles.signalSmall}>{state.currentVelocityLoss !== null ? `${state.currentVelocityLoss.toFixed(1)}% loss` : 'No movement'}</Text>
          </View>
        </View>
      )}

      {state.restProgress && (
        <View style={styles.progressBox}>
          <Text style={styles.progressTitle}>Recovery Progress</Text>
          <Text style={styles.progressText}>
            HR: {state.restProgress.currentHR ?? '--'} / {state.restProgress.targetHR} bpm
          </Text>
          <Text style={styles.progressText}>Recovery: {state.restProgress.percentRecovered}%</Text>
          <Text style={styles.progressText}>Elapsed: {state.restProgress.elapsedSec}s</Text>
        </View>
      )}

      {state.lastAssessment && (
        <View style={styles.assessmentBox}>
          <Text style={styles.progressTitle}>Latest Fatigue Result</Text>
          <Text style={styles.progressText}>
            {state.lastAssessment.ready
              ? 'Recovery is currently adequate'
              : selectedGoalBaseRest !== null
                ? `Rest ${selectedGoalBaseRest + state.lastAssessment.additionalRestSec}s total (${selectedGoalBaseRest}s base + ${state.lastAssessment.additionalRestSec}s extra)`
                : `Rest ${state.lastAssessment.additionalRestSec}s more and choose a goal to personalize the full interval`}
          </Text>
          <Text style={styles.progressText}>
            Fatigue index: {state.lastAssessment.fatigueIndex.toFixed(2)}
          </Text>
        </View>
      )}

      {state.assessmentDataStatus && !state.assessmentDataStatus.ready && (
        <View style={styles.assessmentBox}>
          <Text style={styles.progressTitle}>Data Window</Text>
          <Text style={styles.progressText}>
            HR: {Math.floor(state.assessmentDataStatus.durationsMs.hr / 1000)}s / {MIN_ASSESSMENT_DATA_MS / 1000}s
          </Text>
          <Text style={styles.progressText}>
            EMG: {Math.floor(state.assessmentDataStatus.durationsMs.emg / 1000)}s / {MIN_ASSESSMENT_DATA_MS / 1000}s
          </Text>
          <Text style={styles.progressText}>
            IMU: {Math.floor(state.assessmentDataStatus.durationsMs.velocity / 1000)}s / {MIN_ASSESSMENT_DATA_MS / 1000}s
          </Text>
        </View>
      )}

      {showControls && (
        <View style={styles.buttonRow}>
              {!state.sessionActive ? (
              <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={startMonitoring}>
                <Text style={styles.buttonText}>Start Monitoring</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={stopMonitoring}>
                <Text style={styles.buttonText}>Stop Monitoring</Text>
              </TouchableOpacity>
            )}
        </View>
      )}

      {!state.connected && !state.sessionActive && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#7CFFB2" />
          <Text style={styles.loadingText}>Waiting for camera and sensor connection...</Text>
        </View>
      )}

      {Platform.OS === 'android' ? <View style={styles.platformSpacer} /> : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07111f',
  },
  content: {
    padding: 16,
    paddingTop: 56,
    paddingBottom: 32,
    gap: 12,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 999,
    marginRight: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F7FAFF',
  },
  errorBox: {
    padding: 12,
    backgroundColor: 'rgba(255, 122, 144, 0.12)',
    borderLeftColor: '#FF7A90',
    borderLeftWidth: 4,
    borderRadius: 12,
  },
  errorText: {
    color: '#FFB7C4',
    fontSize: 13,
    fontWeight: '500',
  },
  stateCard: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
  },
  stateTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F7FAFF',
    marginBottom: 4,
  },
  stateMessage: {
    fontSize: 14,
    color: '#C9D3E0',
    marginBottom: 8,
  },
  setNumber: {
    fontSize: 12,
    color: '#8FA4BC',
  },
  signalGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  inputStatusBox: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  signalBox: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  signalLabel: {
    color: '#8FA4BC',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  signalValue: {
    color: '#F7FAFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  signalSmall: {
    color: '#C9D3E0',
    fontSize: 11,
  },
  progressBox: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(124, 255, 178, 0.10)',
    borderLeftColor: '#7CFFB2',
    borderLeftWidth: 4,
  },
  assessmentBox: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  goalButtonGrid: {
    flexDirection: 'column',
    gap: 8,
    marginTop: 10,
  },
  goalButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  goalButtonSelected: {
    backgroundColor: 'rgba(124, 255, 178, 0.18)',
    borderColor: '#7CFFB2',
  },
  goalButtonText: {
    color: '#D6DEEA',
    fontSize: 12,
    fontWeight: '700',
  },
  goalButtonTextSelected: {
    color: '#F7FAFF',
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#7CFFB2',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#D6DEEA',
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#1B7CFF',
  },
  buttonDanger: {
    backgroundColor: '#FF5E73',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  loadingText: {
    color: '#C9D3E0',
    fontSize: 12,
  },
  platformSpacer: {
    height: 8,
  },
});

export default WorkoutFatigueSystem;
