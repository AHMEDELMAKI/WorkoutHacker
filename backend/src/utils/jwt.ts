import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../lib/prisma';
import { logger } from './logger';

export interface AccessTokenPayload {
    sub: string;  // userId
    email: string;
    iat?: number;
    exp?: number;
}

// ─── Sign Access Token ──────────────────────────────────
export function signAccessToken(payload: Omit<AccessTokenPayload, 'iat' | 'exp'>): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not configured');

    return jwt.sign(payload, secret, {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    } as SignOptions);
}

// ─── Verify Access Token ─────────────────────────────────
export function verifyAccessToken(token: string): AccessTokenPayload {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not configured');

    return jwt.verify(token, secret) as AccessTokenPayload;
}

// ─── Create & Persist Refresh Token ─────────────────────
export async function createRefreshToken(userId: string): Promise<string> {
    const token = uuidv4();
    const expiresInDays = parseInt(
        (process.env.JWT_REFRESH_EXPIRES_IN || '30d').replace('d', ''),
        10,
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    await prisma.refreshToken.create({
        data: { userId, token, expiresAt },
    });

    return token;
}

// ─── Rotate Refresh Token ────────────────────────────────
export async function rotateRefreshToken(
    oldToken: string,
): Promise<{ userId: string; newRefreshToken: string }> {
    const record = await prisma.refreshToken.findUnique({
        where: { token: oldToken },
    });

    if (!record || record.revoked) {
        throw new Error('Invalid refresh token');
    }

    if (record.expiresAt < new Date()) {
        throw new Error('Refresh token expired');
    }

    // Revoke old token
    await prisma.refreshToken.update({
        where: { id: record.id },
        data: { revoked: true },
    });

    // Issue new token
    const newRefreshToken = await createRefreshToken(record.userId);
    return { userId: record.userId, newRefreshToken };
}

// ─── Revoke All User Refresh Tokens ─────────────────────
export async function revokeAllUserTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
        where: { userId, revoked: false },
        data: { revoked: true },
    });
    logger.info(`Revoked all refresh tokens for user ${userId}`);
}
