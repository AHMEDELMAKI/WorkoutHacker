declare module 'react-native-pose-landmarks' {
  import { ViewProps } from 'react-native';

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

  export interface PoseLandmarksViewProps extends ViewProps {
    hybridRef?: any;
    isActive?: boolean;
    enableSkeleton?: boolean;
    skeletonColor?: string;
    skeletonBoneThickness?: number;
    landmarkColor?: string;
    minVisibilityConfidence?: number;
    modelSelection?: number;
    delegateSelection?: number;
    inferenceSampleRateHz?: number;
    enableVisibilityRecovery?: boolean;
    enableOneEuroFilter?: boolean;
    enableMotionPrediction?: boolean;
    oneEuroMinCutoff?: number;
    oneEuroBeta?: number;
    width?: number;
    height?: number;
  }

  export const PoseLandmarksView: React.FC<PoseLandmarksViewProps>;

  export default PoseLandmarks;
}
