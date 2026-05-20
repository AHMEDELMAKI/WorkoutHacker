/**
 * User & Analytics API service modules.
 */
import { api } from './client';

// ─── User Profile ─────────────────────────────────────────

export interface UserProfile {
    userId: string;
    displayName: string | null;
    gender: string | null;
    ageYears: number | null;
    heightCm: number | null;
    weightKg: number | null;
    fitnessLevel: string | null;
    fitnessGoals: string[];
    units: 'METRIC' | 'IMPERIAL';
    onboardingDone: boolean;
}

export const userApi = {
    async getMe(): Promise<{ id: string; email: string; profile: UserProfile; privacySettings: any }> {
        return api.get('/api/users/me');
    },

    async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
        return api.put<UserProfile>('/api/users/profile', data);
    },

    async updatePrivacy(data: {
        localOnly?: boolean;
        shareAnalytics?: boolean;
        cameraAccess?: boolean;
        notifications?: boolean;
    }): Promise<void> {
        await api.put('/api/users/privacy', data);
    },
};

// ─── Analytics ───────────────────────────────────────────

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

// ─── Notifications ────────────────────────────────────────

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
