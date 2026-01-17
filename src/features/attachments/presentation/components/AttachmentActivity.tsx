
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { CollaborationService } from '@/src/infrastructure/api/generated/services/CollaborationService';
import i18n from '@/src/infrastructure/localization/i18n';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

interface AuditLog {
    id: string;
    action: string;
    createdAt: string;
    user?: {
        name: string;
    };
    description?: string;
}

interface AttachmentActivityProps {
    attachmentId: string;
}

export const AttachmentActivity: React.FC<AttachmentActivityProps> = ({ attachmentId }) => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const { colors } = useSettings();

    useEffect(() => {
        fetchLogs();
    }, [attachmentId]);

    const fetchLogs = async () => {
        try {
            const response = await CollaborationService.getCollaborationAuditLogs(attachmentId);
            if (response.success && Array.isArray(response.data)) {
                setLogs(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch audit logs', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Intl.DateTimeFormat(i18n.locale === 'tr' ? 'tr-TR' : 'en-US', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            }).format(new Date(dateString));
        } catch (e) {
            return dateString;
        }
    };

    const getActionIcon = (action: string) => {
        if (action.includes('CREATE')) return 'add-circle';
        if (action.includes('UPDATE')) return 'create'; // Ionicons 'create' is pencil
        if (action.includes('DELETE')) return 'trash';
        if (action.includes('SHARE')) return 'share-social';
        if (action.includes('COMMENT')) return 'chatbubble';
        return 'information-circle';
    };

    if (loading) {
        return <ActivityIndicator style={{ padding: 20 }} color={colors.primary} />;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={logs}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.logItem}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
                            <Ionicons name={getActionIcon(item.action) as any} size={20} color={colors.primary} />
                        </View>
                        <View style={styles.content}>
                            <View style={styles.header}>
                                <Text style={[styles.userName, { color: colors.text }]}>{item.user?.name || 'System'}</Text>
                                <Text style={[styles.time, { color: colors.text }]}>{formatDate(item.createdAt)}</Text>
                            </View>
                            <Text style={[styles.description, { color: colors.text }]}>
                                {item.description || item.action}
                            </Text>
                        </View>
                    </View>
                )}
                scrollEnabled={false}
                ListEmptyComponent={
                    <Text style={{ textAlign: 'center', color: colors.text, opacity: 0.6, marginTop: 20 }}>No activity recorded.</Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        paddingHorizontal: 16,
    },
    logItem: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
    },
    time: {
        fontSize: 12,
        opacity: 0.7,
    },
    description: {
        fontSize: 14,
        opacity: 0.9,
    },
});
