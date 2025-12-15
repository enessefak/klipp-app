import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import { SharedFolder, ShareStatus } from '../../domain/FolderShare';
import { useFolderSharing } from '../useFolderSharing';

type FilterTab = 'all' | 'pending' | 'accepted';

export function SharedWithMeScreen() {
    const { colors } = useSettings();
    const router = useRouter();
    const { sharedWithMe, loading, loadSharedWithMe, acceptShare, rejectShare } = useFolderSharing();
    const [activeTab, setActiveTab] = useState<FilterTab>('all');

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
        tabsContainerWrapper: {
            paddingVertical: 12,
            backgroundColor: colors.background,
        },
        tabsScrollView: {
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        tabsContainer: {
            flexDirection: 'row',
            paddingHorizontal: 16,
            paddingBottom: 12,
            gap: 8,
        },
        tab: {
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 20,
            backgroundColor: colors.inputBackground,
        },
        tabActive: {
            backgroundColor: colors.primary,
        },
        tabText: {
            fontSize: 14,
            color: colors.text,
        },
        tabTextActive: {
            color: '#FFFFFF',
            fontWeight: '600',
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
        folderItem: {
            flexDirection: 'row',
            alignItems: 'center',
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
        iconContainer: {
            width: 48,
            height: 48,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },
        folderInfo: {
            flex: 1,
        },
        folderName: {
            fontSize: 16,
            color: colors.text,
            marginBottom: 4,
        },
        sharedByRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            marginBottom: 4,
        },
        sharedByText: {
            fontSize: 13,
            color: colors.subtext,
        },
        permissionRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        permissionBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 2,
            paddingHorizontal: 8,
            borderRadius: 4,
            gap: 4,
        },
        permissionText: {
            fontSize: 11,
            fontWeight: '600',
        },
        pendingBadge: {
            backgroundColor: colors.warning + '20',
            paddingVertical: 2,
            paddingHorizontal: 8,
            borderRadius: 4,
        },
        pendingText: {
            fontSize: 11,
            color: colors.warning,
            fontWeight: '600',
        },
        actionButtons: {
            flexDirection: 'row',
            gap: 8,
        },
        actionBtn: {
            width: 36,
            height: 36,
            borderRadius: 18,
            justifyContent: 'center',
            alignItems: 'center',
        },
        acceptBtn: {
            backgroundColor: colors.success,
        },
        rejectBtn: {
            backgroundColor: colors.error,
        },
        emptyContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 60,
        },
        emptyText: {
            marginTop: 16,
            color: colors.textLight,
            textAlign: 'center',
        },
    }), [colors]);

    useEffect(() => {
        const status = activeTab === 'all' ? undefined : activeTab;
        loadSharedWithMe(status as ShareStatus | undefined);
    }, [activeTab, loadSharedWithMe]);

    const handleRefresh = useCallback(() => {
        const status = activeTab === 'all' ? undefined : activeTab;
        loadSharedWithMe(status as ShareStatus | undefined);
    }, [activeTab, loadSharedWithMe]);

    const handleAccept = useCallback(async (shareId: string) => {
        await acceptShare(shareId);
        handleRefresh();
    }, [acceptShare, handleRefresh]);

    const handleReject = useCallback(async (shareId: string) => {
        await rejectShare(shareId);
        handleRefresh();
    }, [rejectShare, handleRefresh]);

    const handleOpenFolder = useCallback((folderId: string) => {
        router.push(`/shared/${folderId}`);
    }, [router]);

    const renderItem = ({ item }: { item: SharedFolder }) => {
        const isPending = item.status === 'pending';

        return (
            <TouchableOpacity
                style={styles.folderItem}
                onPress={() => !isPending && handleOpenFolder(item.id)}
                activeOpacity={isPending ? 1 : 0.7}
                disabled={isPending}
            >
                <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                    <IconSymbol name={item.icon as any} size={28} color={item.color} />
                </View>
                <View style={styles.folderInfo}>
                    <ThemedText type="defaultSemiBold" style={styles.folderName}>
                        {item.name}
                    </ThemedText>
                    <View style={styles.sharedByRow}>
                        <IconSymbol name="person.fill" size={12} color={colors.gray} />
                        <ThemedText style={styles.sharedByText}>
                            {item.owner.name}
                        </ThemedText>
                        {item.attachmentCount !== undefined && item.attachmentCount > 0 && (
                            <>
                                <ThemedText style={styles.sharedByText}> • </ThemedText>
                                <IconSymbol name="doc.fill" size={12} color={colors.gray} />
                                <ThemedText style={styles.sharedByText}>
                                    {item.attachmentCount} belge
                                </ThemedText>
                            </>
                        )}
                    </View>
                    <View style={styles.permissionRow}>
                        <View style={[
                            styles.permissionBadge,
                            { backgroundColor: item.permission === 'EDIT' ? colors.success + '20' : colors.primary + '20' }
                        ]}>
                            <IconSymbol
                                name={item.permission === 'EDIT' ? 'pencil' : 'eye.fill'}
                                size={12}
                                color={item.permission === 'EDIT' ? colors.success : colors.primary}
                            />
                            <ThemedText style={[
                                styles.permissionText,
                                { color: item.permission === 'EDIT' ? colors.success : colors.primary }
                            ]}>
                                {item.permission === 'EDIT'
                                    ? i18n.t('folders.sharing.roles.editor')
                                    : i18n.t('folders.sharing.roles.viewer')}
                            </ThemedText>
                        </View>
                        {isPending && (
                            <View style={styles.pendingBadge}>
                                <ThemedText style={styles.pendingText}>
                                    {i18n.t('folders.sharing.tabs.pending')}
                                </ThemedText>
                            </View>
                        )}
                    </View>
                </View>

                {isPending ? (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.acceptBtn]}
                            onPress={() => handleAccept(item.shareId)}
                        >
                            <IconSymbol name="checkmark" size={18} color={colors.white} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.rejectBtn]}
                            onPress={() => handleReject(item.shareId)}
                        >
                            <IconSymbol name="xmark" size={18} color={colors.white} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <IconSymbol name="chevron.right" size={20} color={colors.gray} />
                )}
            </TouchableOpacity>
        );
    };

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <IconSymbol name="person.2.slash.fill" size={64} color={colors.border} />
            <ThemedText type="subtitle" style={styles.emptyText}>
                {activeTab === 'pending'
                    ? 'Bekleyen paylaşım daveti yok'
                    : 'Sizinle paylaşılan klasör yok'}
            </ThemedText>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={[styles.header, { paddingTop: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 4, marginLeft: -4 }}>
                    <IconSymbol name="chevron.left" size={24} color={colors.text} />
                </TouchableOpacity>
                <ThemedText type="subtitle" style={[styles.headerTitle, { fontSize: 20 }]}>
                    Benimle Paylaşılanlar
                </ThemedText>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainerWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsContainer}
                    style={styles.tabsScrollView}
                >
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'all' && styles.tabActive]}
                        onPress={() => setActiveTab('all')}
                    >
                        <ThemedText style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
                            {i18n.t('folders.sharing.tabs.all')}
                        </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
                        onPress={() => setActiveTab('pending')}
                    >
                        <ThemedText style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
                            {i18n.t('folders.sharing.tabs.pending')}
                        </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === 'accepted' && styles.tabActive]}
                        onPress={() => setActiveTab('accepted')}
                    >
                        <ThemedText style={[styles.tabText, activeTab === 'accepted' && styles.tabTextActive]}>
                            {i18n.t('folders.sharing.tabs.accepted')}
                        </ThemedText>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {loading && sharedWithMe.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={sharedWithMe}
                    renderItem={renderItem}
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
