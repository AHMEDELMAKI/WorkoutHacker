/**
 * Auth Zustand Store
 * Centralized auth state: user, tokens, loading, and login/logout actions.
 * Replaces scattered useState in auth screens.
 */
import { create } from 'zustand';
import { authApi, AuthUser } from '../services/api/auth.api';
import { secureStorage } from '../services/secureStorage';
import { userApi } from '../services/api/user.api';
import { getGuestMode, setGuestMode } from '../services/guestMode';
import { navigationRef } from '../services/navigationService';

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;
    isGuest: boolean;

    // Actions
    initialize: () => Promise<void>;
    setGuest: (enabled: boolean) => Promise<void>;


    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
    error: null,
    isGuest: false,


    /**
     * Called on app startup to restore session from secure storage.
     */
    initialize: async () => {
        // Guest mode is persisted in AsyncStorage and bypasses secure-token auth.
        const guestEnabled = await getGuestMode();
        set({ isGuest: guestEnabled });

        // For guests we intentionally skip secureStorage token checks.
        if (guestEnabled) {
            set({ isAuthenticated: false, isInitialized: true, isLoading: false, user: null });
            return;
        }

        set({ isLoading: true });
        try {
            const hasTokens = await secureStorage.hasTokens();
            if (!hasTokens) {
                set({ isAuthenticated: false, isInitialized: true, isLoading: false });
                return;
            }
            // Fetch current user profile using stored access token
            const profile = await userApi.getProfile();

            // Trigger: Check if the user has physical data to skip onboarding even if onboardingDone flag is false.
            const hasPhysicalData = !!(profile.weight || profile.height);
            const onboardingDone = profile.onboardingDone || hasPhysicalData;

            set({
                user: {
                    id: profile.id,
                    email: profile.email,
                    emailVerified: true, // TODO: This should come from the API
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    onboardingDone: onboardingDone,
                },
                isAuthenticated: true,
                isInitialized: true,
                isLoading: false,
            });
        } catch {
            // Tokens are invalid or expired — clear and require re-login
            await secureStorage.clearTokens();
            set({ isAuthenticated: false, isInitialized: true, isLoading: false });
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const result = await authApi.login(email, password);
            
            // Trigger: After successful login, fetch the full profile to check for physical data.
            // If the user has weight data, we skip onboarding entirely.
            console.log('[AuthStore] Login successful, checking profile for onboarding skip...');
            const profile = await userApi.getProfile(result.user.id);
            
            // Check for weight or height as a signal that the user has already provided physical data.
            const hasPhysicalData = !!(profile.weight || profile.height);
            const onboardingDone = result.user.onboardingDone || profile.onboardingDone || hasPhysicalData;

            if (hasPhysicalData && !profile.onboardingDone) {
                console.log('[AuthStore] Physical data detected (weight/height), skipping onboarding.');
                // Optional: Notify backend that onboarding is done if it wasn't already.
                userApi.markOnboardingDone().catch(() => {});
            }

            set({
                user: {
                    ...result.user,
                    firstName: profile.firstName || result.user.firstName,
                    lastName: profile.lastName || result.user.lastName,
                    onboardingDone: onboardingDone,
                },
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (err: any) {
            set({ isLoading: false, error: err.message || 'Login failed' });
            throw err;
        }
    },

    register: async (email, password, firstName, lastName) => {
        console.log('[AuthStore] Attempting to register...');
        set({ isLoading: true, error: null });
        try {
            const result = await authApi.register({
                email,
                password,
                firstName: firstName || undefined,
                lastName: lastName || undefined,
            });
            console.log('[AuthStore] Registration API call successful.');
            set({
                user: result.user,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (err: any) {
            console.error('[AuthStore] Registration failed:', err);
            set({ isLoading: false, error: err.message || 'Registration failed' });
            throw err;
        }
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            // Only call backend logout if we were actually authenticated (not guest)
            if (!get().isGuest && get().isAuthenticated) {
                await authApi.logout();
            }
        } catch (error) {
            console.error('API logout failed, clearing local state anyway:', error);
        } finally {
            await setGuestMode(false);
            set({ 
                user: null, 
                isAuthenticated: false, 
                isGuest: false, 
                isLoading: false, 
                error: null 
            });
        }
    },

    refreshUser: async () => {
        try {
            console.log('[authStore] Refreshing user profile...');
            const profile = await userApi.getProfile();
            console.log('[authStore] Fetched profile:', profile);
            
            const currentUser = get().user;
            if (currentUser) {
                const updatedUser = {
                    ...currentUser,
                    firstName: profile.firstName,
                    lastName: profile.lastName,
                    onboardingDone: profile.onboardingDone,
                };
                console.log('[authStore] Updated user:', updatedUser);
                set({ user: updatedUser });
            }
        } catch (err: any) {
            console.error('[authStore] Error refreshing user:', err);
            /* silently ignore */
        }
    },

    setGuest: async (enabled: boolean) => {
        await setGuestMode(enabled);
        set({ isGuest: enabled });
        if (enabled) {
            // Ensure we don't accidentally treat a guest as authenticated.
            set({ user: null, isAuthenticated: false, isInitialized: true, isLoading: false, error: null });
        }
        // When disabling guest mode, app will rely on secure token initialization on next launch.
    },

    clearError: () => set({ error: null }),
}));
