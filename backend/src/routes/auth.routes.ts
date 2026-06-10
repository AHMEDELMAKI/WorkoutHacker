import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';

export const authRouter = Router();

authRouter.post(
    '/register',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 6 }),
        body('firstName').optional().trim(),
        body('lastName').optional().trim(),
        body('displayName').optional().trim(),
    ],
    AuthController.register
);

authRouter.post(
    '/login',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').exists(),
    ],
    AuthController.login
);

authRouter.post('/refresh', AuthController.refresh);

authRouter.post('/logout', authenticate, AuthController.logout);

authRouter.post('/forgot-password', AuthController.forgotPassword);

authRouter.post('/verify-otp', AuthController.verifyOtp);

authRouter.post(
    '/reset-password',
    authenticate,
    [body('password').isLength({ min: 6 })],
    AuthController.resetPassword
);
