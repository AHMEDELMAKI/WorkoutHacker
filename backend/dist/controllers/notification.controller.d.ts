import { Response } from 'express';
import type { AuthRequest } from '../middleware/authenticate';
export declare class NotificationController {
    static getAll(req: AuthRequest, res: Response): Promise<Response>;
    static markRead(req: AuthRequest, res: Response): Promise<Response>;
    static markAllRead(req: AuthRequest, res: Response): Promise<Response>;
}
//# sourceMappingURL=notification.controller.d.ts.map