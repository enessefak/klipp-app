import { Button } from '@/components/form/Button';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AttachmentService } from '@/src/features/attachments/data/AttachmentService';
import { Folder } from '@/src/features/folders/domain/Folder';
import { FolderRepository } from '@/src/features/folders/infrastructure/FolderRepository';
import { FolderAddMenuSheet } from '@/src/features/folders/presentation/components/FolderAddMenuSheet';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { SharingService } from '@/src/features/sharing/data/SharingService';
import I18nLocal from '@/src/infrastructure/localization/i18n';
import { usePicker } from '@/src/infrastructure/picker/PickerContext';
import { getIconDisplay } from '@/src/utils/iconUtils';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FolderPickerScreen() {
    const { colors } = useSettings();
    const router = useRouter();
    const { onFolderSelect } = usePicker();
    const params = useLocalSearchParams<{ selectedId?: string; requiredPermission?: string; moveAttachmentId?: string }>();
    const selectedId = params.selectedId;
    const requiredPermission = params.requiredPermission;
    const moveAttachmentId = params.moveAttachmentId;

    const isMoveMode = !!moveAttachmentId;

    const [folders, setFolders] = useState<Folder[]>([]);
    const [loading, setLoading] = useState(true);
    const [moving, setMoving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    const [isAddMenuVisible, setIsAddMenuVisible] = useState(false);

    const breadcrumbScrollRef = useRef<ScrollView>(null);
    const hasInitializedRef = useRef(false);

    useFocusEffect(
        useCallback(() => {
            loadFolders();
        }, [])
    );

    useEffect(() => {
        if (!loading && folders.length > 0 && selectedId && !hasInitializedRef.current) {
            const selected = folders.find(f => f.id === selectedId);
            if (selected) {
                setCurrentFolderId(isMoveMode ? selected.id : selected.parentId || null);
            }
            hasInitializedRef.current = true;
        }
    }, [loading, folders, selectedId, isMoveMode]);

    useEffect(() => {
        if (breadcrumbScrollRef.current) {
            setTimeout(() => {
                breadcrumbScrollRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [currentFolderId]);

    const checkPermission = (folder: Folder) => {
        if (!requiredPermission) return true;
        if (!folder.permission) return true;

        const levels = ['VIEW', 'EDIT', 'CREATE', 'FULL'];
        const folderLevel = levels.indexOf(folder.permission);
        const requiredLevel = levels.indexOf(requiredPermission);

        return folderLevel >= requiredLevel;
    };

    const loadFolders = async () => {
        setLoading(true);
        const myFolders: Folder[] = [];
        const sharedFolders: any[] = [];

        try {
            const data = await FolderRepository.getFolders({ flat: true });
            if (Array.isArray(data)) {
                myFolders.push(...data);
            }
        } catch (err) {
            console.error('Failed to load folders:', err);
        }

        try {
            const fetchedShared = await SharingService.getSharedWithMe('accepted');
            if (Array.isArray(fetchedShared)) {
                sharedFolders.push(...fetchedShared);
            }
        } catch (err) {
            console.error('Failed to load shared folders:', err);
        }

        const mappedSharedFolders: Folder[] = sharedFolders.map(sf => ({
            id: sf.id,
            name: sf.name,
            icon: sf.icon,
            color: sf.color,
            parentId: undefined,
            createdAt: sf.createdAt,
            isShared: true,
            permission: sf.permission,
            owner: sf.owner ? {
                id: sf.owner.id,
                name: sf.owner.name,
                email: sf.owner.email
            } : undefined
        }));

        setFolders([...myFolders, ...mappedSharedFolders]);
        setLoading(false);
    };

    const currentFolder = useMemo(() =>
        folders.find(f => f.id === currentFolderId),
        [folders, currentFolderId]);

    const breadcrumbs = useMemo(() => {
        const path: Folder[] = [];
        let curr = currentFolder;
        while (curr) {
            path.unshift(curr);
            if (!curr.parentId) break;
            const parentId = curr.parentId;
            curr = folders.find(f => f.id === parentId);
        }
        return path;
    }, [currentFolder, folders]);

    const displayedFolders = useMemo(() => {
        if (searchQuery.trim()) {
            return folders.filter(f =>
                f.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                checkPermission(f)
            );
        }

        return folders
            .filter(f => {
                const isChild = f.parentId === (currentFolderId || undefined) || (currentFolderId === null && !f.parentId);
                return isChild && checkPermission(f);
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [folders, searchQuery, currentFolderId]);

    const handleSelect = (folder: Folder | null) => {
        if (isMoveMode) {
            return;
        }

        onFolderSelect(folder);
        router.back();
    };

    const handleMoveToFolder = async (folder: Folder | null) => {
        if (!moveAttachmentId || !folder) {
            Alert.alert(I18nLocal.t('common.error'), I18nLocal.t('folders.picker.select_folder_error'));
            return;
        }

        setMoving(true);
        try {
            await AttachmentService.updateAttachment(moveAttachmentId, { folderId: folder.id });
            Alert.alert(
                I18nLocal.t('common.success'),
                I18nLocal.t('folders.picker.move_success', { folderName: folder.name }),
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (err) {
            console.error('Move failed:', err);
            Alert.alert(I18nLocal.t('common.error'), I18nLocal.t('folders.picker.move_error'));
        } finally {
            setMoving(false);
        }
    };

    const handleNavigate = (folder: Folder) => {
        setCurrentFolderId(folder.id);
        setSearchQuery('');
    };

    const handleBreadcrumbPress = (folderId: string | null) => {
        setCurrentFolderId(folderId);
    };

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.headerBackground,
        },
        closeButton: {
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
        },
        title: {
            fontSize: 17,
            color: colors.text,
        },
        searchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.inputBackground,
            marginHorizontal: 16,
            marginVertical: 12,
            paddingHorizontal: 12,
            paddingVertical: 12,
            borderRadius: 12,
            gap: 10,
        },
        searchInput: {
            flex: 1,
            fontSize: 16,
            color: colors.text,
            padding: 0,
        },
        breadcrumbContainer: {
            height: 50,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        breadcrumbContent: {
            paddingHorizontal: 16,
            alignItems: 'center',
            flexDirection: 'row',
        },
        breadcrumbItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
        },
        breadcrumbText: {
            fontSize: 14,
            color: colors.primary,
            fontWeight: '500',
        },
        breadcrumbTextActive: {
            color: colors.text,
            fontWeight: '600',
        },
        breadcrumbSeparator: {
            marginHorizontal: 6,
        },
        list: {
            flex: 1,
        },
        item: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.card,
        },
        itemContent: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            flex: 1,
        },
        iconContainer: {
            width: 40,
            height: 40,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
        },
        iconEmoji: {
            fontSize: 20,
        },
        itemText: {
            fontSize: 16,
            color: colors.text,
            flex: 1,
        },
        sharedText: {
            fontSize: 12,
            color: colors.primary,
            marginTop: 2,
        },
        footer: {
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.card,
        },
        emptyContainer: {
            paddingVertical: 60,
            alignItems: 'center',
            gap: 12,
        },
        emptyText: {
            fontSize: 16,
            color: colors.gray,
        },
    }), [colors]);

    const renderBreadcrumbs = () => {
        if (searchQuery) return null;

        return (
            <View style={styles.breadcrumbContainer}>
                <ScrollView
                    ref={breadcrumbScrollRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.breadcrumbContent}
                >
                    <TouchableOpacity
                        onPress={() => handleBreadcrumbPress(null)}
                        style={styles.breadcrumbItem}
                    >
                        <IconSymbol name="house.fill" size={16} color={currentFolderId === null ? colors.text : colors.primary} />
                    </TouchableOpacity>

                    {breadcrumbs.map((folder, index) => (
                        <View key={folder.id} style={styles.breadcrumbItem}>
                            <IconSymbol
                                name="chevron.right"
                                size={12}
                                color={colors.gray}
                                style={styles.breadcrumbSeparator}
                            />
                            <TouchableOpacity onPress={() => handleBreadcrumbPress(folder.id)}>
                                <ThemedText
                                    style={[
                                        styles.breadcrumbText,
                                        index === breadcrumbs.length - 1 && styles.breadcrumbTextActive
                                    ]}
                                >
                                    {folder.name}
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const renderItem = ({ item }: { item: Folder }) => {
        const isSelected = !isMoveMode && selectedId === item.id;

        const handleItemPress = () => {
            if (isMoveMode) {
                handleNavigate(item);
                return;
            }

            if (searchQuery) {
                handleSelect(item);
            } else {
                handleNavigate(item);
            }
        };

        return (
            <TouchableOpacity
                style={styles.item}
                onPress={handleItemPress}
            >
                <View style={styles.itemContent}>
                    <View style={[styles.iconContainer, { backgroundColor: (item.color || '#3B82F6') + '20' }]}>
                        <ThemedText style={styles.iconEmoji}>{getIconDisplay(item.icon)}</ThemedText>
                    </View>
                    <View style={{ flex: 1 }}>
                        <ThemedText style={styles.itemText} numberOfLines={1}>{item.name}</ThemedText>
                        {item.isShared && (
                            <ThemedText style={styles.sharedText}>{I18nLocal.t('folders.picker.shared_badge')}</ThemedText>
                        )}
                    </View>
                </View>

                {searchQuery && !isMoveMode ? (
                    isSelected && <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} />
                ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <IconSymbol name="chevron.right" size={16} color={colors.gray} />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                    <IconSymbol name="xmark" size={22} color={colors.text} />
                </TouchableOpacity>
                <ThemedText type="defaultSemiBold" style={styles.title}>
                    {isMoveMode ? I18nLocal.t('folders.picker.move_title') : I18nLocal.t('folders.picker.modal_title')}
                </ThemedText>
                <TouchableOpacity onPress={() => setIsAddMenuVisible(true)} style={styles.closeButton}>
                    <IconSymbol name="plus" size={22} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <IconSymbol name="magnifyingglass" size={18} color={colors.gray} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={I18nLocal.t('folders.picker.search_placeholder')}
                    placeholderTextColor={colors.gray}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <IconSymbol name="xmark.circle.fill" size={18} color={colors.gray} />
                    </TouchableOpacity>
                )}
            </View>

            {renderBreadcrumbs()}

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={displayedFolders}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={
                        /* Show Ana Dizin option only at root level and not in move/search mode */
                        !isMoveMode && !searchQuery && currentFolderId === null ? (
                            <TouchableOpacity
                                style={[styles.item, { backgroundColor: colors.card }]}
                                onPress={() => handleSelect(null)}
                            >
                                <View style={styles.itemContent}>
                                    <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                                        <IconSymbol name="house.fill" size={20} color={colors.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <ThemedText style={styles.itemText}>
                                            {I18nLocal.t('folders.picker.root_directory', { defaultValue: 'Ana Dizin' })}
                                        </ThemedText>
                                        <ThemedText style={[styles.sharedText, { color: colors.subtext }]}>
                                            {I18nLocal.t('folders.picker.root_directory_desc', { defaultValue: 'Klasörsüz olarak kaydet' })}
                                        </ThemedText>
                                    </View>
                                    <IconSymbol name="checkmark.circle" size={20} color={colors.primary} />
                                </View>
                            </TouchableOpacity>
                        ) : null
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <IconSymbol name="folder" size={48} color={colors.border} />
                            <ThemedText style={styles.emptyText}>
                                {searchQuery ? I18nLocal.t('folders.picker.empty') : I18nLocal.t('folders.empty')}
                            </ThemedText>
                            {!searchQuery && (
                                <Button
                                    title={I18nLocal.t('folders.createFolder')}
                                    onPress={() => setIsAddMenuVisible(true)}
                                    size="medium"
                                    style={{ marginTop: 12 }}
                                />
                            )}
                        </View>
                    }
                    style={styles.list}
                />
            )}

            {!searchQuery && (
                <View style={styles.footer}>
                    <Button
                        title={
                            moving
                                ? I18nLocal.t('common.loading')
                                : isMoveMode
                                    ? (currentFolder
                                        ? `${I18nLocal.t('folders.picker.move_title')}: "${currentFolder.name}"`
                                        : I18nLocal.t('folders.picker.select_folder_error', { defaultValue: 'Bir klasör seçin' }))
                                    : (currentFolder
                                        ? `"${currentFolder.name}" ${I18nLocal.t('common.actions.select', { defaultValue: 'Seç' })}`
                                        : I18nLocal.t('folders.picker.all'))
                        }
                        onPress={() => {
                            if (isMoveMode) {
                                handleMoveToFolder(currentFolder || null);
                            } else {
                                handleSelect(currentFolder || null);
                            }
                        }}
                        disabled={moving || (isMoveMode ? !currentFolder : false)}
                    />
                </View>
            )}

            <FolderAddMenuSheet
                visible={isAddMenuVisible}
                onClose={() => setIsAddMenuVisible(false)}
                onCreateFolder={() => router.push({ pathname: '/folders/create', params: currentFolderId ? { parentId: currentFolderId } : {} })}
                onCreatePersonnelFile={() => { }} // Not implemented in picker context yet
            />
        </SafeAreaView>
    );
}
