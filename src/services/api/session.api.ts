/**
 * NOTE: This file should be renamed to workout.api.ts
 *
 * Workout API service.
 * Manages workout sessions.
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

export const workoutApi = {
    async createWorkout(workout: Omit<Workout, 'sessionId' | 'date'>): Promise<Workout> {
        const userId = getUserId();
        const result = await api.post<{ data: Workout }>(`/users/${userId}/workouts`, workout);
        return result.data;
    },

    async getWorkouts(range?: 'this-week'): Promise<Workout[]> {
        const userId = getUserId();
        const url = range ? `/users/${userId}/workouts?range=${range}` : `/users/${userId}/workouts`;
        const result = await api.get<{ data: Workout[] }>(url);
        return result.data;
    },

    async getWorkout(sessionId: string): Promise<Workout> {
        const userId = getUserId();
        const result = await api.get<{ data: Workout }>(`/users/${userId}/workouts/${sessionId}`);
        return result.data;
    },

    async updateWorkout(sessionId: string, data: Partial<Workout>): Promise<Workout> {
        const userId = getUserId();
        const result = await api.patch<{ data: Workout }>(`/users/${userId}/workouts/${sessionId}`, data);
        return result.data;
    },

    async deleteWorkout(sessionId: string): Promise<void> {
        const userId = getUserId();
        await api.delete(`/users/${userId}/workouts/${sessionId}`);
    },
};


/*
NOTE: The old sessionApi is commented out because it doesn't match the Swagger spec.
This code needs to be refactored to use the new workoutApi.

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
*/
