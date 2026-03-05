import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { SegmentedControl } from '@/components/SegmentedControl';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/src/features/auth/presentation/useAuth';
import { groupRepository } from '@/src/features/groups/data/GroupRepository';
import { Group } from '@/src/features/groups/domain/Group';
import { useGroups } from '@/src/features/groups/presentation/hooks/useGroups';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import { FolderRepository } from '@/src/features/folders/infrastructure/FolderRepository';
import { Folder } from '@/src/features/folders/domain/Folder';
import { FolderShare, SearchedUser, SharePermission } from '../../domain/FolderShare';
import { useFolderSharing } from '../useFolderSharing';
import { SharingService } from '../../data/SharingService';
import { EditShareModal } from './EditShareModal';

interface ShareFolderModalProps {
    visible: boolean;
    onClose: () => void;
    folderId: string;
    folderName: string;
}

type MainTab = 'persons' | 'groups' | 'settings';

const PERMISSION_OPTIONS: SharePermission[] = ['VIEW', 'EDIT', 'CREATE', 'FULL'];

export function ShareFolderModal({ visible, onClose, folderId, folderName }: ShareFolderModalProps) {
    const { colors } = useSettings();
    const { user: currentUser } = useAuth();
    const { searchUsers, shareFolder, searchResults, loading } = useFolderSharing();
    const { groups, refresh: refreshGroups } = useGroups();
    const router = useRouter();

    // Main navigation
    const [mainTab, setMainTab] = useState<MainTab>('persons');
    const [addingPerson, setAddingPerson] = useState(false);

    // Persons list
    const [folderShares, setFolderShares] = useState<FolderShare[]>([]);
    const [sharesLoading, setSharesLoading] = useState(false);
    const [selectedShare, setSelectedShare] = useState<FolderShare | null>(null);
    const [personFilter, setPersonFilter] = useState('');

    // Add person form
    const [email, setEmail] = useState('');
    const [selectedUser, setSelectedUser] = useState<SearchedUser | null>(null);
    const [searched, setSearched] = useState(false);

    // Shared permission
    const [permission, setPermission] = useState<SharePermission>('VIEW');
    const [sharing, setSharing] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Groups
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

    // Settings
    const [folderData, setFolderData] = useState<Folder | null>(null);
    const [updatingApproval, setUpdatingApproval] = useState(false);
    const [updatingConfidential, setUpdatingConfidential] = useState(false);

    const loadFolderShares = useCallback(async () => {
        try {
            setSharesLoading(true);
            const shares = await SharingService.getFolderShares(folderId);
            setFolderShares(shares);
        } catch {
            // suppress
        } finally {
            setSharesLoading(false);
        }
    }, [folderId]);

    useEffect(() => {
        if (visible) {
            loadFolderShares();
            FolderRepository.getFolderById(folderId).then(setFolderData).catch(() => {});
        }
    }, [visible, folderId]);

    useEffect(() => {
        if (visible && mainTab === 'groups' && groups.length === 0) {
            refreshGroups();
        }
    }, [visible, mainTab]);

    const handleToggleRequiresApproval = async (value: boolean) => {
        if (!folderData) return;
        const prev = folderData.requiresApproval ?? false;
        setFolderData({ ...folderData, requiresApproval: value });
        setUpdatingApproval(true);
        try {
            await FolderRepository.updateFolder(folderId, {
                name: folderData.name,
                icon: folderData.icon || 'folder.fill',
                color: folderData.color || '#4DABF7',
                parentId: folderData.parentId || null,
                requiresApproval: value,
                isConfidential: folderData.isConfidential ?? false,
                allowedTransactionTypes: (folderData.allowedTransactionTypes || []) as any,
                allowedTypeIds: folderData.allowedTypeIds || [],
            });
        } catch {
            setFolderData({ ...folderData, requiresApproval: prev });
        } finally {
            setUpdatingApproval(false);
        }
    };

    const handleToggleIsConfidential = async (value: boolean) => {
        if (!folderData) return;
        const prev = folderData.isConfidential ?? false;
        setFolderData({ ...folderData, isConfidential: value });
        setUpdatingConfidential(true);
        try {
            await FolderRepository.updateFolder(folderId, {
                name: folderData.name,
                icon: folderData.icon || 'folder.fill',
                color: folderData.color || '#4DABF7',
                parentId: folderData.parentId || null,
                requiresApproval: folderData.requiresApproval ?? false,
                isConfidential: value,
                allowedTransactionTypes: (folderData.allowedTransactionTypes || []) as any,
                allowedTypeIds: folderData.allowedTypeIds || [],
            });
        } catch {
            setFolderData({ ...folderData, isConfidential: prev });
        } finally {
            setUpdatingConfidential(false);
        }
    };

    const resetAddPersonForm = () => {
        setEmail('');
        setSelectedUser(null);
        setPermission('VIEW');
        setErrorMsg(null);
        setSearched(false);
    };

    const handleClose = () => {
        setMainTab('persons');
        setAddingPerson(false);
        setSelectedGroup(null);
        setPersonFilter('');
        resetAddPersonForm();
        setFolderData(null);
        setFolderShares([]);
        onClose();
    };

    const handleUpdateShare = async (shareId: string, perm: FolderShare['permission']) => {
        await SharingService.updateSharePermission(shareId, perm);
        await loadFolderShares();
    };

    const handleRemoveShare = async (shareId: string) => {
        try {
            await SharingService.removeShare(shareId);
        } catch {
            Alert.alert(i18n.t('common.error'), i18n.t('folders.sharing.actions.remove_error'));
        } finally {
            await loadFolderShares();
        }
    };

    const handleSharePerson = async () => {
        if (!selectedUser) return;
        setSharing(true);
        setErrorMsg(null);
        const result = await shareFolder({ folderId, targetUserId: selectedUser.id, permission });
        setSharing(false);
        if (result) {
            await loadFolderShares();
            setAddingPerson(false);
            resetAddPersonForm();
        } else {
            setErrorMsg(i18n.t('sharing.modal.error_generic'));
        }
    };

    const handleShareGroup = async () => {
        if (!selectedGroup) return;
        setSharing(true);
        setErrorMsg(null);
        try {
            const detailedGroup = await groupRepository.getGroupDetails(selectedGroup.id);
            if (!detailedGroup.members || detailedGroup.members.length === 0) {
                setErrorMsg(i18n.t('sharing.modal.error_no_members'));
                setSharing(false);
                return;
            }
            const alreadySharedIds = new Set(folderShares.map(s => s.sharedWith.id));
            const membersWithUserId = detailedGroup.members.filter(m => !!m.userId);
            const othersOnly = membersWithUserId.filter(m => m.userId !== currentUser?.id);
            const eligibleMembers = othersOnly.filter(m => !alreadySharedIds.has(m.userId!));
            if (eligibleMembers.length === 0) {
                if (othersOnly.length === 0) {
                    setErrorMsg(i18n.t('sharing.modal.error_only_self_in_group'));
                } else {
                    setErrorMsg(i18n.t('sharing.modal.error_no_eligible_members'));
                }
                setSharing(false);
                return;
            }
            const promises = eligibleMembers
                .map(m => shareFolder({ folderId, targetUserId: m.userId!, permission }));
            const results = await Promise.all(promises);
            const successCount = results.filter(Boolean).length;
            setSharing(false);
            if (successCount > 0) {
                await loadFolderShares();
                setSelectedGroup(null);
                setPermission('VIEW');
            } else {
                setErrorMsg(i18n.t('sharing.modal.error_group_share_failed', { count: results.length }));
            }
        } catch {
            setSharing(false);
            setErrorMsg(i18n.t('sharing.modal.error_generic'));
        }
    };

    const permissionColor = (perm: SharePermission) => {
        if (perm === 'EDIT') return colors.success;
        if (perm === 'CREATE') return colors.warning;
        if (perm === 'FULL') return colors.error;
        return colors.primary;
    };

    const permissionLabel = (perm: SharePermission) => {
        if (perm === 'EDIT') return i18n.t('folders.sharing.roles.editor');
        if (perm === 'CREATE') return i18n.t('folders.sharing.roles.create');
        if (perm === 'FULL') return i18n.t('folders.sharing.roles.full');
        return i18n.t('folders.sharing.roles.viewer');
    };

    const permissionIcon = (perm: SharePermission) => {
        if (perm === 'EDIT') return 'pencil';
        if (perm === 'CREATE') return 'plus.circle.fill';
        if (perm === 'FULL') return 'star.circle.fill';
        return 'eye.fill';
    };

    const styles = useMemo(() => StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.headerBackground,
        },
        cancelButton: { color: colors.primary, fontSize: 16 },
        title: { fontSize: 17, color: colors.text },
        folderInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            backgroundColor: colors.card,
            gap: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.cardBorder,
        },
        folderName: { fontSize: 18, color: colors.text },
        tabContainer: { paddingHorizontal: 16, paddingVertical: 12 },
        // Share items list
        shareItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 14,
            backgroundColor: colors.card,
            borderRadius: 12,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            gap: 12,
        },
        avatar: {
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
        },
        avatarText: { color: colors.white, fontSize: 16, fontWeight: '600' },
        shareInfo: { flex: 1 },
        shareName: { fontSize: 14, color: colors.text },
        shareEmail: { fontSize: 12, color: colors.gray, marginTop: 2 },
        permBadge: {
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
        },
        pendingBadge: {
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 6,
            backgroundColor: colors.warning + '20',
            marginTop: 4,
        },
        pendingText: { fontSize: 11, color: colors.warning },
        addButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 14,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: colors.primary,
            borderStyle: 'dashed',
            gap: 8,
            marginTop: 4,
        },
        addButtonText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
        // Add person
        backRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingBottom: 12,
            gap: 6,
        },
        backText: { color: colors.primary, fontSize: 15 },
        searchContainer: { paddingHorizontal: 16, marginBottom: 8 },
        searchRow: { flexDirection: 'row', gap: 8 },
        searchButton: {
            backgroundColor: colors.primary,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            minWidth: 60,
        },
        searchButtonText: { color: colors.white, fontWeight: '600', fontSize: 14 },
        hint: { fontSize: 12, color: colors.gray, marginTop: 6 },
        inputWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.inputBackground,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: colors.border,
            gap: 8,
        },
        input: { flex: 1, fontSize: 16, color: colors.text },
        resultsList: {
            maxHeight: 180,
            marginHorizontal: 16,
            backgroundColor: colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            marginBottom: 8,
        },
        userItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            gap: 12,
        },
        selectedUserContainer: { paddingHorizontal: 16, marginBottom: 12 },
        selectedUser: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            backgroundColor: colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            gap: 12,
        },
        noResultContainer: {
            alignItems: 'center',
            paddingVertical: 20,
            paddingHorizontal: 16,
        },
        noResultText: { color: colors.gray, marginTop: 8, textAlign: 'center' },
        // Permission selector
        permissionSection: { paddingHorizontal: 16 },
        permissionSectionLabel: { fontSize: 14, color: colors.text, marginBottom: 10, fontWeight: '600' },
        permissionOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
        permissionOption: {
            width: '48%',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 12,
            backgroundColor: colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            gap: 6,
        },
        permissionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
        permissionText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
        permissionTextSelected: { color: colors.white },
        // Groups
        groupItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 14,
            backgroundColor: colors.card,
            borderRadius: 12,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            gap: 12,
        },
        groupItemSelected: {
            backgroundColor: colors.primary + '10',
            borderColor: colors.primary,
        },
        groupAvatar: {
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            justifyContent: 'center',
            alignItems: 'center',
        },
        // Settings
        settingRow: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            backgroundColor: colors.card,
            borderBottomWidth: 1,
            borderBottomColor: colors.cardBorder,
            gap: 12,
        },
        settingInfo: { flex: 1 },
        settingTitle: { fontSize: 15, color: colors.text, fontWeight: '600' },
        settingDesc: { fontSize: 12, color: colors.textLight, marginTop: 3 },
        // Footer
        footer: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 16,
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        shareButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primary,
            paddingVertical: 16,
            borderRadius: 12,
            gap: 8,
        },
        shareButtonDisabled: { backgroundColor: colors.gray },
        shareButtonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
        errorText: {
            color: colors.error,
            textAlign: 'center',
            marginTop: 8,
            paddingHorizontal: 16,
        },
        emptyState: { alignItems: 'center', paddingVertical: 32 },
        emptyText: { color: colors.gray, marginTop: 8, textAlign: 'center' },
        emptySubText: { color: colors.gray, marginTop: 6, textAlign: 'center', fontSize: 13, paddingHorizontal: 24 },
        // Filter bar
        filterBar: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.inputBackground,
            borderRadius: 10,
            paddingHorizontal: 12,
            paddingVertical: 9,
            borderWidth: 1,
            borderColor: colors.border,
            gap: 8,
            marginBottom: 12,
        },
        filterInput: { flex: 1, fontSize: 15, color: colors.text },
        // Persons count label
        countLabel: { fontSize: 12, color: colors.gray, marginBottom: 10 },
        // Group section header
        sectionHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        addGroupButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: colors.primary + '15',
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 8,
        },
        addGroupButtonText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
    }), [colors]);

    const renderPermissionPicker = () => (
        <View style={styles.permissionSection}>
            <ThemedText style={styles.permissionSectionLabel}>
                {i18n.t('sharing.modal.permission_level')}
            </ThemedText>
            <View style={styles.permissionOptions}>
                {PERMISSION_OPTIONS.map((perm) => (
                    <TouchableOpacity
                        key={perm}
                        style={[styles.permissionOption, permission === perm && styles.permissionSelected]}
                        onPress={() => setPermission(perm)}
                    >
                        <IconSymbol
                            name={permissionIcon(perm) as any}
                            size={18}
                            color={permission === perm ? colors.white : colors.primary}
                        />
                        <ThemedText style={[styles.permissionText, permission === perm && styles.permissionTextSelected]}>
                            {permissionLabel(perm)}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderPersonsList = () => {
        const filtered = personFilter.trim()
            ? folderShares.filter(s =>
                s.sharedWith.name.toLowerCase().includes(personFilter.toLowerCase()) ||
                s.sharedWith.email.toLowerCase().includes(personFilter.toLowerCase())
              )
            : folderShares;

        return (
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
                {sharesLoading ? (
                    <ActivityIndicator color={colors.primary} style={{ paddingVertical: 32 }} />
                ) : (
                    <>
                        {/* Filter bar — show when 4+ shares */}
                        {folderShares.length >= 4 && (
                            <View style={styles.filterBar}>
                                <IconSymbol name="magnifyingglass" size={16} color={colors.gray} />
                                <TextInput
                                    style={styles.filterInput}
                                    placeholder={i18n.t('sharing.modal.filter_persons')}
                                    placeholderTextColor={colors.gray}
                                    value={personFilter}
                                    onChangeText={setPersonFilter}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    clearButtonMode="while-editing"
                                />
                            </View>
                        )}

                        {folderShares.length === 0 ? (
                            <View style={styles.emptyState}>
                                <IconSymbol name="person.2.fill" size={44} color={colors.border} />
                                <ThemedText style={styles.emptyText}>{i18n.t('folders.sharing.empty')}</ThemedText>
                            </View>
                        ) : filtered.length === 0 ? (
                            <View style={styles.emptyState}>
                                <IconSymbol name="magnifyingglass" size={40} color={colors.gray} />
                                <ThemedText style={styles.emptyText}>{i18n.t('sharing.modal.no_result')}</ThemedText>
                            </View>
                        ) : (
                            <>
                                {folderShares.length >= 4 && (
                                    <ThemedText style={styles.countLabel}>
                                        {filtered.length} / {folderShares.length} kişi
                                    </ThemedText>
                                )}
                                {filtered.map((share) => (
                                    <TouchableOpacity
                                        key={share.id}
                                        style={styles.shareItem}
                                        onPress={() => setSelectedShare(share)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.avatar, { backgroundColor: permissionColor(share.permission) + '30' }]}>
                                            <ThemedText style={[styles.avatarText, { color: permissionColor(share.permission) }]}>
                                                {share.sharedWith.name.charAt(0).toUpperCase()}
                                            </ThemedText>
                                        </View>
                                        <View style={styles.shareInfo}>
                                            <ThemedText type="defaultSemiBold" style={styles.shareName}>
                                                {share.sharedWith.name}
                                            </ThemedText>
                                            <ThemedText style={styles.shareEmail}>{share.sharedWith.email}</ThemedText>
                                        </View>
                                        <View style={{ alignItems: 'flex-end', gap: 4 }}>
                                            <View style={[styles.permBadge, { backgroundColor: permissionColor(share.permission) + '20' }]}>
                                                <ThemedText style={{ fontSize: 11, color: permissionColor(share.permission), fontWeight: '600' }}>
                                                    {permissionLabel(share.permission)}
                                                </ThemedText>
                                            </View>
                                            {share.status === 'pending' && (
                                                <View style={styles.pendingBadge}>
                                                    <ThemedText style={styles.pendingText}>{i18n.t('folders.sharing.status.pending')}</ThemedText>
                                                </View>
                                            )}
                                        </View>
                                        <IconSymbol name="chevron.right" size={15} color={colors.gray} />
                                    </TouchableOpacity>
                                ))}
                            </>
                        )}

                        <TouchableOpacity style={styles.addButton} onPress={() => setAddingPerson(true)}>
                            <IconSymbol name="plus.circle.fill" size={20} color={colors.primary} />
                            <ThemedText style={styles.addButtonText}>{i18n.t('folders.sharing.add_person')}</ThemedText>
                        </TouchableOpacity>
                    </>
                )}
            </ScrollView>
        );
    };

    const renderAddPerson = () => (
        <ScrollView
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 120 }}
            keyboardShouldPersistTaps="handled"
        >
            {/* Back row */}
            <TouchableOpacity
                style={styles.backRow}
                onPress={() => { setAddingPerson(false); resetAddPersonForm(); }}
            >
                <IconSymbol name="chevron.left" size={18} color={colors.primary} />
                <ThemedText style={styles.backText}>{i18n.t('sharing.modal.back_to_persons')}</ThemedText>
            </TouchableOpacity>

            {/* Search */}
            <View style={styles.searchContainer}>
                <ThemedText type="defaultSemiBold" style={{ fontSize: 14, color: colors.text, marginBottom: 8 }}>
                    {i18n.t('sharing.modal.search_title')}
                </ThemedText>
                <View style={styles.searchRow}>
                    <View style={[styles.inputWrapper, { flex: 1 }]}>
                        <IconSymbol name="magnifyingglass" size={20} color={colors.gray} />
                        <TextInput
                            style={styles.input}
                            placeholder={i18n.t('sharing.modal.search_placeholder')}
                            placeholderTextColor={colors.gray}
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                setSelectedUser(null);
                                setErrorMsg(null);
                                setSearched(false);
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            onSubmitEditing={() => {
                                if (!email.includes('@')) { setErrorMsg(i18n.t('sharing.modal.error_email')); return; }
                                setSearched(true);
                                searchUsers(email);
                            }}
                            returnKeyType="search"
                        />
                    </View>
                    <TouchableOpacity
                        style={styles.searchButton}
                        onPress={() => {
                            if (!email.includes('@')) { setErrorMsg(i18n.t('sharing.modal.error_email')); return; }
                            setSearched(true);
                            searchUsers(email);
                        }}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color={colors.white} />
                        ) : (
                            <ThemedText style={styles.searchButtonText}>{i18n.t('sharing.modal.search_button')}</ThemedText>
                        )}
                    </TouchableOpacity>
                </View>
                <ThemedText style={styles.hint}>{i18n.t('sharing.modal.search_hint')}</ThemedText>
            </View>

            {/* No results */}
            {searched && !loading && searchResults.length === 0 && (
                <View style={styles.noResultContainer}>
                    <IconSymbol name="person.slash.fill" size={40} color={colors.gray} />
                    <ThemedText style={styles.noResultText}>{i18n.t('sharing.modal.no_result')}</ThemedText>
                </View>
            )}

            {/* Results */}
            {!selectedUser && searchResults.length > 0 && (
                <FlatList
                    data={searchResults}
                    keyExtractor={(item) => item.id}
                    style={styles.resultsList}
                    scrollEnabled={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.userItem} onPress={() => { setSelectedUser(item); setEmail(item.email); setErrorMsg(null); }}>
                            <View style={styles.avatar}>
                                <ThemedText style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</ThemedText>
                            </View>
                            <View style={{ flex: 1 }}>
                                <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                                <ThemedText style={{ fontSize: 13, color: colors.gray }}>{item.email}</ThemedText>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}

            {/* Selected user */}
            {selectedUser && (
                <View style={styles.selectedUserContainer}>
                    <View style={styles.selectedUser}>
                        <View style={styles.avatar}>
                            <ThemedText style={styles.avatarText}>{selectedUser.name.charAt(0).toUpperCase()}</ThemedText>
                        </View>
                        <View style={{ flex: 1 }}>
                            <ThemedText type="defaultSemiBold">{selectedUser.name}</ThemedText>
                            <ThemedText style={{ fontSize: 13, color: colors.gray }}>{selectedUser.email}</ThemedText>
                        </View>
                        <TouchableOpacity onPress={() => setSelectedUser(null)}>
                            <IconSymbol name="xmark.circle.fill" size={24} color={colors.gray} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Permission picker - shown when user selected */}
            {selectedUser && renderPermissionPicker()}

            {errorMsg && <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>}
        </ScrollView>
    );

    const renderGroupsTab = () => (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
            {/* Section header with "Grup Ekle" */}
            <View style={styles.sectionHeader}>
                <ThemedText type="defaultSemiBold" style={{ fontSize: 14, color: colors.text }}>
                    {i18n.t('sharing.modal.select_group')}
                </ThemedText>
                <TouchableOpacity
                    style={styles.addGroupButton}
                    onPress={() => { handleClose(); router.push('/groups'); }}
                >
                    <IconSymbol name="plus" size={14} color={colors.primary} />
                    <ThemedText style={styles.addGroupButtonText}>{i18n.t('sharing.modal.add_group')}</ThemedText>
                </TouchableOpacity>
            </View>

            {groups.length === 0 ? (
                <View style={[styles.emptyState, { paddingVertical: 40 }]}>
                    <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary + '12', justifyContent: 'center', alignItems: 'center', marginBottom: 4 }}>
                        <IconSymbol name="person.3.fill" size={36} color={colors.primary} />
                    </View>
                    <ThemedText style={[styles.emptyText, { fontWeight: '600', color: colors.text }]}>
                        {i18n.t('sharing.modal.no_groups')}
                    </ThemedText>
                    <ThemedText style={styles.emptySubText}>
                        {i18n.t('sharing.modal.no_groups_cta')}
                    </ThemedText>
                    <TouchableOpacity
                        style={[styles.addGroupButton, { marginTop: 20, paddingHorizontal: 20, paddingVertical: 12 }]}
                        onPress={() => { handleClose(); router.push('/groups'); }}
                    >
                        <IconSymbol name="plus" size={16} color={colors.primary} />
                        <ThemedText style={[styles.addGroupButtonText, { fontSize: 15 }]}>{i18n.t('sharing.modal.add_group')}</ThemedText>
                    </TouchableOpacity>
                </View>
            ) : (
                groups.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[styles.groupItem, selectedGroup?.id === item.id && styles.groupItemSelected]}
                        onPress={() => { setSelectedGroup(selectedGroup?.id === item.id ? null : item); setErrorMsg(null); }}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.groupAvatar, selectedGroup?.id === item.id && { backgroundColor: colors.primary + '20', borderColor: colors.primary }]}>
                            <IconSymbol name="person.3.fill" size={20} color={selectedGroup?.id === item.id ? colors.primary : colors.textLight} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                            <ThemedText style={{ fontSize: 12, color: colors.gray, marginTop: 2 }}>
                                {item.memberCount} {i18n.t('sharing.modal.member_count')}
                            </ThemedText>
                        </View>
                        {selectedGroup?.id === item.id
                            ? <IconSymbol name="checkmark.circle.fill" size={24} color={colors.primary} />
                            : <IconSymbol name="circle" size={22} color={colors.border} />
                        }
                    </TouchableOpacity>
                ))
            )}

            {/* Permission picker - shown when group selected */}
            {selectedGroup && (
                <View style={{ marginTop: 16 }}>
                    {renderPermissionPicker()}
                </View>
            )}

            {errorMsg && <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>}
        </ScrollView>
    );

    const renderSettingsTab = () => (
        <View>
            <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                    <ThemedText style={styles.settingTitle}>
                        {i18n.t('folders.settings.requires_approval')}
                    </ThemedText>
                    <ThemedText style={styles.settingDesc}>
                        {i18n.t('folders.settings.requires_approval_desc')}
                    </ThemedText>
                </View>
                <Switch
                    value={folderData?.requiresApproval ?? false}
                    disabled={updatingApproval || !folderData}
                    onValueChange={handleToggleRequiresApproval}
                    trackColor={{ false: colors.border, true: colors.primary }}
                />
            </View>
            <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                    <ThemedText style={styles.settingTitle}>
                        {i18n.t('folders.settings.is_confidential')}
                    </ThemedText>
                    <ThemedText style={styles.settingDesc}>
                        {i18n.t('folders.settings.is_confidential_desc')}
                    </ThemedText>
                </View>
                <Switch
                    value={folderData?.isConfidential ?? false}
                    disabled={updatingConfidential || !folderData}
                    onValueChange={handleToggleIsConfidential}
                    trackColor={{ false: colors.border, true: colors.primary }}
                />
            </View>
        </View>
    );

    const showFooterButton =
        (mainTab === 'persons' && addingPerson && !!selectedUser) ||
        (mainTab === 'groups' && !!selectedGroup);

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <SafeAreaView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose}>
                        <ThemedText style={styles.cancelButton}>{i18n.t('sharing.modal.cancel')}</ThemedText>
                    </TouchableOpacity>
                    <ThemedText type="defaultSemiBold" style={styles.title}>{i18n.t('sharing.modal.title')}</ThemedText>
                    <View style={{ width: 50 }} />
                </View>

                {/* Folder Info */}
                <View style={styles.folderInfo}>
                    <IconSymbol name="folder.fill" size={32} color={colors.primary} />
                    <ThemedText type="defaultSemiBold" style={styles.folderName}>{folderName}</ThemedText>
                </View>

                {/* 3-tab control — hidden when adding person */}
                {!addingPerson && (
                    <View style={styles.tabContainer}>
                        <SegmentedControl
                            segments={[
                                { key: 'persons', label: `${i18n.t('sharing.modal.tab_persons')}${folderShares.length > 0 ? ` (${folderShares.length})` : ''}` },
                                { key: 'groups', label: i18n.t('sharing.modal.tab_groups') },
                                { key: 'settings', label: i18n.t('sharing.modal.tab_settings') },
                            ]}
                            selectedKey={mainTab}
                            onSelect={(key) => { setMainTab(key as MainTab); setErrorMsg(null); setSelectedGroup(null); setPersonFilter(''); }}
                        />
                    </View>
                )}

                {/* Tab content */}
                <View style={{ flex: 1 }}>
                    {mainTab === 'persons' && !addingPerson && renderPersonsList()}
                    {mainTab === 'persons' && addingPerson && renderAddPerson()}
                    {mainTab === 'groups' && renderGroupsTab()}
                    {mainTab === 'settings' && renderSettingsTab()}
                </View>

                {/* Footer share button */}
                {showFooterButton && (
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.shareButton, sharing && styles.shareButtonDisabled]}
                            onPress={mainTab === 'persons' ? handleSharePerson : handleShareGroup}
                            disabled={sharing}
                        >
                            {sharing ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <>
                                    <IconSymbol name="paperplane.fill" size={20} color={colors.white} />
                                    <ThemedText style={styles.shareButtonText}>{i18n.t('sharing.modal.share_button')}</ThemedText>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                {/* Edit Share bottom sheet */}
                <EditShareModal
                    visible={!!selectedShare}
                    onClose={() => setSelectedShare(null)}
                    share={selectedShare}
                    onUpdate={handleUpdateShare}
                    onRemove={handleRemoveShare}
                />
            </SafeAreaView>
        </Modal>
    );
}
