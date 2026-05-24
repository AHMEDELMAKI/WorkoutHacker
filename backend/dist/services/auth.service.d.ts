export declare class AuthService {
    static register(data: {
        email: string;
        password: string;
        displayName?: string;
    }): Promise<{
        user: {
            email: string;
            id: string;
            createdAt: Date;
            passwordHash: string;
            emailVerified: boolean;
            updatedAt: Date;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    static login(email: string, password: string): Promise<{
        user: {
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
        } & {
            email: string;
            id: string;
            createdAt: Date;
            passwordHash: string;
            emailVerified: boolean;
            updatedAt: Date;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    static refresh(token: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    static logout(userId: string): Promise<void>;
    static forgotPassword(email: string): Promise<void>;
    static verifyOtp(email: string, code: string, type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET'): Promise<{
        token: string;
    }>;
    static resetPassword(userId: string, password: string): Promise<void>;
}
//# sourceMappingURL=auth.service.d.ts.map