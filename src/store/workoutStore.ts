/**
 * Workout Zustand Store
 * Manages the active workout session, exercise state, and persistence.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sessionApi, WorkoutSession } from '../services/api/session.api';

interface ExerciseState {
    id: string;
    name: string;
    reps: number;
    sets: number;
    active: boolean;
}

interface WorkoutState {
    currentSession: WorkoutSession | null;
    isActive: boolean;
    currentExercise: ExerciseState | null;
    elapsedSeconds: number;
    caloriesBurned: number;

    // Actions
    startWorkout: (type: string, title: string) => Promise<void>;
    completeWorkout: (summary: { formScore?: number; fatigue?: string; notes?: string }) => Promise<void>;
    startExercise: (name: string) => Promise<void>;
    updateLiveMetrics: (reps: number, calories: number) => void;
    tick: () => void;
    reset: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
    persist(
        (set, get) => ({
            currentSession: null,
            isActive: false,
            currentExercise: null,
            elapsedSeconds: 0,
            caloriesBurned: 0,

            startWorkout: async (type, title) => {
                const session = await sessionApi.startSession(type, title);
                set({
                    currentSession: session,
                    isActive: true,
                    elapsedSeconds: 0,
                    caloriesBurned: 0,
                    currentExercise: null,
                });
            },

            startExercise: async (name) => {
                const session = get().currentSession;
                if (!session) return;

                const result = await sessionApi.startExerciseSession(session.id, { exerciseName: name });
                set({
                    currentExercise: {
                        id: result.id,
                        name,
                        reps: 0,
                        sets: 1,
                        active: true,
                    },
                });
            },

            updateLiveMetrics: (reps, calories) => {
                set((state) => ({
                    caloriesBurned: state.caloriesBurned + calories,
                    currentExercise: state.currentExercise
                        ? { ...state.currentExercise, reps: state.currentExercise.reps + reps }
                        : null,
                }));
            },

            tick: () => {
                if (get().isActive) {
                    set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 }));
                }
            },

            completeWorkout: async (summary) => {
                const session = get().currentSession;
                if (!session) return;

                await sessionApi.completeSession(session.id, {
                    durationMin: Math.floor(get().elapsedSeconds / 60),
                    caloriesBurned: get().caloriesBurned,
                    ...summary,
                });

                set({ isActive: false, currentSession: null, currentExercise: null });
            },

            reset: () => set({
                currentSession: null,
                isActive: false,
                currentExercise: null,
                elapsedSeconds: 0,
                caloriesBurned: 0,
            }),
        }),
        {
            name: 'workout-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
