import { PermissionsAndroid, Platform } from 'react-native';
import { loadModel, onResult, start, stop, unload } from 'react-native-vosk';
//import { RNFSManager } from 'react-native-fs';


export type VoskResult = {
  text?: string;
};

let modelLoaded = false;
let modelLoadError: string | null = null;
let voskStarted = false;

export const ensureMicPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    {
      title: 'Microphone Permission',
      message: 'This app needs microphone access for voice commands.',
      buttonPositive: 'OK',
      buttonNegative: 'Cancel',
      buttonNeutral: 'Ask Me Later',
    },
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

export const ensureVoskModel = async (): Promise<void> => {
  if (modelLoaded) {
    return;
  }

  if (modelLoadError) {
    throw new Error(`Vosk model previously failed to load: ${modelLoadError}`);
  }

  try {
    console.log('[Vosk] Loading model: vosk-model-small-en-us-0.15');
    await loadModel('vosk-model-small-en-us-0.15');
    console.log('[Vosk] Model loaded successfully');
    modelLoaded = true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Vosk] Failed to load model:', errorMessage);
    modelLoadError = errorMessage;
    throw error;
  }
};

export const startVosk = async (): Promise<void> => {
  if (voskStarted) {
    console.log('[Vosk] Start skipped because recognizer is already active');
    return;
  }

  try {
    console.log('[Vosk] Starting voice recognition');
    await start();
    console.log('[Vosk] Voice recognition started');
    voskStarted = true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('Recognizer is already in use') || errorMessage.toLowerCase().includes('already in use')) {
      console.warn('[Vosk] Recognizer already in use, continuing with existing session');
      voskStarted = true;
      return;
    }
    console.error('[Vosk] Failed to start:', errorMessage);
    throw error;
  }
};

export const stopVosk = async (): Promise<void> => {
  try {
    console.log('[Vosk] Stopping voice recognition');
    await stop();
    console.log('[Vosk] Voice recognition stopped');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Vosk] Failed to stop:', errorMessage);
  } finally {
    voskStarted = false;
  }
};

export const unloadVosk = async (): Promise<void> => {
  try {
    console.log('[Vosk] Unloading model and stopping recognizer');
    await stop();
    unload();
    console.log('[Vosk] Model unloaded successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Vosk] Failed to unload:', errorMessage);
  } finally {
    voskStarted = false;
    modelLoaded = false;
    modelLoadError = null;
  }
};

export const subscribeVoskResults = (callback: (text: string) => void) => {
  try {
    console.log('[Vosk] Subscribing to results');
    // Some native failures (model not loaded / vosk not started) can cause onResult to throw.
    // We guard here so GlobalVoiceController doesn't crash with "onresults of undefined".
    const subscription = onResult((result) => {
      console.log('[Vosk] Raw result event:', result);
      const text =
        typeof result === 'string'
          ? result.trim()
          : typeof result === 'object' && result !== null
          ? String((result as any).text ?? '').trim()
          : '';

      if (text.length > 0) {
        console.log('[Vosk] Result:', text);
        callback(text.toLowerCase());
      }
    });

    if (!subscription || typeof subscription.remove !== 'function') {
      console.warn('[Vosk] Subscription returned invalid object');
      return () => {
        // no-op
      };
    }

    return () => {
      console.log('[Vosk] Unsubscribing from results');
      subscription.remove();
    };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error('[Vosk] Failed to subscribe:', errorMessage);
    return () => {
      // no-op
    };
  }
};

export const isModelLoaded = (): boolean => {
  return modelLoaded;
};

export const getModelLoadError = (): string | null => {
  return modelLoadError;
};