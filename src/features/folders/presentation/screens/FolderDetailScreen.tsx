import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FileDownloadService } from '@/src/features/attachments/application/FileDownloadService';
import { AttachmentService } from '@/src/features/attachments/data/AttachmentService';
import { Attachment } from '@/src/features/attachments/domain/Attachment';
import { useAuth } from '@/src/features/auth/presentation/useAuth';
import { ImportEInvoiceModal } from '@/src/features/e-invoices/presentation/components/ImportEInvoiceModal';
import { useGroups } from '@/src/features/groups/presentation/hooks/useGroups';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { SharingService } from '@/src/features/sharing/data/SharingService';
import { FolderShare } from '@/src/features/sharing/domain/FolderShare';
import { EditShareModal } from '@/src/features/sharing/presentation/components/EditShareModal';
import { ShareFolderModal } from '@/src/features/sharing/presentation/components/ShareFolderModal';
import { OpenAPI } from '@/src/infrastructure/api/generated/core/OpenAPI';
import i18n from '@/src/infrastructure/localization/i18n';
import { Folder } from '../../domain/Folder';
import { FolderRepository } from '../../infrastructure/FolderRepository';
import { BreadcrumbNavigation, buildBreadcrumbPath } from '../components/BreadcrumbNavigation';
import { CreatePersonnelFolderModal } from '../components/CreatePersonnelFolderModal';
import { ExportFolderModal } from '../components/ExportFolderModal';
import { FolderAddMenuSheet } from '../components/FolderAddMenuSheet';
import { FolderEvents } from '../FolderEvents';
import { useFolders } from '../useFolders';


