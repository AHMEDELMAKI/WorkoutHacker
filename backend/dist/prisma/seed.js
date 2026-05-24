"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    // ─── Exercises ─────────────────────────────────────────
    const exercises = [
        { name: 'Barbell Back Squat', muscleGroup: ['Quads', 'Glutes', 'Hamstrings'], equipment: ['barbell'], difficulty: client_1.FitnessLevel.INTERMEDIATE },
        { name: 'Romanian Deadlift', muscleGroup: ['Hamstrings', 'Glutes', 'Lower Back'], equipment: ['barbell'], difficulty: client_1.FitnessLevel.INTERMEDIATE },
        { name: 'Bench Press', muscleGroup: ['Chest', 'Triceps', 'Shoulders'], equipment: ['barbell', 'bench'], difficulty: client_1.FitnessLevel.BEGINNER },
        { name: 'Overhead Press', muscleGroup: ['Shoulders', 'Triceps', 'Upper Back'], equipment: ['barbell'], difficulty: client_1.FitnessLevel.INTERMEDIATE },
        { name: 'Barbell Row', muscleGroup: ['Back', 'Biceps', 'Rear Delt'], equipment: ['barbell'], difficulty: client_1.FitnessLevel.INTERMEDIATE },
        { name: 'Pull-up', muscleGroup: ['Back', 'Biceps'], equipment: ['pullup_bar'], difficulty: client_1.FitnessLevel.INTERMEDIATE },
        { name: 'Dumbbell Bicep Curl', muscleGroup: ['Biceps'], equipment: ['dumbbells'], difficulty: client_1.FitnessLevel.BEGINNER },
        { name: 'Tricep Dip', muscleGroup: ['Triceps', 'Chest'], equipment: ['dip_bar'], difficulty: client_1.FitnessLevel.BEGINNER },
        { name: 'Lateral Raise', muscleGroup: ['Lateral Deltoid'], equipment: ['dumbbells'], difficulty: client_1.FitnessLevel.BEGINNER },
        { name: 'Front Raise', muscleGroup: ['Front Deltoid'], equipment: ['dumbbells'], difficulty: client_1.FitnessLevel.BEGINNER },
        { name: 'Shoulder Press', muscleGroup: ['Shoulders', 'Triceps'], equipment: ['dumbbells'], difficulty: client_1.FitnessLevel.BEGINNER },
        { name: 'Push-up', muscleGroup: ['Chest', 'Triceps', 'Core'], equipment: [], difficulty: client_1.FitnessLevel.BEGINNER },
        { name: 'Lunge', muscleGroup: ['Quads', 'Glutes', 'Hamstrings'], equipment: [], difficulty: client_1.FitnessLevel.BEGINNER },
        { name: 'Bulgarian Split Squat', muscleGroup: ['Quads', 'Glutes'], equipment: ['dumbbells', 'bench'], difficulty: client_1.FitnessLevel.ADVANCED },
        { name: 'Triceps Extension', muscleGroup: ['Triceps'], equipment: ['dumbbells'], difficulty: client_1.FitnessLevel.BEGINNER },
        { name: 'Plank', muscleGroup: ['Core', 'Shoulders'], equipment: [], difficulty: client_1.FitnessLevel.BEGINNER },
        { name: 'Hip Thrust', muscleGroup: ['Glutes', 'Hamstrings'], equipment: ['barbell', 'bench'], difficulty: client_1.FitnessLevel.INTERMEDIATE },
        { name: 'Leg Press', muscleGroup: ['Quads', 'Glutes'], equipment: ['machine'], difficulty: client_1.FitnessLevel.BEGINNER },
        { name: 'Calf Raise', muscleGroup: ['Calves'], equipment: [], difficulty: client_1.FitnessLevel.BEGINNER },
        { name: 'Face Pull', muscleGroup: ['Rear Delt', 'Traps', 'Rotator Cuff'], equipment: ['cable'], difficulty: client_1.FitnessLevel.BEGINNER },
    ];
    for (const ex of exercises) {
        await prisma.exercise.upsert({
            where: { name: ex.name },
            update: {},
            create: ex,
        });
    }
    console.log(`  ✅ Seeded ${exercises.length} exercises`);
    // ─── Demo User ──────────────────────────────────────────
    const passwordHash = await bcryptjs_1.default.hash('Password123!', 12);
    const demoUser = await prisma.user.upsert({
        where: { email: 'demo@workouthacker.app' },
        update: {},
        create: {
            email: 'demo@workouthacker.app',
            passwordHash,
            emailVerified: true,
            profile: {
                create: {
                    displayName: 'Demo Athlete',
                    gender: 'MALE',
                    ageYears: 28,
                    heightCm: 180,
                    weightKg: 80,
                    fitnessLevel: client_1.FitnessLevel.INTERMEDIATE,
                    fitnessGoals: ['Muscle Gain', 'Strength'],
                    onboardingDone: true,
                },
            },
            privacySettings: { create: {} },
            analytics: {
                create: {
                    totalWorkouts: 24,
                    totalCaloriesBurned: 12000,
                    totalMinutes: 1080,
                    currentStreak: 7,
                    longestStreak: 21,
                    avgFormScore: 82.5,
                    lastWorkoutAt: new Date(),
                },
            },
        },
    });
    console.log(`  ✅ Demo user: demo@workouthacker.app / Password123!`);
    // ─── Sample Notification ─────────────────────────────────
    await prisma.notification.upsert({
        where: { id: 'seed-notif-1' },
        update: {},
        create: {
            id: 'seed-notif-1',
            userId: demoUser.id,
            type: 'STREAK_ALERT',
            title: '7-Day Streak! 🔥',
            body: "You've worked out 7 days in a row. You're on fire!",
        },
    });
    console.log('  ✅ Sample notification seeded');
    console.log('\n🚀 Seed complete!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map