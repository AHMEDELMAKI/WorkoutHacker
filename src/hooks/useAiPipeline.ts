import { useEffect, useRef, useCallback } from 'react';
import { useAiStore } from '../store/aiStore';
import { useWorkoutStore } from '../store/workoutStore';
import { exerciseRecognition } from 'react-native-exercise-recognition';
import { createRepCounter } from 'react-native-rep-counter';
import { tempoClassifier } from 'react-native-tempo-classifier';
import { GhostGuideCore } from 'react-native-ghost-guide';
import { FatigueClassifier } from 'react-native-fatigue-classifier';

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
    let formScore = 100;

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
            formScore = Math.max(0, Math.min(100, 100 - (deviation * 150)));
        }
    }

    const updateInference = useAiStore.getState().updateInference;
    const setGuideOverlay = useAiStore.getState().setGuideOverlay;

    updateInference({
        reps,
        formScore,
        tempo,
        tempoQuality: quality,
        exercise: exercise ?? undefined,
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

export const useAiPipeline = () => {
    const repCounterRef = useRef<any>(null);
    const hasLoadedModel = useRef(false);
    const classifierRef = useRef<FatigueClassifier | null>(null);
    const classifierReady = useRef(false);
    const emgBufferRef = useRef<number[]>([]);
    const currentMuscleRef = useRef<'biceps' | 'triceps' | null>(null);
    const fatigueTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
        } catch (e) {
            console.error('[FatigueClassifier] Failed to load:', e);
            classifierReady.current = false;
        }
    }, []);

    const feedEMG = useCallback((rawValues: number[]) => {
        if (!rawValues.length) return;

        const rmsValue = rawValues[2];
        if (rmsValue == null || (typeof rmsValue === 'number' && (isNaN(rmsValue) || !isFinite(rmsValue)))) {
            return;
        }

        const buffer = emgBufferRef.current;

        const { currentExercise } = useWorkoutStore.getState();
        const detectedExercise = useAiStore.getState().detectedExercise;
        const activeExerciseName = detectedExercise || currentExercise?.exercise;
        const muscle = muscleForExercise(activeExerciseName);

        if (muscle && muscle !== currentMuscleRef.current) {
            currentMuscleRef.current = muscle;
            classifierReady.current = false;
        }

        if (buffer.length >= MAX_EMG_BUFFER) {
            buffer.shift();
        }
        buffer.push(rmsValue);
    }, []);

    const predictFatigue = useCallback(() => {
        const buffer = emgBufferRef.current;
        if (buffer.length < 10) return;

        const { currentExercise } = useWorkoutStore.getState();
        const detectedExercise = useAiStore.getState().detectedExercise;
        const activeExerciseName = detectedExercise || currentExercise?.exercise;
        const muscle = muscleForExercise(activeExerciseName);

        if (muscle && muscle !== currentMuscleRef.current) {
            currentMuscleRef.current = muscle;
            classifierReady.current = false;
        }

        const activeMuscle = currentMuscleRef.current;
        if (!activeMuscle) return;

        if (!classifierReady.current || !classifierRef.current) {
            loadFatigueModel(activeMuscle);
            return;
        }

        try {
            const windowSamples = Math.round(PREDICTION_WINDOW_SEC * EMG_FS);
            const signal = buffer.slice(-windowSamples);
            if (signal.length < 2) return;

            const result = classifierRef.current.predict(signal, EMG_FS);

            const fatigueProb = result.probabilities['fatigue'] ?? 0;
            const fatigue = fatigueFromProbability(fatigueProb);

            const updateInference = useAiStore.getState().updateInference;
            updateInference({ fatigue, fatigueConfidence: result.confidence });
        } catch (e) {
            console.error('[FatigueClassifier] predict error:', e);
        }
    }, [loadFatigueModel]);

    useEffect(() => {
        if (!hasLoadedModel.current) {
            exerciseRecognition.loadModelFromAsset('exercise_classifier_rf.json');
            tempoClassifier.loadModelFromAsset('tempo_classifier.json');
            exerciseRecognition.startSession({ enterConfidence: 0.40, exitConfidence: 0.30, enterFrames: 3 });
            hasLoadedModel.current = true;
        }

        repCounterRef.current = createRepCounter();
        repCounterRef.current.startSession({ exercise: null });

        fatigueTimerRef.current = setInterval(() => {
            predictFatigue();
        }, FATIGUE_PREDICT_INTERVAL);

        return () => {
            if (repCounterRef.current) {
                repCounterRef.current.stopSession();
            }
            if (fatigueTimerRef.current) {
                clearInterval(fatigueTimerRef.current);
            }
            if (classifierRef.current) {
                classifierRef.current.unload();
                classifierRef.current = null;
                classifierReady.current = false;
            }
            exerciseRecognition.stopSession();
        };
    }, [predictFatigue]);

    return {
        processBuffer: (buffer: Float32Array) => {
            const { currentExercise } = useWorkoutStore.getState();
            processBuffer(buffer, repCounterRef.current, currentExercise?.exercise);
        },
        feedEMG,
    };
};