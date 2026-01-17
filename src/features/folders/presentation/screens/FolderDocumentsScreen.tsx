import { SearchBar } from '@/components/SearchBar';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AttachmentFilters } from '@/src/features/attachments/domain/Attachment';
import { AttachmentCard } from '@/src/features/attachments/presentation/components/AttachmentCard';
import { FolderFilterBottomSheet } from '@/src/features/folders/presentation/components/FolderFilterBottomSheet';
import { useFolders } from '@/src/features/folders/presentation/useFolders';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FolderFilters } from '../../domain/FolderFilters';

export function FolderDocumentsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { colors } = useSettings();

    const { attachments, loading } = useFolders(id);

    const [searchQuery, setSearchQuery] = useState('');
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

    const filteredAttachments = useMemo(() => {
        if (!attachments) return [];
        let result = attachments;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(a =>
                a.title.toLowerCase().includes(query)
            );
        }

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
    }, [attachments, filters, searchQuery]);

    const activeFilterCount = Object.keys(filters).length + Object.keys(folderFilters).length;

    const handlePressAttachment = (attachment: any) => {
        router.push(`/attachment/${attachment.id}`);
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={{ marginBottom: 8, marginHorizontal: 16 }}>
            <AttachmentCard
                attachment={item}
                onPress={() => handlePressAttachment(item)}
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
                    data={filteredAttachments}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingVertical: 16 }}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <ThemedText style={{ color: colors.textLight, marginTop: 32 }}>Belge bulunamadı</ThemedText>
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
