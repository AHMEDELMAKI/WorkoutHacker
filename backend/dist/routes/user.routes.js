"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const user_controller_1 = require("../controllers/user.controller");
const authenticate_1 = require("../middleware/authenticate");
exports.userRouter = (0, express_1.Router)();
exports.userRouter.use(authenticate_1.authenticate);
// ─── GET /api/users/me ───────────────────────────────────
exports.userRouter.get('/me', user_controller_1.UserController.getMe);
// ─── PUT /api/users/profile ──────────────────────────────
exports.userRouter.put('/profile', [
    (0, express_validator_1.body)('displayName').optional().trim().isLength({ max: 64 }),
    (0, express_validator_1.body)('gender').optional().isIn(['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY']),
    (0, express_validator_1.body)('ageYears').optional().isInt({ min: 10, max: 120 }),
    (0, express_validator_1.body)('heightCm').optional().isFloat({ min: 50, max: 300 }),
    (0, express_validator_1.body)('weightKg').optional().isFloat({ min: 20, max: 500 }),
    (0, express_validator_1.body)('fitnessLevel').optional().isIn(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
    (0, express_validator_1.body)('fitnessGoals').optional().isArray(),
    (0, express_validator_1.body)('units').optional().isIn(['METRIC', 'IMPERIAL']),
    (0, express_validator_1.body)('onboardingDone').optional().isBoolean(),
], user_controller_1.UserController.updateProfile);
// ─── PUT /api/users/privacy ──────────────────────────────
exports.userRouter.put('/privacy', user_controller_1.UserController.updatePrivacy);
//# sourceMappingURL=user.routes.js.map