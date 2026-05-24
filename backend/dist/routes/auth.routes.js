"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("../controllers/auth.controller");
const authenticate_1 = require("../middleware/authenticate");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post('/register', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 }),
    (0, express_validator_1.body)('displayName').optional().trim(),
], auth_controller_1.AuthController.register);
exports.authRouter.post('/login', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').exists(),
], auth_controller_1.AuthController.login);
exports.authRouter.post('/refresh', auth_controller_1.AuthController.refresh);
exports.authRouter.post('/logout', authenticate_1.authenticate, auth_controller_1.AuthController.logout);
exports.authRouter.post('/forgot-password', auth_controller_1.AuthController.forgotPassword);
exports.authRouter.post('/verify-otp', auth_controller_1.AuthController.verifyOtp);
exports.authRouter.post('/reset-password', authenticate_1.authenticate, [(0, express_validator_1.body)('password').isLength({ min: 6 })], auth_controller_1.AuthController.resetPassword);
//# sourceMappingURL=auth.routes.js.map