import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ExerciseType } from '../features/workout/data/workoutData';

export type FatigueCheckStackParamList = {
    FatigueLanding: undefined;
    FatigueHeartRate: undefined;
    FatigueProcessing: undefined;
    FatigueResults: undefined;
};

// Root Stack
export type RootStackParamList = {
    Auth: undefined;
    Onboarding: undefined;
    ProfileSetup: undefined;
    Main: undefined;
    FatigueCheck: NavigatorScreenParams<FatigueCheckStackParamList> | undefined;
};

// Auth Stack
export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
    ForgotPassword: undefined;
    ResetPassword: { token: string };
};

// Onboarding Stack
export type OnboardingStackParamList = {
    Splash: undefined;
    OnboardingSlides: undefined;
    Welcome: undefined;
    Intro: undefined;
};

// Profile Setup Stack
export type ProfileSetupStackParamList = {
    Gender: undefined;
    Age: undefined;
    Weight: undefined;
    Goals: undefined;
    FitnessLevel: undefined;
    Height: undefined;
    SetupComplete: undefined;
};

// AI Coach Stack
export type AICoachStackParamList = {
    AICoachHome: undefined;
    WorkoutPlanner: undefined;
};

// Main Tab Stack
export type MainTabParamList = {
    Home: undefined;
    Workout: { screen?: keyof WorkoutStackParamList; params?: any } | undefined;
    ProgressStack: undefined;
    AIPlanner: NavigatorScreenParams<AICoachStackParamList> | undefined;
    ProfileStack: undefined;
};

// Profile stack (nested under ProfileStack tab)
export type ProfileStackParamList = {
    ProfileHome: undefined;
    PrivacySettings: undefined;
    Help: undefined;
    AboutApp: undefined;
};

// Progress stack (nested under ProgressStack tab)
export type ProgressStackParamList = {
    ProgressHome: undefined;
    WorkoutSummary: {
        workoutType: 'full_body' | 'upper_body' | 'lower_body';
        score: number;
        duration: string;
        calories: number;
        muscleFocus: string[];
        suggestions: string[];
    };
};

// Workout Stack (nested under Workout tab)
export type WorkoutStackParamList = {
    WorkoutSelection: undefined;

    // Core templates
    FullBodyWorkout: undefined;
    UpperWorkout: undefined;
    LowerWorkout: undefined;
    CustomWorkout: undefined;

    // Muscle group workouts
    DeltoidWorkout: undefined;
    BicepWorkout: undefined;
    TricepWorkout: undefined;
    ForearmWorkout: undefined;
    ChestWorkout: undefined;
    AbdominalWorkout: undefined;
    LatsWorkout: undefined;
    TrapeziusWorkout: undefined;
    LumbarWorkout: undefined;
    QuadWorkout: undefined;
    CalfWorkout: undefined;

    // Tests / diagnostics
    GhostGuideTest: undefined;
    TempoClassifierTest: undefined;
    WorkoutPlannerTest: undefined;

    // Shared flow
    ExerciseDetails: { exercise: ExerciseType };
    Tracking: { exercise: ExerciseType };
    HeartRateFatigue: { workoutType: string };
    WorkoutComplete: { workoutType: string };
};

// Screen Props helpers
export type RootStackScreenProps<T extends keyof RootStackParamList> =
    NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
    NativeStackScreenProps<AuthStackParamList, T>;

export type OnboardingStackScreenProps<T extends keyof OnboardingStackParamList> =
    NativeStackScreenProps<OnboardingStackParamList, T>;

export type ProfileSetupStackScreenProps<
    T extends keyof ProfileSetupStackParamList,
> = NativeStackScreenProps<ProfileSetupStackParamList, T>;

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> =
    NativeStackScreenProps<ProfileStackParamList, T>;

export type ProgressStackScreenProps<T extends keyof ProgressStackParamList> =
    NativeStackScreenProps<ProgressStackParamList, T>;

export type WorkoutStackScreenProps<T extends keyof WorkoutStackParamList> =
    NativeStackScreenProps<WorkoutStackParamList, T>;

export type FatigueCheckScreenProps<T extends keyof FatigueCheckStackParamList> =
    NativeStackScreenProps<FatigueCheckStackParamList, T>;
