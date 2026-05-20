import { prisma } from '../lib/prisma';

export class UserService {
    static async getMe(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true, privacySettings: true },
        });
        if (!user) throw new Error('User not found');
        const { passwordHash: _, ...safeUser } = user;
        return safeUser;
    }

    static async updateProfile(userId: string, data: any) {
        // Upsert profile for the user
        return prisma.profile.upsert({
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

    static async updatePrivacy(userId: string, data: any) {
        return prisma.privacySettings.upsert({
            where: { userId },
            update: data,
            create: { userId, ...data },
        });
    }
}
