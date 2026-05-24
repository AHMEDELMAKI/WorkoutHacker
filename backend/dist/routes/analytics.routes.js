"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRouter = void 0;
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
const authenticate_1 = require("../middleware/authenticate");
exports.analyticsRouter = (0, express_1.Router)();
exports.analyticsRouter.use(authenticate_1.authenticate);
exports.analyticsRouter.get('/summary', analytics_controller_1.AnalyticsController.getSummary);
exports.analyticsRouter.get('/weekly', analytics_controller_1.AnalyticsController.getWeekly);
exports.analyticsRouter.get('/streaks', analytics_controller_1.AnalyticsController.getStreaks);
exports.analyticsRouter.get('/fatigue-trend', analytics_controller_1.AnalyticsController.getFatigueTrend);
exports.analyticsRouter.get('/form-trend', analytics_controller_1.AnalyticsController.getFormTrend);
exports.analyticsRouter.get('/personal-records', analytics_controller_1.AnalyticsController.getPersonalRecords);
//# sourceMappingURL=analytics.routes.js.map