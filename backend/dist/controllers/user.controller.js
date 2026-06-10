"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const response_1 = require("../common/response");
class UserController {
    static async getMe(req, res) {
        try {
            const user = await user_service_1.UserService.getMe(req.user.sub);
            return (0, response_1.sendSuccess)(res, user);
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message);
        }
    }
    static async getProfile(req, res) {
        try {
            const profile = await user_service_1.UserService.getProfile(req.user.sub);
            return (0, response_1.sendSuccess)(res, profile);
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message);
        }
    }
    static async updateProfile(req, res) {
        try {
            const profile = await user_service_1.UserService.updateProfile(req.user.sub, req.body);
            return (0, response_1.sendSuccess)(res, profile, 'Profile updated');
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message);
        }
    }
    static async getOnboardingStatus(req, res) {
        try {
            const profile = await user_service_1.UserService.getProfile(req.user.sub);
            return (0, response_1.sendSuccess)(res, { onboardingDone: profile.onboardingDone });
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message);
        }
    }
    static async markOnboardingDone(req, res) {
        try {
            const profile = await user_service_1.UserService.updateProfile(req.user.sub, { onboardingDone: true });
            return (0, response_1.sendSuccess)(res, profile, 'Onboarding completed');
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message);
        }
    }
    static async updatePrivacy(req, res) {
        try {
            const settings = await user_service_1.UserService.updatePrivacy(req.user.sub, req.body);
            return (0, response_1.sendSuccess)(res, settings, 'Privacy settings updated');
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message);
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map