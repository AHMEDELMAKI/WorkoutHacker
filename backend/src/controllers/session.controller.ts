import { Request, Response } from 'express';
import { SessionService } from '../services/session.service';
import { sendSuccess, sendError, sendCreated } from '../common/response';
import type { AuthRequest } from '../middleware/authenticate';

export class SessionController {
    static async startSession(req: AuthRequest, res: Response): Promise<Response> {
        try {
            // FIX: Added 'title' which was missing.
            const { workoutId, title } = req.body;
            const session = await SessionService.startSession(req.user!.sub, workoutId, title || 'Workout Session');
            return sendCreated(res, session);
        } catch (err: any) {
            return sendError(res, err.message);
        }
    }

    // NOTE: This function does not exist on the service, so it is commented out.
    // static async addExercise(req: AuthRequest, res: Response): Promise<Response> {
    //     try {
    //         const session = await SessionService.addExerciseToSession(req.user!.sub, req.body.sessionId, req.body.exerciseId, req.body.details);
    //         return sendSuccess(res, session);
    //     } catch (err: any) {
    //         return sendError(res, err.message);
    //     }
    // }

    static async completeSession(req: AuthRequest, res: Response): Promise<Response> {
        const { id } = req.params;
        if (typeof id !== 'string') {
            return sendError(res, 'Invalid session ID.', 400);
        }
        try {
            const session = await SessionService.completeSession(req.user!.sub, id, req.body);
            return sendSuccess(res, session);
        } catch (err: any) {
            return sendError(res, err.message);
        }
    }

    static async logAiMetric(req: AuthRequest, res: Response): Promise<Response> {
        const { id } = req.params;
        if (typeof id !== 'string') {
            return sendError(res, 'Invalid session ID.', 400);
        }
        try {
            const metric = await SessionService.logAiMetric(req.user!.sub, id, req.body);
            return sendCreated(res, metric);
        } catch (err: any) {
            return sendError(res, err.message);
        }
    }
    
    static async logAiMetricsBatch(req: AuthRequest, res: Response): Promise<Response> {
        const { id } = req.params;
        if (typeof id !== 'string') {
            return sendError(res, 'Invalid session ID.', 400);
        }
        try {
            await SessionService.logAiMetricsBatch(req.user!.sub, id, req.body.metrics);
            return sendSuccess(res, null, 'Metrics logged');
        } catch (err: any) {
            return sendError(res, err.message);
        }
    }

    // NOTE: This function does not exist on the service, so it is commented out.
    // static async getActiveSession(req: AuthRequest, res: Response): Promise<Response> {
    //     try {
    //         const session = await SessionService.getActiveSession(req.user!.sub);
    //         return sendSuccess(res, session);
    //     } catch (err: any) {
    //         return sendError(res, err.message);
    //     }
    // }

    static async getSession(req: AuthRequest, res: Response): Promise<Response> {
        const { id } = req.params;
        if (typeof id !== 'string') {
            return sendError(res, 'Invalid session ID.', 400);
        }
        try {
            const session = await SessionService.getSession(req.user!.sub, id);
            return sendSuccess(res, session);
        } catch (err: any) {
            return sendError(res, err.message);
        }
    }

    // FIX: Added getSessions to match the router.
    static async getSessions(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const sessions = await SessionService.getSessions(req.user!.sub);
            return sendSuccess(res, sessions);
        } catch (err: any) {
            return sendError(res, err.message);
        }
    }
}
