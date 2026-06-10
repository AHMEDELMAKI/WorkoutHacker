/**
 * Workout Zustand Store
 * Manages the active workout session, exercise state, and persistence.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { workoutApi, Workout, Exercise } from '../services/api/session.api'; // a.k.a. workout.api.ts

interface WorkoutState {
    currentWorkout: Omit<Workout, 'sessionId' | 'date'> | null;
    isActive: boolean;
    currentExercise: Exercise | null;
    elapsedSeconds: number;
    caloriesBurned: number;

    // Actions
    startWorkout: (type: 'cardio' | 'strength', title: string) => void;
    completeWorkout: (summary: { notes?: string }) => Promise<void>;
    startExercise: (name: string) => void;
    updateLiveMetrics: (reps: number, calories: number) => void;
    tick: () => void;
    reset: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
    persist(
        (set, get) => ({
            currentWorkout: null,
            isActive: false,
            currentExercise: null,
            elapsedSeconds: 0,
            caloriesBurned: 0,

            startWorkout: (type, title) => {
                set({
                    currentWorkout: {
                        title,
                        sessionType: type,
                        workoutInfo: {
                            duration: 0,
                            caloriesBurned: 0,
                            exercises: [],
                        },
                    },
                    isActive: true,
                    elapsedSeconds: 0,
                    caloriesBurned: 0,
                    currentExercise: null,
                });
            },

            startExercise: (name) => {
                set({
                    currentExercise: {
                        name,
                        reps: 0,
                        sets: 1,
                        weight: 0, // default weight
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
                const workout = get().currentWorkout;
                if (!workout) return;

                const finalWorkout: Omit<Workout, 'sessionId' | 'date'> = {
                    ...workout,
                    workoutInfo: {
                        ...workout.workoutInfo,
                        duration: Math.floor(get().elapsedSeconds / 60),
                        caloriesBurned: get().caloriesBurned,
                        // TODO: exercises should be accumulated during the session
                    },
                    // TODO: notes are not in the new Workout interface
                };

                await workoutApi.createWorkout(finalWorkout);

                set({ isActive: false, currentWorkout: null, currentExercise: null });
            },

            reset: () => set({
                currentWorkout: null,
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
