// File: src/hooks/useProfile.ts
import { useEffect, useState, useCallback } from 'react';
import { profileService } from '../services/profileService';
import type { ProfileSetupState } from '../features/profileSetup/context/ProfileSetupContext';

export const useProfile = () => {
    const [profile, setProfile] = useState<ProfileSetupState | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        profileService.load().then(p => {
            setProfile(p);
            setLoading(false);
        });
    }, []);

    const updateProfile = useCallback(async (partial: Partial<ProfileSetupState>) => {
        await profileService.update(partial);
        const fresh = await profileService.load();
        setProfile(fresh);
    }, []);

    const deleteProfile = useCallback(async () => {
        await profileService.delete();
        setProfile(null);
    }, []);

    return { profile, loading, updateProfile, deleteProfile };
};