export function FolderDetailScreen() {
    const { colors } = useSettings();
    const router = useRouter();
    const { user } = useAuth();

    const params = useLocalSearchParams<{ id: string; shared?: string }>();
    const folderId = params.id;
    const isSharedFolder = params.shared === 'true';

    const { folders, attachments, loading, refresh, createFolder, updateFolder, deleteFolder } = useFolders(folderId, { isSharedFolder });
    const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
    const [folderShares, setFolderShares] = useState<FolderShare[]>([]);
    const [sharesLoading, setSharingLoading] = useState(false);
    const [isExportModalVisible, setIsExportModalVisible] = useState(false);
    const [shareModalVisible, setShareModalVisible] = useState(false);
    const [showShareDetails, setShowShareDetails] = useState(false);
    const [selectedShare, setSelectedShare] = useState<FolderShare | null>(null);
    const [allFolders, setAllFolders] = useState<Folder[]>([]);
    const [activeTab, setActiveTab] = useState<'belgeler' | 'efatura'>('belgeler');
    const [sharingTab, setSharingTab] = useState<'persons' | 'groups'>('persons');

    // Add menu and modal states
    const [isAddMenuVisible, setIsAddMenuVisible] = useState(false);
    const [isPersonnelModalVisible, setIsPersonnelModalVisible] = useState(false);
    const [isImportModalVisible, setIsImportModalVisible] = useState(false);

    // Groups
    const { groups, loading: groupsLoading, refresh: refreshGroups } = useGroups();

    const handleUpdateShare = async (shareId: string, permission: FolderShare['permission']) => {
        await SharingService.updateSharePermission(shareId, permission);
        loadFolderShares();
    };

    const handleRemoveShare = async (shareId: string) => {
        await SharingService.removeShare(shareId);
        loadFolderShares();
    };


    // Load all folders for breadcrumb navigation
    useEffect(() => {
        const loadAllFolders = async () => {
            try {
                const data = await FolderRepository.getFolders({ flat: true });
                setAllFolders(data);
            } catch (err) {
                console.error('Failed to load folders for breadcrumb:', err);
            }
        };
        loadAllFolders();
    }, []);

    const loadFolderInfo = async () => {
        try {
            const folder = await FolderRepository.getFolderById(folderId!);
            setCurrentFolder(folder);
        } catch (err: any) {
            console.error('Failed to load folder:', err);
            if (err.status === 404 || err.body?.message === 'Folder not found') {
                Alert.alert(
                    i18n.t('errors.error'),
                    i18n.t('errors.folderNotFound'),
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            }
        }
    };

    const loadFolderShares = useCallback(async () => {
        try {
            setSharingLoading(true);
            const shares = await SharingService.getFolderShares(folderId!);
            setFolderShares(shares);
        } catch (err: any) {
            // If folder is not found, we probably already handled it in loadFolderInfo or it's deleted.
            // Suppress 404 log to avoid noise.
            if (err.status === 404 || err.body?.message === 'Folder not found') {
                return;
            }
            console.error(`Failed to load folder shares for folderId ${folderId}: `, JSON.stringify(err, null, 2), err);
        } finally {
            setSharingLoading(false);
        }
    }, [folderId]);

    // Load current folder info
    useEffect(() => {
        if (folderId) {
            loadFolderInfo();
            // Only load shares if this is NOT a shared folder (we own it)
            if (!isSharedFolder) {
                loadFolderShares();
            }
        }
    }, [folderId, isSharedFolder, loadFolderShares]);

    useFocusEffect(
        useCallback(() => {
            refresh();
            if (!isSharedFolder) {
                loadFolderShares();
            }
        }, [folderId, isSharedFolder, loadFolderShares])
    );


    const handleExport = async (templateId?: string) => {
        if (!folderId) return;
        try {
            const baseUrl = OpenAPI.BASE;
            const url = `${baseUrl} /folders/${folderId}/export?format=excel${templateId ? `&templateId=${templateId}` : ''}`;
            const filename = `${currentFolder?.name || 'folder'} _export.xlsx`;

            const success = await FileDownloadService.downloadAndShare(url, filename);
            if (!success) {
                Alert.alert(i18n.t('common.error'), 'Dışa aktarma başarısız oldu.');
            }
        } catch (error) {
            console.error('Export failed', error);
            Alert.alert(i18n.t('common.error'), 'Dışa aktarma sırasında bir hata oluştu.');
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Klasörü Sil',
            `"${currentFolder?.name}" klasörünü ve içeriğini silmek istediğinize emin misiniz ? `,
            [
                { text: 'Vazgeç', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (folderId) {
                                await deleteFolder(folderId);
                                FolderEvents.emitDelete(folderId);
                                router.back();
                            }
                        } catch (err: any) {
                            // If folder is already gone (404), just go back
                            if (err.status === 404 || err.toString().includes('Not Found')) {
                                router.back();
                                return;
                            }
                            Alert.alert('Hata', 'Klasör silinemedi');
                        }
                    }
                }
            ]
        );
    };

    const handlePressFolder = (folder: Folder) => {
        router.push(`/folders/${folder.id}`);
    };

    const handlePressAttachment = (attachment: Attachment) => {
        router.push(`/attachment/${attachment.id}`);
    };

    const handleBreadcrumbNavigate = (id: string | null) => {
        if (id === null) {
            router.push('/folders');
        } else {
            router.push(`/folders/${id}`);
        }
    };

    const breadcrumbItems = useMemo(() => {
        return buildBreadcrumbPath(currentFolder, allFolders);
    }, [currentFolder, allFolders]);

    const handleRefresh = useCallback(() => {
        refresh();
        if (!isSharedFolder) {
            loadFolderShares();
        }
    }, [refresh, isSharedFolder]);

    const handleMoveAttachment = (attachment: Attachment) => {
        // Navigate to folder picker and handle move
        router.push({
            pathname: '/picker/folder',
            params: {
                moveAttachmentId: attachment.id,
                selectedId: folderId || undefined,
            },
        });
    };

    const handleEditAttachment = (attachment: Attachment) => {
        router.push(`/attachment/${attachment.id}/edit`);
    };

    const handleDeleteAttachment = (attachment: Attachment) => {
        Alert.alert(
            i18n.t('attachments.actions.delete'),
            `"${attachment.title}" belgesini silmek istediğinize emin misiniz?`,
            [
                { text: i18n.t('common.actions.cancel'), style: 'cancel' },
                {
                    text: i18n.t('attachments.actions.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AttachmentService.deleteAttachment(attachment.id);
                            refresh();
                        } catch (err) {
                            Alert.alert(i18n.t('common.error'), 'Belge silinemedi');
                        }
                    }
                }
            ]
        );
    };

    const acceptedShares = folderShares.filter(s => s.status === 'accepted');
    const pendingShares = folderShares.filter(s => s.status === 'pending');


    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        center: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        listContent: {
            paddingBottom: 100,
        },
        headerSection: {
            marginBottom: 8,
        },
        folderInfoCard: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.card,
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.cardBorder,
        },
        folderIcon: {
            width: 64,
            height: 64,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
        },
        folderDetails: {
            flex: 1,
        },
        folderName: {
            fontSize: 20,
            color: colors.text,
            marginBottom: 4,
            lineHeight: 24,
        },
        folderNameHint: {
            fontSize: 13,
            color: colors.textLight,
            marginBottom: 6,
        },
        statsRow: {
            flexDirection: 'row',
            gap: 16,
        },
        stat: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        statText: {
            fontSize: 13,
            color: colors.gray,
        },
        shareIconButton: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.primary + '15',
            justifyContent: 'center',
            alignItems: 'center',
        },
        sharingSection: {
            backgroundColor: colors.card,
            marginTop: 8,
            paddingVertical: 12,
            paddingHorizontal: 16,
            marginBottom: 24,
            marginHorizontal: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.cardBorder,
        },
        sharingHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        sharingTitleRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        sharingTitle: {
            fontSize: 15,
            color: colors.text,
        },
        sharingBadges: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        shareBadge: {
            backgroundColor: colors.primary + '15',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
        },
        shareBadgeText: {
            fontSize: 12,
            color: colors.primary,
            fontWeight: '600',
        },
        pendingBadge: {
            backgroundColor: colors.warning + '15',
        },
        pendingText: {
            color: colors.warning,
        },
        shareDetailsList: {
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        noSharesText: {
            fontSize: 14,
            color: colors.gray,
            textAlign: 'center',
            paddingVertical: 8,
        },
        shareItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 10,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
        },
        shareAvatar: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },
        shareAvatarText: {
            color: colors.white,
            fontSize: 14,
            fontWeight: '600',
        },
        shareInfo: {
            flex: 1,
        },
        shareName: {
            fontSize: 14,
            color: colors.text,
        },
        shareEmail: {
            fontSize: 12,
            color: colors.gray,
        },
        shareStatus: {
            alignItems: 'flex-end',
            gap: 4,
        },
        permissionBadge: {
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 4,
        },
        permissionText: {
            fontSize: 11,
            fontWeight: '600',
        },
        statusPending: {
            backgroundColor: colors.warning + '20',
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
        },
        statusPendingText: {
            fontSize: 10,
            color: colors.warning,
            fontWeight: '600',
        },
        addShareButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12,
            gap: 8,
        },
        addShareText: {
            color: colors.primary,
            fontWeight: '600',
            fontSize: 14,
        },
        sharingTabsContainer: {
            flexDirection: 'row',
            gap: 8,
            marginBottom: 12,
        },
        sharingTabButton: {
            flex: 1,
            paddingVertical: 8,
            alignItems: 'center',
            borderRadius: 8,
            backgroundColor: colors.inputBackground,
        },
        sharingTabButtonActive: {
            backgroundColor: colors.primary,
        },
        sharingTabText: {
            fontSize: 13,
            color: colors.text,
        },
        sharingTabTextActive: {
            color: colors.white,
            fontWeight: '600',
        },
        groupItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 10,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
        },
        groupAvatar: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.success,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },
        groupInfo: {
            flex: 1,
        },
        groupName: {
            fontSize: 15,
            color: colors.text,
        },
        groupMemberCount: {
            fontSize: 12,
            color: colors.gray,
        },
        contentTitleRow: {
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 8,
        },
        contentTitle: {
            fontSize: 15,
            color: colors.text,
        },
        folderItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            backgroundColor: colors.card,
            borderRadius: 16,
            marginHorizontal: 16,
            marginBottom: 8,
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
            borderRadius: 24,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
        },
        folderItemInfo: {
            flex: 1,
        },
        folderItemName: {
            fontSize: 16,
            color: colors.text,
        },
        folderDate: {
            fontSize: 12,
            color: colors.textLight,
            marginTop: 2,
        },
        emptyContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 40,
            paddingHorizontal: 32,
        },
        emptyText: {
            marginTop: 16,
            color: colors.text,
        },
        emptySubtext: {
            marginTop: 8,
            color: colors.gray,
            textAlign: 'center',
            fontSize: 14,
        },
        fab: {
            position: 'absolute',
            bottom: 100,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 5,
            zIndex: 100,
        },
        fabOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 99,
        },
        fabMenu: {
            position: 'absolute',
            bottom: 170,
            right: 24,
            zIndex: 101,
            gap: 12,
        },
        fabMenuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: colors.card,
            paddingVertical: 12,
            paddingHorizontal: 16,
            borderRadius: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 3,
        },
        fabMenuItemIcon: {
            width: 36,
            height: 36,
            borderRadius: 18,
            justifyContent: 'center',
            alignItems: 'center',
        },
        fabMenuItemText: {
            fontSize: 15,
            fontWeight: '600',
            color: colors.text,
        },
        sharedIndicator: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.primary + '10',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 12,
            marginBottom: 16,
            gap: 10,
        },
        sharedIndicatorText: {
            color: colors.primary,
            fontSize: 14,
        },
    }), [colors]);


    const FolderHeader = () => {
        const rawName = currentFolder?.name || i18n.t('folders.default_name') || 'Klasör';
        const MAX_FOLDER_NAME = 28;
        const isLongName = rawName.length > MAX_FOLDER_NAME;
        const displayName = isLongName ? `${rawName.slice(0, MAX_FOLDER_NAME - 1).trim()}…` : rawName;

        return (
            <View style={styles.headerSection}>
                {/* Folder Info */}
                <View style={styles.folderInfoCard}>
                    <View style={[
                        styles.folderIcon,
                        { backgroundColor: (currentFolder?.color || colors.primary) + '20' }
                    ]}>
                        <IconSymbol
                            name={(currentFolder?.icon as any) || 'folder.fill'}
                            size={40}
                            color={currentFolder?.color || colors.primary}
                        />
                    </View>
                    <View style={styles.folderDetails}>
                        <ThemedText
                            type="title"
                            style={styles.folderName}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                        >
                            {displayName}
                        </ThemedText>
                        {isLongName && (
                            <ThemedText
                                style={styles.folderNameHint}
                                numberOfLines={1}
                                ellipsizeMode="middle"
                            >
                                {rawName}
                            </ThemedText>
                        )}
                        <View style={styles.statsRow}>
                            <View style={styles.stat}>
                                <IconSymbol name="folder.fill" size={14} color={colors.gray} />
                                <ThemedText style={styles.statText}>{folders.length} {i18n.t('folders.stats.subfolder')}</ThemedText>
                            </View>
                            <View style={styles.stat}>
                                <IconSymbol name="doc.fill" size={14} color={colors.gray} />
                                <ThemedText style={styles.statText}>{attachments.length} {i18n.t('folders.stats.document')}</ThemedText>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Folder Actions Section */}
                {(!isSharedFolder || currentFolder?.owner?.id === user?.id) && (
                    <View style={{
                        backgroundColor: colors.card,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        marginTop: 8,
                        borderTopWidth: 1,
                        borderBottomWidth: 1,
                        borderColor: colors.cardBorder,
                    }}>
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <TouchableOpacity
                                style={styles.shareIconButton}
                                onPress={() => router.push(`/folders/edit/${currentFolder?.id}`)}
                            >
                                <IconSymbol name="pencil" size={22} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.shareIconButton}
                                onPress={() => setShareModalVisible(true)}
                            >
                                <IconSymbol name="person.badge.plus" size={22} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.shareIconButton}
                                onPress={() => setIsExportModalVisible(true)}
                            >
                                <IconSymbol name="square.and.arrow.up" size={22} color={colors.primary} />
                            </TouchableOpacity>
                            {!currentFolder?.isSystem && (
                                <TouchableOpacity
                                    style={[styles.shareIconButton, { backgroundColor: colors.error + '15' }]}
                                    onPress={handleDelete}
                                >
                                    <IconSymbol name="trash.fill" size={22} color={colors.error} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                )}

                {/* Sharing Section - Only for owned folders */}
                {
                    currentFolder?.owner?.id === user?.id && (
                        <TouchableOpacity
                            style={styles.sharingSection}
                            onPress={() => setShowShareDetails(!showShareDetails)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.sharingHeader}>
                                <View style={styles.sharingTitleRow}>
                                    <IconSymbol name="person.2.fill" size={20} color={colors.primary} />
                                    <ThemedText type="defaultSemiBold" style={styles.sharingTitle}>
                                        {i18n.t('folders.sharing.title')}
                                    </ThemedText>
                                </View>
                                <View style={styles.sharingBadges}>
                                    {acceptedShares.length > 0 && (
                                        <View style={styles.shareBadge}>
                                            <ThemedText style={styles.shareBadgeText}>
                                                {acceptedShares.length} {i18n.t('folders.sharing.person_count')}
                                            </ThemedText>
                                        </View>
                                    )}
                                    {pendingShares.length > 0 && (
                                        <View style={[styles.shareBadge, styles.pendingBadge]}>
                                            <ThemedText style={[styles.shareBadgeText, styles.pendingText]}>
                                                {pendingShares.length} {i18n.t('folders.sharing.pending_count')}
                                            </ThemedText>
                                        </View>
                                    )}
                                    <IconSymbol
                                        name={showShareDetails ? 'chevron.up' : 'chevron.down'}
                                        size={16}
                                        color={colors.gray}
                                    />
                                </View>
                            </View>

                            {/* Share Details */}
                            {showShareDetails && (
                                <View style={styles.shareDetailsList}>
                                    {/* Tabs for Persons / Groups */}
                                    <View style={styles.sharingTabsContainer}>
                                        <TouchableOpacity
                                            style={[styles.sharingTabButton, sharingTab === 'persons' && styles.sharingTabButtonActive]}
                                            onPress={() => setSharingTab('persons')}
                                        >
                                            <ThemedText style={[styles.sharingTabText, sharingTab === 'persons' && styles.sharingTabTextActive]}>
                                                👤 Kişiler ({folderShares.length})
                                            </ThemedText>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.sharingTabButton, sharingTab === 'groups' && styles.sharingTabButtonActive]}
                                            onPress={() => setSharingTab('groups')}
                                        >
                                            <ThemedText style={[styles.sharingTabText, sharingTab === 'groups' && styles.sharingTabTextActive]}>
                                                👥 Gruplar ({groups.length})
                                            </ThemedText>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Persons Tab Content */}
                                    {sharingTab === 'persons' && (
                                        <>
                                            {sharesLoading ? (
                                                <ActivityIndicator size="small" color={colors.primary} />
                                            ) : folderShares.length === 0 ? (
                                                <ThemedText style={styles.noSharesText}>
                                                    {i18n.t('folders.sharing.empty')}
                                                </ThemedText>
                                            ) : (
                                                folderShares.map((share) => (
                                                    <TouchableOpacity
                                                        key={share.id}
                                                        style={styles.shareItem}
                                                        onPress={() => setSelectedShare(share)}
                                                    >
                                                        <View style={styles.shareAvatar}>
                                                            <ThemedText style={styles.shareAvatarText}>
                                                                {share.sharedWith.name.charAt(0).toUpperCase()}
                                                            </ThemedText>
                                                        </View>
                                                        <View style={styles.shareInfo}>
                                                            <ThemedText type="defaultSemiBold" style={styles.shareName}>
                                                                {share.sharedWith.name}
                                                            </ThemedText>
                                                            <ThemedText style={styles.shareEmail}>
                                                                {share.sharedWith.email}
                                                            </ThemedText>
                                                        </View>
                                                        <View style={styles.shareStatus}>
                                                            <View style={[
                                                                styles.permissionBadge,
                                                                { backgroundColor: share.permission === 'EDIT' ? colors.success + '20' : colors.primary + '20' }
                                                            ]}>
                                                                <ThemedText style={[
                                                                    styles.permissionText,
                                                                    { color: share.permission === 'EDIT' ? colors.success : colors.primary }
                                                                ]}>
                                                                    {share.permission === 'VIEW' ? i18n.t('folders.sharing.roles.viewer') :
                                                                        share.permission === 'EDIT' ? i18n.t('folders.sharing.roles.editor') : share.permission}
                                                                </ThemedText>
                                                            </View>
                                                            {share.status === 'pending' && (
                                                                <View style={styles.statusPending}>
                                                                    <ThemedText style={styles.statusPendingText}>{i18n.t('folders.sharing.status.pending')}</ThemedText>
                                                                </View>
                                                            )}
                                                        </View>
                                                    </TouchableOpacity>
                                                ))
                                            )}
                                            <TouchableOpacity
                                                style={styles.addShareButton}
                                                onPress={() => setShareModalVisible(true)}
                                            >
                                                <IconSymbol name="plus.circle.fill" size={20} color={colors.primary} />
                                                <ThemedText style={styles.addShareText}>{i18n.t('folders.sharing.add_person')}</ThemedText>
                                            </TouchableOpacity>
                                        </>
                                    )}

                                    {/* Groups Tab Content */}
                                    {sharingTab === 'groups' && (
                                        <>
                                            {groupsLoading ? (
                                                <ActivityIndicator size="small" color={colors.primary} />
                                            ) : groups.length === 0 ? (
                                                <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                                                    <ThemedText style={styles.noSharesText}>
                                                        Henüz grup oluşturmadınız
                                                    </ThemedText>
                                                    <TouchableOpacity
                                                        style={[styles.addShareButton, { marginTop: 8 }]}
                                                        onPress={() => router.push('/groups')}
                                                    >
                                                        <IconSymbol name="plus.circle.fill" size={20} color={colors.primary} />
                                                        <ThemedText style={styles.addShareText}>Grup Oluştur</ThemedText>
                                                    </TouchableOpacity>
                                                </View>
                                            ) : (
                                                <>
                                                    {groups.map((group) => (
                                                        <TouchableOpacity
                                                            key={group.id}
                                                            style={styles.groupItem}
                                                            onPress={() => router.push(`/groups/${group.id}`)}
                                                        >
                                                            <View style={styles.groupAvatar}>
                                                                <IconSymbol name="person.3.fill" size={16} color={colors.white} />
                                                            </View>
                                                            <View style={styles.groupInfo}>
                                                                <ThemedText type="defaultSemiBold" style={styles.groupName}>
                                                                    {group.name}
                                                                </ThemedText>
                                                                <ThemedText style={styles.groupMemberCount}>
                                                                    {group.memberCount} üye
                                                                </ThemedText>
                                                            </View>
                                                            <IconSymbol name="chevron.right" size={16} color={colors.gray} />
                                                        </TouchableOpacity>
                                                    ))}
                                                    <TouchableOpacity
                                                        style={styles.addShareButton}
                                                        onPress={() => router.push('/groups')}
                                                    >
                                                        <IconSymbol name="gearshape.fill" size={20} color={colors.primary} />
                                                        <ThemedText style={styles.addShareText}>Grupları Yönet</ThemedText>
                                                    </TouchableOpacity>
                                                </>
                                            )}
                                        </>
                                    )}
                                </View>
                            )}
                        </TouchableOpacity>
                    )
                }

                {/* Shared folder indicator */}
                {
                    isSharedFolder && (
                        <View style={styles.sharedIndicator}>
                            <IconSymbol name="person.2.fill" size={18} color={colors.primary} />
                            <ThemedText style={styles.sharedIndicatorText}>
                                {i18n.t('folders.sharing.shared_with_you')}
                            </ThemedText>
                        </View>
                    )
                }

                {/* Subfolders List */}
                {folders && folders.length > 0 && (
                    <View style={{ marginBottom: 16 }}>
                        <View style={styles.contentTitleRow}>
                            <ThemedText type="defaultSemiBold" style={styles.contentTitle}>
                                {i18n.t('folders.title')}
                            </ThemedText>
                        </View>
                        {folders.map((folder) => {
                            const folderColor = folder.color || '#3B82F6';
                            return (
                                <TouchableOpacity
                                    key={folder.id}
                                    style={styles.folderItem}
                                    onPress={() => handlePressFolder(folder)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.iconContainer, { backgroundColor: folderColor + '20' }]}>
                                        <IconSymbol name={(folder.icon || 'folder.fill') as any} size={28} color={folderColor} />
                                    </View>
                                    <View style={styles.folderItemInfo}>
                                        <ThemedText type="defaultSemiBold" style={styles.folderItemName}>
                                            {folder.name}
                                        </ThemedText>
                                        <ThemedText style={styles.folderDate}>
                                            {new Date(folder.createdAt).toLocaleDateString()}
                                        </ThemedText>
                                    </View>
                                    <IconSymbol name="chevron.right" size={20} color={colors.gray} />
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

            </View>
        );
    };

    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <IconSymbol name="folder.fill" size={64} color={colors.border} />
            <ThemedText type="subtitle" style={styles.emptyText}>
                {i18n.t('folders.detail_empty.title')}
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
                {i18n.t('folders.detail_empty.desc')}
            </ThemedText>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={[]}>
            {/* Breadcrumb Navigation */}
            <BreadcrumbNavigation
                items={breadcrumbItems}
                onNavigate={handleBreadcrumbNavigate}
            />


            {loading && !currentFolder ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={handleRefresh} />}
                >
                    <FolderHeader />

                    {/* Navigation Buttons */}
                    <View style={styles.contentTitleRow}>
                        <ThemedText type="defaultSemiBold" style={styles.contentTitle}>
                            {i18n.t('folders.section.contents')}
                        </ThemedText>
                    </View>
                    <View>

                        <TouchableOpacity
                            style={[styles.folderItem, { backgroundColor: colors.card, marginBottom: 12 }]}
                            onPress={() => router.push(`/folders/${folderId}/documents`)}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                                <IconSymbol name="doc.fill" size={24} color={colors.primary} />
                            </View>
                            <View style={styles.folderItemInfo}>
                                <ThemedText type="defaultSemiBold" style={styles.folderItemName}>
                                    Belgeler
                                </ThemedText>
                                <ThemedText style={styles.folderDate}>
                                    {attachments.length} belge
                                </ThemedText>
                            </View>
                            <IconSymbol name="chevron.right" size={20} color={colors.gray} />
                        </TouchableOpacity>


                    </View>
                </ScrollView>
            )}

            <ExportFolderModal
                visible={isExportModalVisible}
                onClose={() => setIsExportModalVisible(false)}
                onExport={handleExport}
            />

            {currentFolder && (
                <ShareFolderModal
                    visible={shareModalVisible}
                    onClose={() => {
                        setShareModalVisible(false);
                        loadFolderShares();
                    }}
                    folderId={currentFolder.id}
                    folderName={currentFolder.name}
                />
            )}

            <EditShareModal
                visible={!!selectedShare}
                onClose={() => setSelectedShare(null)}
                share={selectedShare}
                onUpdate={handleUpdateShare}
                onRemove={handleRemoveShare}
            />

            {/* Add Menu Sheet */}
            <FolderAddMenuSheet
                visible={isAddMenuVisible}
                onClose={() => setIsAddMenuVisible(false)}
                onCreateFolder={() => router.push({ pathname: '/folders/create', params: { parentId: folderId } })}
                onCreatePersonnelFile={() => setIsPersonnelModalVisible(true)}
                onImportPress={() => setIsImportModalVisible(true)}
                folderId={folderId}
                isRootLevel={false}
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
                initialFolderId={folderId}
            />

            {/* FAB Button */}
            {(!isSharedFolder || currentFolder?.owner?.id === user?.id) && (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => setIsAddMenuVisible(true)}
                    activeOpacity={0.8}
                >
                    <IconSymbol name="plus" size={28} color={colors.white} />
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );

}
