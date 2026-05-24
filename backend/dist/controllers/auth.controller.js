"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const express_validator_1 = require("express-validator");
const auth_service_1 = require("../services/auth.service");
const response_1 = require("../common/response");
class AuthController {
    static async register(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            return (0, response_1.sendError)(res, 'Validation failed', 400, errors.array());
        try {
            const data = await auth_service_1.AuthService.register(req.body);
            return (0, response_1.sendCreated)(res, {
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                user: { id: data.user.id, email: data.user.email, emailVerified: data.user.emailVerified }
            }, 'Account created successfully');
        }
        catch (err) {
            const status = err.message === 'Email already in use' ? 409 : 500;
            return (0, response_1.sendError)(res, err.message, status);
        }
    }
    static async login(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            return (0, response_1.sendError)(res, 'Validation failed', 400, errors.array());
        try {
            const { email, password } = req.body;
            const data = await auth_service_1.AuthService.login(email, password);
            return (0, response_1.sendSuccess)(res, {
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    emailVerified: data.user.emailVerified,
                    displayName: data.user.profile?.displayName,
                    onboardingDone: data.user.profile?.onboardingDone,
                }
            }, 'Login successful');
        }
        catch (err) {
            const status = err.message === 'Invalid credentials' ? 401 : 500;
            return (0, response_1.sendError)(res, err.message, status);
        }
    }
    static async refresh(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken)
                return (0, response_1.sendError)(res, 'Refresh token required', 400);
            const data = await auth_service_1.AuthService.refresh(refreshToken);
            return (0, response_1.sendSuccess)(res, data, 'Token refreshed');
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message, 401);
        }
    }
    static async logout(req, res) {
        try {
            await auth_service_1.AuthService.logout(req.user.sub);
            return (0, response_1.sendSuccess)(res, null, 'Logged out successfully');
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message);
        }
    }
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            await auth_service_1.AuthService.forgotPassword(email);
            return (0, response_1.sendSuccess)(res, null, 'If an account exists, a reset code was sent');
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message);
        }
    }
    static async verifyOtp(req, res) {
        try {
            const { email, code, type } = req.body;
            const data = await auth_service_1.AuthService.verifyOtp(email, code, type || 'EMAIL_VERIFICATION');
            return (0, response_1.sendSuccess)(res, data, 'Code verified');
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message, 400);
        }
    }
    static async resetPassword(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            return (0, response_1.sendError)(res, 'Validation failed', 400, errors.array());
        try {
            await auth_service_1.AuthService.resetPassword(req.user.sub, req.body.password);
            return (0, response_1.sendSuccess)(res, null, 'Password reset successfully');
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map