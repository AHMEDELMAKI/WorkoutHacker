// File: src/hooks/useWorkouts.ts
import { useEffect, useState, useCallback } from 'react';
import { workoutService, WorkoutLog } from '../services/workoutService';

interface UseWorkoutsReturn {
    workouts: WorkoutLog[];
    weeklyLogs: WorkoutLog[];
    loading: boolean;
    addWorkout: (w: WorkoutLog) => Promise<void>;
    deleteWorkout: (id: string) => Promise<void>;
    refresh: () => Promise<void>;
}

export const useWorkouts = (): UseWorkoutsReturn => {
    const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
    const [weeklyLogs, setWeeklyLogs] = useState<WorkoutLog[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        setLoading(true);
        const [all, weekly] = await Promise.all([
            workoutService.getAll(),
            workoutService.getThisWeek(),
        ]);
        setWorkouts(all);
        setWeeklyLogs(weekly);
        setLoading(false);
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const addWorkout = useCallback(async (w: WorkoutLog) => {
        await workoutService.add(w);
        await refresh();
    }, [refresh]);

    const deleteWorkout = useCallback(async (id: string) => {
        await workoutService.delete(id);
        await refresh();
    }, [refresh]);

    return { workouts, weeklyLogs, loading, addWorkout, deleteWorkout, refresh };
};