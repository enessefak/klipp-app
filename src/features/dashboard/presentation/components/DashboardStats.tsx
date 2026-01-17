import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { DashboardOverview } from '../../domain/Dashboard';

interface DashboardStatsProps {
    data: DashboardOverview;
}

const { width } = Dimensions.get('window');
const GAP = 12;
const PADDING = 16;
const CARD_WIDTH = (width - (PADDING * 2) - GAP) / 2;

export const DashboardStats = ({ data }: DashboardStatsProps) => {
    const { colors } = useSettings();

    const stats = [
        {
            title: i18n.t('dashboard.stats.folders'),
            value: data.totalFolders,
            desc: i18n.t('dashboard.stats.foldersDesc', { shared: data.sharedFolders }),
            icon: 'folder.fill',
            color: '#3B82F6', // Blue
            bgColor: '#3B82F620'
        },
        {
            title: i18n.t('dashboard.stats.attachments'),
            value: data.totalAttachments,
            desc: i18n.t('dashboard.stats.attachmentsDesc'),
            icon: 'doc.text.fill',
            color: '#10B981', // Emerald
            bgColor: '#10B98120'
        },
        {
            title: i18n.t('dashboard.stats.pending'),
            value: data.pendingApprovals,
            desc: i18n.t('dashboard.stats.pendingDesc'),
            icon: 'clock.fill',
            color: data.pendingApprovals > 0 ? '#F97316' : '#6B7280', // Orange or Gray
            bgColor: data.pendingApprovals > 0 ? '#F9731620' : '#F3F4F6',
            highlight: data.pendingApprovals > 0
        },
        {
            title: i18n.t('dashboard.stats.shares'),
            value: data.totalShares,
            desc: i18n.t('dashboard.stats.sharesDesc'),
            icon: 'square.and.arrow.up.fill',
            color: '#8B5CF6', // Purple
            bgColor: '#8B5CF620'
        }
    ];

    return (
        <View style={styles.grid}>
            {stats.map((stat, index) => (
                <View
                    key={index}
                    style={[
                        styles.card,
                        {
                            backgroundColor: colors.card,
                            borderColor: stat.highlight ? stat.color : colors.cardBorder
                        }
                    ]}
                >
                    <View style={styles.header}>
                        <ThemedText type="defaultSemiBold" style={{ fontSize: 13, color: colors.textLight }}>
                            {stat.title}
                        </ThemedText>
                        <View style={[styles.iconContainer, { backgroundColor: stat.bgColor }]}>
                            <IconSymbol name={stat.icon as any} size={16} color={stat.color} />
                        </View>
                    </View>
                    <ThemedText type="title" style={{ marginTop: 8, color: stat.highlight ? stat.color : colors.text }}>
                        {stat.value}
                    </ThemedText>
                    <ThemedText style={{ fontSize: 11, color: colors.textLight, marginTop: 4 }}>
                        {stat.desc}
                    </ThemedText>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: GAP,
        paddingHorizontal: PADDING,
        marginBottom: 24,
    },
    card: {
        width: CARD_WIDTH,
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
