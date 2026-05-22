declare module 'react-native-ghost-guide' {
  export type GhostSkeleton = {
    points?: Array<{ x: number; y: number; visibility?: number }>;
  };

  export type ProcessResult = {
    repCount: number;
    currentCheckpointIndex: number;
    isAligned: boolean;
    ghostSkeleton?: GhostSkeleton;
  };

  export const GhostGuideCore: {
    createReferenceFromFrames: (frames: any[], exerciseKey: string) => any;
    loadReference: (reference: any) => void;
    processLandmarksBufferWithReference: (
      buffer: number[],
      frames: any[],
      opts: { applyReferencePose: boolean; frameIndex: number }
    ) => ProcessResult | null;
  };
}
