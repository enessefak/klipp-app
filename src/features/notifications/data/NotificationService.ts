import { NotificationsService } from '@/src/infrastructure/api/generated/services/NotificationsService';
import { NotificationResponse } from '../domain/Notification';

export class NotificationService {
    /**
     * Get notifications with pagination
     */
    static async getNotifications(
        unreadOnly?: boolean,
        limit?: number,
        cursor?: string
    ): Promise<NotificationResponse> {
        const response = await NotificationsService.getNotifications(
            unreadOnly?.toString(),
            limit?.toString(),
            cursor
        );
        return (response as any).data || response;
    }

    /**
     * Get unread notification count (for badge)
     */
    static async getUnreadCount(): Promise<number> {
        const response = await NotificationsService.getNotificationsUnreadCount();
        return (response as any).data?.count ?? (response as any).count ?? 0;
    }

    /**
     * Mark notifications as read
     * If no IDs provided, marks all as read
     */
    static async markAsRead(notificationIds?: string[]): Promise<void> {
        if (notificationIds && notificationIds.length > 0) {
            await Promise.all(notificationIds.map(id => NotificationsService.patchNotificationsRead(id)));
        } else {
            await NotificationsService.postNotificationsMarkRead();
        }
    }

    /**
     * Mark single notification as read
     */
    static async markOneAsRead(notificationId: string): Promise<void> {
        await NotificationsService.patchNotificationsRead(notificationId);
    }

    /**
     * Delete a notification
     */
    static async deleteNotification(notificationId: string): Promise<void> {
        await NotificationsService.deleteNotifications(notificationId);
    }

    /**
     * Delete all read notifications
     */
    static async deleteReadNotifications(): Promise<void> {
        await NotificationsService.deleteNotificationsRead();
    }

    /**
     * Register Expo push token for push notifications
     */
    static async registerPushToken(expoPushToken: string, platform: 'ios' | 'android' | 'web'): Promise<void> {
        await NotificationsService.postNotificationsRegisterPushToken({
            expoPushToken,
            platform,
        });
    }
}
