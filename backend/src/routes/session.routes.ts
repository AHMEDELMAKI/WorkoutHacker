import { Router } from 'express';
import { body } from 'express-validator';
import { SessionController } from '../controllers/session.controller';
import { authenticate } from '../middleware/authenticate';

export const sessionRouter = Router();
sessionRouter.use(authenticate);

sessionRouter.post(
    '/start',
    [
        body('workoutType').notEmpty(),
        body('title').notEmpty().trim(),
    ],
    SessionController.startSession
);

sessionRouter.post(
    '/:id/complete',
    [
        body('durationMin').optional().isInt({ min: 0 }),
        body('caloriesBurned').optional().isInt({ min: 0 }),
        body('formScore').optional().isFloat({ min: 0, max: 100 }),
        body('overallFatigue').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    ],
    SessionController.completeSession
);

sessionRouter.post('/:id/ai-metrics', SessionController.logAiMetric);
sessionRouter.post('/:id/ai-metrics/batch', SessionController.logAiMetricsBatch);

sessionRouter.get('/', SessionController.getSessions);

sessionRouter.get('/:id', SessionController.getSession);
