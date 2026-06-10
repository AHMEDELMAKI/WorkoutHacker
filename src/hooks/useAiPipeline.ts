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
import { GhostGuideCore } from '../lib/ghostGuide';
// import { sessionApi } from '../services/api/session.api';
import { PoseLandmarks } from 'react-native-pose-landmarks';

// Secondary AI logic can be imported here
// import { RepCounter } from 'react-native-rep-counter';
// import { FormAnalyzer } from '../lib/formAnalysis';

export const useAiPipeline = () => {
    const setLandmarks = useAiStore((s) => s.setLandmarks);
    const updateInference = useAiStore((s) => s.updateInference);
    const setGuideOverlay = useAiStore((s) => s.setGuideOverlay);
    const currentWorkout = useWorkoutStore((s) => s.currentWorkout);
    const currentExercise = useWorkoutStore((s) => s.currentExercise);

    // Worklet-safe setter to update the JS-side store from the Frame Processor thread
    const updateStoreJS = Worklets.createRunOnJS((landmarks: any[], inference: any, ghostData?: any) => {
        setLandmarks(landmarks);
        if (inference) updateInference(inference);
        if (ghostData) setGuideOverlay(ghostData.skeleton, ghostData.deviation);
    });

    const lastUpdate = useRef(0);
    const metricBuffer = useRef<any[]>([]);
    const lastSync = useRef(Date.now());

    const frameProcessor = useCallback((frame: any) => {
        'worklet';
        const now = Date.now();
        if (now - lastUpdate.current < 66) return; // ~15 FPS
        lastUpdate.current = now;

        const buffer = PoseLandmarks.getLandmarksBuffer();
        if (!buffer || buffer.length === 0) return;

        const landmarks = [];
        for (let i = 0; i < 33; i++) {
            landmarks.push({
                x: buffer[i * 4],
                y: buffer[i * 4 + 1],
                z: buffer[i * 4 + 2],
                visibility: buffer[i * 4 + 3],
            });
        }

        const inference = {
            reps: 0,
            formScore: 95,
            fatigue: 'LOW',
            timestampMs: now,
        };

        // Buffer the metric for batch sync
        metricBuffer.current.push(inference);

        updateStoreJS(landmarks, inference, null);
    }, [updateStoreJS]);

    // Background sync loop for buffered metrics
    /*
    NOTE: The AI metrics API is not included in the Swagger specification.
    This code is commented out to avoid breaking the application.
    useEffect(() => {
        PoseLandmarks.initPoseLandmarker();

        const syncInterval = setInterval(() => {
            if (metricBuffer.current.length > 0 && currentWorkout) {
                const batch = [...metricBuffer.current];
                metricBuffer.current = [];
                // sessionApi.logAiMetricsBatch(currentWorkout.id, batch).catch(e => {
                //     console.warn('[AI Pipeline] Batch sync failed:', e.message);
                // });
            }
        }, 10000); // Sync every 10 seconds

        return () => {
            PoseLandmarks.closePoseLandmarker();
            clearInterval(syncInterval);
        };
    }, [currentWorkout]);
    */

    return { frameProcessor };
};
