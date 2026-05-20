declare module 'react-native-pose-landmarks' {
  export type PoseLandmarksInitOptions = {
    // keep it permissive; native module may accept different options by version
    [key: string]: any;
  };

  export type PoseLandmarksInstance = {
    // Optional instance API (some versions expose instance methods, others expose statics)
    initPoseLandmarker?: (...args: any[]) => boolean;
    closePoseLandmarker?: () => void;
    getLandmarksBuffer?: () => number[];
    getLastInferenceTimeMs?: () => number;
    [key: string]: any;
  };

  export const PoseLandmarks: PoseLandmarksInstance & {
    initPoseLandmarker: (...args: any[]) => boolean;
    closePoseLandmarker: () => void;
    getLandmarksBuffer: () => number[];
    getLastInferenceTimeMs: () => number;
  };

  export default PoseLandmarks;
}
