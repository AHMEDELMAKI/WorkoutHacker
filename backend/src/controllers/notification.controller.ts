
import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { sendSuccess, sendError } from '../common/response';
import type { AuthRequest } from '../middleware/authenticate';

export class NotificationController {
    static async getAll(req: AuthRequest, res: Response): Promise<Response> {
        const notifications = await NotificationService.getAll(req.user!.sub);
        return sendSuccess(res, notifications);
    }

    static async markRead(req: AuthRequest, res: Response): Promise<Response> {
        const { id } = req.params;
        if (typeof id !== 'string') {
            return sendError(res, 'Invalid notification ID.', 400);
        }
        try {
            const updated = await NotificationService.markRead(req.user!.sub, id);
            return sendSuccess(res, updated);
        } catch (err: any) {
            return sendError(res, err.message);
        }
    }

    static async markAllRead(req: AuthRequest, res: Response): Promise<Response> {
        await NotificationService.markAllRead(req.user!.sub);
        return sendSuccess(res, null, 'All notifications marked as read');
    }
}
