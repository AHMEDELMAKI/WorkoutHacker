/**
 * Session API service.
 * Manages workout sessions: starting, completing, and logging AI metrics.
 */
import { api } from './client';

export interface WorkoutSession {
    id: string;
    workoutType: string;
    title: string;
    startedAt: string;
    completedAt: string | null;
    durationMin: number | null;
    caloriesBurned: number | null;
    formScore: number | null;
    overallFatigue: string | null;
    notes: string | null;
}

export interface AiMetricPayload {
    exerciseSessionId?: string;
    timestampMs: number;
    reps?: number;
    formScore?: number;
    fatigue?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    tempo?: string;
    detectedExercise?: string;
    confidenceScore?: number;
}

export const sessionApi = {
    async startSession(workoutType: string, title: string): Promise<WorkoutSession> {
        return api.post<WorkoutSession>('/api/sessions/start', { workoutType, title });
    },

    async completeSession(
        sessionId: string,
        data: {
            durationMin?: number;
            caloriesBurned?: number;
            formScore?: number;
            overallFatigue?: string;
            notes?: string;
        },
    ): Promise<WorkoutSession> {
        return api.post<WorkoutSession>(`/api/sessions/${sessionId}/complete`, data);
    },

    async logAiMetric(sessionId: string, metric: AiMetricPayload): Promise<void> {
        await api.post(`/api/sessions/${sessionId}/ai-metrics`, metric);
    },

    async logAiMetricsBatch(sessionId: string, metrics: AiMetricPayload[]): Promise<void> {
        await api.post(`/api/sessions/${sessionId}/ai-metrics/batch`, { metrics });
    },

    async startExerciseSession(
        sessionId: string,
        data: {
            exerciseName: string;
            exerciseId?: string;
        },
    ): Promise<{ id: string }> {
        return api.post<{ id: string }>(`/api/sessions/${sessionId}/exercise-session`, data);
    },

    async getSessions(limit = 20, offset = 0): Promise<{ sessions: WorkoutSession[]; total: number }> {
        return api.get<{ sessions: WorkoutSession[]; total: number }>(
            `/api/sessions?limit=${limit}&offset=${offset}`,
        );
    },

    async getSession(sessionId: string): Promise<WorkoutSession> {
        return api.get<WorkoutSession>(`/api/sessions/${sessionId}`);
    },
};
