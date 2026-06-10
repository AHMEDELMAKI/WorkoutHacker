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

export const analyticsApi = {
    getSummary: async (): Promise<AnalyticsSummary> => {
        const response = await api.get<{ data: AnalyticsSummary }>('/analytics/summary');
        return response.data;
    },

    getWeekly: async (): Promise<WeeklySummary> => {
        const response = await api.get<{ data: WeeklySummary }>('/analytics/weekly');
        return response.data;
    },

    getStreaks: async (): Promise<{ currentStreak: number; longestStreak: number; lastWorkoutAt: string | null }> => {
        const response = await api.get<{ data: any }>('/analytics/streaks');
        return response.data;
    },

    getFatigueTrend: async (): Promise<FatigueTrend[]> => {
        const response = await api.get<{ data: FatigueTrend[] }>('/analytics/fatigue-trend');
        return response.data;
    },

    getFormTrend: async (): Promise<FormTrend[]> => {
        const response = await api.get<{ data: FormTrend[] }>('/analytics/form-trend');
        return response.data;
    },

    getPersonalRecords: async (): Promise<PersonalRecord[]> => {
        const response = await api.get<{ data: PersonalRecord[] }>('/analytics/personal-records');
        return response.data;
    },
};
