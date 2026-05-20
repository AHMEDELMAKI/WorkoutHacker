import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { SignalSnapshot } from '../../../../Fatigue-with-HeartRate-main/src/aggregator';
import { BarbellVelocityTracker, type VelocityReading } from '../../../../Fatigue-with-HeartRate-main/src/barbell';
import type { EMGSample } from '../../../../Fatigue-with-HeartRate-main/src/emg';
import {
  FatigueAssessment,
  type ReadinessResult,
} from '../../../../Fatigue-with-HeartRate-main/src/fatigue-engine';
import type { HeartRateMeasurement } from '../../../../Fatigue-with-HeartRate-main/src/heart-rate/ppg-processor';
import { EMAFilter } from '../../../../Fatigue-with-HeartRate-main/src/utils/filters';

export type HeartRateCaptureState = 'idle' | 'measuring' | 'ready' | 'error';
export type BluetoothCaptureState = 'idle' | 'scanning' | 'connecting' | 'connected' | 'error';

export interface IMUReading {
  timestamp: number;
  roll: number;
  pitch: number;
  yaw: number;
}

export interface StandaloneFatigueResult {
  action: 'continue' | 'rest';
  fatigueLabel: 'Low' | 'Moderate' | 'High';
  recommendedRestSec: number;
  summary: string;
  missingSignals: string[];
  snapshot: SignalSnapshot;
  assessment: ReadinessResult;
  measuredAt: number;
}

interface FatigueCheckContextValue {
  liveHeartRate: HeartRateMeasurement | null;
  capturedHeartRate: HeartRateMeasurement | null;
  heartRateState: HeartRateCaptureState;
  heartRateProgress: number;
  requiredStableHeartRateReadings: number;
  cameraReady: boolean;
  heartRateError: string | null;
  bluetoothStatus: BluetoothCaptureState;
  sensorError: string | null;
  emgSample: EMGSample | null;
  emgReadingCount: number;
  requiredEmgReadings: number;
  velocityReading: VelocityReading | null;
  velocityRepCount: number;
  requiredVelocityReps: number;
  liveVelocity: number | null;
  velocityReady: boolean;
  processingStarted: boolean;
  processingElapsedSec: number;
  result: StandaloneFatigueResult | null;
  resetSession: () => void;
  handleCameraReady: () => void;
  handleHeartRateReading: (reading: HeartRateMeasurement) => void;
  handleHeartRateError: (message: string) => void;
  startSensorProcessing: () => void;
  handleBluetoothStatusChange: (status: BluetoothCaptureState) => void;
  handleSensorError: (message: string) => void;
  handleEMGReading: (sample: EMGSample) => void;
  handleIMUReading: (reading: IMUReading) => void;
}

const FatigueCheckContext = createContext<FatigueCheckContextValue | null>(null);

const DEFAULT_HR_MAX = 185;
const REQUIRED_STABLE_HR_READINGS = 2;
const MIN_HR_CONFIDENCE = 0.55;
const MAX_HR_VARIATION_BPM = 6;
const MIN_EMG_READINGS = 2;
const MIN_VELOCITY_REPS = 3;
const MIN_SENSOR_CAPTURE_MS = 10_000;
const MAX_SENSOR_CAPTURE_MS = 30_000;
const MIN_RECOMMENDED_REST_SEC = 45;
const MAX_RECOMMENDED_REST_SEC = 180;
const DEFAULT_VELOCITY_SCALE = 0.12;
// Velocities observed are in range ~0–15. Use thresholds appropriate for that range.
const VELOCITY_START_THRESHOLD = 1.2; // start detecting movement above ~1.2
const VELOCITY_STOP_THRESHOLD = 0.6; // consider stopped below ~0.6
const VELOCITY_SAMPLE_TIMEOUT_MS = 550; // allow slightly longer gaps
const VELOCITY_MAX_MOVEMENT_DURATION_MS = 2000; // allow longer movements
const VELOCITY_STOP_SAMPLE_COUNT = 1; // fewer samples needed to finalize
const MIN_PEAK_FOR_REP = 1.5; // minimum peak velocity to consider a rep

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function formatRestSummary(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) return `${minutes} min`;
  return `${minutes} min ${remainingSeconds}s`;
}

