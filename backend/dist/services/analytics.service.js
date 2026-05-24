"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const prisma_1 = require("../lib/prisma");
class AnalyticsService {
    static async getSummary(userId) {
        const analytics = await prisma_1.prisma.analytics.findUnique({ where: { userId } });
        return analytics || {
            totalWorkouts: 0,
            totalCaloriesBurned: 0,
            totalMinutes: 0,
            currentStreak: 0,
            longestStreak: 0,
            avgFormScore: 0,
            lastWorkoutAt: null,
        };
    }
    static async getWeeklySummary(userId) {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7));
        startOfWeek.setHours(0, 0, 0, 0);
        const sessions = await prisma_1.prisma.workoutSession.findMany({
            where: {
                userId,
                startedAt: { gte: startOfWeek },
                completedAt: { not: null },
            },
            orderBy: { startedAt: 'asc' },
        });
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const byDay = {};
        days.forEach((d) => (byDay[d] = { workouts: 0, calories: 0, minutes: 0 }));
        for (const s of sessions) {
            const dayIdx = (s.startedAt.getDay() + 6) % 7;
            const day = days[dayIdx];
            byDay[day].workouts++;
            byDay[day].calories += s.caloriesBurned || 0;
            byDay[day].minutes += s.durationMin || 0;
        }
        return { sessions, byDay };
    }
    static async getStreaks(userId) {
        const analytics = await prisma_1.prisma.analytics.findUnique({ where: { userId } });
        return {
            currentStreak: analytics?.currentStreak || 0,
            longestStreak: analytics?.longestStreak || 0,
            lastWorkoutAt: analytics?.lastWorkoutAt || null,
        };
    }
    static async getFatigueTrend(userId) {
        const since = new Date();
        since.setDate(since.getDate() - 30);
        return prisma_1.prisma.aiMetric.findMany({
            where: {
                workoutSession: { userId },
                createdAt: { gte: since },
                fatigue: { not: null },
            },
            select: { fatigue: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
            take: 500,
        });
    }
    static async getFormTrend(userId) {
        return prisma_1.prisma.workoutSession.findMany({
            where: { userId, formScore: { not: null } },
            orderBy: { startedAt: 'asc' },
            take: 30,
            select: { startedAt: true, formScore: true, title: true },
        });
    }
    static async getPersonalRecords(userId) {
        return prisma_1.prisma.exerciseSession.findMany({
            where: {
                workoutSession: { userId, completedAt: { not: null } },
                totalReps: { gt: 0 },
            },
            orderBy: [{ exerciseName: 'asc' }, { totalReps: 'desc' }],
            distinct: ['exerciseName'],
            select: {
                exerciseName: true,
                totalReps: true,
                totalSets: true,
                avgFormScore: true,
                workoutSession: { select: { startedAt: true } },
            },
        });
    }
}
exports.AnalyticsService = AnalyticsService;
//# sourceMappingURL=analytics.service.js.map