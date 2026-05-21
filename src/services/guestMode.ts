export const GUEST_MODE_KEY = 'wh:guest_mode';

export const getGuestMode = async (): Promise<boolean> => {
  try {
    // Lazy-load AsyncStorage to avoid importing it in environments/tests that don't need it.
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    const raw = await AsyncStorage.getItem(GUEST_MODE_KEY);
    return raw === 'true';
  } catch {
    return false;
  }
};

export const setGuestMode = async (enabled: boolean): Promise<void> => {
  try {
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    await AsyncStorage.setItem(GUEST_MODE_KEY, String(enabled));
  } catch {
    // ignore
  }
};

