"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionController = void 0;
const session_service_1 = require("../services/session.service");
const response_1 = require("../common/response");
class SessionController {
    static async startSession(req, res) {
        try {
            // FIX: Added 'title' which was missing.
            const { workoutId, title } = req.body;
            const session = await session_service_1.SessionService.startSession(req.user.sub, workoutId, title || 'Workout Session');
            return (0, response_1.sendCreated)(res, session);
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message);
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
    static async completeSession(req, res) {
        const { id } = req.params;
        if (typeof id !== 'string') {
            return (0, response_1.sendError)(res, 'Invalid session ID.', 400);
        }
        try {
            const session = await session_service_1.SessionService.completeSession(req.user.sub, id, req.body);
            return (0, response_1.sendSuccess)(res, session);
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message);
        }
    }
    static async logAiMetric(req, res) {
        const { id } = req.params;
        if (typeof id !== 'string') {
            return (0, response_1.sendError)(res, 'Invalid session ID.', 400);
        }
        try {
            const metric = await session_service_1.SessionService.logAiMetric(req.user.sub, id, req.body);
            return (0, response_1.sendCreated)(res, metric);
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message);
        }
    }
    static async logAiMetricsBatch(req, res) {
        const { id } = req.params;
        if (typeof id !== 'string') {
            return (0, response_1.sendError)(res, 'Invalid session ID.', 400);
        }
        try {
            await session_service_1.SessionService.logAiMetricsBatch(req.user.sub, id, req.body.metrics);
            return (0, response_1.sendSuccess)(res, null, 'Metrics logged');
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message);
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
    static async getSession(req, res) {
        const { id } = req.params;
        if (typeof id !== 'string') {
            return (0, response_1.sendError)(res, 'Invalid session ID.', 400);
        }
        try {
            const session = await session_service_1.SessionService.getSession(req.user.sub, id);
            return (0, response_1.sendSuccess)(res, session);
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message);
        }
    }
    // FIX: Added getSessions to match the router.
    static async getSessions(req, res) {
        try {
            const sessions = await session_service_1.SessionService.getSessions(req.user.sub);
            return (0, response_1.sendSuccess)(res, sessions);
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message);
        }
    }
}
exports.SessionController = SessionController;
//# sourceMappingURL=session.controller.js.map