/**
 * Central API client for Workout Hacker.
 * - Handles base URL configuration per platform
 * - Attaches access tokens to all requests
 * - Automatically refreshes tokens on 401 and retries
 * - Dispatches logout on unrecoverable auth failure
 */
import { Platform } from 'react-native';
import { secureStorage } from '../secureStorage';
import { navigationService } from '../navigationService';


// =================================================================
// IMPORTANT: FOR PHYSICAL DEVICE TESTING
// =================================================================
// Replace this with your computer's IP address on your local Wi-Fi network.
// You can find this by running `ipconfig` (Windows) or `ifconfig` (macOS) in your terminal.
const DEV_SERVER_IP = '192.168.1.4'; // <--- REPLACE THIS WITH YOUR ACTUAL IP
// =================================================================


// Use the IP address for development, but you would use a real domain in production.
const BASE_URL = `http://${DEV_SERVER_IP}:4000`;


// ─── Types ───────────────────────────────────────────────

export interface ApiError {
    message: string;
    statusCode: number;
    errors?: { msg: string; param: string }[];
}

// ─── Token Refresh State ─────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
    failedQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else if (token) {
            resolve(token);
        }
    });
    failedQueue = [];
}

// ─── Core Fetch Wrapper ──────────────────────────────────

async function apiFetch<T>(
    path: string,
    options: RequestInit = {},
    retry = true,
): Promise<T> {
    const accessToken = await secureStorage.getAccessToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options.headers as Record<string, string> | undefined),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };

    const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

    if (response.ok) {
        // Some endpoints return 204 No Content
        const text = await response.text();
        return (text ? JSON.parse(text) : {}) as T;
    }

    // ── Handle 401 with token refresh ──────────────────────
    if (response.status === 401 && retry) {
        if (isRefreshing) {
            return new Promise<T>((resolve, reject) => {
                failedQueue.push({
                    resolve: async (newToken) => {
                        try {
                            resolve(await apiFetch<T>(path, options, false));
                        } catch (e) {
                            reject(e);
                        }
                    },
                    reject,
                });
            });
        }

        isRefreshing = true;
        const refreshToken = await secureStorage.getRefreshToken();

        if (!refreshToken) {
            isRefreshing = false;
            await secureStorage.clearTokens();
            navigationService.navigate('Auth');
            throw buildError('Session expired. Please log in again.', 401);
        }

        try {
            const refreshResponse = await fetch(`${BASE_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (!refreshResponse.ok) {
                throw new Error('Refresh failed');
            }

            const data = await refreshResponse.json() as { accessToken: string; refreshToken: string };
            await secureStorage.setTokens(data.accessToken, data.refreshToken);
            processQueue(null, data.accessToken);
            return apiFetch<T>(path, options, false);
        } catch (err) {
            processQueue(err, null);
            await secureStorage.clearTokens();
            navigationService.navigate('Auth');
            throw buildError('Session expired. Please log in again.', 401);
        } finally {
            isRefreshing = false;
        }
    }

    // ── Parse error body ────────────────────────────────────
    const errorBody = await response.json().catch(() => ({})) as Record<string, unknown>;
    throw buildError(
        (errorBody.error as string) || `Request failed with ${response.status}`,
        response.status,
        (errorBody.errors as any[]) || undefined,
    );
}

function buildError(message: string, statusCode: number, errors?: any[]): ApiError & Error {
    const err = new Error(message) as Error & ApiError;
    err.statusCode = statusCode;
    if (errors) err.errors = errors;
    return err;
}

// ─── HTTP Shortcuts ──────────────────────────────────────

export const api = {
    get: <T>(path: string, options?: RequestInit) =>
        apiFetch<T>(path, { method: 'GET', ...options }),

    post: <T>(path: string, body?: unknown, options?: RequestInit) =>
        apiFetch<T>(path, {
            method: 'POST',
            body: JSON.stringify(body),
            ...options,
        }),

    put: <T>(path: string, body?: unknown, options?: RequestInit) =>
        apiFetch<T>(path, {
            method: 'PUT',
            body: JSON.stringify(body),
            ...options,
        }),

    patch: <T>(path: string, body?: unknown, options?: RequestInit) =>
        apiFetch<T>(path, {
            method: 'PATCH',
            body: JSON.stringify(body),
            ...options,
        }),

    delete: <T>(path: string, options?: RequestInit) =>
        apiFetch<T>(path, { method: 'DELETE', ...options }),
};
