import { Router, Response } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate } from '../middleware/authenticate';

export const analyticsRouter = Router();
analyticsRouter.use(authenticate);

analyticsRouter.get('/summary', AnalyticsController.getSummary);
analyticsRouter.get('/weekly', AnalyticsController.getWeekly);
analyticsRouter.get('/streaks', AnalyticsController.getStreaks);
analyticsRouter.get('/fatigue-trend', AnalyticsController.getFatigueTrend);
analyticsRouter.get('/form-trend', AnalyticsController.getFormTrend);
analyticsRouter.get('/personal-records', AnalyticsController.getPersonalRecords);
