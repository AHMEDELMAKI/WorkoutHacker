declare module 'react-native-rep-counter' {
  export type RepCounterState = {
    phase: string;
    reps: number;
    confidence: number;
    activeArm: string | null;
  };

  export type RepCounterConfig = {
    exercise: string | null;
  };

  export function createRepCounter(): {
    startSession(config: RepCounterConfig): void;
    stopSession(): void;
    update(buffer: number[], exercise: string | null): RepCounterState;
  };
}

declare module 'react-native-random-forest' {
  export const randomForest: {
    loadModelFromAsset(assetName: string): boolean;
    predict(features: number[]): number;
    predictProba(features: number[]): number[];
  };
}

declare module 'react-native-tempo-classifier' {
  export const tempoClassifier: {
    loadModelFromAsset(assetName: string): boolean;
    update(phase: string, fps: number): void;
    getCurrentTempo(): string;
    getCurrentQuality(): number;
    setExercise(exercise: string): void;
  };
}

declare module 'react-native-exercise-recognition' {
  export const exerciseRecognition: {
    loadModelFromAsset(assetName: string): boolean;
    startSession(config: {
      enterConfidence: number;
      exitConfidence: number;
      enterFrames: number;
    }): void;
    stopSession(): void;
    ingestLandmarksBuffer(buffer: number[]): void;
    getCurrentExercise(): string | null;
    getCurrentConfidence(): number;
    getLastClassifierInferenceTimeMs(): number;
  };
}

