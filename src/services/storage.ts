// File: src/services/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    PROFILE: 'wh:profile',
    ONBOARDING_DONE: 'wh:onboarding_done',
    WORKOUTS: 'wh:workouts',
    SETTINGS: 'wh:settings',
    STATS: 'wh:stats',
} as const;

type StorageKey = typeof KEYS[keyof typeof KEYS];

class StorageService {
    async get<T>(key: StorageKey): Promise<T | null> {
        try {
            const raw = await AsyncStorage.getItem(key);
            return raw ? (JSON.parse(raw) as T) : null;
        } catch {
            return null;
        }
    }

    async set<T>(key: StorageKey, value: T): Promise<boolean> {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    }

    async remove(key: StorageKey): Promise<void> {
        try {
            await AsyncStorage.removeItem(key);
        } catch { /* silent */ }
    }

    async clearAll(): Promise<void> {
        try {
            await AsyncStorage.multiRemove(Object.values(KEYS));
        } catch { /* silent */ }
    }

    // Convenience wrappers
    async isOnboardingDone(): Promise<boolean> {
        const val = await this.get<boolean>(KEYS.ONBOARDING_DONE);
        return val === true;
    }

    async setOnboardingDone(): Promise<void> {
        await this.set(KEYS.ONBOARDING_DONE, true);
    }
}

export const storage = new StorageService();
export { KEYS as STORAGE_KEYS };