export declare class UserService {
    static getMe(userId: string): Promise<{
        profile: {
            id: string;
            createdAt: Date;
            userId: string;
            updatedAt: Date;
            displayName: string | null;
            avatarUrl: string | null;
            gender: import(".prisma/client").$Enums.Gender | null;
            ageYears: number | null;
            heightCm: number | null;
            weightKg: number | null;
            fitnessLevel: import(".prisma/client").$Enums.FitnessLevel | null;
            fitnessGoals: string[];
            units: import(".prisma/client").$Enums.UnitSystem;
            onboardingDone: boolean;
        } | null;
        privacySettings: {
            id: string;
            userId: string;
            notifications: boolean;
            localOnly: boolean;
            shareAnalytics: boolean;
            cameraAccess: boolean;
        } | null;
        email: string;
        id: string;
        createdAt: Date;
        emailVerified: boolean;
        updatedAt: Date;
    }>;
    static updateProfile(userId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        updatedAt: Date;
        displayName: string | null;
        avatarUrl: string | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        ageYears: number | null;
        heightCm: number | null;
        weightKg: number | null;
        fitnessLevel: import(".prisma/client").$Enums.FitnessLevel | null;
        fitnessGoals: string[];
        units: import(".prisma/client").$Enums.UnitSystem;
        onboardingDone: boolean;
    }>;
    static updatePrivacy(userId: string, data: any): Promise<{
        id: string;
        userId: string;
        notifications: boolean;
        localOnly: boolean;
        shareAnalytics: boolean;
        cameraAccess: boolean;
    }>;
}
//# sourceMappingURL=user.service.d.ts.map