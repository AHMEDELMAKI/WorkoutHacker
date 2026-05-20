// File: src/hooks/useAppInit.ts
import { useEffect, useState } from 'react';
import { storage } from '../services/storage';
import { profileService } from '../services/profileService';
import { settingsService } from '../services/settingsService';
import type { AppSettings } from '../services/settingsService';
import type { ProfileSetupState } from '../features/profileSetup/context/ProfileSetupContext';

type InitRoute = 'Onboarding' | 'Auth' | 'ProfileSetup' | 'Main';

interface AppInitState {
    loading: boolean;
    initialRoute: InitRoute;
    settings: AppSettings | null;
    profile: ProfileSetupState | null;
}

export const useAppInit = (): AppInitState => {
    const [state, setState] = useState<AppInitState>({
        loading: true,
        initialRoute: 'Onboarding',
        settings: null,
        profile: null,
    });

    useEffect(() => {
        const init = async () => {
            try {
                const [onboardingDone, profile, settings] = await Promise.all([
                    storage.isOnboardingDone(),
                    profileService.load(),
                    settingsService.load(),
                ]);

                let initialRoute: InitRoute = 'Onboarding';
                if (onboardingDone && profile?.gender && profile.goals.length > 0) {
                    initialRoute = 'Main';
                } else if (onboardingDone) {
                    initialRoute = 'Auth';
                }

                setState({ loading: false, initialRoute, settings, profile });
            } catch {
                setState(s => ({ ...s, loading: false, initialRoute: 'Onboarding' }));
            }
        };

        init();
    }, []);

    return state;
};