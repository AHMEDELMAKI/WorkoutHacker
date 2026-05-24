"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const analytics_service_1 = require("../services/analytics.service");
const response_1 = require("../common/response");
class AnalyticsController {
    static async getSummary(req, res) {
        try {
            const data = await analytics_service_1.AnalyticsService.getSummary(req.user.sub);
            return (0, response_1.sendSuccess)(res, data);
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message);
        }
    }
    static async getWeekly(req, res) {
        try {
            const data = await analytics_service_1.AnalyticsService.getWeeklySummary(req.user.sub);
            return (0, response_1.sendSuccess)(res, data);
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message);
        }
    }
    static async getStreaks(req, res) {
        try {
            const data = await analytics_service_1.AnalyticsService.getStreaks(req.user.sub);
            return (0, response_1.sendSuccess)(res, data);
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message);
        }
    }
    static async getFatigueTrend(req, res) {
        try {
            const data = await analytics_service_1.AnalyticsService.getFatigueTrend(req.user.sub);
            return (0, response_1.sendSuccess)(res, data);
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message);
        }
    }
    static async getFormTrend(req, res) {
        try {
            const data = await analytics_service_1.AnalyticsService.getFormTrend(req.user.sub);
            return (0, response_1.sendSuccess)(res, data);
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message);
        }
    }
    static async getPersonalRecords(req, res) {
        try {
            const data = await analytics_service_1.AnalyticsService.getPersonalRecords(req.user.sub);
            return (0, response_1.sendSuccess)(res, data);
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message);
        }
    }
}
exports.AnalyticsController = AnalyticsController;
//# sourceMappingURL=analytics.controller.js.map