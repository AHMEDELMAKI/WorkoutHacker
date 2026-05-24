export declare class AnalyticsService {
    static getSummary(userId: string): Promise<{
        id: string;
        userId: string;
        updatedAt: Date;
        totalWorkouts: number;
        totalCaloriesBurned: number;
        totalMinutes: number;
        currentStreak: number;
        longestStreak: number;
        lastWorkoutAt: Date | null;
        avgFormScore: number;
    } | {
        totalWorkouts: number;
        totalCaloriesBurned: number;
        totalMinutes: number;
        currentStreak: number;
        longestStreak: number;
        avgFormScore: number;
        lastWorkoutAt: null;
    }>;
    static getWeeklySummary(userId: string): Promise<{
        sessions: {
            id: string;
            createdAt: Date;
            userId: string;
            durationMin: number | null;
            workoutType: string;
            title: string;
            startedAt: Date;
            completedAt: Date | null;
            caloriesBurned: number | null;
            formScore: number | null;
            overallFatigue: import(".prisma/client").$Enums.FatigueLevel | null;
            notes: string | null;
        }[];
        byDay: Record<string, {
            workouts: number;
            calories: number;
            minutes: number;
        }>;
    }>;
    static getStreaks(userId: string): Promise<{
        currentStreak: number;
        longestStreak: number;
        lastWorkoutAt: Date | null;
    }>;
    static getFatigueTrend(userId: string): Promise<{
        createdAt: Date;
        fatigue: import(".prisma/client").$Enums.FatigueLevel | null;
    }[]>;
    static getFormTrend(userId: string): Promise<{
        title: string;
        startedAt: Date;
        formScore: number | null;
    }[]>;
    static getPersonalRecords(userId: string): Promise<{
        workoutSession: {
            startedAt: Date;
        };
        avgFormScore: number | null;
        exerciseName: string;
        totalReps: number;
        totalSets: number;
    }[]>;
}
//# sourceMappingURL=analytics.service.d.ts.map