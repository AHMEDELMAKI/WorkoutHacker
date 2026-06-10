/**
 * User API service modules.
 */
import { api } from './client';
import { useAuthStore } from '../../store/authStore';

// ─── User Profile ─────────────────────────────────────────

export interface UserProfile {
    // This should match the prisma schema for User
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    height?: number;
    weight?: number;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    onboardingDone?: boolean;
    fitnessLevel?: 'beginner' | 'intermediate' | 'advanced' | 'athlete';
    fitnessGoals?: string[];
    // Workout Preferences
    workoutPrimaryGoal?: string;
    workoutTrainingLevel?: string;
    workoutDaysPerWeek?: number;
}

export interface UserSettings {
    notifications: boolean;
    darkMode: boolean;
    units: 'metric' | 'imperial';
    language: string;
    privacyLocalOnly: boolean;
    privacyShareAnalytics: boolean;
    privacyCameraAccess: boolean;
}

const getUserId = () => {
    const { user } = useAuthStore.getState();
    if (!user) {
        throw new Error('User is not authenticated');
    }
    return user.id;
};

const unwrapData = (result: any) => result?.data || result;

const normalizeGender = (gender: any): UserProfile['gender'] | undefined => {
    const value = String(gender || '').toLowerCase();
    if (value === 'male' || value === 'female' || value === 'other') {
        return value;
    }
    if (value === 'non_binary' || value === 'prefer_not_to_say') {
        return 'other';
    }
    return undefined;
};

const normalizeFitnessLevel = (level: any): UserProfile['fitnessLevel'] | undefined => {
    const value = String(level || '').toLowerCase();
    if (value === 'beginner' || value === 'intermediate' || value === 'advanced' || value === 'athlete') {
        return value;
    }
    return undefined;
};

const normalizeUserProfile = (raw: any): UserProfile => {
    const userProfile = unwrapData(raw);
    const profile = userProfile?.profile || userProfile;

    if (!userProfile || (!userProfile.id && !userProfile._id && !profile?.userId)) {
        throw new Error('Invalid profile response');
    }

    return {
        id: userProfile.id || userProfile._id || profile.userId,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        height: profile.height || profile.heightCm,
        weight: profile.weight || profile.weightKg,
        age: profile.age || profile.ageYears,
        gender: normalizeGender(profile.gender),
        onboardingDone: profile.onboardingDone ?? userProfile.onboardingDone ?? false,
        fitnessLevel: normalizeFitnessLevel(profile.fitnessLevel),
        fitnessGoals: profile.fitnessGoals || [],
        workoutPrimaryGoal: profile.workoutPrimaryGoal,
        workoutTrainingLevel: profile.workoutTrainingLevel,
        workoutDaysPerWeek: profile.workoutDaysPerWeek,
    };
};

