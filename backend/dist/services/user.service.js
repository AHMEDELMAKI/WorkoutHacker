"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const prisma_1 = require("../lib/prisma");
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
    static async updateProfile(userId, data) {
        // Upsert profile for the user
        return prisma_1.prisma.profile.upsert({
            where: { userId },
            update: {
                ...data,
                ...(data.ageYears && { ageYears: parseInt(data.ageYears, 10) }),
                ...(data.heightCm && { heightCm: parseFloat(data.heightCm) }),
                ...(data.weightKg && { weightKg: parseFloat(data.weightKg) }),
            },
            create: {
                userId,
                ...data,
                ...(data.ageYears && { ageYears: parseInt(data.ageYears, 10) }),
                ...(data.heightCm && { heightCm: parseFloat(data.heightCm) }),
                ...(data.weightKg && { weightKg: parseFloat(data.weightKg) }),
            },
        });
    }
    static async updatePrivacy(userId, data) {
        return prisma_1.prisma.privacySettings.upsert({
            where: { userId },
            update: data,
            create: { userId, ...data },
        });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map