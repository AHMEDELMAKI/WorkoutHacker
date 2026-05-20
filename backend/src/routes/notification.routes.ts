import { Router, Response } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/authenticate';

export const notificationRouter = Router();
notificationRouter.use(authenticate);

// ─── GET /api/notifications ──────────────────────────────
notificationRouter.get('/', NotificationController.getAll);

// ─── PATCH /api/notifications/:id/read ──────────────────
notificationRouter.patch('/:id/read', NotificationController.markRead);

// ─── PATCH /api/notifications/read-all ──────────────────
notificationRouter.patch('/read-all', NotificationController.markAllRead);
