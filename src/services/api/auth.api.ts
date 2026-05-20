/**
 * Auth API service module.
 * All authentication-related API calls go through here.
 */
import { api } from './client';
import { secureStorage } from '../secureStorage';

export interface AuthUser {
    id: string;
    email: string;
    emailVerified: boolean;
    displayName?: string;
    onboardingDone?: boolean;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
}

export const authApi = {
    async register(payload: {
        email: string;
        password: string;
        displayName?: string;
    }): Promise<AuthTokens> {
        const result = await api.post<AuthTokens>('/api/auth/register', payload);
        await secureStorage.setTokens(result.accessToken, result.refreshToken);
        return result;
    },

    async login(email: string, password: string): Promise<AuthTokens> {
        const result = await api.post<AuthTokens>('/api/auth/login', { email, password });
        await secureStorage.setTokens(result.accessToken, result.refreshToken);
        return result;
    },

    async logout(): Promise<void> {
        try {
            await api.post('/api/auth/logout');
        } finally {
            await secureStorage.clearTokens();
        }
    },

    async forgotPassword(email: string): Promise<void> {
        await api.post('/api/auth/forgot-password', { email });
    },

    async verifyOtp(
        email: string,
        code: string,
        type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' = 'EMAIL_VERIFICATION',
    ): Promise<{ token: string }> {
        return api.post<{ token: string }>('/api/auth/verify-otp', { email, code, type });
    },

    async resetPassword(password: string): Promise<void> {
        await api.post('/api/auth/reset-password', { password });
    },
};
