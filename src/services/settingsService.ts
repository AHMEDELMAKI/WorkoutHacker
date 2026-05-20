// File: src/services/settingsService.ts
import { storage, STORAGE_KEYS } from './storage';

export interface AppSettings {
    notifications: boolean;
    darkMode: boolean;
    units: 'metric' | 'imperial';
    language: string;
    privacyLocalOnly: boolean;
    privacyShareAnalytics: boolean;
    privacyCameraAccess: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
    notifications: true,
    darkMode: true,
    units: 'metric',
    language: 'en',
    privacyLocalOnly: true,
    privacyShareAnalytics: false,
    privacyCameraAccess: true,
};

export const settingsService = {
    async load(): Promise<AppSettings> {
        const saved = await storage.get<AppSettings>(STORAGE_KEYS.SETTINGS);
        return { ...DEFAULT_SETTINGS, ...saved };
    },

    async save(settings: AppSettings): Promise<boolean> {
        return storage.set(STORAGE_KEYS.SETTINGS, settings);
    },

    async update(partial: Partial<AppSettings>): Promise<boolean> {
        const current = await settingsService.load();
        return settingsService.save({ ...current, ...partial });
    },

    async reset(): Promise<boolean> {
        return settingsService.save(DEFAULT_SETTINGS);
    },
};