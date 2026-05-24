"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.verifyAccessToken = verifyAccessToken;
exports.createRefreshToken = createRefreshToken;
exports.rotateRefreshToken = rotateRefreshToken;
exports.revokeAllUserTokens = revokeAllUserTokens;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const prisma_1 = require("../lib/prisma");
const logger_1 = require("./logger");
// ─── Sign Access Token ──────────────────────────────────
function signAccessToken(payload) {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET is not configured');
    return jsonwebtoken_1.default.sign(payload, secret, {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });
}
// ─── Verify Access Token ─────────────────────────────────
function verifyAccessToken(token) {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error('JWT_SECRET is not configured');
    return jsonwebtoken_1.default.verify(token, secret);
}
// ─── Create & Persist Refresh Token ─────────────────────
async function createRefreshToken(userId) {
    const token = (0, uuid_1.v4)();
    const expiresInDays = parseInt((process.env.JWT_REFRESH_EXPIRES_IN || '30d').replace('d', ''), 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    await prisma_1.prisma.refreshToken.create({
        data: { userId, token, expiresAt },
    });
    return token;
}
// ─── Rotate Refresh Token ────────────────────────────────
async function rotateRefreshToken(oldToken) {
    const record = await prisma_1.prisma.refreshToken.findUnique({
        where: { token: oldToken },
    });
    if (!record || record.revoked) {
        throw new Error('Invalid refresh token');
    }
    if (record.expiresAt < new Date()) {
        throw new Error('Refresh token expired');
    }
    // Revoke old token
    await prisma_1.prisma.refreshToken.update({
        where: { id: record.id },
        data: { revoked: true },
    });
    // Issue new token
    const newRefreshToken = await createRefreshToken(record.userId);
    return { userId: record.userId, newRefreshToken };
}
// ─── Revoke All User Refresh Tokens ─────────────────────
async function revokeAllUserTokens(userId) {
    await prisma_1.prisma.refreshToken.updateMany({
        where: { userId, revoked: false },
        data: { revoked: true },
    });
    logger_1.logger.info(`Revoked all refresh tokens for user ${userId}`);
}
//# sourceMappingURL=jwt.js.map