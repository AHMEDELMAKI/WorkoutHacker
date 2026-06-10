import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';

export const userRouter = Router();
userRouter.use(authenticate);

// ─── GET /api/users/me ───────────────────────────────────
userRouter.get('/me', UserController.getMe);
userRouter.get('/:userId/profile', UserController.getProfile);
userRouter.get('/:userId/onboarding', UserController.getOnboardingStatus);

// ─── PUT /api/users/profile ──────────────────────────────
userRouter.put(
    '/profile',
    [
        body('displayName').optional().trim().isLength({ max: 64 }),
        body('gender').optional().isIn(['male', 'female', 'other', 'MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY']),
        body('ageYears').optional().isInt({ min: 10, max: 120 }),
        body('heightCm').optional().isFloat({ min: 50, max: 300 }),
        body('weightKg').optional().isFloat({ min: 20, max: 500 }),
        body('fitnessLevel').optional().isIn(['beginner', 'intermediate', 'advanced', 'athlete', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
        body('fitnessGoals').optional().isArray(),
        body('units').optional().isIn(['METRIC', 'IMPERIAL']),
        body('onboardingDone').optional().isBoolean(),
    ],
    UserController.updateProfile,
);
userRouter.patch('/:userId/profile', UserController.updateProfile);
userRouter.post('/:userId/onboarding/done', UserController.markOnboardingDone);

// ─── PUT /api/users/privacy ──────────────────────────────
userRouter.put('/privacy', UserController.updatePrivacy);
userRouter.patch('/:userId/settings', UserController.updatePrivacy);
