import { NativeModules, Platform } from 'react-native';

type WorkoutTtsNativeModule = {
  speak: (text: string) => Promise<void>;
  stop: () => Promise<void>;
  shutdown: () => Promise<void>;
};

const nativeTts = NativeModules.WorkoutTtsModule as WorkoutTtsNativeModule | undefined;

export const speak = async (text: string): Promise<void> => {
  if (Platform.OS !== 'android' || !nativeTts?.speak) {
    return;
  }

  try {
    await nativeTts.speak(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('[TTS] Speak failed:', message);
  }
};

export const stopTts = async (): Promise<void> => {
  if (Platform.OS !== 'android' || !nativeTts?.stop) {
    return;
  }

  try {
    await nativeTts.stop();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('[TTS] Stop failed:', message);
  }
};

export const speakWorkoutStart = async (): Promise<void> => {
  await speak('Starting workout. Let us get to work.');
};