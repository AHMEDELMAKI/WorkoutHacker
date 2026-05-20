import { prisma } from '../lib/prisma';

export class NotificationService {
    static async getAll(userId: string) {
        return prisma.notification.findMany({
            where: { userId },
            orderBy: { sentAt: 'desc' },
            take: 50,
        });
    }

    static async markRead(userId: string, id: string) {
        const n = await prisma.notification.findFirst({
            where: { id, userId },
        });
        if (!n) throw new Error('Notification not found');

        return prisma.notification.update({
            where: { id },
            data: { read: true },
        });
    }

    static async markAllRead(userId: string) {
        return prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
    }
}
