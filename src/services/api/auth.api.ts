/**
 * Auth API service module.
 * All authentication-related API calls go through here.
 */
import { api } from './client';
import { secureStorage } from '../secureStorage';
import { userApi } from './user.api';

export interface AuthUser {
    id: string;
    email: string;
    emailVerified: boolean;
    firstName?: string;
    lastName?: string;
    onboardingDone?: boolean;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
}

// A simple Base64 decoder that works in React Native's environment
const b64Decode = (str: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    str = String(str).replace(/=+$/, '');
    for (
        let bc = 0, bs = 0, buffer, i = 0;
        (buffer = str.charAt(i++));
        ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
            ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
            : 0
    ) {
        buffer = chars.indexOf(buffer);
    }
    return output;
};

function decodeJwt(token: string): { id: string; userType?: string } {
    try {
        console.log('[decodeJwt] Token to decode:', token.substring(0, 50) + '...');
        console.log('[decodeJwt] Token type:', typeof token);
        console.log('[decodeJwt] Token length:', token.length);
        
        const parts = token.split('.');
        console.log('[decodeJwt] JWT parts count:', parts.length);
        
        if (parts.length !== 3) {
            throw new Error(`Invalid JWT format: expected 3 parts, got ${parts.length}`);
        }
        
        const payloadBase64 = parts[1];
        console.log('[decodeJwt] Base64 payload:', payloadBase64.substring(0, 50) + '...');
        
        const decodedPayload = b64Decode(payloadBase64);
        console.log('[decodeJwt] Decoded payload string:', decodedPayload);
        
        const parsed = JSON.parse(decodedPayload);
        console.log('[decodeJwt] Parsed JSON:', parsed);
        
        return parsed;
    } catch (e: any) {
        console.error('[decodeJwt] Failed to decode JWT:', e.message);
        console.error('[decodeJwt] Error details:', e);
        throw new Error(`Invalid token received from server: ${e.message}`);
    }
}

export const authApi = {
    async register(payload: {
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
        userType?: 'user' | 'coach';
    }): Promise<AuthTokens> {
        const url = payload.userType ? `/auth/register?userType=${payload.userType}` : '/auth/register';
        const { userType, ...body } = payload;
        const result = await api.post<{ data: AuthTokens }>(url, body);
        await secureStorage.setTokens(result.data.accessToken, result.data.refreshToken);
        return {
            ...result.data,
            user: {
                ...result.data.user,
                onboardingDone: result.data.user.onboardingDone ?? false,
            },
        };
    },

    async login(email: string, password: string): Promise<AuthTokens> {
        console.log('[authApi.login] Calling backend...');
        // Use any to safely handle different wrapper formats
        const response = await api.post<any>('/auth/login', { email, password });
        console.log('[authApi.login] Raw response:', JSON.stringify(response, null, 2));
        
        // Normalize response: extract from .data if present, else use root
        const result = response.data !== undefined ? response.data : response;

        let accessToken: string;
        let refreshToken: string;
        let user: AuthUser;
        
        if (typeof result === 'string') {
            // Old backend format: just returns the JWT token string
            console.log('[authApi.login] Detected legacy format (JWT string only)');
            accessToken = result;
            
            try {
                // Decode JWT to get user ID
                const decodedToken = decodeJwt(accessToken);
                console.log('[authApi.login] Decoded JWT:', decodedToken);
                
                const userId = decodedToken.id || decodedToken.sub;
                if (!userId) {
                    throw new Error('JWT missing id or sub field');
                }
                
                // CRITICAL: We must store the token BEFORE fetching the profile, 
                // because userApi.getProfile needs it in the headers.
                await secureStorage.setTokens(accessToken, 'LEGACY_REFRESH_TOKEN');
                
                // Fetch user profile with the access token
                console.log('[authApi.login] Fetching user profile for ID:', userId);
                try {
                    const userProfile = await userApi.getProfile(userId);
                    console.log('[authApi.login] User profile fetched:', userProfile);
                    
                    if (!userProfile) {
                        throw new Error('User profile is empty/undefined');
                    }
                    
                    refreshToken = 'LEGACY_REFRESH_TOKEN';
                    user = {
                        id: userProfile.id,
                        email: userProfile.email,
                        firstName: userProfile.firstName,
                        lastName: userProfile.lastName,
                        emailVerified: true, // Assume verified on login
                    };
                } catch (profileErr: any) {
                    console.error('[authApi.login] Error fetching user profile:', profileErr.message);
                    
                    // Fallback to minimal user data from JWT
                    refreshToken = 'LEGACY_REFRESH_TOKEN';
                    user = {
                        id: userId,
                        email: decodedToken.email || 'unknown@email.com',
                        firstName: 'User',
                        lastName: '',
                        emailVerified: false,
                        onboardingDone: false,
                    };
                }
            } catch (decodeErr: any) {
                console.error('[authApi.login] Error decoding JWT:', decodeErr);
                throw new Error(`Login error: ${decodeErr.message}`);
            }
        } else {
            // New backend format: returns object with accessToken, refreshToken, user
            console.log('[authApi.login] Detected standard format (object)');
            const at = result.accessToken || result.token;
            const rt = result.refreshToken || 'NO_REFRESH_TOKEN';
            const u = result.user;

            if (!at || !u) {
                console.error('[authApi.login] Missing required fields in response:', result);
                throw new Error('Invalid login response format');
            }

            accessToken = at;
            refreshToken = rt;
            user = {
                id: u.id,
                email: u.email,
                emailVerified: u.emailVerified ?? true,
                firstName: u.firstName || u.profile?.firstName,
                lastName: u.lastName || u.profile?.lastName,
                onboardingDone: u.onboardingDone ?? u.profile?.onboardingDone ?? false,
            };

            // Store tokens in secure storage
            await secureStorage.setTokens(accessToken, refreshToken);
        }
        
        console.log('[authApi.login] Login complete. User:', user.email);

        return {
            accessToken,
            refreshToken,
            user,
        };
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

    async verifyOtp(email: string, code: string, type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' = 'PASSWORD_RESET'): Promise<string> {
        const result = await api.post<{ data: { token: string } }>('/api/auth/verify-otp', { email, code, type });
        return result.data.token;
    },

    async resetPassword(token: string, newPassword: string): Promise<void> {
        // We use the temp token to authenticate the reset request
        await api.post('/api/auth/reset-password', { password: newPassword }, {
            headers: { Authorization: `Bearer ${token}` }
        });
    },
};
