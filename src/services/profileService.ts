// File: src/services/profileService.ts
import { storage, STORAGE_KEYS } from './storage';
import type { ProfileSetupState } from '../features/profileSetup/context/ProfileSetupContext';

export const profileService = {
    async save(profile: ProfileSetupState): Promise<boolean> {
        return storage.set(STORAGE_KEYS.PROFILE, profile);
    },

    async load(): Promise<ProfileSetupState | null> {
        return storage.get<ProfileSetupState>(STORAGE_KEYS.PROFILE);
    },

    async update(partial: Partial<ProfileSetupState>): Promise<boolean> {
        const existing = await profileService.load();
        if (!existing) return false;
        return profileService.save({ ...existing, ...partial });
    },

    async delete(): Promise<void> {
        await storage.remove(STORAGE_KEYS.PROFILE);
    },
};