export const userApi = {
    async getProfile(userId?: string): Promise<UserProfile> {
        const hasCurrentUser = !!useAuthStore.getState().user;
        const id = userId || (hasCurrentUser ? getUserId() : undefined);
        console.log('[userApi.getProfile] Fetching profile for user ID:', id || 'me');
        try {
            const result = await api.get<any>(id ? `/users/${id}/profile` : '/users/me')
                .catch(async (err: any) => {
                    if (err?.statusCode === 404 || err?.statusCode === 405) {
                        return api.get<any>('/users/me');
                    }
                    throw err;
                });
            console.log('[userApi.getProfile] Full response:', JSON.stringify(result, null, 2));
            const normalized = normalizeUserProfile(result);
            
            console.log('[userApi.getProfile] Normalized profile:', normalized);
            return normalized;
        } catch (err: any) {
            console.error('[userApi.getProfile] Error fetching profile:', err.message);
            console.error('[userApi.getProfile] Full error:', err);
            throw err;
        }
    },

    async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
        const userId = getUserId();
        
        // Map fields to match BOTH the gemini-code reference AND the local backend code.
        // This ensures compatibility across different environment versions.
        const payload: any = { ...data };
        
        if (payload.age !== undefined) {
            const val = Number(payload.age);
            payload.age = val;
            payload.ageYears = val; // Legacy compatibility
        }
        if (payload.height !== undefined) {
            const val = Number(payload.height);
            payload.height = val;
            payload.heightCm = val; // Legacy compatibility
        }
        if (payload.weight !== undefined) {
            const val = Number(payload.weight);
            payload.weight = val;
            payload.weightKg = val; // Legacy compatibility
        }

        const result = await api.put<any>('/users/profile', payload)
            .catch(async (err: any) => {
                if (err?.statusCode === 404 || err?.statusCode === 405) {
                    return api.patch<any>(`/users/${userId}/profile`, payload);
                }
                throw err;
            });

        return normalizeUserProfile({ data: { id: userId, profile: unwrapData(result) } });
    },

    async deleteProfile(): Promise<void> {
        const userId = getUserId();
        await api.delete(`/users/${userId}/profile`);
    },

    async getSettings(): Promise<UserSettings> {
        const userId = getUserId();
        const result = await api.get<any>(`/users/${userId}/settings`);
        
        // Handle both wrapped and direct object formats
        return result.data || result;
    },

    async updateSettings(data: Partial<UserSettings>): Promise<UserSettings> {
        const userId = getUserId();
        const payload = {
            localOnly: data.privacyLocalOnly,
            shareAnalytics: data.privacyShareAnalytics,
            cameraAccess: data.privacyCameraAccess,
            notifications: data.notifications,
        };
        const result = await api.put<any>('/users/privacy', payload)
            .catch(async (err: any) => {
                if (err?.statusCode === 404 || err?.statusCode === 405) {
                    return api.patch<any>(`/users/${userId}/settings`, data);
                }
                throw err;
            });
        
        // Handle both wrapped and direct object formats
        return result.data || result;
    },

    async resetSettings(): Promise<void> {
        const userId = getUserId();
        await api.post(`/users/${userId}/settings/reset`);
    },

    async getOnboardingStatus(): Promise<{ onboardingDone: boolean }> {
        const userId = getUserId();
        const result = await api.get<any>(`/users/${userId}/onboarding`);
        
        // Handle both wrapped and direct object formats
        return result.data || result;
    },

    async markOnboardingDone(): Promise<void> {
        await userApi.updateProfile({ onboardingDone: true });
    },

    async getAllUsers(): Promise<UserProfile[]> {
        const result = await api.get<{ data: UserProfile[] }>('/users/getAllUser');
        return result.data;
    },

    async deleteCurrentUser(): Promise<void> {
        await api.delete('/users/deleteUser');
    },

    async getPaginatedUsers(page: number, limit: number): Promise<UserProfile[]> {
        const result = await api.get<{ data: UserProfile[] }>(`/users/paginatedUsers?page=${page}&limit=${limit}`);
        return result.data;
    },
};

// ─── Analytics ───────────────────────────────────────────
/*
NOTE: The analytics and notifications APIs are not included in the Swagger specification.
They are commented out to avoid breaking the application until they can be properly specified and implemented in the backend.

export interface AnalyticsSummary {
    totalWorkouts: number;
    totalCaloriesBurned: number;
    totalMinutes: number;
    currentStreak: number;
    longestStreak: number;
    avgFormScore: number;
    lastWorkoutAt: string | null;
}

export const analyticsApi = {
    async getSummary(): Promise<AnalyticsSummary> {
        return api.get<AnalyticsSummary>('/api/analytics/summary');
    },

    async getWeekly(): Promise<any> {
        return api.get('/api/analytics/weekly');
    },

    async getStreaks(): Promise<{ currentStreak: number; longestStreak: number; lastWorkoutAt: string | null }> {
        return api.get('/api/analytics/streaks');
    },

    async getFatigueTrend(): Promise<any[]> {
        return api.get('/api/analytics/fatigue-trend');
    },

    async getFormTrend(): Promise<any[]> {
        return api.get('/api/analytics/form-trend');
    },

    async getPersonalRecords(): Promise<any[]> {
        return api.get('/api/analytics/personal-records');
    },
};
*/

// ─── Notifications ────────────────────────────────────────
/*
export const notificationsApi = {
    async getAll(): Promise<any[]> {
        return api.get('/api/notifications');
    },

    async markRead(id: string): Promise<void> {
        await api.patch(`/api/notifications/${id}/read`);
    },

    async markAllRead(): Promise<void> {
        await api.patch('/api/notifications/read-all');
    },
};
*/