function getFatigueLabel(fatigueIndex: number): 'Low' | 'Moderate' | 'High' {
  if (fatigueIndex < 0.45) return 'Low';
  if (fatigueIndex < 0.72) return 'Moderate';
  return 'High';
}

function buildSnapshot(
  heartRate: HeartRateMeasurement | null,
  emgSample: EMGSample | null,
  velocityReading: VelocityReading | null,
): SignalSnapshot {
  const velocityReady = (velocityReading?.repNumber ?? 0) >= 2;
  const velocityLossPct = velocityReady ? velocityReading?.velocityLossPct ?? null : null;

  return {
    timestamp: Date.now(),
    heartRate: heartRate?.bpm ?? null,
    hrConfidence: heartRate?.confidence ?? null,
    emgFatigue: emgSample?.fatigueScore ?? null,
    emgRMS: emgSample?.rmsAmplitude ?? null,
    emgMedianFreq: emgSample?.medianFrequency ?? null,
    velocityMps: velocityReading?.velocityMps ?? null,
    velocityLossPct,
    norm: {
      hrRatio: heartRate ? clamp01(heartRate.bpm / DEFAULT_HR_MAX) : null,
      emgFatigue: emgSample?.fatigueScore ?? null,
      velocityLoss: velocityLossPct !== null ? clamp01(velocityLossPct / 30) : null,
    },
    quality: {
      hrFresh: heartRate !== null,
      emgFresh: emgSample !== null,
      velocityFresh: velocityReading !== null,
    },
  };
}

