import { Response } from 'express';
import type { AuthRequest } from '../middleware/authenticate';
export declare class SessionController {
    static startSession(req: AuthRequest, res: Response): Promise<Response>;
    static completeSession(req: AuthRequest, res: Response): Promise<Response>;
    static logAiMetric(req: AuthRequest, res: Response): Promise<Response>;
    static logAiMetricsBatch(req: AuthRequest, res: Response): Promise<Response>;
    static getSession(req: AuthRequest, res: Response): Promise<Response>;
    static getSessions(req: AuthRequest, res: Response): Promise<Response>;
}
//# sourceMappingURL=session.controller.d.ts.map