"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const prisma_1 = require("../lib/prisma");
const normalizeProfileData = (data) => ({
    ...data,
    ...(data.gender === 'male' && { gender: 'MALE' }),
    ...(data.gender === 'female' && { gender: 'FEMALE' }),
    ...(data.gender === 'other' && { gender: 'NON_BINARY' }),
    ...(data.fitnessLevel === 'beginner' && { fitnessLevel: 'BEGINNER' }),
    ...(data.fitnessLevel === 'intermediate' && { fitnessLevel: 'INTERMEDIATE' }),
    ...(data.fitnessLevel === 'advanced' && { fitnessLevel: 'ADVANCED' }),
    ...(data.fitnessLevel === 'athlete' && { fitnessLevel: 'ADVANCED' }),
});
class UserService {
    static async getMe(userId) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true, privacySettings: true },
        });
        if (!user)
            throw new Error('User not found');
        const { passwordHash: _, ...safeUser } = user;
        return safeUser;
    }
    static async getProfile(userId) {
        const profile = await prisma_1.prisma.profile.findUnique({ where: { userId } });
        if (!profile)
            throw new Error('Profile not found');
        return profile;
    }
    static async updateProfile(userId, data) {
        const normalized = normalizeProfileData(data);
        // Upsert profile for the user
        return prisma_1.prisma.profile.upsert({
            where: { userId },
            update: {
                ...normalized,
                ...(normalized.ageYears && { ageYears: parseInt(normalized.ageYears, 10) }),
                ...(normalized.heightCm && { heightCm: parseFloat(normalized.heightCm) }),
                ...(normalized.weightKg && { weightKg: parseFloat(normalized.weightKg) }),
            },
            create: {
                userId,
                ...normalized,
                ...(normalized.ageYears && { ageYears: parseInt(normalized.ageYears, 10) }),
                ...(normalized.heightCm && { heightCm: parseFloat(normalized.heightCm) }),
                ...(normalized.weightKg && { weightKg: parseFloat(normalized.weightKg) }),
            },
        });
    }
    static async updatePrivacy(userId, data) {
        const normalized = {
            ...(data.localOnly !== undefined && { localOnly: data.localOnly }),
            ...(data.shareAnalytics !== undefined && { shareAnalytics: data.shareAnalytics }),
            ...(data.cameraAccess !== undefined && { cameraAccess: data.cameraAccess }),
            ...(data.notifications !== undefined && { notifications: data.notifications }),
            ...(data.privacyLocalOnly !== undefined && { localOnly: data.privacyLocalOnly }),
            ...(data.privacyShareAnalytics !== undefined && { shareAnalytics: data.privacyShareAnalytics }),
            ...(data.privacyCameraAccess !== undefined && { cameraAccess: data.privacyCameraAccess }),
        };
        return prisma_1.prisma.privacySettings.upsert({
            where: { userId },
            update: normalized,
            create: { userId, ...normalized },
        });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map