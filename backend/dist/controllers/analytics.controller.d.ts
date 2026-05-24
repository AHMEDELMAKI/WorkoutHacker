import { Response } from 'express';
import { AuthRequest } from '../middleware/authenticate';
export declare class AnalyticsController {
    static getSummary(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getWeekly(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getStreaks(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getFatigueTrend(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getFormTrend(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getPersonalRecords(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=analytics.controller.d.ts.map