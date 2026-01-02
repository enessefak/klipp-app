import { Button } from '@/components/form/Button';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Folder } from '@/src/features/folders/domain/Folder';
import { FolderRepository } from '@/src/features/folders/infrastructure/FolderRepository';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { SharingService } from '@/src/features/sharing/data/SharingService';
import I18nLocal from '@/src/infrastructure/localization/i18n';
import { usePicker } from '@/src/infrastructure/picker/PickerContext';
import { getIconDisplay } from '@/src/utils/iconUtils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
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
    const params = useLocalSearchParams<{ selectedId?: string; requiredPermission?: string }>();
    const selectedId = params.selectedId;
    const requiredPermission = params.requiredPermission;

    const [folders, setFolders] = useState<Folder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
    
    const breadcrumbScrollRef = useRef<ScrollView>(null);
    const hasInitializedRef = useRef(false);

    useEffect(() => {
        loadFolders();
    }, []);

    useEffect(() => {
        if (!loading && folders.length > 0 && selectedId && !hasInitializedRef.current) {
             const selected = folders.find(f => f.id === selectedId);
             if (selected) {
                 setCurrentFolderId(selected.parentId || null);
             }
             hasInitializedRef.current = true;
        }
    }, [loading, folders, selectedId]);

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
            const data = await FolderRepository.getFolders();
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
            curr = folders.find(f => f.id === curr.parentId);
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
        onFolderSelect(folder);
        router.back();
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
        const isSelected = selectedId === item.id;

        return (
            <TouchableOpacity
                style={styles.item}
                onPress={() => searchQuery ? handleSelect(item) : handleNavigate(item)}
            >
                <View style={styles.itemContent}>
                    <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                        <ThemedText style={styles.iconEmoji}>{getIconDisplay(item.icon)}</ThemedText>
                    </View>
                    <View style={{ flex: 1 }}>
                        <ThemedText style={styles.itemText} numberOfLines={1}>{item.name}</ThemedText>
                        {item.isShared && (
                            <ThemedText style={styles.sharedText}>{I18nLocal.t('folders.picker.shared_badge')}</ThemedText>
                        )}
                    </View>
                </View>
                
                {searchQuery ? (
                     isSelected && <IconSymbol name="checkmark" size={20} color={colors.primary} />
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
                <ThemedText type="defaultSemiBold" style={styles.title}>{I18nLocal.t('folders.picker.modal_title')}</ThemedText>
                <View style={styles.closeButton} />
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
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <IconSymbol name="folder" size={48} color={colors.border} />
                            <ThemedText style={styles.emptyText}>
                                {searchQuery ? I18nLocal.t('folders.picker.empty') : I18nLocal.t('folders.empty')}
                            </ThemedText>
                        </View>
                    }
                    style={styles.list}
                />
            )}

            {!searchQuery && (
                <View style={styles.footer}>
                    <Button 
                        title={currentFolder 
                            ? `Select "${currentFolder.name}"`
                            : I18nLocal.t('folders.picker.all')
                        }
                        onPress={() => handleSelect(currentFolder || null)}
                    />
                </View>
            )}
        </SafeAreaView>
    );
}
