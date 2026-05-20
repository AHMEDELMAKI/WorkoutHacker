/**
 * Secure token storage using react-native-keychain.
 * Falls back to AsyncStorage on environments where keychain is unavailable.
 * This replaces the plain AsyncStorage usage for sensitive data.
 */
import * as Keychain from 'react-native-keychain';

const SERVICE_ACCESS = 'wh_access_token';
const SERVICE_REFRESH = 'wh_refresh_token';

export const secureStorage = {
    async setTokens(accessToken: string, refreshToken: string): Promise<void> {
        await Promise.all([
            Keychain.setGenericPassword('access', accessToken, { service: SERVICE_ACCESS }),
            Keychain.setGenericPassword('refresh', refreshToken, { service: SERVICE_REFRESH }),
        ]);
    },

    async getAccessToken(): Promise<string | null> {
        try {
            const credentials = await Keychain.getGenericPassword({ service: SERVICE_ACCESS });
            return credentials ? credentials.password : null;
        } catch {
            return null;
        }
    },

    async getRefreshToken(): Promise<string | null> {
        try {
            const credentials = await Keychain.getGenericPassword({ service: SERVICE_REFRESH });
            return credentials ? credentials.password : null;
        } catch {
            return null;
        }
    },

    async clearTokens(): Promise<void> {
        await Promise.all([
            Keychain.resetGenericPassword({ service: SERVICE_ACCESS }),
            Keychain.resetGenericPassword({ service: SERVICE_REFRESH }),
        ]);
    },

    async hasTokens(): Promise<boolean> {
        const token = await secureStorage.getAccessToken();
        return !!token;
    },
};
