import { useEffect, useState } from 'react';
import { PoseLandmarks } from 'react-native-pose-landmarks';

const LANDMARK_COUNT = 33;
const VALUES_PER_LANDMARK = 4;

export function usePoseLandmarks() {
  const [landmarks, setLandmarks] = useState<number[]>([]);
  const [inferenceMs, setInferenceMs] = useState<number>(-1);

  useEffect(() => {
    const initialized = PoseLandmarks.initPoseLandmarker();
    if (!initialized) return;

    const interval = setInterval(() => {
      const buffer = PoseLandmarks.getLandmarksBuffer();

      if (Array.isArray(buffer) && buffer.length === LANDMARK_COUNT * VALUES_PER_LANDMARK) {
        setLandmarks(buffer);
      }

      setInferenceMs(PoseLandmarks.getLastInferenceTimeMs());
    }, 33);

    return () => {
      clearInterval(interval);
      PoseLandmarks.closePoseLandmarker();
    };
  }, []);

  return { landmarks, inferenceMs };
}
