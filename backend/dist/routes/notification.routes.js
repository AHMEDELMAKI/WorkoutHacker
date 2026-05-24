"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRouter = void 0;
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const authenticate_1 = require("../middleware/authenticate");
exports.notificationRouter = (0, express_1.Router)();
exports.notificationRouter.use(authenticate_1.authenticate);
// ─── GET /api/notifications ──────────────────────────────
exports.notificationRouter.get('/', notification_controller_1.NotificationController.getAll);
// ─── PATCH /api/notifications/:id/read ──────────────────
exports.notificationRouter.patch('/:id/read', notification_controller_1.NotificationController.markRead);
// ─── PATCH /api/notifications/read-all ──────────────────
exports.notificationRouter.patch('/read-all', notification_controller_1.NotificationController.markAllRead);
//# sourceMappingURL=notification.routes.js.map