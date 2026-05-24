"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const prisma_1 = require("../lib/prisma");
class SessionService {
    static async startSession(userId, workoutType, title) {
        return prisma_1.prisma.workoutSession.create({
            data: {
                userId,
                workoutType,
                title,
                startedAt: new Date(),
            },
        });
    }
    static async completeSession(userId, sessionId, data) {
        const session = await prisma_1.prisma.workoutSession.findFirst({
            where: { id: sessionId, userId },
        });
        if (!session)
            throw new Error('Session not found');
        const completed = await prisma_1.prisma.workoutSession.update({
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
    static async logAiMetric(userId, sessionId, data) {
        const session = await prisma_1.prisma.workoutSession.findFirst({
            where: { id: sessionId, userId },
        });
        if (!session)
            throw new Error('Session not found');
        return prisma_1.prisma.aiMetric.create({
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
    static async logAiMetricsBatch(userId, sessionId, metrics) {
        const session = await prisma_1.prisma.workoutSession.findFirst({
            where: { id: sessionId, userId },
        });
        if (!session)
            throw new Error('Session not found');
        return prisma_1.prisma.aiMetric.createMany({
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
    static async updateUserAnalytics(userId, data) {
        const analytics = await prisma_1.prisma.analytics.findUnique({ where: { userId } });
        const now = new Date();
        const lastWorkout = analytics?.lastWorkoutAt;
        const daysSinceLast = lastWorkout
            ? Math.floor((now.getTime() - lastWorkout.getTime()) / 86400000)
            : null;
        const currentStreak = analytics?.currentStreak !== undefined
            ? daysSinceLast === 1
                ? analytics.currentStreak + 1
                : daysSinceLast === 0
                    ? analytics.currentStreak
                    : 1
            : 1;
        const newAvgFormScore = data.formScore !== undefined && analytics
            ? (analytics.avgFormScore * analytics.totalWorkouts + data.formScore) /
                (analytics.totalWorkouts + 1)
            : analytics?.avgFormScore ?? 0;
        await prisma_1.prisma.analytics.upsert({
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
    static async getSessions(userId, limit = 20, offset = 0) {
        const [sessions, total] = await Promise.all([
            prisma_1.prisma.workoutSession.findMany({
                where: { userId, completedAt: { not: null } },
                orderBy: { startedAt: 'desc' },
                take: limit,
                skip: offset,
                include: { exerciseSessions: true },
            }),
            prisma_1.prisma.workoutSession.count({ where: { userId, completedAt: { not: null } } }),
        ]);
        return { sessions, total, limit, offset };
    }
    static async getSession(userId, sessionId) {
        const session = await prisma_1.prisma.workoutSession.findFirst({
            where: { id: sessionId, userId },
            include: {
                exerciseSessions: true,
                aiMetrics: {
                    orderBy: { timestampMs: 'asc' },
                    take: 500,
                },
            },
        });
        if (!session)
            throw new Error('Session not found');
        return session;
    }
}
exports.SessionService = SessionService;
//# sourceMappingURL=session.service.js.map