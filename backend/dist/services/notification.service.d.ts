export declare class NotificationService {
    static getAll(userId: string): Promise<{
        id: string;
        userId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        body: string;
        read: boolean;
        sentAt: Date;
    }[]>;
    static markRead(userId: string, id: string): Promise<{
        id: string;
        userId: string;
        type: import(".prisma/client").$Enums.NotificationType;
        title: string;
        body: string;
        read: boolean;
        sentAt: Date;
    }>;
    static markAllRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
//# sourceMappingURL=notification.service.d.ts.map