import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { logger } from '../utils/logger';
import { signAccessToken, createRefreshToken, rotateRefreshToken, revokeAllUserTokens } from '../utils/jwt';
import { sendOtpEmail, sendPasswordResetEmail } from '../utils/email';

export class AuthService {
    static async register(data: { email: string; password: string; displayName?: string }) {
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) throw new Error('Email already in use');

        const passwordHash = await bcrypt.hash(data.password, 12);
        const user = await prisma.user.create({
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
        await prisma.otpCode.create({
            data: { userId: user.id, code, type: 'EMAIL_VERIFICATION', expiresAt },
        });

        // In development, log the OTP to the console. In production, send the email.
        if (process.env.NODE_ENV === 'development') {
            logger.info(`DEV-ONLY: OTP for ${data.email} is ${code}`);
        } else {
            try { await sendOtpEmail(data.email, code); } catch (err) {
                logger.error('Failed to send OTP email:', err);
            }
        }

        const accessToken = signAccessToken({ sub: user.id, email: user.email });
        const refreshToken = await createRefreshToken(user.id);
        return { user, accessToken, refreshToken };
    }

    static async login(email: string, password: string) {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { profile: true },
        });

        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            throw new Error('Invalid credentials');
        }

        const accessToken = signAccessToken({ sub: user.id, email: user.email });
        const refreshToken = await createRefreshToken(user.id);
        return { user, accessToken, refreshToken };
    }

    static async refresh(token: string) {
        const { userId, newRefreshToken } = await rotateRefreshToken(token);
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error('User not found');

        const accessToken = signAccessToken({ sub: user.id, email: user.email });
        return { accessToken, refreshToken: newRefreshToken };
    }

    static async logout(userId: string) {
        await revokeAllUserTokens(userId);
    }

    static async forgotPassword(email: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            await prisma.otpCode.create({
                data: { userId: user.id, code, type: 'PASSWORD_RESET', expiresAt },
            });
            // In development, log the OTP to the console.
            if (process.env.NODE_ENV === 'development') {
                logger.info(`DEV-ONLY: Password Reset OTP for ${email} is ${code}`);
            } else {
                try { await sendPasswordResetEmail(email, code); } catch (err) {
                    logger.error('Failed to send password reset email:', err);
                }
            }
        }
    }

    static async verifyOtp(email: string, code: string, type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET') {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error('Invalid code');

        const otp = await prisma.otpCode.findFirst({
            where: { userId: user.id, code, type, used: false },
            orderBy: { createdAt: 'desc' },
        });

        if (!otp || otp.expiresAt < new Date()) throw new Error('Invalid or expired code');

        await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } });

        if (type === 'EMAIL_VERIFICATION') {
            await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } });
        }

        const tempToken = signAccessToken({ sub: user.id, email: user.email });
        return { token: tempToken };
    }

    static async resetPassword(userId: string, password: string) {
        const passwordHash = await bcrypt.hash(password, 12);
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
        await revokeAllUserTokens(userId);
    }
}
