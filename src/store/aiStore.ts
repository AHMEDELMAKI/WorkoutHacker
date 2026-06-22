/**
 * AI Zustand Store
 * Centralized state for the unified AI pipeline detection results and landmarks.
 */
import { create } from 'zustand';

export interface PoseLandmark {
    x: number;
    y: number;
    z?: number;
    visibility?: number;
}

interface AiState {
    landmarks: PoseLandmark[] | null;
    detectedExercise: string | null;
    reps: number;
    formScore: number;
    fatigueLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    fatigueConfidence: number;
    tempo: string | null;
    tempoQuality: number;
    isProcessing: boolean;
    imuClassification: string | null;

    // Ghost Guide state
    guideOverlay: PoseLandmark[] | null;
    deviationScore: number;

    // Debug variables
    debugEmgBufferLength: number;
    debugLastPredictTime: string | null;
    debugClassifierMuscle: string | null;

    // Actions
    setLandmarks: (landmarks: PoseLandmark[]) => void;
    updateInference: (data: {
        reps?: number;
        formScore?: number;
        fatigue?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        fatigueConfidence?: number;
        tempo?: string;
        tempoQuality?: number;
        exercise?: string;
        imuClassification?: string | null;
        debugEmgBufferLength?: number;
        debugLastPredictTime?: string | null;
        debugClassifierMuscle?: string | null;
    }) => void;
    setGuideOverlay: (overlay: PoseLandmark[] | null, deviation?: number) => void;
    setProcessing: (val: boolean) => void;
    reset: () => void;
}

export const useAiStore = create<AiState>((set) => ({
    landmarks: null,
    detectedExercise: null,
    reps: 0,
    formScore: 100,
    fatigueLevel: 'LOW',
    fatigueConfidence: 0,
    tempo: null,
    tempoQuality: 0,
    isProcessing: false,
    imuClassification: null,
    guideOverlay: null,
    deviationScore: 0,

    // Debug defaults
    debugEmgBufferLength: 0,
    debugLastPredictTime: null,
    debugClassifierMuscle: null,

    setLandmarks: (landmarks) => set({ landmarks }),

    updateInference: (data) => set((state) => ({
        reps: data.reps ?? state.reps,
        formScore: data.formScore ?? state.formScore,
        fatigueLevel: data.fatigue ?? state.fatigueLevel,
        fatigueConfidence: data.fatigueConfidence ?? state.fatigueConfidence,
        tempo: data.tempo ?? state.tempo,
        tempoQuality: data.tempoQuality ?? state.tempoQuality,
        detectedExercise: data.exercise ?? state.detectedExercise,
        imuClassification: data.imuClassification !== undefined ? data.imuClassification : state.imuClassification,
        debugEmgBufferLength: data.debugEmgBufferLength ?? state.debugEmgBufferLength,
        debugLastPredictTime: data.debugLastPredictTime ?? state.debugLastPredictTime,
        debugClassifierMuscle: data.debugClassifierMuscle ?? state.debugClassifierMuscle,
    })),

    setGuideOverlay: (overlay, deviation) => set({
        guideOverlay: overlay,
        deviationScore: deviation ?? 0,
    }),

    setProcessing: (val) => set({ isProcessing: val }),

    reset: () => set({
        landmarks: null,
        detectedExercise: null,
        reps: 0,
        formScore: 100,
        fatigueLevel: 'LOW',
        fatigueConfidence: 0,
        tempo: null,
        tempoQuality: 0,
        isProcessing: false,
        imuClassification: null,
        guideOverlay: null,
        deviationScore: 0,
        debugEmgBufferLength: 0,
        debugLastPredictTime: null,
        debugClassifierMuscle: null,
    }),
}));
