import { useEffect, useRef, useCallback } from 'react';
import { useAiStore } from '../store/aiStore';
import { useWorkoutStore } from '../store/workoutStore';
import { exerciseRecognition } from 'react-native-exercise-recognition';
import { createRepCounter } from 'react-native-rep-counter';
import { tempoClassifier } from 'react-native-tempo-classifier';
import { GhostGuideCore } from 'react-native-ghost-guide';
import { FatigueClassifier } from 'react-native-fatigue-classifier';
import IMUFormAnalysis from 'imuformanalysis';

import bicepCurlFrames from '../assets/ghost-guide/bicep_curl_frames.json';
import shoulderPressFrames from '../assets/ghost-guide/shoulder_press_frames.json';
import frontRaiseFrames from '../assets/ghost-guide/front_raise_frames.json';
import lateralRaiseFrames from '../assets/ghost-guide/lateral_raise_frames.json';
import tricepsExtensionFrames from '../assets/ghost-guide/triceps_extension_frames.json';

const GHOST_REFS = {
    bicep_curl: bicepCurlFrames,
    shoulder_press: shoulderPressFrames,
    front_raise: frontRaiseFrames,
    lateral_raise: lateralRaiseFrames,
    triceps_extension: tricepsExtensionFrames,
};

const LANDMARK_COUNT = 33;
const VALUES_PER_LANDMARK = 4;

const FATIGUE_PREDICT_INTERVAL = 3000;
const IMU_PREDICT_INTERVAL = 1000;
const MAX_EMG_BUFFER = 10000;
const PREDICTION_WINDOW_SEC = 8;
const EMG_FS = 50;

type FatigueLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

const processBuffer = (
    buffer: Float32Array,
    repCounter: any,
    currentExerciseName: string | undefined,
) => {
    exerciseRecognition.ingestLandmarksBuffer(buffer as any);
    const exercise = exerciseRecognition.getCurrentExercise() ?? null;
    console.log(`[useAiPipeline] Detected Exercise: ${exercise} (Confidence: ${(exerciseRecognition.getCurrentConfidence() * 100).toFixed(1)}%)`);

    let reps = 0;
    let phase = 'UNKNOWN';
    if (repCounter) {
        const state = repCounter.update(buffer, exercise);
        reps = state.reps;
        phase = state.phase;
    }

    let tempo = 'unknown';
    let quality = 0;
    if (phase === 'UP' || phase === 'DOWN') {
        tempoClassifier.update(phase, 30);
        tempo = tempoClassifier.getCurrentTempo();
        quality = tempoClassifier.getCurrentQuality();
    }
    if (exercise != null) {
        tempoClassifier.setExercise(exercise);
    }

    let deviation = 0;
    let ghostSkeleton = null;
    let visionFormScore: number | undefined = undefined;

    const activeExerciseName = currentExerciseName?.toLowerCase() || exercise?.toLowerCase() || '';

    let ghostKey: keyof typeof GHOST_REFS | null = null;
    if (activeExerciseName.includes('bicep')) ghostKey = 'bicep_curl';
    else if (activeExerciseName.includes('shoulder press')) ghostKey = 'shoulder_press';
    else if (activeExerciseName.includes('front raise')) ghostKey = 'front_raise';
    else if (activeExerciseName.includes('lateral raise')) ghostKey = 'lateral_raise';
    else if (activeExerciseName.includes('tricep')) ghostKey = 'triceps_extension';

    if (ghostKey && GHOST_REFS[ghostKey]) {
        const res = GhostGuideCore.processLandmarksBufferWithReference(
            buffer as any,
            GHOST_REFS[ghostKey],
            { applyReferencePose: true }
        );
        if (res) {
            deviation = res.deviationScore;
            ghostSkeleton = res.ghostSkeleton;
            visionFormScore = Math.max(0, Math.min(100, 100 - (deviation * 150)));
        }
    }

    const muscle = muscleForExercise(activeExerciseName);

    const updateInference = useAiStore.getState().updateInference;
    const setGuideOverlay = useAiStore.getState().setGuideOverlay;

    updateInference({
        reps,
        ...(visionFormScore !== undefined ? { formScore: visionFormScore } : {}),
        tempo,
        tempoQuality: quality,
        exercise: exercise ?? undefined,
        ...(muscle ? { debugClassifierMuscle: muscle } : {}),
    });
    if (ghostSkeleton) {
        setGuideOverlay(ghostSkeleton.points ?? null, deviation);
    }
};

