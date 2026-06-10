/**
 * Workout API service.
 * Manages workout sessions and AI metrics.
 */
import { api } from './client';
import { useAuthStore } from '../../store/authStore';

export interface Exercise {
    name: string;
    reps: number;
    sets: number;
    weight: number;
}

export interface Workout {
    sessionId: string;
    title: string;
    sessionType: 'cardio' | 'strength';
    date: string;
    workoutInfo: {
        duration: number;
        caloriesBurned: number;
        exercises: Exercise[];
    };
}

const getUserId = () => {
    const { user } = useAuthStore.getState();
    if (!user) {
        throw new Error('User is not authenticated');
    }
    return user.id;
};

/**
 * Modern Session API matching the backend implementation.
 */
export interface WorkoutSession {
    id: string;
    userId: string;
    workoutType: string;
    title: string;
    startedAt: string;
    completedAt: string | null;
    durationMin: number | null;
    caloriesBurned: number | null;
    formScore: number | null;
    overallFatigue: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
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
    /**
     * Start a new workout session.
     * @param workoutId - The ID of the workout template (or 'custom')
     * @param title - Optional title for the session
     */
    async startSession(workoutId: string, title?: string): Promise<WorkoutSession> {
        const result = await api.post<{ data: WorkoutSession }>('/api/sessions/start', { workoutId, title });
        return result.data;
    },

    /**
     * Complete an active session.
     */
    async completeSession(
        sessionId: string,
        data: {
            durationMin?: number;
            caloriesBurned?: number;
            formScore?: number;
            overallFatigue?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
            notes?: string;
        },
    ): Promise<WorkoutSession> {
        const result = await api.post<{ data: WorkoutSession }>(`/api/sessions/${sessionId}/complete`, data);
        return result.data;
    },

    async logAiMetric(sessionId: string, metric: AiMetricPayload): Promise<void> {
        await api.post(`/api/sessions/${sessionId}/ai-metrics`, metric);
    },

    async logAiMetricsBatch(sessionId: string, metrics: AiMetricPayload[]): Promise<void> {
        await api.post(`/api/sessions/${sessionId}/ai-metrics/batch`, { metrics });
    },

    async getSessions(): Promise<WorkoutSession[]> {
        const result = await api.get<{ data: WorkoutSession[] }>('/api/sessions');
        return result.data;
    },

    async getSession(sessionId: string): Promise<WorkoutSession> {
        const result = await api.get<{ data: WorkoutSession }>(`/api/sessions/${sessionId}`);
        return result.data;
    },
};

/**
 * Legacy/Alternative workout API. 
 * TODO: Refactor to use sessionApi for active tracking.
 */
export const workoutApi = {
    async createWorkout(workout: Omit<Workout, 'sessionId' | 'date'>): Promise<Workout> {
        const userId = getUserId();
        const result = await api.post<{ data: Workout }>(`/api/users/${userId}/workouts`, workout);
        return result.data;
    },

    async getWorkouts(range?: 'this-week'): Promise<Workout[]> {
        const userId = getUserId();
        const url = range ? `/api/users/${userId}/workouts?range=${range}` : `/api/users/${userId}/workouts`;
        const result = await api.get<{ data: Workout[] }>(url);
        return result.data;
    },

    async getWorkout(sessionId: string): Promise<Workout> {
        const userId = getUserId();
        const result = await api.get<{ data: Workout }>(`/api/users/${userId}/workouts/${sessionId}`);
        return result.data;
    },

    async updateWorkout(sessionId: string, data: Partial<Workout>): Promise<Workout> {
        const userId = getUserId();
        const result = await api.patch<{ data: Workout }>(`/api/users/${userId}/workouts/${sessionId}`, data);
        return result.data;
    },

    async deleteWorkout(sessionId: string): Promise<void> {
        const userId = getUserId();
        await api.delete(`/api/users/${userId}/workouts/${sessionId}`);
    },
};
