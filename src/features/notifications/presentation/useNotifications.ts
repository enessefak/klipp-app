import { useCallback, useEffect, useState } from 'react';
import { NotificationService } from '../data/NotificationService';
import { Notification } from '../domain/Notification';

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadNotifications = useCallback(async (unreadOnly: boolean = false) => {
        try {
            setLoading(true);
            setError(null);
            const response = await NotificationService.getNotifications(unreadOnly);
            setNotifications(response.items);
            setUnreadCount(response.unreadCount);
        } catch (err) {
            console.error('Failed to load notifications:', err);
            setError('Bildirimler yüklenemedi');
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshUnreadCount = useCallback(async () => {
        try {
            const count = await NotificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (err) {
            console.error('Failed to get unread count:', err);
        }
    }, []);

    const markAsRead = useCallback(async (notificationIds?: string[]) => {
        try {
            await NotificationService.markAsRead(notificationIds);
            // Update local state
            if (notificationIds) {
                setNotifications(prev => 
                    prev.map(n => 
                        notificationIds.includes(n.id) ? { ...n, isRead: true } : n
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - notificationIds.length));
            } else {
                // All marked as read
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                setUnreadCount(0);
            }
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    }, []);

    const markOneAsRead = useCallback(async (notificationId: string) => {
        try {
            await NotificationService.markOneAsRead(notificationId);
            setNotifications(prev => 
                prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    }, []);

    const deleteNotification = useCallback(async (notificationId: string) => {
        try {
            await NotificationService.deleteNotification(notificationId);
            const notification = notifications.find(n => n.id === notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            if (notification && !notification.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    }, [notifications]);

    const deleteReadNotifications = useCallback(async () => {
        try {
            await NotificationService.deleteReadNotifications();
            setNotifications(prev => prev.filter(n => !n.isRead));
        } catch (err) {
            console.error('Failed to delete read notifications:', err);
        }
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        loadNotifications,
        refreshUnreadCount,
        markAsRead,
        markOneAsRead,
        deleteNotification,
        deleteReadNotifications,
    };
}
