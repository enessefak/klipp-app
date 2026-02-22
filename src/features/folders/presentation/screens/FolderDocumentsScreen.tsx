import { SearchBar } from '@/components/SearchBar';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AttachmentService } from '@/src/features/attachments/data/AttachmentService';
import { Attachment, AttachmentFilters } from '@/src/features/attachments/domain/Attachment';
import { AttachmentCard } from '@/src/features/attachments/presentation/components/AttachmentCard';
import { FolderFilterBottomSheet } from '@/src/features/folders/presentation/components/FolderFilterBottomSheet';
import { useFolders } from '@/src/features/folders/presentation/useFolders';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import { usePicker } from '@/src/infrastructure/picker/PickerContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Folder } from '../../domain/Folder';
import { FolderFilters } from '../../domain/FolderFilters';
import { FolderRepository } from '../../infrastructure/FolderRepository';

export function FolderDocumentsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors } = useSettings();

    const isRoot = id === 'root';
    const folderIdForFetch = isRoot ? undefined : id;

    const [currentFolder, setCurrentFolder] = useState<Folder | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [filters, setFilters] = useState<AttachmentFilters>({ folderId: folderIdForFetch }); // Initialize with folderId
    const [folderFilters, setFolderFilters] = useState<FolderFilters>({});
    const { setFolderCallback } = usePicker();

    // Combine search query into filters for backend
    const effectiveFilters = useMemo(() => {
        const combined: Omit<AttachmentFilters, 'folderId'> = { ...filters };
        // Prefer searchQuery from header if present, otherwise use filter's search
        if (searchQuery) {
            combined.search = searchQuery;
        }
        // Remove folderId since useFolders handles it separately
        delete (combined as any).folderId;
        return combined;
    }, [filters, searchQuery]);

    // Use backend filtering via useFolders hook
    const { attachments, loading, refresh } = useFolders(folderIdForFetch, { attachmentFilters: effectiveFilters });

    useEffect(() => {
        if (id && !isRoot) {
            FolderRepository.getFolderById(id).then(setCurrentFolder).catch(console.error);
        }
    }, [id, isRoot]);

    const handleApplyFilters = (newFilters: AttachmentFilters, newFolderFilters: FolderFilters) => {
        setFilters(newFilters);
        setFolderFilters(newFolderFilters);
    };

    const handleResetFilters = () => {
        setFilters({});
        setFolderFilters({});
        setSearchQuery('');
    };

    // No client-side filtering needed - backend does it
    const displayAttachments = attachments || [];

    const activeFilterCount = Object.entries(filters).filter(([k, v]) =>
        v !== undefined && v !== null && v !== '' && k !== 'folderId'
    ).length + Object.keys(folderFilters).length;

    const handlePressAttachment = (attachment: any) => {
        router.push(`/attachment/${attachment.id}`);
    };

    const handleMoveToFolder = useCallback((attachment: Attachment) => {
        setFolderCallback(async (folder) => {
            if (folder) {
                try {
                    await AttachmentService.updateAttachment(attachment.id, { folderId: folder.id });
                    refresh();
                } catch (error) {
                    console.error('Failed to move attachment:', error);
                }
            }
        });
        router.push('/picker/folder');
    }, [setFolderCallback, router, refresh]);

    const renderItem = ({ item }: { item: any }) => (
        <View style={{ marginBottom: 8, marginHorizontal: 16 }}>
            <AttachmentCard
                attachment={item}
                onPress={() => handlePressAttachment(item)}
                onMoveToFolder={handleMoveToFolder}
            />
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.headerBackground, borderColor: colors.border }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <IconSymbol name="chevron.left" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <ThemedText type="subtitle" style={{ color: colors.text }}>{i18n.t('folders.section.contents')}</ThemedText>
                    <View style={{ width: 40 }} />
                </View>

                <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
                    <SearchBar
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder={i18n.t('common.search')}
                        onClear={() => setSearchQuery('')}
                        onFilterPress={() => setIsFilterVisible(true)}
                        filterCount={activeFilterCount}
                    />
                </View>
            </View>

            {loading && !attachments ? (
                <View style={styles.center}>
                    <ActivityIndicator color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={displayAttachments}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingVertical: 16 }}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <ThemedText style={{ color: colors.textLight, marginTop: 32 }}>{i18n.t('folders.picker.empty')}</ThemedText>
                        </View>
                    }
                />
            )}

            <FolderFilterBottomSheet
                visible={isFilterVisible}
                onClose={() => setIsFilterVisible(false)}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
                attachmentFilters={filters}
                folderFilters={folderFilters}
                fixedFolderId={folderIdForFetch}
                fixedFolder={currentFolder}
                showFolderFilters={false}
                onReopen={() => setIsFilterVisible(true)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        borderBottomWidth: 1,
        paddingBottom: 4,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
        width: 40,
        alignItems: 'center',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
