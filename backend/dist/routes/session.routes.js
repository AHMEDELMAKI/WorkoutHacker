"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionRouter = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const session_controller_1 = require("../controllers/session.controller");
const authenticate_1 = require("../middleware/authenticate");
exports.sessionRouter = (0, express_1.Router)();
exports.sessionRouter.use(authenticate_1.authenticate);
exports.sessionRouter.post('/start', [
    // NOTE: workoutId is now used instead of workoutType
    (0, express_validator_1.body)('workoutId').notEmpty(),
    (0, express_validator_1.body)('title').optional().trim(),
], session_controller_1.SessionController.startSession);
exports.sessionRouter.post('/:id/complete', [
    (0, express_validator_1.body)('durationMin').optional().isInt({ min: 0 }),
    (0, express_validator_1.body)('caloriesBurned').optional().isInt({ min: 0 }),
    (0, express_validator_1.body)('formScore').optional().isFloat({ min: 0, max: 100 }),
    (0, express_validator_1.body)('overallFatigue').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
], session_controller_1.SessionController.completeSession);
exports.sessionRouter.post('/:id/ai-metrics', session_controller_1.SessionController.logAiMetric);
exports.sessionRouter.post('/:id/ai-metrics/batch', session_controller_1.SessionController.logAiMetricsBatch);
exports.sessionRouter.get('/', session_controller_1.SessionController.getSessions);
exports.sessionRouter.get('/:id', session_controller_1.SessionController.getSession);
//# sourceMappingURL=session.routes.js.map