import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { NotificationService } from '../services/notification.service';
import { sendSuccess, sendError } from '../common/response';

export class NotificationController {
    static async getAll(req: AuthRequest, res: Response) {
        try {
            const data = await NotificationService.getAll(req.user!.sub);
            return sendSuccess(res, data);
        } catch (err: any) {
            return sendError(res, err.message);
        }
    }

    static async markRead(req: AuthRequest, res: Response) {
        try {
            const { id } = req.params;
            const updated = await NotificationService.markRead(req.user!.sub, id);
            return sendSuccess(res, updated, 'Notification marked as read');
        } catch (err: any) {
            return sendError(res, err.message);
        }
    }

    static async markAllRead(req: AuthRequest, res: Response) {
        try {
            await NotificationService.markAllRead(req.user!.sub);
            return sendSuccess(res, null, 'All notifications marked as read');
        } catch (err: any) {
            return sendError(res, err.message);
        }
    }
}
