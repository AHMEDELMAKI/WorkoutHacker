/**
 * @module react-native/WorkoutFatigueSystem
 *
 * Lightweight on-device workout controller for the full mobile pipeline.
 * No backend, no WebSocket loop, no HTTP ingest.
 *
 * Data flow:
 *   CameraHeartRateComponent -> DataAggregator -> FatigueEngine
 *   WiFi sensor hooks         -> DataAggregator -> FatigueEngine
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
import { FatigueEngine, EngineState, ReadinessResult, RestProgressEvent, StateEvent } from '../fatigue-engine';
import { BarbellVelocityTracker, VelocityReading } from '../barbell';
import { EMGSample } from '../emg';
import { HeartRateMeasurement } from '../heart-rate/ppg-processor';
import { EMAFilter } from '../utils/filters';
import { useEMGPackets, useIMUPackets, useWiFiSensorStatus } from '../../../ESP-connection-main/src';
import { CameraHeartRateComponent } from './CameraHeartRateComponent';

interface WorkoutFatigueSystemProps {
  hrMax: number;
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

interface IMUReading {
  timestamp: number;
  roll: number;
  pitch: number;
  yaw: number;
}

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
  error: string | null;
}

const DEFAULT_VELOCITY_SCALE = 0.08;
const VELOCITY_START_THRESHOLD = 0.75;
const VELOCITY_STOP_THRESHOLD = 0.35;
const VELOCITY_SAMPLE_TIMEOUT_MS = 250;
const MIN_ASSESSMENT_DATA_MS = 30_000;

export const WorkoutFatigueSystem: React.FC<WorkoutFatigueSystemProps> = ({
  hrMax,
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
  const engineRef = useRef(
    new FatigueEngine(aggregatorRef.current, {
      hrMax,
      rest: {
        pollIntervalMs: 1000,
        minRestMs: 15_000,
        timeoutMs: 240_000,
      },
      fatigue: {
        weights: {
          emg: 0.30,
          velocity: 0.40,
          hr: 0.30,
        },
      },
      minAssessmentDataMs: MIN_ASSESSMENT_DATA_MS,
      assessmentPollIntervalMs: 1000,
      assessmentTimeoutMs: 90_000,
    })
  );
  const velocityTrackerRef = useRef(new BarbellVelocityTracker({ velocityLossThreshold: 20 }));
  const velocityEmaRef = useRef(new EMAFilter(0.35));
  const lastImuRef = useRef<IMUReading | null>(null);
  const movementActiveRef = useRef(false);
  const peakVelocityRef = useRef(0);
  const lastMovementTimeRef = useRef(0);

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
    message: 'Ready to begin fatigue calculation',
    restProgress: null,
    lastSnapshot: null,
    lastAssessment: null,
    assessmentDataStatus: null,
    error: null,
  });

  const updateLocalState = useCallback((patch: Partial<WorkoutState>) => {
    setState(prev => ({ ...prev, ...patch }));
  }, []);

  const handleStateEvent = useCallback((event: StateEvent) => {
    updateLocalState({
      currentState: event.state,
      setNumber: event.setNumber,
      message: event.message,
      sessionActive: event.state !== 'idle' && event.state !== 'done',
      error: null,
    });
    if (event.data) {
      const result = event.data as ReadinessResult;
      updateLocalState({ lastAssessment: result });
      onAssessment?.(result);
    }
    onStateChange?.(event);
  }, [onAssessment, onStateChange, updateLocalState]);

  const handleProgressEvent = useCallback((event: RestProgressEvent) => {
    updateLocalState({ restProgress: event });
    onProgressUpdate?.(event);
  }, [onProgressUpdate, updateLocalState]);

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

  const handleAssessment = useCallback((result: ReadinessResult) => {
    updateLocalState({ lastAssessment: result });
    onAssessment?.(result);
  }, [onAssessment, updateLocalState]);

  const handleAssessmentData = useCallback((status: SignalCollectionStatus) => {
    updateLocalState({ assessmentDataStatus: status });
  }, [updateLocalState]);

  // Subscribe to global WiFi sensor data
  useEMGPackets(handleEMG);
  useIMUPackets(handleIMU);
  const wifiStatus = useWiFiSensorStatus();

  useEffect(() => {
    // Update connection status based on WiFi sensor status
    const isConnected = wifiStatus === 'connected';
    updateLocalState({ connected: isConnected });
  }, [wifiStatus, updateLocalState]);

  useEffect(() => {
    const engine = engineRef.current;
    const aggregator = aggregatorRef.current;

    engine
      .on('state', handleStateEvent)
      .on('progress', handleProgressEvent)
      .on('assessment-data', handleAssessmentData);

    aggregator.on('snapshot', handleSnapshotEvent);

    return () => {
      aggregator.destroy();
      engine.endWorkout();
    };
  }, [handleAssessmentData, handleProgressEvent, handleSnapshotEvent, handleStateEvent]);

  useEffect(() => {
    if (autoStart) {
      startWorkout();
    }
  }, [autoStart]);

  const startWorkout = useCallback(() => {
    updateLocalState({
      error: null,
      restProgress: null,
      lastAssessment: null,
      assessmentDataStatus: null,
      message: 'Fatigue calculation started',
      sessionActive: true,
      connected: true,
    });
    engineRef.current.startWorkout();
  }, [updateLocalState]);

  const endWorkout = useCallback(() => {
    engineRef.current.endWorkout();
    updateLocalState({
      sessionActive: false,
      currentState: 'done',
      message: 'Fatigue calculation complete',
    });
  }, [updateLocalState]);

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

  const handleEMG = useCallback((sample: EMGSample) => {
    try {
      aggregatorRef.current.ingestEMG(sample);
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

  const handleIMU = useCallback((imu: IMUReading) => {
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

  const getStateColor = () => {
    switch (state.currentState) {
      case 'resting':
        return '#FF9800';
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
        return 'CALCULATING';
      case 'set':
        return 'MEASURING';
      case 'assessing':
        return 'ASSESSING';
      case 'done':
        return 'COMPLETE';
      default:
        return 'IDLE';
    }
  };

  const hasLiveInputs =
    state.currentHR !== null ||
    state.currentFatigue !== null ||
    state.currentVelocity !== null ||
    state.lastSnapshot !== null;

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
        <Text style={styles.setNumber}>Run #{state.setNumber}</Text>
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
            {state.lastAssessment.ready ? 'Rest time is enough' : `Rest ${state.lastAssessment.additionalRestSec}s more`}
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
            <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={startWorkout}>
              <Text style={styles.buttonText}>Start Fatigue Calculation</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={endWorkout}>
              <Text style={styles.buttonText}>Stop Calculation</Text>
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
  buttonSuccess: {
    backgroundColor: '#2EB67D',
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
