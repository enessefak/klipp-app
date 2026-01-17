import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { FolderSummaryData } from '../../domain/Dashboard';

interface FolderSummaryListProps {
    folders: FolderSummaryData[];
}

export const FolderSummaryList = ({ folders }: FolderSummaryListProps) => {
    const { colors } = useSettings();
    const router = useRouter();

    if (!folders || folders.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="subtitle">{i18n.t('folders.my_folders')}</ThemedText>
                <TouchableOpacity onPress={() => router.push('/(tabs)/folders')}>
                    <ThemedText style={{ color: colors.primary, fontSize: 14 }}>{i18n.t('common.actions.success').replace('Başarılı', 'Tümünü Gör')}</ThemedText>
                    {/* Note: Ideally add 'See All' translate key, using placeholder for now or static */}
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {folders.map((folder) => (
                    <TouchableOpacity
                        key={folder.id}
                        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                        onPress={() => router.push(`/folders/${folder.id}`)}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: folder.color + '20' }]}>
                            <IconSymbol name={folder.icon as any} size={24} color={folder.color} />
                        </View>

                        <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.folderName}>
                            {folder.name}
                        </ThemedText>

                        <ThemedText style={[styles.count, { color: colors.textLight }]}>
                            {folder.attachmentCount} {i18n.t('folders.stats.document')}
                        </ThemedText>

                        {folder.summary && ((folder.summary.totalIncome ?? 0) > 0 || (folder.summary.totalExpense ?? 0) > 0) && (
                            <View style={styles.financialContainer}>
                                {(folder.summary.totalIncome ?? 0) > 0 && (
                                    <View style={styles.financialRow}>
                                        <IconSymbol name="arrow.down.left" size={12} color={colors.success} />
                                        <ThemedText style={{ fontSize: 11, color: colors.success }}>
                                            {(folder.summary.totalIncome ?? 0).toLocaleString()} {folder.summary.currency}
                                        </ThemedText>
                                    </View>
                                )}
                                {(folder.summary.totalExpense ?? 0) > 0 && (
                                    <View style={styles.financialRow}>
                                        <IconSymbol name="arrow.up.right" size={12} color={colors.error} />
                                        <ThemedText style={{ fontSize: 11, color: colors.error }}>
                                            {(folder.summary.totalExpense ?? 0).toLocaleString()} {folder.summary.currency}
                                        </ThemedText>
                                    </View>
                                )}
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 12,
    },
    card: {
        width: 160,
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        marginRight: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    folderName: {
        fontSize: 14,
        marginBottom: 4,
    },
    count: {
        fontSize: 12,
        marginBottom: 8,
    },
    financialContainer: {
        marginTop: 4,
        gap: 4,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#00000010', // subtle separator
    },
    financialRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    }
});
