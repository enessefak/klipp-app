
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { WebSession, WebSessionRepository } from '@/src/features/auth/infrastructure/WebSessionRepository';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function WebSessionsScreen() {
    const { colors } = useSettings();
    const router = useRouter();
    const [sessions, setSessions] = useState<WebSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadSessions = async () => {
        try {
            const data = await WebSessionRepository.getSessions();
            setSessions(data);
        } catch (error) {
            console.error('Failed to load sessions', error);
            // Silent error or toast
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadSessions();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        loadSessions();
    };

    const handleRevoke = (sessionId: string, deviceName: string) => {
        Alert.alert(
            i18n.t('web_sessions.revoke_title', { defaultValue: 'Oturumu Kapat' }),
            i18n.t('web_sessions.revoke_confirm', { defaultValue: 'Bu cihazdan çıkış yapmak istediğinize emin misiniz?' }),
            [
                { text: i18n.t('common.actions.cancel'), style: 'cancel' },
                {
                    text: i18n.t('common.actions.logout'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Optimistic update
                            setSessions(prev => prev.filter(s => s.id !== sessionId));
                            await WebSessionRepository.revokeSession(sessionId);
                        } catch (error) {
                            Alert.alert(i18n.t('common.error'), 'Oturum kapatılamadı.');
                            loadSessions(); // Revert on error
                        }
                    }
                }
            ]
        );
    };

    const handleRevokeAll = () => {
        Alert.alert(
            i18n.t('web_sessions.revoke_all_title', { defaultValue: 'Tüm Oturumları Kapat' }),
            i18n.t('web_sessions.revoke_all_confirm', { defaultValue: 'Tüm web oturumlarını kapatmak istediğinize emin misiniz?' }),
            [
                { text: i18n.t('common.actions.cancel'), style: 'cancel' },
                {
                    text: i18n.t('common.actions.logout'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setSessions([]);
                            await WebSessionRepository.revokeAllSessions();
                            Alert.alert(i18n.t('common.success'), 'Tüm oturumlar kapatıldı.');
                        } catch (error) {
                            Alert.alert(i18n.t('common.error'), 'İşlem başarısız.');
                            loadSessions();
                        }
                    }
                }
            ]
        );
    };

    const getIconName = (os: string, deviceType: string) => {
        if (deviceType === 'mobile') return 'iphone';
        if (os.toLowerCase().includes('mac')) return 'laptopcomputer'; // SF Symbol mapping
        if (os.toLowerCase().includes('windows')) return 'laptopcomputer';
        return 'desktopcomputer';
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
        },
        listContent: {
            padding: 16,
            gap: 16,
        },
        sessionItem: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.card,
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.cardBorder,
        },
        iconContainer: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.primary + '15',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
        },
        sessionInfo: {
            flex: 1,
        },
        deviceName: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
        },
        sessionDetail: {
            fontSize: 13,
            color: colors.textLight,
        },
        revokeButton: {
            padding: 8,
        },
        emptyContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 60,
        },
        emptyText: {
            marginTop: 16,
            fontSize: 16,
            color: colors.textLight,
        },
        revokeAllButton: {
            margin: 16,
            padding: 16,
            backgroundColor: colors.error + '15',
            borderRadius: 12,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.error + '30',
        },
        revokeAllText: {
            color: colors.error,
            fontWeight: '600',
            fontSize: 16,
        }
    });

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 4, marginLeft: -4 }}>
                    <IconSymbol name="chevron.left" size={24} color={colors.text} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Web Oturumları</ThemedText>
                <View style={{ width: 28 }} />
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator color={colors.primary} />
                </View>
            ) : (
                <>
                    <FlatList
                        data={sessions}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <IconSymbol name="desktopcomputer" size={64} color={colors.gray} />
                                <ThemedText style={styles.emptyText}>Aktif web oturumu yok.</ThemedText>
                            </View>
                        }
                        renderItem={({ item }) => (
                            <View style={styles.sessionItem}>
                                <View style={styles.iconContainer}>
                                    <IconSymbol
                                        name={getIconName(item.os, item.deviceType)}
                                        size={24}
                                        color={colors.primary}
                                    />
                                </View>
                                <View style={styles.sessionInfo}>
                                    <ThemedText style={styles.deviceName}>{item.deviceName}</ThemedText>
                                    <ThemedText style={styles.sessionDetail}>
                                        {item.browser} • {item.os}
                                    </ThemedText>
                                    <ThemedText style={[styles.sessionDetail, { fontSize: 11, marginTop: 2 }]}>
                                        Son işlem: {new Date(item.lastActiveAt).toLocaleDateString()}
                                    </ThemedText>
                                </View>
                                <TouchableOpacity
                                    style={styles.revokeButton}
                                    onPress={() => handleRevoke(item.id, item.deviceName)}
                                >
                                    <IconSymbol name="trash" size={20} color={colors.error} />
                                </TouchableOpacity>
                            </View>
                        )}
                        ListFooterComponent={
                            sessions.length > 0 ? (
                                <TouchableOpacity style={styles.revokeAllButton} onPress={handleRevokeAll}>
                                    <ThemedText style={styles.revokeAllText}>Tüm Oturumları Kapat</ThemedText>
                                </TouchableOpacity>
                            ) : undefined
                        }
                    />
                </>
            )}
        </SafeAreaView>
    );
}
