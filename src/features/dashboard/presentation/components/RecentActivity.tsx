import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { DashboardRecentActivity } from '../../domain/Dashboard';

interface RecentActivityProps {
    activities: DashboardRecentActivity[];
}

export const RecentActivity = ({ activities }: RecentActivityProps) => {
    const { colors } = useSettings();
    const router = useRouter();

    if (!activities || activities.length === 0) return null;

    const renderItem = ({ item }: { item: DashboardRecentActivity }) => (
        <TouchableOpacity
            style={[styles.item, { borderBottomColor: colors.border }]}
            onPress={() => router.push(`/attachment/${item.id}`)}
        >
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '10' }]}>
                <IconSymbol name="doc.text.fill" size={20} color={colors.primary} />
            </View>
            <View style={styles.content}>
                <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>{item.title}</ThemedText>
                <View style={styles.metaRow}>
                    <ThemedText style={{ fontSize: 12, color: colors.textLight }}>
                        {new Date(item.date).toLocaleDateString()} • {item.folderName}
                    </ThemedText>
                    {item.userName && (
                        <ThemedText style={{ fontSize: 12, color: colors.textLight }}>
                            • {item.userName}
                        </ThemedText>
                    )}
                </View>
            </View>
            {item.amount !== undefined && item.currency && (
                <ThemedText type="defaultSemiBold" style={{ color: colors.text }}>
                    {item.amount.toLocaleString()} {item.currency}
                </ThemedText>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="subtitle">{i18n.t('dashboard.recentActivity')}</ThemedText>
            </View>
            <View style={[styles.listContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                {activities.map((item, index) => (
                    <View key={item.id}>
                        {renderItem({ item })}
                        {index < activities.length - 1 && <View style={[styles.separator, { backgroundColor: colors.border }]} />}
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    header: {
        marginBottom: 12,
    },
    listContainer: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    separator: {
        height: 1,
        marginLeft: 56, // Align with text start
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    }
});
