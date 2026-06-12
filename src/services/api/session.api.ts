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

/**
 * Aligned with BACKEND_REQUIREMENTS.md
 */
export interface WorkoutSet {
    exercise: string;
    reps: number;
    weightKg: number;
}

export interface Workout {
    id: string;
    title: string;
    type: string;
    date: string; // ISO
    durationMin: number;
    calories: number;
    sets: WorkoutSet[];
    formScore?: number;
    notes?: string;
}

const getUserId = () => {
    const { user } = useAuthStore.getState();
    if (!user) {
        throw new Error('User is not authenticated');
    }
    return user.id;
};

/**
 * Modern Session API matching the backend implementation and spec.
 */
export interface WorkoutSession {
    id: string;
    userId: string;
    workoutId: string;
    title: string;
    startedAt: string;
    completedAt: string | null;
    durationMin: number | null;
    caloriesBurned: number | null;
    formScore: number | null;
    overallFatigue: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
    notes: string | null;
    exercises?: WorkoutSet[];
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

const unwrap = (res: any) => (res && res.data !== undefined ? res.data : res);

export const sessionApi = {
    /**
     * Start a new workout session.
     * @param workoutId - The ID of the workout template (or 'custom')
     * @param title - Optional title for the session
     */
    async startSession(workoutId: string, title?: string): Promise<WorkoutSession> {
        const response = await api.post<any>('/sessions/start', { workoutId, title });
        return unwrap(response);
    },

    /**
     * Complete an active session.
     * Aligned with BACKEND_REQUIREMENTS.md data shape.
     */
    async completeSession(
        sessionId: string,
        data: {
            durationMin?: number;
            caloriesBurned?: number;
            formScore?: number;
            overallFatigue?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
            notes?: string;
            exercises?: WorkoutSet[];
        },
    ): Promise<WorkoutSession> {
        const response = await api.post<any>(`/sessions/${sessionId}/complete`, data);
        return unwrap(response);
    },

    async logAiMetric(sessionId: string, metric: AiMetricPayload): Promise<void> {
        await api.post(`/sessions/${sessionId}/ai-metrics`, metric);
    },

    async logAiMetricsBatch(sessionId: string, metrics: AiMetricPayload[]): Promise<void> {
        await api.post(`/sessions/${sessionId}/ai-metrics/batch`, { metrics });
    },

    async getSessions(): Promise<any> {
        const response = await api.get<any>('/sessions');
        return unwrap(response);
    },

    async getSession(sessionId: string): Promise<WorkoutSession> {
        const response = await api.get<any>(`/sessions/${sessionId}`);
        return unwrap(response);
    },
};

/**
 * Legacy/Alternative workout API. 
 * TODO: Refactor to use sessionApi for active tracking.
 */
export const workoutApi = {
    async createWorkout(workout: Omit<Workout, 'sessionId' | 'date'>): Promise<Workout> {
        const userId = getUserId();
        const response = await api.post<any>(`/users/${userId}/workouts`, workout);
        return unwrap(response);
    },

    async getWorkouts(range?: 'this-week'): Promise<Workout[]> {
        const userId = getUserId();
        const url = range ? `/users/${userId}/workouts?range=${range}` : `/users/${userId}/workouts`;
        const response = await api.get<any>(url);
        return unwrap(response);
    },

    async getWorkout(workoutId: string): Promise<Workout> {
        const userId = getUserId();
        const response = await api.get<any>(`/users/${userId}/workouts/${workoutId}`);
        return unwrap(response);
    },

    async updateWorkout(workoutId: string, data: Partial<Workout>): Promise<Workout> {
        const userId = getUserId();
        const response = await api.patch<any>(`/users/${userId}/workouts/${workoutId}`, data);
        return unwrap(response);
    },

    async deleteWorkout(workoutId: string): Promise<void> {
        const userId = getUserId();
        await api.delete(`/users/${userId}/workouts/${workoutId}`);
    },
};
