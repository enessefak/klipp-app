import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SearchBar } from '@/components/SearchBar';
import { SegmentedControl } from '@/components/SegmentedControl';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Attachment, AttachmentFilters } from '@/src/features/attachments/domain/Attachment';
import { AttachmentCard } from '@/src/features/attachments/presentation/components/AttachmentCard';
import { useAuth } from '@/src/features/auth/presentation/useAuth';
import { ImportEInvoiceModal } from '@/src/features/e-invoices/presentation/components/ImportEInvoiceModal';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { SharedFolder } from '@/src/features/sharing/domain/FolderShare';
import { ShareFolderModal } from '@/src/features/sharing/presentation/components/ShareFolderModal';
import { useFolderSharing } from '@/src/features/sharing/presentation/useFolderSharing';
import i18n from '@/src/infrastructure/localization/i18n';
import { Folder } from '../../domain/Folder';
import { FolderFilters } from '../../domain/FolderFilters';
import { FolderRepository } from '../../infrastructure/FolderRepository';

import { CreatePersonnelFolderModal } from '../components/CreatePersonnelFolderModal';
import { FolderAddMenuSheet } from '../components/FolderAddMenuSheet';
import { FolderCard } from '../components/FolderCard';
import { FolderFilterBottomSheet } from '../components/FolderFilterBottomSheet';
import { InboxTab } from '../components/InboxTab';
import { useFolders } from '../useFolders';

type TabKey = 'myFolders' | 'shared' | 'inbox';

interface FoldersScreenProps {
    parentId?: string;
}