export const FatigueCheckProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const assessmentRef = useRef(
    new FatigueAssessment({
      emgFatigueThreshold: 0.55,
      velocityLossThreshold: 16,
      hrRatioThreshold: 0.66,
      weights: {
        emg: 0.35,
        velocity: 0.25,
        hr: 0.40,
      },
      baseAdditionalRestSec: 90,
    }),
  );
  const velocityTrackerRef = useRef(new BarbellVelocityTracker({ velocityLossThreshold: 16 }));
  const velocityEmaRef = useRef(new EMAFilter(0.35));
  const stableHeartRateBufferRef = useRef<HeartRateMeasurement[]>([]);
  const emgReadingCountRef = useRef(0);
  const lastImuRef = useRef<IMUReading | null>(null);
  const movementActiveRef = useRef(false);
  const movementStartedAtRef = useRef(0);
  const peakVelocityRef = useRef(0);
  const lastMovementTimeRef = useRef(0);
  const lowVelocitySampleCountRef = useRef(0);
  const processingStartedAtRef = useRef<number | null>(null);
  const processingFinishedRef = useRef(false);
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestHeartRateRef = useRef<HeartRateMeasurement | null>(null);
  const capturedHeartRateRef = useRef<HeartRateMeasurement | null>(null);
  const emgSampleRef = useRef<EMGSample | null>(null);
  const velocityReadingRef = useRef<VelocityReading | null>(null);

  const [liveHeartRate, setLiveHeartRate] = useState<HeartRateMeasurement | null>(null);
  const [capturedHeartRate, setCapturedHeartRate] = useState<HeartRateMeasurement | null>(null);
  const [heartRateState, setHeartRateState] = useState<HeartRateCaptureState>('idle');
  const [heartRateProgress, setHeartRateProgress] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [heartRateError, setHeartRateError] = useState<string | null>(null);
  const [bluetoothStatus, setBluetoothStatus] = useState<BluetoothCaptureState>('idle');
  const [sensorError, setSensorError] = useState<string | null>(null);
  const [emgSample, setEmgSample] = useState<EMGSample | null>(null);
  const [emgReadingCount, setEmgReadingCount] = useState(0);
  const [velocityReading, setVelocityReading] = useState<VelocityReading | null>(null);
  const [liveVelocity, setLiveVelocity] = useState<number | null>(null);
  const [processingStarted, setProcessingStarted] = useState(false);
  const [processingElapsedSec, setProcessingElapsedSec] = useState(0);
  const [result, setResult] = useState<StandaloneFatigueResult | null>(null);

  const clearProcessingTimer = () => {
    if (elapsedIntervalRef.current) {
      clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }
  };

  const resetVelocityTracking = () => {
    velocityTrackerRef.current.resetSet();
    velocityEmaRef.current.reset();
    lastImuRef.current = null;
    movementActiveRef.current = false;
    movementStartedAtRef.current = 0;
    peakVelocityRef.current = 0;
    lastMovementTimeRef.current = 0;
    lowVelocitySampleCountRef.current = 0;
  };

  const completeAssessment = () => {
    if (processingFinishedRef.current) return;

    processingFinishedRef.current = true;
    clearProcessingTimer();

    const heartRate = capturedHeartRateRef.current ?? latestHeartRateRef.current;
    const latestEmg = emgSampleRef.current;
    const latestVelocity = velocityReadingRef.current;
    const snapshot = buildSnapshot(heartRate, latestEmg, latestVelocity);
    const assessment = assessmentRef.current.evaluate(snapshot);
    const fatigueLabel = getFatigueLabel(assessment.fatigueIndex);
    const recommendedRestSec = assessment.ready
      ? 0
      : Math.min(
          MAX_RECOMMENDED_REST_SEC,
          Math.max(MIN_RECOMMENDED_REST_SEC, assessment.additionalRestSec || MIN_RECOMMENDED_REST_SEC),
        );
    const missingSignals = [
      snapshot.heartRate === null ? 'Heart rate' : null,
      snapshot.emgFatigue === null ? 'EMG' : null,
      snapshot.norm.velocityLoss === null ? 'Velocity loss' : null,
    ].filter(Boolean) as string[];

    const action = recommendedRestSec > 0 ? 'rest' : 'continue';
    const summary =
      action === 'continue'
        ? fatigueLabel === 'Low'
          ? 'Your fatigue level looks stable. You can continue your activity.'
          : 'You can continue your activity, but keep the intensity moderate and recheck if you feel drained.'
        : `Rest for about ${formatRestSummary(recommendedRestSec)} before continuing your activity.`;

    setResult({
      action,
      fatigueLabel,
      recommendedRestSec,
      summary,
      missingSignals,
      snapshot,
      assessment,
      measuredAt: Date.now(),
    });
  };

  const maybeFinalizeAssessment = () => {
    const startedAt = processingStartedAtRef.current;
    if (!startedAt || processingFinishedRef.current) return;

    const elapsedMs = Date.now() - startedAt;
    const hasEmg = emgReadingCountRef.current >= MIN_EMG_READINGS;
    const hasVelocityLoss = (velocityReadingRef.current?.repNumber ?? 0) >= MIN_VELOCITY_REPS;
    const hasEnoughData = hasEmg && hasVelocityLoss && elapsedMs >= MIN_SENSOR_CAPTURE_MS;
    const timedOut = elapsedMs >= MAX_SENSOR_CAPTURE_MS;

    if (hasEnoughData || timedOut) {
      completeAssessment();
    }
  };

  const finalizeMovement = () => {
    // Accept movements that at least crossed the start threshold
    if (peakVelocityRef.current < VELOCITY_START_THRESHOLD) {
      peakVelocityRef.current = 0;
      movementActiveRef.current = false;
      setLiveVelocity(null);
      return;
    }

    const reading = velocityTrackerRef.current.push(peakVelocityRef.current);
    peakVelocityRef.current = 0;
    movementActiveRef.current = false;
    lastMovementTimeRef.current = Date.now();
    velocityReadingRef.current = reading;
    setVelocityReading(reading);
    setLiveVelocity(reading.velocityMps);
    maybeFinalizeAssessment();
  };

  const resetSession = () => {
    clearProcessingTimer();
    resetVelocityTracking();

    stableHeartRateBufferRef.current = [];
    emgReadingCountRef.current = 0;
    processingStartedAtRef.current = null;
    processingFinishedRef.current = false;
    latestHeartRateRef.current = null;
    capturedHeartRateRef.current = null;
    emgSampleRef.current = null;
    velocityReadingRef.current = null;

    setLiveHeartRate(null);
    setCapturedHeartRate(null);
    setHeartRateState('idle');
    setHeartRateProgress(0);
    setCameraReady(false);
    setHeartRateError(null);
    setBluetoothStatus('idle');
    setSensorError(null);
    setEmgSample(null);
    setEmgReadingCount(0);
    setVelocityReading(null);
    setLiveVelocity(null);
    setProcessingStarted(false);
    setProcessingElapsedSec(0);
    setResult(null);
  };

  const handleCameraReady = () => {
    setCameraReady(true);
    setHeartRateState('measuring');
    setHeartRateError(null);
  };

  const handleHeartRateReading = (reading: HeartRateMeasurement) => {
    latestHeartRateRef.current = reading;
    setLiveHeartRate(reading);
    setHeartRateState('measuring');
    setHeartRateError(null);

    if (capturedHeartRateRef.current) return;
    if (reading.confidence < MIN_HR_CONFIDENCE) {
      stableHeartRateBufferRef.current = [];
      setHeartRateProgress(0);
      return;
    }

    const nextBuffer = [...stableHeartRateBufferRef.current, reading].slice(-REQUIRED_STABLE_HR_READINGS);
    stableHeartRateBufferRef.current = nextBuffer;
    setHeartRateProgress(nextBuffer.length);

    if (nextBuffer.length < REQUIRED_STABLE_HR_READINGS) return;

    const bpmValues = nextBuffer.map(item => item.bpm);
    const bpmRange = Math.max(...bpmValues) - Math.min(...bpmValues);
    if (bpmRange > MAX_HR_VARIATION_BPM) {
      stableHeartRateBufferRef.current = [nextBuffer[nextBuffer.length - 1]];
      setHeartRateProgress(1);
      return;
    }

    const averageBpm = Math.round(
      bpmValues.reduce((sum, current) => sum + current, 0) / nextBuffer.length,
    );
    const averageConfidence = parseFloat(
      (
        nextBuffer.reduce((sum, current) => sum + current.confidence, 0) /
        nextBuffer.length
      ).toFixed(2),
    );
    const stableReading: HeartRateMeasurement = {
      bpm: averageBpm,
      confidence: averageConfidence,
      timestamp: Date.now(),
    };

    capturedHeartRateRef.current = stableReading;
    setCapturedHeartRate(stableReading);
    setHeartRateState('ready');
  };

  const handleHeartRateError = (message: string) => {
    setHeartRateState('error');
    setHeartRateError(message);
  };

  const startSensorProcessing = () => {
    if (processingStartedAtRef.current) return;

    processingFinishedRef.current = false;
    processingStartedAtRef.current = Date.now();
    emgReadingCountRef.current = 0;
    emgSampleRef.current = null;
    velocityReadingRef.current = null;

    setBluetoothStatus('scanning');
    setSensorError(null);
    setEmgSample(null);
    setEmgReadingCount(0);
    setVelocityReading(null);
    setLiveVelocity(null);
    setProcessingStarted(true);
    setProcessingElapsedSec(0);
    setResult(null);
    resetVelocityTracking();

    clearProcessingTimer();
    elapsedIntervalRef.current = setInterval(() => {
      const startedAt = processingStartedAtRef.current;
      if (!startedAt) return;

      setProcessingElapsedSec(Math.floor((Date.now() - startedAt) / 1000));
      maybeFinalizeAssessment();
    }, 1000);
  };

  const handleBluetoothStatusChange = (status: BluetoothCaptureState) => {
    setBluetoothStatus(status);
  };

  const handleSensorError = (message: unknown) => {
    const msg = message instanceof Error ? message.message : String(message ?? 'Unknown sensor error');
    setSensorError(msg);
    setBluetoothStatus('error');
  };

  const handleEMGReading = (sample: EMGSample) => {
    emgReadingCountRef.current += 1;
    emgSampleRef.current = sample;
    setEmgSample(sample);
    setEmgReadingCount(emgReadingCountRef.current);
    maybeFinalizeAssessment();
  };

  const handleIMUReading = (reading: IMUReading) => {
    const previous = lastImuRef.current;
    lastImuRef.current = reading;

    if (!previous) return;

    const deltaMs = Math.max(16, reading.timestamp - previous.timestamp);
    const deltaSeconds = deltaMs / 1000;
    const dx = reading.roll - previous.roll;
    const dy = reading.pitch - previous.pitch;
    const dz = reading.yaw - previous.yaw;
    const angularDelta = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const rawVelocity = Math.max(0, (angularDelta / deltaSeconds) * DEFAULT_VELOCITY_SCALE);
    const smoothedVelocity = velocityEmaRef.current.update(rawVelocity);

    // Start movement when we cross the start threshold
    if (smoothedVelocity >= VELOCITY_START_THRESHOLD) {
      if (!movementActiveRef.current) {
        movementStartedAtRef.current = reading.timestamp;
        lowVelocitySampleCountRef.current = 0;
        peakVelocityRef.current = smoothedVelocity;
      }

      movementActiveRef.current = true;
      peakVelocityRef.current = Math.max(peakVelocityRef.current, smoothedVelocity);
      lastMovementTimeRef.current = reading.timestamp;
      setLiveVelocity(smoothedVelocity);
      return;
    }

    // If not active, ignore small movements
    if (!movementActiveRef.current) return;

    peakVelocityRef.current = Math.max(peakVelocityRef.current, smoothedVelocity);
    const movementDurationMs = reading.timestamp - movementStartedAtRef.current;

    // adaptive stop threshold based on observed peak (for forgiving finish detection)
    const peakDropThreshold = Math.max(VELOCITY_STOP_THRESHOLD, peakVelocityRef.current * 0.6);
    if (smoothedVelocity <= VELOCITY_STOP_THRESHOLD) {
      lowVelocitySampleCountRef.current += 1;
    } else {
      lowVelocitySampleCountRef.current = 0;
    }

    // Allow quicker finalization for modest peaks and shorter movements
    const quickPeakFinish = movementDurationMs >= 120 && peakVelocityRef.current >= VELOCITY_START_THRESHOLD && smoothedVelocity <= peakDropThreshold;
    const shouldFinalize =
      quickPeakFinish ||
      lowVelocitySampleCountRef.current >= VELOCITY_STOP_SAMPLE_COUNT ||
      movementDurationMs >= VELOCITY_MAX_MOVEMENT_DURATION_MS ||
      (smoothedVelocity <= VELOCITY_STOP_THRESHOLD && peakVelocityRef.current >= VELOCITY_START_THRESHOLD) ||
      (reading.timestamp - lastMovementTimeRef.current) > VELOCITY_SAMPLE_TIMEOUT_MS;

    if (shouldFinalize) {
      finalizeMovement();
      return;
    }

    setLiveVelocity(smoothedVelocity);
  };

  useEffect(() => () => {
    clearProcessingTimer();
  }, []);

  return (
    <FatigueCheckContext.Provider
      value={{
        liveHeartRate,
        capturedHeartRate,
        heartRateState,
        heartRateProgress,
        requiredStableHeartRateReadings: REQUIRED_STABLE_HR_READINGS,
        cameraReady,
        heartRateError,
        bluetoothStatus,
        sensorError,
        emgSample,
        emgReadingCount,
        requiredEmgReadings: MIN_EMG_READINGS,
        velocityReading,
        velocityRepCount: velocityReading?.repNumber ?? 0,
        requiredVelocityReps: MIN_VELOCITY_REPS,
        liveVelocity,
        velocityReady: (velocityReading?.repNumber ?? 0) >= MIN_VELOCITY_REPS,
        processingStarted,
        processingElapsedSec,
        result,
        resetSession,
        handleCameraReady,
        handleHeartRateReading,
        handleHeartRateError,
        startSensorProcessing,
        handleBluetoothStatusChange,
        handleSensorError,
        handleEMGReading,
        handleIMUReading,
      }}
    >
      {children}
    </FatigueCheckContext.Provider>
  );
};

export function useFatigueCheck(): FatigueCheckContextValue {
  const context = useContext(FatigueCheckContext);
  if (!context) {
    throw new Error('useFatigueCheck must be used inside FatigueCheckProvider');
  }
  return context;
}
