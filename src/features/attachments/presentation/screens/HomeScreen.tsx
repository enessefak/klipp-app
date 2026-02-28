import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SearchBar } from '@/components/SearchBar';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import i18n from '@/src/infrastructure/localization/i18n';
import { usePicker } from '@/src/infrastructure/picker/PickerContext';

import { useAuth } from '@/src/features/auth/presentation/useAuth';
import { ImportEInvoiceModal } from '@/src/features/e-invoices/presentation/components/ImportEInvoiceModal';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { AttachmentRepository } from '../../data/AttachmentRepository';
import { AttachmentService } from '../../data/AttachmentService';
import { Attachment, AttachmentFilters } from '../../domain/Attachment';
import { AddMenuSheet } from '../components/AddMenuSheet';
import { AttachmentCard } from '../components/AttachmentCard';
import { FilterBottomSheet } from '../components/FilterBottomSheet';

const PAGE_SIZE = 20;

export function HomeScreen() {
    const { user } = useAuth();
    const { language, colors } = useSettings();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { selectionVersion } = usePicker();
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<AttachmentFilters>({});
    const [showFilterSheet, setShowFilterSheet] = useState(false);
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [attachmentToMove, setAttachmentToMove] = useState<Attachment | null>(null);
    const { setFolderCallback } = usePicker();

    // Count active filters (excluding search)
    const activeFilterCount = useMemo(() => {
        return Object.values(filters).filter(v => v !== undefined && v !== null && v !== '').length;
    }, [filters]);

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 16,
            backgroundColor: colors.headerBackground,
        },
        headerTop: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
        },
        profileCard: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            marginRight: 16,
        },
        avatarContainer: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
        },
        avatarText: {
            color: colors.white,
            fontSize: 18,
            fontWeight: '600',
        },
        profileInfo: {
            justifyContent: 'center',
            gap: 2,
        },
        welcomeText: {
            fontSize: 12,
            color: colors.subtext,
            lineHeight: 14,
        },
        userName: {
            fontSize: 16,
            fontWeight: '700',
            color: colors.text,
            lineHeight: 20,
        },
        headerActions: {
            flexDirection: 'row',
            gap: 12,
        },
        iconButton: {
            padding: 4,
        },
        searchContainer: {
            //
        },
        listContent: {
            padding: 16,
            paddingBottom: 100 + (insets.bottom || 0),
            flexGrow: 1,
        },
        center: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 60,
        },
        loadingMore: {
            paddingVertical: 16,
            alignItems: 'center',
        },
        fab: {
            position: 'absolute',
            bottom: 100 + (insets.bottom || 0),
            right: 24,
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 5,
        },
    }), [colors, insets.bottom]);

    const fetchAttachments = useCallback(async (isRefresh = false, cursor?: string, currentFilters?: AttachmentFilters, currentSearch?: string) => {
        try {
            const activeFilters: AttachmentFilters = {
                ...(currentFilters || filters),
                ...((currentSearch ?? searchQuery) ? { search: currentSearch ?? searchQuery } : {}),
                includeShared: true, // Include attachments from shared folders
            };

            const response = await AttachmentRepository.getAttachments(
                activeFilters,
                { cursor, limit: PAGE_SIZE }
            );

            if (isRefresh || !cursor) {
                setAttachments(response.items);
            } else {
                setAttachments(prev => [...prev, ...response.items]);
            }

            setHasMore(response.hasMore);
            setNextCursor(response.nextCursor);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch attachments', err);
            setError(i18n.t('receipts.home.error_load'));
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    }, [filters, searchQuery]);

    // Initial fetch and refetch when filters/search changes
    useEffect(() => {
        fetchAttachments(true, undefined, filters, searchQuery);
    }, [fetchAttachments, filters, searchQuery]);

    // Refresh list when screen comes into focus (e.g., after deleting from detail screen)
    const isFirstMount = useRef(true);
    const filterSheetWasOpen = useRef(false);

    useFocusEffect(
        useCallback(() => {
            if (isFirstMount.current) {
                isFirstMount.current = false;
                return;
            }
            // Refresh when coming back to this screen
            fetchAttachments(true, undefined, filters, searchQuery);

            // Re-open filter sheet if it was open before navigating away
            if (filterSheetWasOpen.current) {
                // Add delay to prevent conflict with navigation transition
                setTimeout(() => {
                    setShowFilterSheet(true);
                    filterSheetWasOpen.current = false;
                }, 500);
            }
        }, [fetchAttachments, filters, searchQuery])
    );

    // Track when filter sheet opens picker
    const handleFilterSheetPickerOpen = useCallback(() => {
        filterSheetWasOpen.current = true;
    }, []);

    // Re-open filter sheet when picker selection completes


    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setNextCursor(null);
        fetchAttachments(true, undefined, filters, searchQuery);
    }, [fetchAttachments, filters, searchQuery]);

    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore && nextCursor) {
            setLoadingMore(true);
            fetchAttachments(false, nextCursor, filters, searchQuery);
        }
    }, [loadingMore, hasMore, nextCursor, fetchAttachments, filters, searchQuery]);

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        setNextCursor(null);
    }, []);

    const handleApplyFilters = useCallback((newFilters: AttachmentFilters) => {
        setFilters(newFilters);
        setNextCursor(null);
    }, []);

    const handleResetFilters = useCallback(() => {
        setFilters({});
        setNextCursor(null);
    }, []);

    const handlePressAttachment = (attachment: Attachment) => {
        router.push(`/attachment/${attachment.id}`);
    };

    const handleMoveToFolder = useCallback((attachment: Attachment) => {
        setAttachmentToMove(attachment);
        setFolderCallback(async (folder) => {
            if (folder && attachment) {
                try {
                    await AttachmentService.updateAttachment(attachment.id, { folderId: folder.id });
                    fetchAttachments(true);
                } catch (error) {
                    console.error('Failed to move attachment:', error);
                }
            }
            setAttachmentToMove(null);
        });
        router.push('/picker/folder');
    }, [setFolderCallback, router, fetchAttachments]);

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <IconSymbol name="doc.text" size={64} color={colors.border} />
            <ThemedText type="subtitle" style={{ marginTop: 16, color: colors.text }}>{i18n.t('home.empty')}</ThemedText>
            <ThemedText style={{ textAlign: 'center', marginTop: 8, color: colors.textLight }}>
                {i18n.t('home.emptyDesc')}
            </ThemedText>
        </View>
    );

    const ListFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.loadingMore}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <ThemedText type="title" style={{ color: colors.primary }}>
                        {i18n.t('receipts.home.title')}
                    </ThemedText>
                </View>

                <View style={styles.searchContainer}>
                    <SearchBar
                        onFilterPress={() => setShowFilterSheet(true)}
                        onSearch={handleSearch}
                        value={searchQuery}
                        filterCount={activeFilterCount}
                    />
                </View>
            </View>

            {loading && !refreshing ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : error ? (
                <View style={styles.center}>
                    <ThemedText style={{ color: colors.error }}>{error}</ThemedText>
                    <TouchableOpacity onPress={onRefresh} style={{ marginTop: 12 }}>
                        <ThemedText style={{ color: colors.primary }}>{i18n.t('receipts.home.retry')}</ThemedText>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={attachments}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <AttachmentCard
                            attachment={item}
                            onPress={() => handlePressAttachment(item)}
                            onMoveToFolder={handleMoveToFolder}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={EmptyState}
                    ListFooterComponent={ListFooter}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.3}
                />
            )}

            <FilterBottomSheet
                visible={showFilterSheet}
                onClose={() => setShowFilterSheet(false)}
                filters={filters}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
                onPickerOpen={handleFilterSheetPickerOpen}
                onReopen={() => setShowFilterSheet(true)}
            />

            {/* FAB for adding documents */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setShowAddMenu(true)}
            >
                <IconSymbol name="plus" size={32} color={colors.white} />
            </TouchableOpacity>

            <AddMenuSheet
                visible={showAddMenu}
                onClose={() => setShowAddMenu(false)}
                onImportPress={() => setShowImportModal(true)}
            />

            <ImportEInvoiceModal
                visible={showImportModal}
                onClose={() => setShowImportModal(false)}
                onSuccess={() => fetchAttachments(true)}
            />
        </SafeAreaView>
    );
}
