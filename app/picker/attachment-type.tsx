import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { AttachmentTypeService } from '@/src/infrastructure/api/generated/services/AttachmentTypeService';
import I18nLocal from '@/src/infrastructure/localization/i18n';
import { usePicker } from '@/src/infrastructure/picker/PickerContext';
import { getAttachmentTypeLabel } from '@/src/utils/attachmentUtils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AttachmentType {
    id: string;
    name: string;
    icon: string;
    color: string;
}

export default function AttachmentTypePickerScreen() {
    const { colors } = useSettings();
    const router = useRouter();
    const { selectedId, allowedTypeIds } = useLocalSearchParams<{ selectedId?: string; allowedTypeIds?: string }>();
    const { onTypeSelect } = usePicker();

    const [types, setTypes] = useState<AttachmentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadTypes();
    }, []);

    const loadTypes = async () => {
        try {
            const response = await AttachmentTypeService.getAttachmentTypes();
            const data = (response as any).data || response;
            setTypes(Array.isArray(data) ? data : (data as any).items || []);
        } catch (err) {
            console.error('Failed to load attachment types:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredTypes = useMemo(() => {
        let currentTypes = types;

        // Filter by allowedTypeIds if present
        if (allowedTypeIds) {
            const allowedIds = allowedTypeIds.split(',');
            if (allowedIds.length > 0) {
                currentTypes = currentTypes.filter(t => allowedIds.includes(t.id));
            }
        }

        if (!searchQuery.trim()) return currentTypes;
        const lowerQuery = searchQuery.toLowerCase();
        return currentTypes.filter(t => {
            const label = getAttachmentTypeLabel(t.name).toLowerCase();
            return t.name.toLowerCase().includes(lowerQuery) || label.includes(lowerQuery);
        });
    }, [types, searchQuery, allowedTypeIds]);

    const handleSelect = (type: AttachmentType | null) => {
        onTypeSelect(type);
        router.back();
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
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
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
        },
        itemActive: {
            backgroundColor: colors.primary + '10',
        },
        itemContent: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
        },
        iconContainer: {
            width: 44,
            height: 44,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
        },
        iconEmoji: {
            fontSize: 22,
        },
        itemText: {
            fontSize: 16,
            color: colors.text,
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

    const renderItem = ({ item }: { item: AttachmentType }) => (
        <TouchableOpacity
            style={[styles.item, selectedId === item.id && styles.itemActive]}
            onPress={() => handleSelect(item)}
        >
            <View style={styles.itemContent}>
                <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                    <ThemedText style={styles.iconEmoji}>{item.icon}</ThemedText>
                </View>
                <ThemedText style={styles.itemText}>{getAttachmentTypeLabel(item.name)}</ThemedText>
            </View>
            {selectedId === item.id && (
                <IconSymbol name="checkmark" size={20} color={colors.primary} />
            )}
        </TouchableOpacity>
    );

    const renderHeader = () => {
        if (searchQuery) return null;
        return (
            <TouchableOpacity
                style={[styles.item, !selectedId && styles.itemActive]}
                onPress={() => handleSelect(null)}
            >
                <View style={styles.itemContent}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.gray + '20' }]}>
                        <IconSymbol name="doc" size={20} color={colors.gray} />
                    </View>
                    <ThemedText style={styles.itemText}>{I18nLocal.t('folders.picker.all')}</ThemedText>
                </View>
                {!selectedId && (
                    <IconSymbol name="checkmark" size={20} color={colors.primary} />
                )}
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => {
        if (!searchQuery) return null;
        return (
            <View style={styles.emptyContainer}>
                <IconSymbol name="doc.fill" size={48} color={colors.border} />
                <ThemedText style={styles.emptyText}>{I18nLocal.t('folders.picker.empty_type')}</ThemedText>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                    <IconSymbol name="xmark" size={22} color={colors.text} />
                </TouchableOpacity>
                <ThemedText type="defaultSemiBold" style={styles.title}>{I18nLocal.t('filters.sections.type_title')}</ThemedText>
                <View style={styles.closeButton} />
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <IconSymbol name="magnifyingglass" size={18} color={colors.gray} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={I18nLocal.t('folders.picker.search_type')}
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

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredTypes}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={renderHeader}
                    ListEmptyComponent={renderEmpty}
                    keyboardShouldPersistTaps="handled"
                    style={styles.list}
                />
            )}
        </SafeAreaView>
    );
}
