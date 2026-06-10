/**
 * Workout Zustand Store
 * Manages the active workout session, exercise state, and persistence.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sessionApi, Workout, Exercise } from '../services/api/session.api';

interface WorkoutState {
    sessionId: string | null;
    currentWorkout: Omit<Workout, 'sessionId' | 'date'> | null;
    isActive: boolean;
    currentExercise: Exercise | null;
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
    updateLiveMetrics: (reps: number, calories: number) => void;
    tick: () => void;
    reset: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
    persist(
        (set, get) => ({
            sessionId: null,
            currentWorkout: null,
            isActive: false,
            currentExercise: null,
            elapsedSeconds: 0,
            caloriesBurned: 0,

            startWorkout: async (type, title) => {
                try {
                    // Start session on backend
                    const session = await sessionApi.startSession('custom', title);
                    
                    set({
                        sessionId: session.id,
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
                } catch (error) {
                    console.error('[workoutStore] Failed to start session:', error);
                    // Fallback to local-only if backend fails (optional: depending on requirements)
                    set({
                        isActive: true,
                        elapsedSeconds: 0,
                        caloriesBurned: 0,
                    });
                }
            },

            startExercise: (name) => {
                set({
                    currentExercise: {
                        name,
                        reps: 0,
                        sets: 1,
                        weight: 0,
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
                const { sessionId, elapsedSeconds, caloriesBurned } = get();
                
                if (sessionId) {
                    try {
                        await sessionApi.completeSession(sessionId, {
                            durationMin: Math.floor(elapsedSeconds / 60),
                            caloriesBurned: Math.round(caloriesBurned),
                            formScore: summary.formScore,
                            overallFatigue: summary.fatigue,
                            notes: summary.notes,
                        });
                    } catch (error) {
                        console.error('[workoutStore] Failed to complete session on backend:', error);
                    }
                }

                set({ 
                    isActive: false, 
                    sessionId: null,
                    currentWorkout: null, 
                    currentExercise: null,
                    elapsedSeconds: 0,
                    caloriesBurned: 0 
                });
            },

            reset: () => set({
                sessionId: null,
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
