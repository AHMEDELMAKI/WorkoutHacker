"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = require("../services/notification.service");
const response_1 = require("../common/response");
class NotificationController {
    static async getAll(req, res) {
        const notifications = await notification_service_1.NotificationService.getAll(req.user.sub);
        return (0, response_1.sendSuccess)(res, notifications);
    }
    static async markRead(req, res) {
        const { id } = req.params;
        if (typeof id !== 'string') {
            return (0, response_1.sendError)(res, 'Invalid notification ID.', 400);
        }
        try {
            const updated = await notification_service_1.NotificationService.markRead(req.user.sub, id);
            return (0, response_1.sendSuccess)(res, updated);
        }
        catch (err) {
            return (0, response_1.sendError)(res, err.message);
        }
    }
    static async markAllRead(req, res) {
        await notification_service_1.NotificationService.markAllRead(req.user.sub);
        return (0, response_1.sendSuccess)(res, null, 'All notifications marked as read');
    }
}
exports.NotificationController = NotificationController;
//# sourceMappingURL=notification.controller.js.map