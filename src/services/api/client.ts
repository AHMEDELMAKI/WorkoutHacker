/**
 * Central API client for Workout Hacker.
 * - Handles base URL configuration per platform
 * - Attaches access tokens to all requests
 * - Automatically refreshes tokens on 401 and retries
 * - Dispatches logout on unrecoverable auth failure
 */
import { secureStorage } from '../secureStorage';
import { navigateRoot } from '../navigationService';


// =================================================================
// IMPORTANT: FOR PHYSICAL DEVICE TESTING
// =================================================================
// Replace this with your computer's IP address on your local Wi-Fi network.
// Use the production Render backend exclusively.
const BASE_URL = 'https://gymhacker.onrender.com';

console.log('[ApiClient] Initialized with BASE_URL:', BASE_URL);


// ─── Types ───────────────────────────────────────────────

export interface ApiError {
    message: string;
    statusCode: number;
    errors?: { msg: string; param: string }[];
}

// ─── Token Refresh State ─────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (e: unknown) => void }> = [];

const PUBLIC_AUTH_PATHS = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
];

const isPublicAuthPath = (path: string) =>
    PUBLIC_AUTH_PATHS.some((publicPath) => path.startsWith(publicPath));

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
    if (response.status === 401 && retry && !isPublicAuthPath(path)) {
        if (isRefreshing) {
            return new Promise<T>((resolve, reject) => {
                failedQueue.push({
                    resolve: async (_newToken) => {
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
            navigateRoot('Auth');
            throw buildError('Session expired. Please log in again.', 401);
        }

        try {
            const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (!refreshResponse.ok) {
                throw new Error('Refresh failed');
            }

            const refreshBody = await refreshResponse.json() as { data: { accessToken: string; refreshToken: string } };
            const data = refreshBody.data;
            await secureStorage.setTokens(data.accessToken, data.refreshToken);
            processQueue(null, data.accessToken);
            return apiFetch<T>(path, options, false);
        } catch (err) {
            processQueue(err, null);
            await secureStorage.clearTokens();
            navigateRoot('Auth');
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
