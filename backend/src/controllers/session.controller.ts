import { Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/authenticate';
import { SessionService } from '../services/session.service';
import { sendSuccess, sendError, sendCreated } from '../common/response';

export class SessionController {
    static async startSession(req: AuthRequest, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return sendError(res, 'Validation failed', 400, errors.array());

        try {
            const { workoutType, title } = req.body;
            const session = await SessionService.startSession(req.user!.sub, workoutType, title);
            return sendCreated(res, session, 'Workout session started');
        } catch (err: any) {
            return sendError(res, err.message);
        }
    }

    static async completeSession(req: AuthRequest, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return sendError(res, 'Validation failed', 400, errors.array());

        try {
            const { id } = req.params;
            const session = await SessionService.completeSession(req.user!.sub, id, req.body);
            return sendSuccess(res, session, 'Workout session completed');
        } catch (err: any) {
            const status = err.message === 'Session not found' ? 404 : 500;
            return sendError(res, err.message, status);
        }
    }

    static async logAiMetric(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const metric = await SessionService.logAiMetric(req.user!.sub, id, req.body);
            // Serialize BigInt for JSON
            const data = { ...metric, timestampMs: metric.timestampMs.toString() };
            return sendCreated(res, data, 'AI metric logged');
        } catch (err: any) {
            const status = err.message === 'Session not found' ? 404 : 500;
            return sendError(res, err.message, status);
        }
    }

    static async logAiMetricsBatch(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            await SessionService.logAiMetricsBatch(req.user!.sub, id, req.body.metrics);
            return sendSuccess(res, null, 'AI metrics batch logged');
        } catch (err: any) {
            const status = err.message === 'Session not found' ? 404 : 500;
            return sendError(res, err.message, status);
        }
    }

    static async getSessions(req: AuthRequest, res: Response) {
        try {
            const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 100);
            const offset = parseInt((req.query.offset as string) || '0', 10);
            const data = await SessionService.getSessions(req.user!.sub, limit, offset);
            return sendSuccess(res, data);
        } catch (err: any) {
            return sendError(res, err.message);
        }
    }

    static async getSession(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const session = await SessionService.getSession(req.user!.sub, id);
            // Serialize BigInts
            const data = {
                ...session,
                aiMetrics: session.aiMetrics.map((m: any) => ({ ...m, timestampMs: m.timestampMs.toString() })),
            };
            return sendSuccess(res, data);
        } catch (err: any) {
            const status = err.message === 'Session not found' ? 404 : 500;
            return sendError(res, err.message, status);
        }
    }
}
