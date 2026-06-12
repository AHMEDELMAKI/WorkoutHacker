/**
 * Workout Zustand Store
 * Manages the active workout session, exercise state, and persistence.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sessionApi, Workout, WorkoutSession, WorkoutSet } from '../services/api/session.api';

interface WorkoutState {
    sessionId: string | null;
    workoutTitle: string | null;
    sessionType: 'cardio' | 'strength' | null;
    isActive: boolean;
    currentExercise: WorkoutSet | null;
    completedExercises: WorkoutSet[];
    elapsedSeconds: number;
    caloriesBurned: number;

    // Actions
    startWorkout: (type: 'cardio' | 'strength', title: string) => Promise<void>;
    completeWorkout: (summary: { 
        notes?: string; 
        formScore?: number; 
        fatigue?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' 
    }) => Promise<void>;
    startExercise: (name: string) => void;
    finishExercise: () => void;
    updateLiveMetrics: (reps: number, calories: number) => void;
    tick: () => void;
    reset: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
    persist(
        (set, get) => ({
            sessionId: null,
            workoutTitle: null,
            sessionType: null,
            isActive: false,
            currentExercise: null,
            completedExercises: [],
            elapsedSeconds: 0,
            caloriesBurned: 0,

            startWorkout: async (type, title) => {
                try {
                    const session = await sessionApi.startSession('custom', title);
                    
                    set({
                        sessionId: session.id,
                        workoutTitle: title,
                        sessionType: type,
                        isActive: true,
                        elapsedSeconds: 0,
                        caloriesBurned: 0,
                        currentExercise: null,
                        completedExercises: [],
                    });
                } catch (error) {
                    console.error('[workoutStore] Failed to start session:', error);
                    set({
                        isActive: true,
                        workoutTitle: title,
                        sessionType: type,
                        elapsedSeconds: 0,
                        caloriesBurned: 0,
                        completedExercises: [],
                    });
                }
            },

            startExercise: (name) => {
                set({
                    currentExercise: {
                        exercise: name,
                        reps: 0,
                        weightKg: 0,
                    },
                });
            },

            finishExercise: () => {
                const { currentExercise, completedExercises } = get();
                if (currentExercise) {
                    set({
                        completedExercises: [...completedExercises, currentExercise],
                        currentExercise: null,
                    });
                }
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
                const { sessionId, elapsedSeconds, caloriesBurned, completedExercises, currentExercise } = get();
                
                // Ensure the final exercise is collected
                const allExercises = [...completedExercises];
                if (currentExercise) allExercises.push(currentExercise);

                if (sessionId) {
                    try {
                        await sessionApi.completeSession(sessionId, {
                            durationMin: Math.floor(elapsedSeconds / 60),
                            caloriesBurned: Math.round(caloriesBurned),
                            formScore: summary.formScore,
                            overallFatigue: summary.fatigue,
                            notes: summary.notes,
                            exercises: allExercises,
                        });
                    } catch (error) {
                        console.error('[workoutStore] Failed to complete session on backend:', error);
                    }
                }

                set({ 
                    isActive: false, 
                    sessionId: null,
                    workoutTitle: null,
                    sessionType: null,
                    currentExercise: null,
                    completedExercises: [],
                    elapsedSeconds: 0,
                    caloriesBurned: 0 
                });
            },

            reset: () => set({
                sessionId: null,
                workoutTitle: null,
                sessionType: null,
                isActive: false,
                currentExercise: null,
                completedExercises: [],
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
