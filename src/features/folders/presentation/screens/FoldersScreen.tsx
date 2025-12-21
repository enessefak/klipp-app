
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SearchBar } from '@/components/SearchBar';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Attachment, AttachmentFilters } from '@/src/features/attachments/domain/Attachment';
import { AttachmentCard } from '@/src/features/attachments/presentation/components/AttachmentCard';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { SharedFolder } from '@/src/features/sharing/domain/FolderShare';
import { ShareFolderModal } from '@/src/features/sharing/presentation/components/ShareFolderModal';
import { useFolderSharing } from '@/src/features/sharing/presentation/useFolderSharing';
import i18n from '@/src/infrastructure/localization/i18n';
import { Folder } from '../../domain/Folder';
import { FolderFilters } from '../../domain/FolderFilters';
import { CreateFolderModal } from '../components/CreateFolderModal';
import { FolderFilterBottomSheet } from '../components/FolderFilterBottomSheet';
import { useFolders } from '../useFolders';

interface FoldersScreenProps {
    parentId?: string;
}

export function FoldersScreen({ parentId: propParentId }: FoldersScreenProps) {
    const { colors } = useSettings();
    const router = useRouter();
    const params = useLocalSearchParams<{ id: string }>();
    const parentId = propParentId || params.id || undefined;

    const {
        folders,
        attachments,
        loading,
        loadingMore,
        refresh,
        createFolder,
        loadMore,
        hasMore,
        search: searchFolders
    } = useFolders(parentId);

    const {
        sharedWithMe,
        sharedByMe,
        loadSharedWithMe,
        loadSharedByMe,
        sharedWithMeHasMore,
        loadingMoreSharedWithMe
    } = useFolderSharing();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [shareModalVisible, setShareModalVisible] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter State
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [filters, setFilters] = useState<AttachmentFilters>({});
    const [folderFilters, setFolderFilters] = useState<FolderFilters>({});

    const handleApplyFilters = (newFilters: AttachmentFilters, newFolderFilters: FolderFilters) => {
        setFilters(newFilters);
        setFolderFilters(newFolderFilters);
    };

    const handleResetFilters = () => {
        setFilters({});
        setFolderFilters({});
    };

    const activeFilterCount = Object.keys(filters).length + Object.keys(folderFilters).length;

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            padding: 16,
            paddingBottom: 8,
            backgroundColor: colors.headerBackground,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
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
        emptyContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 60,
        },
        folderItem: {
            flexDirection: 'column',
            padding: 16,
            backgroundColor: colors.card,
            borderRadius: 16,
            marginBottom: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
            borderWidth: 1,
            borderColor: colors.cardBorder,
        },
        folderMainRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        iconContainer: {
            width: 48,
            height: 48,
            borderRadius: 24,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
        },
        folderInfo: {
            flex: 1,
            justifyContent: 'center',
        },
        folderName: {
            fontSize: 16,
            color: colors.text,
        },
        folderDate: {
            fontSize: 12,
            color: colors.textLight,
            marginTop: 2,
        },
        fab: {
            position: 'absolute',
            bottom: 100,
            right: 24,
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: colors.accent,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: colors.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 5,
            zIndex: 100,
        },
        shareButton: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.primary + '15',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 8,
        },
        sharedSection: {
            marginBottom: 16,
        },
        sectionTitleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
            gap: 8,
        },
        sectionTitle: {
            fontSize: 15,
            color: colors.text,
            flex: 1,
        },
        countBadge: {
            backgroundColor: colors.primary + '15',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
        },
        countText: {
            fontSize: 12,
            color: colors.primary,
            fontWeight: '600',
        },
        sharedFolderItem: {
            borderLeftWidth: 3,
            borderLeftColor: colors.success,
        },
        sharedByRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            marginTop: 2,
        },
        permissionBadge: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
            marginRight: 8,
        },
        permissionText: {
            fontSize: 11,
            fontWeight: '600',
        },
        loadMoreButton: {
            padding: 8,
            alignItems: 'center',
            justifyContent: 'center',
        },
        loadMoreText: {
            color: colors.primary,
            fontSize: 14,
            fontWeight: '600',
        },
        shareCountBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 8,
            gap: 6,
        },
        shareCountText: {
            fontSize: 12,
            color: colors.primary,
            fontWeight: '500',
        }
    }), [colors]);

    // Load shared folders on mount (only for root level)
    useEffect(() => {
        if (!parentId) {
            loadSharedWithMe('accepted');
            loadSharedByMe();
        }
    }, [parentId, loadSharedWithMe, loadSharedByMe]);

    const handleCreate = async (dto: any) => {
        await createFolder(dto);
        // Toast or success feedback?
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        searchFolders(text);
        if (!parentId) {
            // Reset pagination and search
            loadSharedWithMe('accepted', false, 20, text);
            loadSharedByMe();
        }
    };

    const handleLoadMoreShared = () => {
        if (!parentId && sharedWithMeHasMore && !loadingMoreSharedWithMe) {
            loadSharedWithMe('accepted', true, 20, searchQuery);
        }
    };

    const handlePressFolder = (folder: Folder) => {
        // Since we are in (tabs)/folders/_layout, pushing a specific ID stays in the stack
        router.push(`/folders/${folder.id}`);
    };

    const handleShareFolder = (folder: Folder) => {
        setSelectedFolder(folder);
        setShareModalVisible(true);
    };

    const handlePressAttachment = (attachment: Attachment) => {
        console.log('Pressed attachment', attachment.id);
        router.push(`/attachment/${attachment.id}`);
    };

    const handlePressSharedFolder = (folder: SharedFolder) => {
        router.push(`/folders/${folder.id}?shared=true`);
    };

    const handleRefresh = () => {
        refresh();
        if (!parentId) {
            loadSharedWithMe('accepted', false, 20, searchQuery);
            loadSharedByMe();
        }
    };

    const filteredFolders = useMemo(() => {
        let result = folders || [];

        // Parent filter (implicit)
        if (!parentId) {
            result = result.filter(f => !f.isShared);
        }

        // Apply advanced filters
        if (folderFilters.folderIcon) {
            result = result.filter(f => f.icon === folderFilters.folderIcon);
        }

        if (folderFilters.folderColor) {
            result = result.filter(f => f.color === folderFilters.folderColor);
        }

        return result;
    }, [folders, parentId, folderFilters]);

    const filteredAttachments = useMemo(() => {
        if (!attachments) return [];
        let result = attachments;

        if (filters.attachmentTypeId) {
            result = result.filter(a => a.attachmentTypeId === filters.attachmentTypeId);
        }

        if (filters.documentDateFrom) {
            try {
                const searchDate = new Date(filters.documentDateFrom);
                result = result.filter(a => new Date(a.documentDate) >= searchDate);
            } catch (e) {
                console.warn('Invalid dateFrom filter', filters.documentDateFrom);
            }
        }

        if (filters.documentDateTo) {
            try {
                const searchDate = new Date(filters.documentDateTo);
                result = result.filter(a => new Date(a.documentDate) <= searchDate);
            } catch (e) {
                console.warn('Invalid dateTo filter', filters.documentDateTo);
            }
        }

        return result;
    }, [attachments, filters]);

    const combinedData = [
        ...(filteredFolders.map(f => ({ type: 'folder' as const, data: f }))),
        ...(filteredAttachments.map(a => ({ type: 'attachment' as const, data: a })))
    ];

    const renderItem = ({ item }: { item: { type: 'folder' | 'attachment', data: any } }) => {
        if (item.type === 'folder') {
            const folder = item.data as Folder;
            // Find shares for this folder
            const sharesElement = sharedByMe.filter(s => s.folderId === folder.id);
            const shareCount = sharesElement.length;

            return (
                <TouchableOpacity
                    style={styles.folderItem}
                    onPress={() => handlePressFolder(folder)}
                    activeOpacity={0.7}
                >
                    <View style={styles.folderMainRow}>
                        <View style={[styles.iconContainer, { backgroundColor: folder.color + '20' }]}>
                            <IconSymbol name={folder.icon as any} size={28} color={folder.color} />
                        </View>
                        <View style={styles.folderInfo}>
                            <ThemedText type="defaultSemiBold" style={styles.folderName}>{folder.name}</ThemedText>
                            <ThemedText style={styles.folderDate}>{new Date(folder.createdAt).toLocaleDateString()}</ThemedText>
                        </View>
                        <TouchableOpacity
                            style={styles.shareButton}
                            onPress={() => handleShareFolder(folder)}
                        >
                            <IconSymbol name="person.badge.plus" size={20} color={colors.primary} />
                        </TouchableOpacity>
                        <IconSymbol name="chevron.right" size={20} color={colors.gray} />
                    </View>

                    {/* Simple Share Count Indicator */}
                    {shareCount > 0 && (
                        <View style={styles.shareCountBadge}>
                            <IconSymbol name="person.2.fill" size={12} color={colors.primary} />
                            <ThemedText style={styles.shareCountText}>
                                {shareCount} {i18n.t('folders.sharing.person_count')}
                            </ThemedText>
                        </View>
                    )}
                </TouchableOpacity>
            );
        } else {
            const attachment = item.data as Attachment;
            return (
                <View style={{ marginBottom: 12 }}>
                    <AttachmentCard attachment={attachment} onPress={() => handlePressAttachment(attachment)} />
                </View>
            );
        }
    };

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <IconSymbol name="folder.fill" size={64} color={colors.border} />
            <ThemedText type="subtitle" style={{ marginTop: 16, color: colors.text }}>{i18n.t('folders.empty')}</ThemedText>
        </View>
    );

    const renderSharedFolder = (folder: SharedFolder) => (
        <TouchableOpacity
            key={folder.shareId || folder.id}
            style={[styles.folderItem, styles.sharedFolderItem]}
            onPress={() => handlePressSharedFolder(folder)}
            activeOpacity={0.7}
        >
            <View style={styles.folderMainRow}>
                <View style={[styles.iconContainer, { backgroundColor: folder.color + '20' }]}>
                    <IconSymbol name={folder.icon as any} size={28} color={folder.color} />
                </View>
                <View style={styles.folderInfo}>
                    <ThemedText type="defaultSemiBold" style={styles.folderName}>{folder.name}</ThemedText>
                    <View style={styles.sharedByRow}>
                        <IconSymbol name="person.fill" size={12} color={colors.gray} />
                        <ThemedText style={styles.folderDate}>{folder.owner.name}</ThemedText>
                    </View>
                </View>
                <View style={[
                    styles.permissionBadge,
                    { backgroundColor: folder.permission === 'EDIT' ? colors.success + '20' : colors.primary + '20' }
                ]}>
                    <ThemedText style={[
                        styles.permissionText,
                        { color: folder.permission === 'EDIT' ? colors.success : colors.primary }
                    ]}>
                        {folder.permission === 'EDIT' ? i18n.t('folders.picker.permissions.edit') : i18n.t('folders.picker.permissions.view')}
                    </ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.gray} />
            </View>
        </TouchableOpacity>
    );

    const ListHeader = () => (
        <>
            {/* Search Bar is in main Layout usually, but if inside safer area: */}
            {/* If parentId implies nested, maybe no search? But we added search support. */}

            {/* Shared With Me Section - Only show on root level */}
            {!parentId && sharedWithMe.length > 0 && (
                <View style={styles.sharedSection}>
                    <View style={styles.sectionTitleRow}>
                        <IconSymbol name="person.2.fill" size={18} color={colors.primary} />
                        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                            {i18n.t('folders.shared_with_me')}
                        </ThemedText>
                        <View style={styles.countBadge}>
                            <ThemedText style={styles.countText}>{sharedWithMe.length}</ThemedText>
                        </View>
                    </View>
                    {sharedWithMe.map(renderSharedFolder)}

                    {sharedWithMeHasMore && (
                        <TouchableOpacity
                            style={styles.loadMoreButton}
                            onPress={handleLoadMoreShared}
                            disabled={loadingMoreSharedWithMe}
                        >
                            {loadingMoreSharedWithMe ? (
                                <ActivityIndicator size="small" color={colors.primary} />
                            ) : (
                                <ThemedText style={styles.loadMoreText}> Daha fazlasını gör </ThemedText>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* My Folders Section Title - Only show if has shared folders */}
            {!parentId && sharedWithMe.length > 0 && folders.length > 0 && (
                <View style={styles.sectionTitleRow}>
                    <IconSymbol name="folder.fill" size={18} color={colors.primary} />
                    <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                        {i18n.t('folders.my_folders')}
                    </ThemedText>
                </View>
            )}
        </>
    );

    // Header Component for Sticky behavior or just top
    return (
        <SafeAreaView style={styles.container} edges={parentId ? [] : ['top']}>
            <View style={styles.header}>
                {!parentId && (
                    <ThemedText type="title" style={{ color: colors.primary, marginBottom: 12 }}>{i18n.t('folders.title')}</ThemedText>
                )}
                <SearchBar
                    value={searchQuery}
                    onChangeText={handleSearch}
                    placeholder={i18n.t('common.search')}
                    onClear={() => handleSearch('')}
                    onFilterPress={() => setIsFilterVisible(true)}
                    filterCount={activeFilterCount}
                />
            </View>

            {loading && !loadingMore && combinedData.length === 0 && sharedWithMe.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={combinedData}
                    renderItem={renderItem}
                    keyExtractor={item => item.data.id}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={ListHeader}
                    ListEmptyComponent={!parentId && sharedWithMe.length > 0 ? null : EmptyState}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} tintColor={colors.primary} />}
                    onEndReached={() => {
                        if (hasMore && !loadingMore) {
                            loadMore();
                        }
                    }}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={loadingMore ? <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 16 }} /> : null}
                />
            )}

            <TouchableOpacity style={styles.fab} onPress={() => setIsModalVisible(true)}>
                <IconSymbol name="plus" size={32} color={colors.white} />
            </TouchableOpacity>

            <CreateFolderModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSubmit={handleCreate}
                parentId={parentId || null}
            />

            <FolderFilterBottomSheet
                visible={isFilterVisible}
                onClose={() => setIsFilterVisible(false)}
                attachmentFilters={filters}
                folderFilters={folderFilters}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
            />

            {selectedFolder && (
                <ShareFolderModal
                    visible={shareModalVisible}
                    onClose={() => {
                        setShareModalVisible(false);
                        setSelectedFolder(null);
                        loadSharedByMe(); // Reload shares after adding/closing
                    }}
                    folderId={selectedFolder.id}
                    folderName={selectedFolder.name}
                />
            )}
        </SafeAreaView>
    );
}
