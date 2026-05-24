"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const prisma_1 = require("../lib/prisma");
class NotificationService {
    static async getAll(userId) {
        return prisma_1.prisma.notification.findMany({
            where: { userId },
            orderBy: { sentAt: 'desc' },
            take: 50,
        });
    }
    static async markRead(userId, id) {
        const n = await prisma_1.prisma.notification.findFirst({
            where: { id, userId },
        });
        if (!n)
            throw new Error('Notification not found');
        return prisma_1.prisma.notification.update({
            where: { id },
            data: { read: true },
        });
    }
    static async markAllRead(userId) {
        return prisma_1.prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
    }
}
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map