function fatigueFromProbability(probFatigue: number): FatigueLevel {
    if (probFatigue < 0.3) return 'LOW';
    if (probFatigue < 0.55) return 'MEDIUM';
    if (probFatigue < 0.8) return 'HIGH';
    return 'CRITICAL';
}

export function muscleForExercise(exerciseName: string | undefined | null): 'biceps' | 'triceps' | null {
    const name = exerciseName?.toLowerCase() ?? '';
    
    // Direct mapping for exact outputs of the exercise recognition model
    if (name === 'bicep curl' || name === 'bicep curls') return 'biceps';
    if (name === 'triceps extension' || name === 'tricep extension') return 'triceps';
    if (name === 'lateral raise' || name === 'shoulder press' || name === 'front raises' || name === 'null/unknown') {
        return null;
    }
    
    // Explicit mappings for other exercises
    const bicepsExercises = [
        'bicep_curl', 'bicep_curls',
        'hammer_curl', 'hammer_curls',
        'incline_bicep_curl', 'incline_bicep_curls',
        'concentration_curl', 'concentration_curls',
        'barbell_curl', 'barbell_curls',
        'chin_up', 'chin_ups'
    ];
    
    const tricepsExercises = [
        'tricep_pushdown', 'tricep_pushdowns',
        'triceps_extension', 'tricep_extension', 'overhead_tricep_extension',
        'tricep_dip', 'tricep_dips',
        'skull_crusher', 'skull_crushers',
        'diamond_pushup', 'diamond_push_ups',
        'close_grip_bench_press'
    ];

    if (bicepsExercises.some(ex => name === ex || name.includes(ex))) return 'biceps';
    if (tricepsExercises.some(ex => name === ex || name.includes(ex))) return 'triceps';

    // Fallbacks for general matching
    if (name.includes('bicep') || name.includes('curl')) return 'biceps';
    if (name.includes('tricep') || name.includes('extension') || name.includes('pushdown') || name.includes('dip')) return 'triceps';

    return null;
}

export interface RawImuPacket {
    roll: number;   // degrees
    pitch: number;  // degrees
    yaw: number;    // degrees

    accX: number;
    accY: number;
    accZ: number;

    gyroX: number;  // deg/s
    gyroY: number;
    gyroZ: number;

    magX: number;
    magY: number;
    magZ: number;
}

export interface PreprocessedImu {
    DMRoll: number;
    DMPitch: number;
    DMYaw: number;
    DMRotX: number;
    DMRotY: number;
    DMRotZ: number;
    AccelroX: number;
    AccelroY: number;
    AccelroZ: number;
}

const DEG_TO_RAD = Math.PI / 180;
const ACC_SCALE = 16384; // ±2g
const G_TO_MS2 = 9.80665;

export function convertImuPacket(
    packet: RawImuPacket
): PreprocessedImu {
    return {
        DMRoll: packet.roll * DEG_TO_RAD,
        DMPitch: packet.pitch * DEG_TO_RAD,
        DMYaw: packet.yaw * DEG_TO_RAD,

        DMRotX: packet.gyroX,
        DMRotY: packet.gyroY,
        DMRotZ: packet.gyroZ,

        AccelroX: (packet.accX / ACC_SCALE) * G_TO_MS2,
        AccelroY: (packet.accY / ACC_SCALE) * G_TO_MS2,
        AccelroZ: (packet.accZ / ACC_SCALE) * G_TO_MS2,
    };
}

/**
 * Preprocess IMU data before model inference.
 * data: flat array [timestamp, roll, pitch, yaw, ax, ay, az, gx, gy, gz, mx, my, mz, ...]
 */
