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
    register: (email: string, password: string, displayName?: string) => Promise<{ email: string }>;
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
            const me = await userApi.getMe();
            set({
                user: {
                    id: me.id,
                    email: me.email,
                    emailVerified: true,
                    displayName: me.profile?.displayName ?? undefined,
                    onboardingDone: me.profile?.onboardingDone,
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
            set({
                user: result.user,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (err: any) {
            set({ isLoading: false, error: err.message || 'Login failed' });
            throw err;
        }
    },

    register: async (email, password, displayName) => {
        set({ isLoading: true, error: null });
        try {
            await authApi.register({ email, password, displayName });
            set({ isLoading: false });
            return { email };
        } catch (err: any) {
            set({ isLoading: false, error: err.message || 'Registration failed' });
            throw err;
        }
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            await authApi.logout();
        } finally {
            set({ user: null, isAuthenticated: false, isLoading: false, error: null });
        }
    },

    refreshUser: async () => {
        try {
            const me = await userApi.getMe();
            const currentUser = get().user;
            if (currentUser) {
                set({
                    user: {
                        ...currentUser,
                        displayName: me.profile?.displayName ?? undefined,
                        onboardingDone: me.profile?.onboardingDone,
                    },
                });
            }
        } catch {
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

