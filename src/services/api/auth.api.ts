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
        const result = await api.post<{ data: any }>('/auth/login', { email, password });
        
        console.log('[authApi.login] Raw response:', JSON.stringify(result, null, 2));
        
        // Handle both old (JWT string) and new (full object) response formats
        let accessToken: string;
        let refreshToken: string;
        let user: AuthUser;
        
        if (typeof result.data === 'string') {
            // Old backend format: just returns the JWT token string
            console.log('[authApi.login] Detected old format (JWT string only)');
            accessToken = result.data;
            
            try {
                // Decode JWT to get user ID
                const decodedToken = decodeJwt(accessToken);
                console.log('[authApi.login] Decoded JWT:', decodedToken);
                
                if (!decodedToken || !decodedToken.id) {
                    throw new Error('JWT missing id field');
                }
                
                // Fetch user profile with the access token
                console.log('[authApi.login] Fetching user profile for ID:', decodedToken.id);
                try {
                    const userProfile = await userApi.getProfile(decodedToken.id);
                    console.log('[authApi.login] User profile fetched:', userProfile);
                    
                    if (!userProfile) {
                        throw new Error('User profile is empty/undefined');
                    }
                    
                    // No refresh token available in old format
                    refreshToken = '';
                    
                    user = {
                        id: userProfile.id,
                        email: userProfile.email,
                        firstName: userProfile.firstName,
                        lastName: userProfile.lastName,
                        emailVerified: true, // Assume verified on login
                    };
                } catch (profileErr: any) {
                    console.error('[authApi.login] Error fetching user profile:', profileErr.message);
                    console.error('[authApi.login] Full error:', profileErr);
                    
                    // If profile fetch fails, construct minimal user from JWT
                    console.log('[authApi.login] Falling back to minimal user data from JWT');
                    refreshToken = '';
                    user = {
                        id: decodedToken.id,
                        email: 'unknown@email.com', // Will need to update from profile later
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
            // New backend format: returns full object with accessToken, refreshToken, user
            console.log('[authApi.login] Detected new format (full object)');
            const { accessToken: at, refreshToken: rt, user: u } = result.data;
            accessToken = at;
            refreshToken = rt;
            user = {
                id: u.id,
                email: u.email,
                emailVerified: u.emailVerified,
                firstName: u.firstName,
                lastName: u.lastName,
                onboardingDone: u.onboardingDone ?? u.profile?.onboardingDone ?? false,
            };
        }
        
        console.log('[authApi.login] Final tokens:');
        console.log('  accessToken:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NONE');
        console.log('  refreshToken:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'NONE');
        console.log('  user:', user);

        // Store tokens in secure storage
        await secureStorage.setTokens(accessToken, refreshToken || 'NO_REFRESH_TOKEN');

        return {
            accessToken,
            refreshToken,
            user,
        };
    },

    async logout(): Promise<void> {
        try {
            await api.post('/auth/logout');
        } finally {
            await secureStorage.clearTokens();
        }
    },

    async forgotPassword(email: string): Promise<void> {
        await api.post('/auth/forgot-password', { email });
    },

    async resetPassword(token: string, newPassword: string): Promise<void> {
        await api.put(`/auth/reset-password?token=${token}`, { newPassword });
    },
};