const preprocessIMUData = (data: number[]): number[] => {
    const result: number[] = [];
    const sampleSize = 13; // timestamp + 12 IMU values

    for (let i = 0; i < data.length; i += sampleSize) {
        if (i + sampleSize > data.length) break;

        const raw: RawImuPacket = {
            roll: data[i + 1],
            pitch: data[i + 2],
            yaw: data[i + 3],
            accX: data[i + 4],
            accY: data[i + 5],
            accZ: data[i + 6],
            gyroX: data[i + 7],
            gyroY: data[i + 8],
            gyroZ: data[i + 9],
            magX: data[i + 10],
            magY: data[i + 11],
            magZ: data[i + 12],
        };

        const p = convertImuPacket(raw);

        // We MUST return exactly 13 values per sample to match Rust's COLS constant (node_modules/imuformanalysis/rust/bicep_rf/src/lib.rs)
        result.push(
            data[i],      // 0: timestamp
            p.DMRoll,     // 1: roll (converted to rad)
            p.DMPitch,    // 2: pitch (converted to rad)
            p.DMYaw,      // 3: yaw (converted to rad)
            p.AccelroX,   // 4: accX
            p.AccelroY,   // 5: accY
            p.AccelroZ,   // 6: accZ
            p.DMRotX,     // 7: gyroX (converted to rad/s)
            p.DMRotY,     // 8: gyroY (converted to rad/s)
            p.DMRotZ,     // 9: gyroZ (converted to rad/s)
            raw.magX,     // 10: magX
            raw.magY,     // 11: magY
            raw.magZ      // 12: magZ
        );
    }

    return result;
};

