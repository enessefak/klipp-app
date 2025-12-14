import { ThemedText } from '@/components/themed-text';
import { Folder } from '@/src/features/folders/domain/Folder';
import { FolderRepository } from '@/src/features/folders/infrastructure/FolderRepository';
import i18n from '@/src/infrastructure/localization/i18n';
import { Colors } from '@/src/infrastructure/theme/Colors';
import { getIconDisplay } from '@/src/utils/iconUtils';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface FolderPickerProps {
    label: string;
    value: string;
    onChange: (folderId: string) => void;
    placeholder?: string;
}

interface FolderWithPath extends Folder {
    path: string;
    level: number;
}

export function FolderPicker({ label, value, onChange, placeholder = 'Klasör seçin' }: FolderPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [allFolders, setAllFolders] = useState<Folder[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentParentId, setCurrentParentId] = useState<string | null>(null);
    const [navigationStack, setNavigationStack] = useState<Array<{ id: string | null; name: string }>>([]);

    // Load all folders when modal opens
    useEffect(() => {
        if (isOpen) {
            loadFolders();
        }
    }, [isOpen]);

    const loadFolders = async () => {
        setLoading(true);
        try {
            const folders = await FolderRepository.getFolders();
            setAllFolders(folders);
        } catch (error) {
            console.error('Failed to load folders:', error);
        } finally {
            setLoading(false);
        }
    };

    // Build folder tree with paths
    const buildFolderTree = (folders: Folder[]): FolderWithPath[] => {
        const result: FolderWithPath[] = [];
        const folderMap = new Map<string, Folder>();

        folders.forEach(f => folderMap.set(f.id, f));

        const getPath = (folder: Folder, level: number = 0): string => {
            if (!folder.parentId) return folder.name;
            const parent = folderMap.get(folder.parentId);
            if (!parent) return folder.name;
            return `${getPath(parent, level + 1)} / ${folder.name}`;
        };

        const getLevel = (folder: Folder): number => {
            if (!folder.parentId) return 0;
            const parent = folderMap.get(folder.parentId);
            if (!parent) return 0;
            return getLevel(parent) + 1;
        };

        folders.forEach(folder => {
            result.push({
                ...folder,
                path: getPath(folder),
                level: getLevel(folder),
            });
        });

        return result;
    };

    // Get current level folders or search results
    const displayFolders = useMemo(() => {
        const foldersWithPath = buildFolderTree(allFolders);

        if (searchQuery.trim()) {
            // Search mode - show all matching folders with full path
            return foldersWithPath.filter(f =>
                f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                f.path.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Navigation mode - show folders at current level
        return foldersWithPath.filter(f =>
            currentParentId ? f.parentId === currentParentId : !f.parentId
        );
    }, [allFolders, searchQuery, currentParentId]);

    // Get children count for a folder
    const getChildrenCount = (folderId: string) => {
        return allFolders.filter(f => f.parentId === folderId).length;
    };

    // Get selected folder info
    const selectedFolder = useMemo(() => {
        if (!value) return null;
        const foldersWithPath = buildFolderTree(allFolders);
        return foldersWithPath.find(f => f.id === value);
    }, [value, allFolders]);

    // Navigate into a folder
    const navigateToFolder = (folder: Folder) => {
        setNavigationStack(prev => [...prev, { id: currentParentId, name: currentParentId ? allFolders.find(f => f.id === currentParentId)?.name || '' : i18n.t('folders.picker.root') }]);
        setCurrentParentId(folder.id);
        setSearchQuery('');
    };

    // Navigate back
    const navigateBack = () => {
        const newStack = [...navigationStack];
        const previous = newStack.pop();
        setNavigationStack(newStack);
        setCurrentParentId(previous?.id || null);
    };

    // Select folder and close
    const selectFolder = (folder: Folder) => {
        onChange(folder.id);
        setIsOpen(false);
        setSearchQuery('');
        setCurrentParentId(null);
        setNavigationStack([]);
    };

    // Reset and close
    const handleClose = () => {
        setIsOpen(false);
        setSearchQuery('');
        setCurrentParentId(null);
        setNavigationStack([]);
    };

    // Get current folder name for breadcrumb
    const currentFolderName = useMemo(() => {
        if (currentParentId) {
            return allFolders.find(f => f.id === currentParentId)?.name || '';
        }
        return i18n.t('folders.picker.root');
    }, [currentParentId, allFolders]);

    return (
        <View style={styles.container}>
            <ThemedText style={styles.label}>{label}</ThemedText>

            <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setIsOpen(true)}
            >
                <View style={styles.selectContent}>
                    {selectedFolder ? (
                        <>
                            <View style={[styles.folderIconSmall, { backgroundColor: selectedFolder.color + '20' }]}>
                                <ThemedText style={styles.folderIconTextSmall}>
                                    {getIconDisplay(selectedFolder.icon)}
                                </ThemedText>
                            </View>
                            <View style={styles.selectedTextContainer}>
                                <ThemedText style={styles.selectText} numberOfLines={1}>
                                    {selectedFolder.name}
                                </ThemedText>
                                {selectedFolder.level > 0 && (
                                    <ThemedText style={styles.pathText} numberOfLines={1}>
                                        {selectedFolder.path}
                                    </ThemedText>
                                )}
                            </View>
                        </>
                    ) : (
                        <ThemedText style={styles.placeholder}>{placeholder}</ThemedText>
                    )}
                </View>
                <ThemedText style={styles.arrow}>▼</ThemedText>
            </TouchableOpacity>

            <Modal
                visible={isOpen}
                transparent
                animationType="slide"
                onRequestClose={handleClose}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={handleClose}
                >
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <ThemedText type="subtitle" style={styles.modalTitle}>
                                {i18n.t('folders.picker.modal_title')}
                            </ThemedText>
                            <TouchableOpacity onPress={handleClose}>
                                <ThemedText style={styles.closeButton}>✕</ThemedText>
                            </TouchableOpacity>
                        </View>

                        {/* Search Bar */}
                        <View style={styles.searchContainer}>
                            <ThemedText style={styles.searchIcon}>🔍</ThemedText>
                            <TextInput
                                style={styles.searchInput}
                                placeholder={i18n.t('folders.picker.search_placeholder')}
                                placeholderTextColor={Colors.gray}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <ThemedText style={styles.clearSearch}>✕</ThemedText>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Breadcrumb / Navigation */}
                        {!searchQuery && (
                            <View style={styles.breadcrumb}>
                                {navigationStack.length > 0 && (
                                    <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
                                        <ThemedText style={styles.backButtonText}>{i18n.t('folders.picker.back')}</ThemedText>
                                    </TouchableOpacity>
                                )}
                                <ThemedText style={styles.breadcrumbText} numberOfLines={1}>
                                    📁 {currentFolderName}
                                </ThemedText>
                            </View>
                        )}

                        {/* Folder List */}
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={Colors.primary} />
                            </View>
                        ) : (
                            <ScrollView style={styles.folderList}>
                                {displayFolders.length === 0 ? (
                                    <View style={styles.emptyContainer}>
                                        <ThemedText style={styles.emptyText}>
                                            {searchQuery ? i18n.t('folders.picker.empty_search') : i18n.t('folders.picker.empty_folder')}
                                        </ThemedText>
                                    </View>
                                ) : (
                                    displayFolders.map((folder) => {
                                        const childrenCount = getChildrenCount(folder.id);
                                        const isSelected = folder.id === value;

                                        return (
                                            <View key={folder.id} style={styles.folderItemContainer}>
                                                <TouchableOpacity
                                                    style={[
                                                        styles.folderItem,
                                                        isSelected && styles.folderItemSelected
                                                    ]}
                                                    onPress={() => selectFolder(folder)}
                                                >
                                                    <View style={[styles.folderIcon, { backgroundColor: folder.color + '20' }]}>
                                                        <ThemedText style={styles.folderIconText}>
                                                            {getIconDisplay(folder.icon)}
                                                        </ThemedText>
                                                    </View>
                                                    <View style={styles.folderInfo}>
                                                        <ThemedText style={[
                                                            styles.folderName,
                                                            isSelected && styles.folderNameSelected
                                                        ]}>
                                                            {folder.name}
                                                        </ThemedText>
                                                        {folder.isShared && (
                                                            <View style={styles.sharedBadge}>
                                                                <ThemedText style={styles.sharedText}>{i18n.t('folders.picker.shared')}</ThemedText>
                                                            </View>
                                                        )}
                                                        {searchQuery && folder.level > 0 && (
                                                            <ThemedText style={styles.folderPath} numberOfLines={1}>
                                                                {folder.path}
                                                            </ThemedText>
                                                        )}
                                                    </View>
                                                    {isSelected && (
                                                        <ThemedText style={styles.checkmark}>✓</ThemedText>
                                                    )}
                                                </TouchableOpacity>

                                                {/* Navigate button if has children */}
                                                {childrenCount > 0 && !searchQuery && (
                                                    <TouchableOpacity
                                                        style={styles.navigateButton}
                                                        onPress={() => navigateToFolder(folder)}
                                                    >
                                                        <ThemedText style={styles.childrenCount}>
                                                            {childrenCount}
                                                        </ThemedText>
                                                        <ThemedText style={styles.navigateArrow}>›</ThemedText>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        );
                                    })
                                )}
                            </ScrollView>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 0,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: Colors.text,
    },
    selectButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    selectContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    folderIconSmall: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    folderIconTextSmall: {
        fontSize: 16,
    },
    selectedTextContainer: {
        flex: 1,
    },
    selectText: {
        fontSize: 16,
        color: Colors.text,
    },
    pathText: {
        fontSize: 12,
        color: Colors.gray,
        marginTop: 2,
    },
    placeholder: {
        fontSize: 16,
        color: Colors.gray,
    },
    arrow: {
        fontSize: 12,
        color: Colors.gray,
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: Colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '85%',
        paddingBottom: 34,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    closeButton: {
        fontSize: 24,
        color: Colors.gray,
        padding: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 12,
        margin: 16,
        marginBottom: 8,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    searchIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: Colors.text,
    },
    clearSearch: {
        fontSize: 16,
        color: Colors.gray,
        padding: 4,
    },
    breadcrumb: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: Colors.surface,
    },
    backButton: {
        marginRight: 12,
        padding: 4,
    },
    backButtonText: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    breadcrumbText: {
        flex: 1,
        fontSize: 14,
        color: Colors.textLight,
    },
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    folderList: {
        padding: 8,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.gray,
        fontSize: 14,
    },
    folderItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    folderItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        backgroundColor: Colors.white,
    },
    folderItemSelected: {
        backgroundColor: Colors.primary + '15',
    },
    folderIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    folderIconText: {
        fontSize: 22,
    },
    folderInfo: {
        flex: 1,
    },
    folderName: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.text,
    },
    folderNameSelected: {
        color: Colors.primary,
        fontWeight: '600',
    },
    folderPath: {
        fontSize: 12,
        color: Colors.gray,
        marginTop: 2,
    },
    checkmark: {
        fontSize: 20,
        color: Colors.primary,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    navigateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginLeft: 8,
        backgroundColor: Colors.primary + '15',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.primary + '30',
    },
    childrenCount: {
        fontSize: 13,
        color: Colors.primary,
        fontWeight: '600',
        marginRight: 6,
    },
    navigateArrow: {
        fontSize: 20,
        color: Colors.primary,
        fontWeight: 'bold',
    },
    sharedBadge: {
        backgroundColor: Colors.primary + '20',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    sharedText: {
        fontSize: 10,
        color: Colors.primary,
        fontWeight: '600',
    },
});
