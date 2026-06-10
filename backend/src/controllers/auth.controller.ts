import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError, sendCreated } from '../common/response';
import { AuthRequest } from '../middleware/authenticate';

export class AuthController {
    static async register(req: Request, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return sendError(res, 'Validation failed', 400, errors.array());

        try {
            const data = await AuthService.register(req.body);
            return sendCreated(res, {
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                user: { 
                    id: data.user.id, 
                    email: data.user.email, 
                    emailVerified: data.user.emailVerified,
                    firstName: data.user.profile?.firstName,
                    lastName: data.user.profile?.lastName,
                }
            }, 'Account created successfully');
        } catch (err: any) {
            const status = err.message === 'Email already in use' ? 409 : 500;
            return sendError(res, err.message, status);
        }
    }

    static async login(req: Request, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return sendError(res, 'Validation failed', 400, errors.array());

        try {
            const { email, password } = req.body;
            const data = await AuthService.login(email, password);
            return sendSuccess(res, {
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    emailVerified: data.user.emailVerified,
                    firstName: data.user.profile?.firstName,
                    lastName: data.user.profile?.lastName,
                    onboardingDone: data.user.profile?.onboardingDone,
                }
            }, 'Login successful');
        } catch (err: any) {
            let status = 401;
            if (err.message === 'User not found') {
                status = 404;
            }
            return sendError(res, err.message, status);
        }
    }

    static async refresh(req: Request, res: Response) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) return sendError(res, 'Refresh token required', 400);

            const data = await AuthService.refresh(refreshToken);
            return sendSuccess(res, data, 'Token refreshed');
        } catch (err: any) {
            return sendError(res, err.message, 401);
        }
    }

    static async logout(req: AuthRequest, res: Response) {
        try {
            await AuthService.logout(req.user!.sub);
            return sendSuccess(res, null, 'Logged out successfully');
        } catch (err: any) {
            return sendError(res, err.message);
        }
    }

    static async forgotPassword(req: Request, res: Response) {
        try {
            const { email } = req.body;
            await AuthService.forgotPassword(email);
            return sendSuccess(res, null, 'If an account exists, a reset code was sent');
        } catch (err: any) {
            return sendError(res, err.message);
        }
    }

    static async verifyOtp(req: Request, res: Response) {
        try {
            const { email, code, type } = req.body;
            const data = await AuthService.verifyOtp(email, code, type || 'EMAIL_VERIFICATION');
            return sendSuccess(res, data, 'Code verified');
        } catch (err: any) {
            return sendError(res, err.message, 400);
        }
    }

    static async resetPassword(req: AuthRequest, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return sendError(res, 'Validation failed', 400, errors.array());

        try {
            await AuthService.resetPassword(req.user!.sub, req.body.password);
            return sendSuccess(res, null, 'Password reset successfully');
        } catch (err: any) {
            return sendError(res, err.message);
        }
    }
}