export const useAiPipeline = () => {
    const repCounterRef = useRef<any>(null);
    const hasLoadedModel = useRef(false);
    const classifierRef = useRef<FatigueClassifier | null>(null);
    const classifierReady = useRef(false);
    const emgBufferRef = useRef<number[]>([]);
    const currentMuscleRef = useRef<'biceps' | 'triceps' | null>(null);
    const fatigueTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const imuTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const streamingInitializedRef = useRef(false);

    const imuClassifierReady = useRef(false);
    const currentImuCategoryRef = useRef<'bicep' | 'shoulder' | 'lateral' | null>(null);
    const imuBufferRef = useRef<number[]>([]);

    const loadIMUModel = useCallback(async (category: 'bicep' | 'shoulder' | 'lateral') => {
        if (currentImuCategoryRef.current === category && imuClassifierReady.current) {
            return;
        }

        try {
            await IMUFormAnalysis.initialize(category);
            imuClassifierReady.current = true;
            currentImuCategoryRef.current = category;
            console.log(`[IMUFormAnalysis] Initialized for ${category}`);
        } catch (e) {
            console.error(`[IMUFormAnalysis] Failed to initialize for ${category}:`, e);
            imuClassifierReady.current = false;
        }
    }, []);

    const loadFatigueModel = useCallback(async (muscle: 'biceps' | 'triceps') => {
        if (classifierRef.current && currentMuscleRef.current === muscle && classifierReady.current) {
            return;
        }

        try {
            if (classifierRef.current) {
                classifierRef.current.unload();
                classifierRef.current = null;
                classifierReady.current = false;
            }

            const classifier = new FatigueClassifier();

            let modelJson: any;
            let metadataJson: any;
            let featureList: any;
            let labelMap: any;

            if (muscle === 'biceps') {
                modelJson = require('react-native-fatigue-classifier/model_data/fatigue_rf_model_BICEPS_BRACHII_envelope.json');
                metadataJson = require('react-native-fatigue-classifier/model_data/model_metadata_BICEPS_BRACHII_envelope.json');
                featureList = require('react-native-fatigue-classifier/model_data/feature_list_BICEPS_BRACHII_envelope.json');
                labelMap = require('react-native-fatigue-classifier/model_data/label_map_BICEPS_BRACHII.json');
            } else {
                modelJson = require('react-native-fatigue-classifier/model_data/fatigue_rf_model_TRICEPS_BRACHII_envelope.json');
                metadataJson = require('react-native-fatigue-classifier/model_data/model_metadata_TRICEPS_BRACHII_envelope.json');
                featureList = require('react-native-fatigue-classifier/model_data/feature_list_TRICEPS_BRACHII_envelope.json');
                labelMap = require('react-native-fatigue-classifier/model_data/label_map_TRICEPS_BRACHII.json');
            }

            await classifier.load({
                modelJson: JSON.stringify(modelJson),
                featureList,
                featureMeans: {},
                labelMap,
                metadataJson: JSON.stringify(metadataJson),
            });

            classifierRef.current = classifier;
            classifierReady.current = true;
            currentMuscleRef.current = muscle;
            streamingInitializedRef.current = false;
        } catch (e) {
            console.error('[FatigueClassifier] Failed to load:', e);
            classifierReady.current = false;
        }
    }, []);

    const feedEMG = useCallback((rawValues: number[]) => {
        if (!rawValues.length) return;

        // More robust value selection: Prefer index 2 (often RMS), fallback to index 0
        const rmsValue = rawValues.length >= 3 ? rawValues[2] : rawValues[0];

        if (rmsValue == null || (typeof rmsValue === 'number' && (isNaN(rmsValue) || !isFinite(rmsValue)))) {
            return;
        }

        const buffer = emgBufferRef.current;

        const { currentExercise } = useWorkoutStore.getState();
        const detectedExercise = useAiStore.getState().detectedExercise;
        const activeExerciseName = detectedExercise || currentExercise?.exercise;
        const muscle = muscleForExercise(activeExerciseName);
        console.log(`[feedEMG] detected: "${detectedExercise}", current: "${currentExercise?.exercise}", active: "${activeExerciseName}", muscle: "${muscle}"`);

        if (muscle && muscle !== currentMuscleRef.current) {
            currentMuscleRef.current = muscle;
            classifierReady.current = false;
        }

        if (buffer.length >= MAX_EMG_BUFFER) {
            buffer.shift();
        }
        buffer.push(rmsValue);

        // Update debug state
        const updateInference = useAiStore.getState().updateInference;
        updateInference({
            debugEmgBufferLength: buffer.length,
            debugClassifierMuscle: currentMuscleRef.current || 'NONE',
        });
    }, []);

    const feedIMU = useCallback((packet: any) => {
        if (!packet) return;

        // Construct the flat data array for this sample
        // Expected format: [timestamp, roll, pitch, yaw, accX, accY, accZ, gyroX, gyroY, gyroZ, magX, magY, magZ]
        const sample = [
            packet.timestamp,
            packet.roll,
            packet.pitch,
            packet.yaw,
            packet.ax ?? 0,
            packet.ay ?? 0,
            packet.az ?? 0,
            packet.gx ?? 0,
            packet.gy ?? 0,
            packet.gz ?? 0,
            packet.mx ?? 0,
            packet.my ?? 0,
            packet.mz ?? 0
        ];

        const buffer = imuBufferRef.current;
        buffer.push(...sample);

        // Keep buffer size limited (approx 10-20 seconds of data)
        if (buffer.length >= 5000) {
            buffer.splice(0, sample.length);
        }
    }, []);

    const predictFatigue = useCallback(() => {
        const { currentExercise } = useWorkoutStore.getState();
        const detectedExercise = useAiStore.getState().detectedExercise;
        const activeExerciseName = detectedExercise || currentExercise?.exercise;
        const muscle = muscleForExercise(activeExerciseName);

        if (muscle && muscle !== currentMuscleRef.current) {
            currentMuscleRef.current = muscle;
            classifierReady.current = false;
            streamingInitializedRef.current = false; // Reset streaming baseline on muscle switch!
        }

        const activeMuscle = currentMuscleRef.current;

        // Update target muscle in the store even if we exit early
        const updateInference = useAiStore.getState().updateInference;
        updateInference({
            debugClassifierMuscle: activeMuscle || 'NONE',
        });

        const buffer = emgBufferRef.current;
        if (!activeMuscle) return;

        if (!classifierReady.current || !classifierRef.current) {
            loadFatigueModel(activeMuscle);
            return;
        }

        // We need at least 10 seconds of baseline data (500 samples @ 50 Hz) to initialize streaming
        if (!streamingInitializedRef.current) {
            if (buffer.length < 500) {
                // Not enough baseline samples yet. Keep collecting.
                updateInference({
                    debugEmgBufferLength: buffer.length,
                });
                return;
            }
            try {
                // Initialize streaming with the first 10 seconds of the buffer
                classifierRef.current.startStreaming(buffer.slice(0, 500));
                streamingInitializedRef.current = true;
                console.log('[FatigueClassifier] Streaming initialized with 10s baseline.');
            } catch (e) {
                console.error('[FatigueClassifier] startStreaming error:', e);
                return;
            }
        }

        if (buffer.length < 12) return;
        const lastWindow = buffer.slice(-12);


        try {
            const result = classifierRef.current.predictStreaming(lastWindow);

            const fatigueProb = result.probabilities['fatigue'] ?? 0;
            const fatigue = fatigueFromProbability(fatigueProb);

            updateInference({
                fatigue,
                fatigueConfidence: result.confidence,
                debugEmgBufferLength: buffer.length,
                debugLastPredictTime: new Date().toLocaleTimeString(),
                debugClassifierMuscle: activeMuscle,
            });
        } catch (e) {
            console.error('[FatigueClassifier] predictStreaming error:', e);
        }
    }, [loadFatigueModel]);

    const predictIMUForm = useCallback(async () => {
        const { currentExercise } = useWorkoutStore.getState();
        const detectedExercise = useAiStore.getState().detectedExercise;
        const activeExerciseName = detectedExercise || currentExercise?.exercise;

        if (!activeExerciseName) return;

        // Map exercise name to IMU category
        const name = activeExerciseName.toLowerCase();
        let category: 'bicep' | 'shoulder' | 'lateral' | null = null;
        if (name.includes('bicep') || name.includes('curl')) category = 'bicep';
        else if (name.includes('shoulder') || name.includes('press')) category = 'shoulder';
        else if (name.includes('lateral') || name.includes('raise')) category = 'lateral';

        if (!category) return;

        if (category !== currentImuCategoryRef.current) {
            imuClassifierReady.current = false;
            useAiStore.getState().updateInference({ imuClassification: null });
            loadIMUModel(category);
            return;
        }

        if (!imuClassifierReady.current) return;

        const buffer = imuBufferRef.current;
        if (buffer.length < 50) return; // Minimum data points to try processing

        try {
            // Preprocess the buffer before sending to model
            const processedBuffer = preprocessIMUData(buffer);

            // IMUFormAnalysis.processDataBatch expects a flat array of IMU data
            // Usually [timestamp, roll, pitch, yaw, accX, accY, accZ, gyroX, gyroY, gyroZ, ...]
            // We'll pass the current buffer and then clear it or manage it
            const result = await IMUFormAnalysis.processDataBatch(processedBuffer);

            if (result && result !== "") {
                console.log("[IMUFormAnalysis] Rep classified as:", result);

                const updateInference = useAiStore.getState().updateInference;

                updateInference({
                    imuClassification: result,
                });

                // Clear buffer after a successful classification of a rep
                imuBufferRef.current = [];
            }
        } catch (e) {
            console.error('[IMUFormAnalysis] Prediction error:', e);
        }
    }, [loadIMUModel]);

    useEffect(() => {
        if (!hasLoadedModel.current) {
            exerciseRecognition.loadModelFromAsset('exercise_classifier_rf.json');
            tempoClassifier.loadModelFromAsset('tempo_classifier.json');
            exerciseRecognition.startSession({ enterConfidence: 0.40, exitConfidence: 0.30, enterFrames: 3 });
            hasLoadedModel.current = true;
        }

        repCounterRef.current = createRepCounter();
        repCounterRef.current.startSession({ exercise: null });

        imuClassifierReady.current = false;

        fatigueTimerRef.current = setInterval(() => {
            predictFatigue();
        }, FATIGUE_PREDICT_INTERVAL);

        imuTimerRef.current = setInterval(() => {
            predictIMUForm();
        }, IMU_PREDICT_INTERVAL);

        return () => {
            if (repCounterRef.current) {
                repCounterRef.current.stopSession();
            }
            if (fatigueTimerRef.current) {
                clearInterval(fatigueTimerRef.current);
            }
            if (imuTimerRef.current) {
                clearInterval(imuTimerRef.current);
            }
            if (classifierRef.current) {
                classifierRef.current.unload();
                classifierRef.current = null;
                classifierReady.current = false;
                streamingInitializedRef.current = false;
            }
            imuClassifierReady.current = false;
            exerciseRecognition.stopSession();
        };
    }, [predictFatigue, predictIMUForm]);

    return {
        processBuffer: (buffer: Float32Array) => {
            const { currentExercise } = useWorkoutStore.getState();
            processBuffer(buffer, repCounterRef.current, currentExercise?.exercise);
        },
        feedEMG,
        feedIMU,
    };
};