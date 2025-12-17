import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SearchBar } from '@/components/SearchBar';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import i18n from '@/src/infrastructure/localization/i18n';
import { usePicker } from '@/src/infrastructure/picker/PickerContext';

import { useAuth } from '@/src/features/auth/presentation/useAuth';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { AttachmentRepository } from '../../data/AttachmentRepository';
import { Attachment, AttachmentFilters } from '../../domain/Attachment';
import { AttachmentCard } from '../components/AttachmentCard';
import { FilterBottomSheet } from '../components/FilterBottomSheet';

const PAGE_SIZE = 20;

export function HomeScreen() {
    const { user } = useAuth();
    const { language, colors } = useSettings();
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
            paddingBottom: 100,
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
    }), [colors]);

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
            console.log('Fetch Attachments Response:', JSON.stringify(response, null, 2));

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
    useEffect(() => {
        if (selectionVersion > 0 && filterSheetWasOpen.current) {
            // Add delay to prevent conflict with navigation transition
            setTimeout(() => {
                setShowFilterSheet(true);
                filterSheetWasOpen.current = false;
            }, 500);
        }
    }, [selectionVersion]);

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
                    <TouchableOpacity
                        style={styles.profileCard}
                        onPress={() => router.push({ pathname: '/(tabs)/profile', params: { from: 'home' } })}
                        activeOpacity={0.7}
                    >
                        <View style={styles.avatarContainer}>
                            <IconSymbol name="person.fill" size={24} color={colors.white} />
                        </View>
                        <View style={styles.profileInfo}>
                            <ThemedText style={styles.welcomeText}>
                                {i18n.t('receipts.home.myProfile')}
                            </ThemedText>
                            <ThemedText type="subtitle" style={styles.userName} numberOfLines={1}>
                                {user?.name || user?.email?.split('@')[0] || 'User'}
                            </ThemedText>
                        </View>
                        <IconSymbol name="chevron.right" size={20} color={colors.textLight} style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/scan')}>
                            <IconSymbol name="plus.circle.fill" size={30} color={colors.accent} />
                        </TouchableOpacity>
                    </View>
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
                        <AttachmentCard attachment={item} onPress={() => handlePressAttachment(item)} />
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
            />
        </SafeAreaView>
    );
}
