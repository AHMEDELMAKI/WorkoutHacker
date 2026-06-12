import { api } from './client';

export interface AnalyticsSummary {
    totalWorkouts: number;
    totalCaloriesBurned: number;
    totalMinutes: number;
    currentStreak: number;
    longestStreak: number;
    avgFormScore: number;
    lastWorkoutAt: string | null;
}

export interface WeeklySummary {
    sessions: any[];
    byDay: Record<string, { workouts: number; calories: number; minutes: number }>;
}

export interface FatigueTrend {
    fatigue: string;
    createdAt: string;
}

export interface FormTrend {
    startedAt: string;
    formScore: number;
    title: string;
}

export interface PersonalRecord {
    exerciseName: string;
    totalReps: number;
    totalSets: number;
    avgFormScore: number;
    workoutSession: { startedAt: string };
}

const unwrap = (res: any) => (res && res.data !== undefined ? res.data : res);

export const analyticsApi = {
    getSummary: async (): Promise<AnalyticsSummary> => {
        const response = await api.get<any>('/analytics/summary');
        return unwrap(response);
    },

    getWeekly: async (): Promise<WeeklySummary> => {
        const response = await api.get<any>('/analytics/weekly');
        return unwrap(response);
    },

    getStreaks: async (): Promise<{ currentStreak: number; longestStreak: number; lastWorkoutAt: string | null }> => {
        const response = await api.get<any>('/analytics/streaks');
        return unwrap(response);
    },

    getFatigueTrend: async (): Promise<FatigueTrend[]> => {
        const response = await api.get<any>('/analytics/fatigue-trend');
        return unwrap(response);
    },

    getFormTrend: async (): Promise<FormTrend[]> => {
        const response = await api.get<any>('/analytics/form-trend');
        return unwrap(response);
    },

    getPersonalRecords: async (): Promise<PersonalRecord[]> => {
        const response = await api.get<any>('/analytics/personal-records');
        return unwrap(response);
    },
};

