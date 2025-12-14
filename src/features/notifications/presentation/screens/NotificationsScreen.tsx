import { useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { useFolderSharing } from '@/src/features/sharing/presentation/useFolderSharing';
import i18n from '@/src/infrastructure/localization/i18n';
import { ThemeColors } from '@/src/infrastructure/theme/Colors';
import { Notification, NotificationType } from '../../domain/Notification';
import { useNotifications } from '../useNotifications';

const getNotificationIcon = (type: NotificationType): string => {
    switch (type) {
        case 'FOLDER_SHARE_INVITE':
            return 'folder.fill.badge.person.crop';
        case 'FOLDER_SHARE_ACCEPTED':
            return 'checkmark.circle.fill';
        case 'FOLDER_SHARE_REJECTED':
            return 'xmark.circle.fill';
        case 'SYSTEM':
            return 'bell.fill';
        default:
            return 'bell.fill';
    }
};

const getNotificationColor = (type: NotificationType, colors: ThemeColors): string => {
    switch (type) {
        case 'FOLDER_SHARE_INVITE':
            return colors.primary;
        case 'FOLDER_SHARE_ACCEPTED':
            return colors.success;
        case 'FOLDER_SHARE_REJECTED':
            return colors.error;
        case 'SYSTEM':
            return colors.gray;
        default:
            return colors.gray;
    }
};

const getLocalizedNotification = (item: Notification) => {
    // If title doesn't look like a key (has spaces), use it as is (fallback)
    if (item.title.includes(' ')) {
        return { title: item.title, body: item.body };
    }

    const titleKey = `notification.${item.title}.title`;
    const bodyKey = `notification.${item.title}.body`;

    // Try to translate. If missing, i18n might return the key or stripped key.
    // A safer check is if the translation equals the key, it might be missing.
    // But for now, we trust the backend sends valid keys.
    return {
        title: i18n.t(titleKey),
        body: i18n.t(bodyKey, item.data || {}),
    };
};

export function NotificationsScreen() {
    const { colors } = useSettings();
    const router = useRouter();
    const {
        notifications,
        loading,
        loadNotifications,
        markOneAsRead,
        markAsRead,
        deleteReadNotifications,
    } = useNotifications();

    const { acceptShare, rejectShare } = useFolderSharing();

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            padding: 16,
            backgroundColor: colors.headerBackground,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        headerTitle: {
            color: colors.text,
        },
        headerActions: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        headerButton: {
            paddingVertical: 4,
        },
        headerButtonText: {
            color: colors.primary,
            fontSize: 14,
        },
        center: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        listContent: {
            padding: 16,
            paddingBottom: 100,
        },
        notificationItem: {
            flexDirection: 'row',
            padding: 16,
            backgroundColor: colors.card,
            borderRadius: 12,
            marginBottom: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
            borderWidth: 1,
            borderColor: colors.cardBorder,
        },
        unread: {
            backgroundColor: colors.primary + '10',
            borderLeftWidth: 3,
            borderLeftColor: colors.primary,
            borderColor: colors.primary + '20',
        },
        iconContainer: {
            width: 44,
            height: 44,
            borderRadius: 22,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },
        content: {
            flex: 1,
        },
        title: {
            fontSize: 15,
            color: colors.text,
            marginBottom: 4,
        },
        message: {
            fontSize: 14,
            color: colors.subtext,
            marginBottom: 4,
        },
        time: {
            fontSize: 12,
            color: colors.textLight,
        },
        unreadDot: {
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: colors.primary,
            alignSelf: 'flex-start',
            marginTop: 4,
        },
        actions: {
            flexDirection: 'row',
            marginTop: 12,
            gap: 8,
        },
        actionButton: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 8,
            gap: 4,
        },
        acceptButton: {
            backgroundColor: colors.success,
        },
        rejectButton: {
            backgroundColor: colors.error,
        },
        actionButtonText: {
            color: 'white', // Always white on buttons
            fontSize: 14,
            fontWeight: '600',
        },
        emptyContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 60,
        },
        emptyText: {
            marginTop: 16,
            color: colors.textLight,
        },
    }), [colors]);

    const handleRefresh = useCallback(() => {
        loadNotifications();
    }, [loadNotifications]);

    const handleNotificationPress = useCallback((notification: Notification) => {
        if (!notification.isRead) {
            markOneAsRead(notification.id);
        }
    }, [markOneAsRead]);

    const handleAcceptShare = useCallback(async (notification: Notification) => {
        if (notification.data?.shareId) {
            await acceptShare(notification.data.shareId);
            await loadNotifications();
        }
    }, [acceptShare, loadNotifications]);

    const handleRejectShare = useCallback(async (notification: Notification) => {
        if (notification.data?.shareId) {
            await rejectShare(notification.data.shareId);
            await loadNotifications();
        }
    }, [rejectShare, loadNotifications]);

    const renderNotification = ({ item }: { item: Notification }) => {
        const iconName = getNotificationIcon(item.type);
        const iconColor = getNotificationColor(item.type, colors);
        const isShareInvite = item.type === 'FOLDER_SHARE_INVITE' && item.data?.shareId;
        const { title, body } = getLocalizedNotification(item);

        return (
            <TouchableOpacity
                style={[styles.notificationItem, !item.isRead && styles.unread]}
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.7}
            >
                <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
                    <IconSymbol name={iconName as any} size={24} color={iconColor} />
                </View>
                <View style={styles.content}>
                    <ThemedText type="defaultSemiBold" style={styles.title}>
                        {title}
                    </ThemedText>
                    <ThemedText style={styles.message}>{body}</ThemedText>
                    <ThemedText style={styles.time}>
                        {formatTimeAgo(item.createdAt)}
                    </ThemedText>

                    {/* Share invite actions */}
                    {isShareInvite && (
                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.acceptButton]}
                                onPress={() => handleAcceptShare(item)}
                            >
                                <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                                <ThemedText style={styles.actionButtonText}>Kabul Et</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.rejectButton]}
                                onPress={() => handleRejectShare(item)}
                            >
                                <IconSymbol name="xmark" size={16} color="#FFFFFF" />
                                <ThemedText style={styles.actionButtonText}>Reddet</ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
                {!item.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
        );
    };

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <IconSymbol name="bell.slash.fill" size={64} color={colors.border} />
            <ThemedText type="subtitle" style={styles.emptyText}>
                Henüz bildirim yok
            </ThemedText>
        </View>
    );

    const HeaderActions = () => (
        <View style={styles.headerActions}>
            <TouchableOpacity
                style={styles.headerButton}
                onPress={() => markAsRead()}
            >
                <ThemedText style={styles.headerButtonText}>Tümünü Okundu Yap</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.headerButton}
                onPress={() => deleteReadNotifications()}
            >
                <ThemedText style={[styles.headerButtonText, { color: colors.error }]}>
                    Okunanları Sil
                </ThemedText>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 4, marginLeft: -4 }}>
                    <IconSymbol name="chevron.left" size={24} color={colors.text} />
                </TouchableOpacity>
                <ThemedText type="subtitle" style={[styles.headerTitle, { fontSize: 20 }]}>Bildirimler</ThemedText>
            </View>

            {notifications.length > 0 && <HeaderActions />}

            {loading && notifications.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderNotification}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={EmptyState}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={handleRefresh} tintColor={colors.primary} />
                    }
                />
            )}
        </SafeAreaView>
    );
}

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
}
