import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
import { AnalyticsService } from '../services/analytics.service';
import { sendSuccess, sendError } from '../common/response';

export class AnalyticsController {
    static async getSummary(req: AuthRequest, res: Response) {
        try {
            const data = await AnalyticsService.getSummary(req.user!.sub);
            return sendSuccess(res, data);
        } catch (err: any) {
            return sendError(res, err.message);
        }
    }

    static async getWeekly(req: AuthRequest, res: Response) {
        try {
            const data = await AnalyticsService.getWeeklySummary(req.user!.sub);
            return sendSuccess(res, data);
        } catch (err: any) {
            return sendError(res, err.message);
        }
    }

    static async getStreaks(req: AuthRequest, res: Response) {
        try {
            const data = await AnalyticsService.getStreaks(req.user!.sub);
            return sendSuccess(res, data);
        } catch (err: any) {
            return sendError(res, err.message);
        }
    }

    static async getFatigueTrend(req: AuthRequest, res: Response) {
        try {
            const data = await AnalyticsService.getFatigueTrend(req.user!.sub);
            return sendSuccess(res, data);
        } catch (err: any) {
            return sendError(res, err.message);
        }
    }

    static async getFormTrend(req: AuthRequest, res: Response) {
        try {
            const data = await AnalyticsService.getFormTrend(req.user!.sub);
            return sendSuccess(res, data);
        } catch (err: any) {
            return sendError(res, err.message);
        }
    }

    static async getPersonalRecords(req: AuthRequest, res: Response) {
        try {
            const data = await AnalyticsService.getPersonalRecords(req.user!.sub);
            return sendSuccess(res, data);
        } catch (err: any) {
            return sendError(res, err.message);
        }
    }
}
