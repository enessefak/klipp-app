
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { WebSessionService } from '@/src/infrastructure/api/generated/services/WebSessionService';
import i18n from '@/src/infrastructure/localization/i18n';

export function WebSessionsScreen() {
    const router = useRouter();
    const { colors } = useSettings();
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const loadSessions = async () => {
        setLoading(true);
        try {
            const result = await WebSessionService.getWebSessions();

            // Handle response based on generated service signature: { sessions: Array<{...}> }
            const data = (result as any).data || result;
            const sessions = data.sessions || data;

            if (sessions && Array.isArray(sessions)) {
                setSessions(sessions);
            } else {
                setSessions([]);
            }
        } catch (error) {
            console.error('Load Sessions Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSessions();
    }, []);

    const handleRevoke = (id: string) => {
        Alert.alert(
            i18n.t('web_sessions.revoke_title'),
            i18n.t('web_sessions.revoke_confirm'),
            [
                { text: i18n.t('common.actions.cancel'), style: 'cancel' },
                {
                    text: i18n.t('common.actions.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setSubmitting(true);
                            await WebSessionService.deleteWebSessions(id);
                            loadSessions();
                        } catch (error) {
                            console.error('Revoke Error:', error);
                            Alert.alert(i18n.t('common.error'), 'Failed to revoke session');
                        } finally {
                            setSubmitting(false);
                        }
                    }
                }
            ]
        );
    };

    const handleRevokeAll = () => {
        Alert.alert(
            i18n.t('web_sessions.revoke_all_title'),
            i18n.t('web_sessions.revoke_all_confirm'),
            [
                { text: i18n.t('common.actions.cancel'), style: 'cancel' },
                {
                    text: i18n.t('common.actions.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setSubmitting(true);
                            // Assuming API has endpoint or we loop. 
                            // Check API definition: deleteWebSessions takes ID. Is there a "delete all"?
                            // If not, maybe we just revoke one by one or assume standard usage.
                            // The generated service shows deleteWebSessions(id).
                            // Let's assume we implement a loop for MVP if backend doesn't support 'all'

                            // Better: Let's just create a loop
                            for (const session of sessions) {
                                await WebSessionService.deleteWebSessions(session.id);
                            }
                            loadSessions();
                        } catch (error) {
                            console.error('Revoke All Error:', error);
                        } finally {
                            setSubmitting(false);
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={[styles.sessionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.iconContainer}>
                <IconSymbol name="desktopcomputer" size={24} color={colors.primary} />
            </View>
            <View style={styles.sessionInfo}>
                <ThemedText type="defaultSemiBold">{item.deviceName || item.browser || 'Bilinmeyen Cihaz'}</ThemedText>
                <ThemedText style={{ color: colors.textLight, fontSize: 13 }}>
                    {item.os || 'Bilinmeyen OS'} • {item.lastActiveAt ? new Date(item.lastActiveAt).toLocaleString() : 'Şimdi'}
                </ThemedText>
                {item.ipAddress && <ThemedText style={{ color: colors.textLight, fontSize: 12 }}>IP: {item.ipAddress}</ThemedText>}
            </View>
            <TouchableOpacity onPress={() => handleRevoke(item.id)} style={styles.revokeButton}>
                <IconSymbol name="trash" size={20} color={colors.error} />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
                    <IconSymbol name="chevron.left" size={24} color={colors.text} />
                </TouchableOpacity>
                <ThemedText type="subtitle" style={{ fontSize: 18 }}>{i18n.t('web_sessions.title')}</ThemedText>
                {sessions.length > 0 ? (
                    <TouchableOpacity onPress={handleRevokeAll}>
                        <ThemedText style={{ color: colors.error, fontSize: 14 }}>{i18n.t('common.actions.delete')}</ThemedText>
                    </TouchableOpacity>
                ) : <View style={{ width: 40 }} />}
            </View>

            <FlatList
                data={sessions}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16 }}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadSessions} />}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <IconSymbol name="desktopcomputer" size={48} color={colors.border} />
                            <ThemedText style={{ color: colors.textLight, marginTop: 16 }}>
                                No active sessions
                            </ThemedText>
                        </View>
                    ) : null
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    sessionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,122,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    sessionInfo: {
        flex: 1,
    },
    revokeButton: {
        padding: 8,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    }
});
