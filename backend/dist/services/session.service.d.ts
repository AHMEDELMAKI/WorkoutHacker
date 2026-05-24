import { FatigueLevel } from '@prisma/client';
export declare class SessionService {
    static startSession(userId: string, workoutType: string, title: string): Promise<{
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
    }>;
    static completeSession(userId: string, sessionId: string, data: {
        durationMin?: number;
        caloriesBurned?: number;
        formScore?: number;
        overallFatigue?: FatigueLevel;
        notes?: string;
    }): Promise<{
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
    }>;
    static logAiMetric(userId: string, sessionId: string, data: {
        exerciseSessionId?: string;
        timestampMs: number;
        reps?: number;
        formScore?: number;
        fatigue?: FatigueLevel;
        tempo?: string;
        detectedExercise?: string;
        confidenceScore?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        formScore: number | null;
        timestampMs: bigint;
        reps: number;
        fatigue: import(".prisma/client").$Enums.FatigueLevel | null;
        tempo: string | null;
        detectedExercise: string | null;
        confidenceScore: number | null;
        poseData: import("@prisma/client/runtime/library").JsonValue | null;
        workoutSessionId: string;
        exerciseSessionId: string | null;
    }>;
    static logAiMetricsBatch(userId: string, sessionId: string, metrics: Array<{
        exerciseSessionId?: string;
        timestampMs: number;
        reps?: number;
        formScore?: number;
        fatigue?: FatigueLevel;
        tempo?: string;
        detectedExercise?: string;
        confidenceScore?: number;
    }>): Promise<import(".prisma/client").Prisma.BatchPayload>;
    private static updateUserAnalytics;
    static getSessions(userId: string, limit?: number, offset?: number): Promise<{
        sessions: ({
            exerciseSessions: {
                id: string;
                avgFormScore: number | null;
                startedAt: Date;
                completedAt: Date | null;
                workoutSessionId: string;
                exerciseId: string | null;
                exerciseName: string;
                totalReps: number;
                totalSets: number;
                maxFatigueLevel: import(".prisma/client").$Enums.FatigueLevel | null;
                tempoClassified: string | null;
            }[];
        } & {
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
        })[];
        total: number;
        limit: number;
        offset: number;
    }>;
    static getSession(userId: string, sessionId: string): Promise<{
        exerciseSessions: {
            id: string;
            avgFormScore: number | null;
            startedAt: Date;
            completedAt: Date | null;
            workoutSessionId: string;
            exerciseId: string | null;
            exerciseName: string;
            totalReps: number;
            totalSets: number;
            maxFatigueLevel: import(".prisma/client").$Enums.FatigueLevel | null;
            tempoClassified: string | null;
        }[];
        aiMetrics: {
            id: string;
            createdAt: Date;
            formScore: number | null;
            timestampMs: bigint;
            reps: number;
            fatigue: import(".prisma/client").$Enums.FatigueLevel | null;
            tempo: string | null;
            detectedExercise: string | null;
            confidenceScore: number | null;
            poseData: import("@prisma/client/runtime/library").JsonValue | null;
            workoutSessionId: string;
            exerciseSessionId: string | null;
        }[];
    } & {
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
    }>;
}
//# sourceMappingURL=session.service.d.ts.map