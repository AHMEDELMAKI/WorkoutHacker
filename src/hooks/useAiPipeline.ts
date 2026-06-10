/**
 * Unified AI Pipeline Hook
 * - Orchestrates Vision Camera Frame Processors
 * - Runs Pose Detection in a Worklet
 * - Streams shared landmarks to AI modules (RepCounter, GhostGuide, etc.)
 * - Updates global AI store
 */
import { useEffect, useRef, useCallback } from 'react';
import { Worklets } from 'react-native-worklets-core';
import { useAiStore } from '../store/aiStore';
import { useWorkoutStore } from '../store/workoutStore';
import { PoseLandmarks } from 'react-native-pose-landmarks';
import { exerciseRecognition } from 'react-native-exercise-recognition';
import { createRepCounter } from 'react-native-rep-counter';
import { tempoClassifier } from 'react-native-tempo-classifier';
import { GhostGuideCore } from 'react-native-ghost-guide';

// Ghost Guide reference frames
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

export const useAiPipeline = () => {
    const setLandmarks = useAiStore((s) => s.setLandmarks);
    const updateInference = useAiStore((s) => s.updateInference);
    const setGuideOverlay = useAiStore((s) => s.setGuideOverlay);
    const currentWorkout = useWorkoutStore((s) => s.currentWorkout);
    const currentExercise = useWorkoutStore((s) => s.currentExercise);

    const repCounterRef = useRef<any>(null);
    const hasLoadedModel = useRef(false);

    // Initialization
    useEffect(() => {
        if (!hasLoadedModel.current) {
            exerciseRecognition.loadModelFromAsset('exercise_classifier_rf.json');
            tempoClassifier.loadModelFromAsset('tempo_classifier.json');
            hasLoadedModel.current = true;
        }
        repCounterRef.current = createRepCounter();
        repCounterRef.current.startSession({ exercise: null });

        return () => {
            if (repCounterRef.current) {
                repCounterRef.current.stopSession();
            }
        };
    }, []);

    // Worklet-safe setter to update the JS-side store from the Frame Processor thread
    const updateStoreJS = Worklets.createRunOnJS((landmarks: any[], inference: any, ghostData?: any) => {
        setLandmarks(landmarks);
        if (inference) updateInference(inference);
        if (ghostData) setGuideOverlay(ghostData.skeleton, ghostData.deviation);
    });

    const lastUpdate = useRef(0);

    const frameProcessor = useCallback((frame: any) => {
        'worklet';
        const now = Date.now();
        if (now - lastUpdate.current < 66) return; // ~15 FPS
        lastUpdate.current = now;

        const buffer = PoseLandmarks.getLandmarksBuffer();
        if (!buffer || buffer.length === 0) return;

        // 1. Parse Landmarks
        const landmarks = [];
        for (let i = 0; i < 33; i++) {
            landmarks.push({
                x: buffer[i * 4],
                y: buffer[i * 4 + 1],
                z: buffer[i * 4 + 2],
                visibility: buffer[i * 4 + 3],
            });
        }

        // 2. Exercise Recognition
        exerciseRecognition.ingestLandmarksBuffer(buffer);
        const exercise = exerciseRecognition.getCurrentExercise() ?? null;
        const exConfidence = exerciseRecognition.getCurrentConfidence();

        // 3. Rep Counting & Phase
        let reps = 0;
        let phase = 'UNKNOWN';
        if (repCounterRef.current) {
            const state = repCounterRef.current.update(buffer, exercise);
            reps = state.reps;
            phase = state.phase;
        }

        // 4. Tempo & Quality
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

        // 5. Ghost Guide & Form Score
        let deviation = 0;
        let ghostSkeleton = null;
        let formScore = 100;

        // Identify which ghost reference to use
        let ghostKey: keyof typeof GHOST_REFS | null = null;
        if (exercise) {
            if (exercise.includes('bicep')) ghostKey = 'bicep_curl';
            else if (exercise.includes('shoulder_press')) ghostKey = 'shoulder_press';
            else if (exercise.includes('front_raise')) ghostKey = 'front_raise';
            else if (exercise.includes('lateral_raise')) ghostKey = 'lateral_raise';
            else if (exercise.includes('triceps')) ghostKey = 'triceps_extension';
        }

        if (ghostKey && GHOST_REFS[ghostKey]) {
            const res = GhostGuideCore.processLandmarksBufferWithReference(
                buffer,
                GHOST_REFS[ghostKey],
                { applyReferencePose: true }
            );
            if (res) {
                deviation = res.deviationScore;
                ghostSkeleton = res.ghostSkeleton;
                // Map deviation (0-1 typically) to form score (0-100)
                // Lower deviation = higher form score
                formScore = Math.max(0, Math.min(100, 100 - (deviation * 150)));
            }
        }

        // 6. Fatigue Level Heuristic (Based on Tempo Quality)
        let fatigue: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
        if (quality < 30) fatigue = 'CRITICAL';
        else if (quality < 50) fatigue = 'HIGH';
        else if (quality < 75) fatigue = 'MEDIUM';

        const inference = {
            reps,
            formScore,
            fatigue,
            tempo,
            tempoQuality: quality,
            exercise,
            timestampMs: now,
        };

        updateStoreJS(landmarks, inference, ghostSkeleton ? { skeleton: ghostSkeleton.points, deviation } : null);
    }, [updateStoreJS]);

    return { frameProcessor };
};
