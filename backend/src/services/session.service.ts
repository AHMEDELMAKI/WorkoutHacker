import { prisma } from '../lib/prisma';
import { FatigueLevel } from '@prisma/client';

export class SessionService {
    static async startSession(userId: string, workoutType: string, title: string) {
        return prisma.workoutSession.create({
            data: {
                userId,
                workoutType,
                title,
                startedAt: new Date(),
            },
        });
    }

    static async completeSession(
        userId: string,
        sessionId: string,
        data: {
            durationMin?: number;
            caloriesBurned?: number;
            formScore?: number;
            overallFatigue?: FatigueLevel;
            notes?: string;
        },
    ) {
        const session = await prisma.workoutSession.findFirst({
            where: { id: sessionId, userId },
        });

        if (!session) throw new Error('Session not found');

        const completed = await prisma.workoutSession.update({
            where: { id: sessionId },
            data: {
                completedAt: new Date(),
                ...data,
            },
        });

        // Update analytics
        await this.updateUserAnalytics(userId, {
            durationMin: data.durationMin || 0,
            caloriesBurned: data.caloriesBurned || 0,
            formScore: data.formScore,
        });

        return completed;
    }

    static async logAiMetric(
        userId: string,
        sessionId: string,
        data: {
            exerciseSessionId?: string;
            timestampMs: number;
            reps?: number;
            formScore?: number;
            fatigue?: FatigueLevel;
            tempo?: string;
            detectedExercise?: string;
            confidenceScore?: number;
        },
    ) {
        const session = await prisma.workoutSession.findFirst({
            where: { id: sessionId, userId },
        });
        if (!session) throw new Error('Session not found');

        return prisma.aiMetric.create({
            data: {
                workoutSessionId: sessionId,
                exerciseSessionId: data.exerciseSessionId || null,
                timestampMs: BigInt(data.timestampMs),
                reps: data.reps || 0,
                formScore: data.formScore || null,
                fatigue: data.fatigue || null,
                tempo: data.tempo || null,
                detectedExercise: data.detectedExercise || null,
                confidenceScore: data.confidenceScore || null,
            },
        });
    }

    static async logAiMetricsBatch(
        userId: string,
        sessionId: string,
        metrics: Array<{
            exerciseSessionId?: string;
            timestampMs: number;
            reps?: number;
            formScore?: number;
            fatigue?: FatigueLevel;
            tempo?: string;
            detectedExercise?: string;
            confidenceScore?: number;
        }>,
    ) {
        const session = await prisma.workoutSession.findFirst({
            where: { id: sessionId, userId },
        });
        if (!session) throw new Error('Session not found');

        return prisma.aiMetric.createMany({
            data: metrics.map((m) => ({
                workoutSessionId: sessionId,
                exerciseSessionId: m.exerciseSessionId || null,
                timestampMs: BigInt(m.timestampMs),
                reps: m.reps || 0,
                formScore: m.formScore || null,
                fatigue: m.fatigue || null,
                tempo: m.tempo || null,
                detectedExercise: m.detectedExercise || null,
                confidenceScore: m.confidenceScore || null,
            })),
        });
    }

    private static async updateUserAnalytics(
        userId: string,
        data: { durationMin: number; caloriesBurned: number; formScore?: number },
    ) {
        const analytics = await prisma.analytics.findUnique({ where: { userId } });
        const now = new Date();
        const lastWorkout = analytics?.lastWorkoutAt;
        const daysSinceLast = lastWorkout
            ? Math.floor((now.getTime() - lastWorkout.getTime()) / 86400000)
            : null;

        const currentStreak =
            analytics?.currentStreak !== undefined
                ? daysSinceLast === 1
                    ? analytics.currentStreak + 1
                    : daysSinceLast === 0
                        ? analytics.currentStreak
                        : 1
                : 1;

        const newAvgFormScore =
            data.formScore !== undefined && analytics
                ? (analytics.avgFormScore * analytics.totalWorkouts + data.formScore) /
                (analytics.totalWorkouts + 1)
                : analytics?.avgFormScore ?? 0;

        await prisma.analytics.upsert({
            where: { userId },
            create: {
                userId,
                totalWorkouts: 1,
                totalCaloriesBurned: data.caloriesBurned,
                totalMinutes: data.durationMin,
                currentStreak: 1,
                longestStreak: 1,
                lastWorkoutAt: now,
                avgFormScore: data.formScore ?? 0,
            },
            update: {
                totalWorkouts: { increment: 1 },
                totalCaloriesBurned: { increment: data.caloriesBurned },
                totalMinutes: { increment: data.durationMin },
                currentStreak,
                longestStreak: Math.max(analytics?.longestStreak ?? 0, currentStreak),
                lastWorkoutAt: now,
                avgFormScore: newAvgFormScore,
            },
        });
    }

    static async getSessions(userId: string, limit = 20, offset = 0) {
        const [sessions, total] = await Promise.all([
            prisma.workoutSession.findMany({
                where: { userId, completedAt: { not: null } },
                orderBy: { startedAt: 'desc' },
                take: limit,
                skip: offset,
                include: { exerciseSessions: true },
            }),
            prisma.workoutSession.count({ where: { userId, completedAt: { not: null } } }),
        ]);
        return { sessions, total, limit, offset };
    }

    static async getSession(userId: string, sessionId: string) {
        const session = await prisma.workoutSession.findFirst({
            where: { id: sessionId, userId },
            include: {
                exerciseSessions: true,
                aiMetrics: {
                    orderBy: { timestampMs: 'asc' },
                    take: 500,
                },
            },
        });
        if (!session) throw new Error('Session not found');
        return session;
    }
}
