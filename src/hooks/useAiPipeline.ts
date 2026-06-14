import { useEffect, useRef } from 'react';
import { useAiStore } from '../store/aiStore';
import { useWorkoutStore } from '../store/workoutStore';
import { exerciseRecognition } from 'react-native-exercise-recognition';
import { createRepCounter } from 'react-native-rep-counter';
import { tempoClassifier } from 'react-native-tempo-classifier';
import { GhostGuideCore } from 'react-native-ghost-guide';

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

const processBuffer = (
    buffer: Float32Array,
    repCounter: any,
    currentExerciseName: string | undefined,
) => {
    // Exercise Recognition
    exerciseRecognition.ingestLandmarksBuffer(buffer);
    const exercise = exerciseRecognition.getCurrentExercise() ?? null;

    // Rep Counting & Phase
    let reps = 0;
    let phase = 'UNKNOWN';
    if (repCounter) {
        const state = repCounter.update(buffer, exercise);
        reps = state.reps;
        phase = state.phase;
    }

    // Tempo & Quality
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

    // Ghost Guide & Form Score
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
            buffer,
            GHOST_REFS[ghostKey],
            { applyReferencePose: true }
        );
        if (res) {
            deviation = res.deviationScore;
            ghostSkeleton = res.ghostSkeleton;
            formScore = Math.max(0, Math.min(100, 100 - (deviation * 150)));
        }
    }

    // Fatigue Level Heuristic
    let fatigue: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (quality < 30) fatigue = 'CRITICAL';
    else if (quality < 50) fatigue = 'HIGH';
    else if (quality < 75) fatigue = 'MEDIUM';

    const updateInference = useAiStore.getState().updateInference;
    const setGuideOverlay = useAiStore.getState().setGuideOverlay;

    updateInference({
        reps,
        formScore,
        fatigue,
        tempo,
        tempoQuality: quality,
        exercise,
    });
    if (ghostSkeleton) {
        setGuideOverlay(ghostSkeleton.points, deviation);
    }
};

export const useAiPipeline = () => {
    const repCounterRef = useRef<any>(null);
    const hasLoadedModel = useRef(false);

    // Initialization
    useEffect(() => {
        if (!hasLoadedModel.current) {
            exerciseRecognition.loadModelFromAsset('exercise_classifier_rf.json');
            tempoClassifier.loadModelFromAsset('tempo_classifier.json');
            exerciseRecognition.startSession({ enterConfidence: 0.40, exitConfidence: 0.30, enterFrames: 3 });
            hasLoadedModel.current = true;
        }
        repCounterRef.current = createRepCounter();
        repCounterRef.current.startSession({ exercise: null });

        return () => {
            if (repCounterRef.current) {
                repCounterRef.current.stopSession();
            }
            exerciseRecognition.stopSession();
        };
    }, []);

    return {
        processBuffer: (buffer: Float32Array) => {
            const { currentExercise } = useWorkoutStore.getState();
            processBuffer(buffer, repCounterRef.current, currentExercise?.name);
        },
    };
};
