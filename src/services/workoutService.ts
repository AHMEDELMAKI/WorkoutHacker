// File: src/services/workoutService.ts
import { storage, STORAGE_KEYS } from './storage';

export interface WorkoutLog {
    id: string;
    title: string;
    type: string;
    date: string;          // ISO string
    durationMin: number;
    calories: number;
    sets: SetLog[];
    formScore?: number;
    notes?: string;
}

export interface SetLog {
    exercise: string;
    reps: number;
    weightKg: number;
}

export const workoutService = {
    async getAll(): Promise<WorkoutLog[]> {
        return (await storage.get<WorkoutLog[]>(STORAGE_KEYS.WORKOUTS)) ?? [];
    },

    async add(workout: WorkoutLog): Promise<boolean> {
        const existing = await workoutService.getAll();
        return storage.set(STORAGE_KEYS.WORKOUTS, [workout, ...existing]);
    },

    async update(id: string, partial: Partial<WorkoutLog>): Promise<boolean> {
        const all = await workoutService.getAll();
        const updated = all.map(w => w.id === id ? { ...w, ...partial } : w);
        return storage.set(STORAGE_KEYS.WORKOUTS, updated);
    },

    async delete(id: string): Promise<boolean> {
        const all = await workoutService.getAll();
        return storage.set(STORAGE_KEYS.WORKOUTS, all.filter(w => w.id !== id));
    },

    async getThisWeek(): Promise<WorkoutLog[]> {
        const all = await workoutService.getAll();
        const now = new Date();
        const mon = new Date(now);
        mon.setDate(now.getDate() - ((now.getDay() + 6) % 7));
        mon.setHours(0, 0, 0, 0);
        return all.filter(w => new Date(w.date) >= mon);
    },

    async deleteAll(): Promise<void> {
        await storage.remove(STORAGE_KEYS.WORKOUTS);
    },
};