export function FoldersScreen({ parentId: propParentId }: FoldersScreenProps) {
    const { colors } = useSettings();
    const { user } = useAuth();
    const router = useRouter();
    const params = useLocalSearchParams<{ id: string }>();
    const parentId = propParentId || params.id || undefined;

    // Tab state - only show tabs on root level
    const [activeTab, setActiveTab] = useState<TabKey>('myFolders');

    const {
        folders,
        attachments,
        loading,
        loadingMore,
        refresh,
        createFolder,
        updateFolder,
        loadMore,
        hasMore,
        search: searchFolders
    } = useFolders(parentId, { fetchMode: parentId ? 'all' : 'rootOnly' });


    const {
        sharedWithMe,
        sharedByMe,
        loadSharedWithMe,
        loadSharedByMe,
        sharedWithMeHasMore,
        loadingMoreSharedWithMe,
        acceptShare,
        rejectShare
    } = useFolderSharing();


    const [shareModalVisible, setShareModalVisible] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [filters, setFilters] = useState<AttachmentFilters>({});
    const [folderFilters, setFolderFilters] = useState<FolderFilters>({});

    // Add menu sheet state
    const [isAddMenuVisible, setIsAddMenuVisible] = useState(false);
    const [isPersonnelModalVisible, setIsPersonnelModalVisible] = useState(false);
    const [isImportModalVisible, setIsImportModalVisible] = useState(false);

    // Inbox state (placeholder - will need API integration)
    const [inboxAttachments, setInboxAttachments] = useState<Attachment[]>([]);
    const [inboxLoading, setInboxLoading] = useState(false);

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
            paddingBottom: 12,
            backgroundColor: colors.headerBackground,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        headerTitle: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        tabContainer: {
            marginBottom: 12,
        },
        center: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        scrollContent: {
            paddingBottom: 100,
        },
        emptyContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 60,
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
        // Shared folder styles
        sharedFolderCard: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            padding: 16,
            marginHorizontal: 16,
            marginBottom: 12,
        },
        sharedIconContainer: {
            width: 48,
            height: 48,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
        },
        sharedFolderInfo: {
            flex: 1,
        },
        sharedFolderName: {
            fontSize: 16,
            color: colors.text,
        },
        sharedOwnerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            marginTop: 4,
        },
        sharedOwnerText: {
            fontSize: 13,
            color: colors.textLight,
        },
        permissionBadge: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
        },
        permissionText: {
            fontSize: 11,
            fontWeight: '600',
        },
        sectionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
        },
        sectionTitle: {
            fontSize: 15,
            color: colors.text,
        },
        sectionSubtitle: {
            fontSize: 13,
            color: colors.textLight,
            marginTop: 2,
        },
        attachmentItem: {
            marginHorizontal: 16,
            marginBottom: 12,
        },
        // Folder Grid 
        folderGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingHorizontal: 16,
            gap: 12,
        },
        emptyIcon: {
            marginBottom: 16,
        },
        emptyText: {
            fontSize: 16,
            color: colors.textLight,
            textAlign: 'center',
        },
        emptyStateContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 32,
            paddingVertical: 40,
        },
        emptyStateIconContainer: {
            width: 64,
            height: 64,
            borderRadius: 18,
            backgroundColor: colors.primary + '10',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
        },
        emptyStateTitle: {
            fontSize: 18,
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: 8,
            color: colors.text,
        },
        emptyStateDescription: {
            fontSize: 14,
            color: colors.textLight,
            textAlign: 'center',
            lineHeight: 20,
            marginBottom: 24,
        },
        emptyStateButton: {
            paddingHorizontal: 24,
        },
        subTab: {
            paddingVertical: 6,
            paddingHorizontal: 14,
            borderRadius: 16,
            backgroundColor: colors.inputBackground,
        },
        subTabActive: {
            backgroundColor: colors.primary,
        },
        subTabText: {
            fontSize: 13,
            color: colors.text,
        },
        subTabTextActive: {
            color: '#FFFFFF',
            fontWeight: '600',
        },
    }), [colors]);

    // Load shared folders on mount (only for root level)
    useEffect(() => {
        if (!parentId) {
            loadSharedWithMe('accepted');
            loadSharedByMe();
        }
    }, [parentId, loadSharedWithMe, loadSharedByMe]);


    const handleSearch = (text: string) => {
        setSearchQuery(text);
        searchFolders(text);
        if (!parentId) {
            loadSharedWithMe('accepted', false, 20, text);
            loadSharedByMe();
        }
    };

    const handlePressFolder = (folder: Folder) => {
        router.push(`/folders/${folder.id}`);
    };

    const handleShareFolder = (folder: Folder) => {
        setSelectedFolder(folder);
        setShareModalVisible(true);
    };

    const handlePressAttachment = (attachment: Attachment) => {
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

    const handleExportFolder = (folder: Folder) => {
        // Navigate to folder detail with export modal open, or open export directly
        router.push(`/folders/${folder.id}?export=true`);
    };

    const handleEditFolder = (folder: Folder) => {
        router.push(`/folders/edit/${folder.id}`);
    };

    const handleDeleteFolder = (folder: Folder) => {
        Alert.alert(
            i18n.t('folders.actions.delete'),
            `"${folder.name}" klasörünü silmek istediğinize emin misiniz?`,
            [
                { text: i18n.t('common.actions.cancel'), style: 'cancel' },
                {
                    text: i18n.t('folders.actions.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await FolderRepository.deleteFolder(folder.id);
                            refresh();
                        } catch (err) {
                            Alert.alert(i18n.t('common.error'), 'Klasör silinemedi');
                        }
                    }
                }
            ]
        );
    };

    const filteredFolders = useMemo(() => {
        let result = folders || [];
        if (!parentId) {
            result = result.filter(f => !f.isShared);
        }
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
            } catch (e) { }
        }
        if (filters.documentDateTo) {
            try {
                const searchDate = new Date(filters.documentDateTo);
                result = result.filter(a => new Date(a.documentDate) <= searchDate);
            } catch (e) { }
        }
        return result;
    }, [attachments, filters]);

    // Tab segments
    const tabSegments = [
        { key: 'myFolders', label: i18n.t('folderTabs.myFolders') },
        { key: 'shared', label: i18n.t('folderTabs.shared') },
        { key: 'inbox', label: i18n.t('folderTabs.inbox') },
    ];

    // Render My Folders Tab
    const renderMyFoldersTab = () => (
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            refreshControl={
                <RefreshControl refreshing={loading} onRefresh={handleRefresh} tintColor={colors.primary} />
            }
        >
            {loading && filteredFolders.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : filteredFolders.length === 0 ? (
                <View style={styles.emptyStateContainer}>
                    <View style={styles.emptyStateIconContainer}>
                        <IconSymbol name="folder.fill" size={32} color={colors.primary} />
                    </View>
                    <ThemedText type="defaultSemiBold" style={styles.emptyStateTitle}>
                        {i18n.t('folders.emptyState.title')}
                    </ThemedText>
                    <ThemedText style={styles.emptyStateDescription}>
                        {i18n.t('folders.emptyState.description')}
                    </ThemedText>
                    <TouchableOpacity
                        style={[styles.fab, { position: 'relative', bottom: 0, right: 0, width: 'auto', height: 48, borderRadius: 12, paddingHorizontal: 24, flexDirection: 'row', gap: 8 }]}
                        onPress={() => router.push('/folders/create')}
                    >
                        <IconSymbol name="plus" size={20} color={colors.white} />
                        <ThemedText style={{ color: colors.white, fontWeight: '600' }}>
                            {i18n.t('folders.emptyState.action')}
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    {/* Section Header */}
                    <View style={styles.sectionHeader}>
                        <View>
                            <ThemedText type="subtitle" style={styles.sectionTitle}>
                                {i18n.t('folderTabs.myFolders')}
                            </ThemedText>
                            <ThemedText style={styles.sectionSubtitle}>
                                {i18n.t('folders.subtitle')}
                            </ThemedText>
                        </View>
                    </View>

                    {/* Folder Grid */}
                    <View style={styles.folderGrid}>
                        {filteredFolders.map((folder) => (
                            <FolderCard
                                key={folder.id}
                                folder={folder}
                                onPress={handlePressFolder}
                                onShare={handleShareFolder}
                                onExport={handleExportFolder}
                                onEdit={handleEditFolder}
                                onDelete={handleDeleteFolder}
                                size="medium"
                            />
                        ))}
                    </View>

                    {/* Root Attachments */}
                    {filteredAttachments.length > 0 && (
                        <>
                            <View style={styles.sectionHeader}>
                                <View>
                                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                                        {i18n.t('receipts.home.title')}
                                    </ThemedText>
                                </View>
                            </View>
                            <View style={{ paddingHorizontal: 16 }}>
                                {filteredAttachments.map((attachment) => (
                                    <AttachmentCard
                                        key={attachment.id}
                                        attachment={attachment}
                                        onPress={() => handlePressAttachment(attachment)}
                                    />
                                ))}
                            </View>
                        </>
                    )}
                </>
            )}
        </ScrollView>
    );

    // Render Shared Tab - with inner sub-tabs
    const [sharedSubTab, setSharedSubTab] = useState<'all' | 'pending' | 'accepted'>('all');

    const filteredSharedFolders = useMemo(() => {
        if (sharedSubTab === 'all') return sharedWithMe;
        return sharedWithMe.filter(folder => folder.status === sharedSubTab);
    }, [sharedWithMe, sharedSubTab]);

    const handleAcceptShare = useCallback(async (shareId: string) => {
        await acceptShare(shareId);
        loadSharedWithMe(sharedSubTab === 'all' ? undefined : sharedSubTab);
    }, [acceptShare, loadSharedWithMe, sharedSubTab]);

    const handleRejectShare = useCallback(async (shareId: string) => {
        await rejectShare(shareId);
        loadSharedWithMe(sharedSubTab === 'all' ? undefined : sharedSubTab);
    }, [rejectShare, loadSharedWithMe, sharedSubTab]);

    const renderSharedTab = () => (
        <View style={{ flex: 1 }}>
            {/* Inner Sub-Tabs */}
            <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
                {(['all', 'pending', 'accepted'] as const).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[
                            styles.subTab,
                            sharedSubTab === tab && styles.subTabActive
                        ]}
                        onPress={() => setSharedSubTab(tab)}
                    >
                        <ThemedText style={[
                            styles.subTabText,
                            sharedSubTab === tab && styles.subTabTextActive
                        ]}>
                            {tab === 'all' ? i18n.t('folders.sharing.tabs.all')
                                : tab === 'pending' ? i18n.t('folders.sharing.tabs.pending')
                                    : i18n.t('folders.sharing.tabs.accepted')}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={loadingMoreSharedWithMe}
                        onRefresh={() => loadSharedWithMe(sharedSubTab === 'all' ? undefined : sharedSubTab)}
                        tintColor={colors.primary}
                    />
                }
            >
                {filteredSharedFolders.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <IconSymbol name="person.2.fill" size={64} color={colors.border} style={styles.emptyIcon} />
                        <ThemedText style={styles.emptyText}>
                            {sharedSubTab === 'pending'
                                ? 'Bekleyen paylaşım daveti yok'
                                : i18n.t('folders.sharing.shared_with_me_empty')}
                        </ThemedText>
                    </View>
                ) : (
                    filteredSharedFolders.map((folder) => {
                        const isPending = folder.status === 'pending';
                        return (
                            <TouchableOpacity
                                key={folder.shareId || folder.id}
                                style={styles.sharedFolderCard}
                                onPress={() => !isPending && handlePressSharedFolder(folder)}
                                activeOpacity={isPending ? 1 : 0.7}
                                disabled={isPending}
                            >
                                <View style={[styles.sharedIconContainer, { backgroundColor: folder.color + '20' }]}>
                                    <IconSymbol name={(folder.icon as any) || 'folder.fill'} size={24} color={folder.color} />
                                </View>
                                <View style={styles.sharedFolderInfo}>
                                    <ThemedText type="defaultSemiBold" style={styles.sharedFolderName}>
                                        {folder.name}
                                    </ThemedText>
                                    <View style={styles.sharedOwnerRow}>
                                        <IconSymbol name="person.fill" size={12} color={colors.gray} />
                                        <ThemedText style={styles.sharedOwnerText}>{folder.owner.name}</ThemedText>
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
                                        {folder.permission === 'EDIT'
                                            ? i18n.t('folders.picker.permissions.edit')
                                            : i18n.t('folders.picker.permissions.view')
                                        }
                                    </ThemedText>
                                </View>
                                {isPending ? (
                                    <View style={{ flexDirection: 'row', gap: 8, marginLeft: 8 }}>
                                        <TouchableOpacity
                                            style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.success, justifyContent: 'center', alignItems: 'center' }}
                                            onPress={() => handleAcceptShare(folder.shareId)}
                                        >
                                            <IconSymbol name="checkmark" size={16} color={colors.white} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.error, justifyContent: 'center', alignItems: 'center' }}
                                            onPress={() => handleRejectShare(folder.shareId)}
                                        >
                                            <IconSymbol name="xmark" size={16} color={colors.white} />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <IconSymbol name="chevron.right" size={20} color={colors.gray} style={{ marginLeft: 8 }} />
                                )}
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );

    // Render Inbox Tab
    const renderInboxTab = () => (
        <InboxTab
            userEmail={user?.email || 'user@example.com'}
            attachments={inboxAttachments}
            loading={inboxLoading}
            onRefresh={() => {
                setInboxLoading(true);
                // TODO: Implement inbox API call
                setTimeout(() => setInboxLoading(false), 1000);
            }}
            onPressAttachment={handlePressAttachment}
        />
    );

    // Render active tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'shared':
                return renderSharedTab();
            case 'inbox':
                return renderInboxTab();
            default:
                return renderMyFoldersTab();
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={parentId ? [] : ['top']}>
            <View style={styles.header}>
                {!parentId && (
                    <View style={styles.tabContainer}>
                        <SegmentedControl
                            segments={tabSegments}
                            selectedKey={activeTab}
                            onSelect={(key) => setActiveTab(key as TabKey)}
                        />
                    </View>
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

            {/* Tab Content */}
            {renderTabContent()}

            {/* FAB - Only show on My Folders tab */}
            {activeTab === 'myFolders' && (
                <>
                    <TouchableOpacity
                        style={styles.fab}
                        onPress={() => setIsAddMenuVisible(true)}
                    >
                        <IconSymbol name="plus" size={32} color={colors.white} />
                    </TouchableOpacity>
                </>
            )}

            <FolderAddMenuSheet
                visible={isAddMenuVisible}
                onClose={() => setIsAddMenuVisible(false)}
                onCreateFolder={() => router.push({ pathname: '/folders/create', params: parentId ? { parentId } : {} })}
                onCreatePersonnelFile={() => setIsPersonnelModalVisible(true)}
                onImportPress={() => setIsImportModalVisible(true)}
                folderId={parentId}
                isRootLevel={!parentId}
            />

            <CreatePersonnelFolderModal
                visible={isPersonnelModalVisible}
                onClose={() => setIsPersonnelModalVisible(false)}
                onSuccess={() => refresh()}
            />

            <ImportEInvoiceModal
                visible={isImportModalVisible}
                onClose={() => setIsImportModalVisible(false)}
                onSuccess={() => refresh()}
                initialFolderId={parentId}
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
                        loadSharedByMe();
                    }}
                    folderId={selectedFolder.id}
                    folderName={selectedFolder.name}
                />
            )}
        </SafeAreaView>
    );
}
