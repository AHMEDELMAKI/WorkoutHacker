"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../lib/prisma");
const jwt_1 = require("../utils/jwt");
const email_1 = require("../utils/email");
class AuthService {
    static async register(data) {
        const existing = await prisma_1.prisma.user.findUnique({ where: { email: data.email } });
        if (existing)
            throw new Error('Email already in use');
        const passwordHash = await bcryptjs_1.default.hash(data.password, 12);
        const user = await prisma_1.prisma.user.create({
            data: {
                email: data.email,
                passwordHash,
                profile: { create: { displayName: data.displayName || null } },
                privacySettings: { create: {} },
                analytics: { create: {} },
            },
        });
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
        await prisma_1.prisma.otpCode.create({
            data: { userId: user.id, code, type: 'EMAIL_VERIFICATION', expiresAt },
        });
        try {
            await (0, email_1.sendOtpEmail)(data.email, code);
        }
        catch { }
        const accessToken = (0, jwt_1.signAccessToken)({ sub: user.id, email: user.email });
        const refreshToken = await (0, jwt_1.createRefreshToken)(user.id);
        return { user, accessToken, refreshToken };
    }
    static async login(email, password) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
            include: { profile: true },
        });
        if (!user || !(await bcryptjs_1.default.compare(password, user.passwordHash))) {
            throw new Error('Invalid credentials');
        }
        const accessToken = (0, jwt_1.signAccessToken)({ sub: user.id, email: user.email });
        const refreshToken = await (0, jwt_1.createRefreshToken)(user.id);
        return { user, accessToken, refreshToken };
    }
    static async refresh(token) {
        const { userId, newRefreshToken } = await (0, jwt_1.rotateRefreshToken)(token);
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error('User not found');
        const accessToken = (0, jwt_1.signAccessToken)({ sub: user.id, email: user.email });
        return { accessToken, refreshToken: newRefreshToken };
    }
    static async logout(userId) {
        await (0, jwt_1.revokeAllUserTokens)(userId);
    }
    static async forgotPassword(email) {
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (user) {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            await prisma_1.prisma.otpCode.create({
                data: { userId: user.id, code, type: 'PASSWORD_RESET', expiresAt },
            });
            try {
                await (0, email_1.sendPasswordResetEmail)(email, code);
            }
            catch { }
        }
    }
    static async verifyOtp(email, code, type) {
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new Error('Invalid code');
        const otp = await prisma_1.prisma.otpCode.findFirst({
            where: { userId: user.id, code, type, used: false },
            orderBy: { createdAt: 'desc' },
        });
        if (!otp || otp.expiresAt < new Date())
            throw new Error('Invalid or expired code');
        await prisma_1.prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } });
        if (type === 'EMAIL_VERIFICATION') {
            await prisma_1.prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } });
        }
        const tempToken = (0, jwt_1.signAccessToken)({ sub: user.id, email: user.email });
        return { token: tempToken };
    }
    static async resetPassword(userId, password) {
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
        await (0, jwt_1.revokeAllUserTokens)(userId);
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map