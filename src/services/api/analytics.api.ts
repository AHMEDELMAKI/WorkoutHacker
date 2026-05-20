import { api } from './client';

export interface AnalyticsSummary {
    totalWorkouts: number;
    totalCalories: number;
    avgFormScore: number;
    weeklyVolume: { day: string; volume: number }[];
    monthlyTrend: { month: string; score: number }[];
    recentWorkouts: {
        id: string;
        name: string;
        duration: string;
        score: number;
        calories: number;
        timestamp: string;
        workoutType: string;
    }[];
}

export const analyticsApi = {
    getSummary: async (): Promise<AnalyticsSummary> => {
        const response = await api.get<AnalyticsSummary>('/analytics/summary');
        return response;
    },
};
