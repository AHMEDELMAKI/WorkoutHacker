// File: src/hooks/useAppInit.ts
import { useEffect, useState } from 'react';
import { storage } from '../services/storage';
import { profileService } from '../services/profileService';
import { settingsService } from '../services/settingsService';
import type { AppSettings } from '../services/settingsService';
import type { ProfileSetupState } from '../features/profileSetup/context/ProfileSetupContext';
import { useAuthStore } from '../store/authStore';

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
                const settings = await settingsService.load();

                // Prefer backend onboardingDone (authStore.initialize -> userApi.getProfile)
                const refreshFromBackend = async () => {
                    const store = useAuthStore.getState();
                    const { initialize } = store;

                    await initialize();

                    const { user, isGuest, isAuthenticated } = useAuthStore.getState();
                    
                    if (isGuest) {
                        return { initialRoute: 'Onboarding' as InitRoute, profile: null };
                    }

                    if (isAuthenticated) {
                        const onboardingDone = user?.onboardingDone ?? false;
                        
                        // Sync local storage if backend says we are done
                        if (onboardingDone) {
                            storage.setOnboardingDone().catch(() => {});
                        }

                        return {
                            initialRoute: onboardingDone ? ('Main' as InitRoute) : ('ProfileSetup' as InitRoute),
                            profile: profileService.load().catch(() => null),
                        };
                    }

                    return { initialRoute: 'Onboarding' as InitRoute, profile: null };
                };

                try {
                    const { initialRoute, profile } = await refreshFromBackend();
                    setState({
                        loading: false,
                        initialRoute,
                        settings,
                        profile: await profile,
                    });
                } catch (backendErr) {
                    console.warn('[useAppInit] Backend init failed, checking local fallback:', backendErr);
                    
                    // Fallback: local storage gating (offline/legacy behavior)
                    const [onboardingDone, profile, tokensExist] = await Promise.all([
                        storage.isOnboardingDone(),
                        profileService.load(),
                        import('../services/secureStorage').then(m => m.secureStorage.hasTokens())
                    ]);

                    let initialRoute: InitRoute = 'Onboarding';
                    
                    if (tokensExist) {
                        // We have tokens but backend is unreachable
                        initialRoute = onboardingDone ? 'Main' : 'ProfileSetup';
                    } else if (onboardingDone) {
                        // No tokens but onboarding was done before (maybe guest or cleared)
                        initialRoute = 'Auth';
                    }

                    setState({ loading: false, initialRoute, settings, profile });
                }
            } catch {
                setState(s => ({ ...s, loading: false, initialRoute: 'Onboarding' }));
            }
        };

        init();
    }, []);

    return state;
};
