import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Folder } from '@/src/features/folders/domain/Folder';
import { FolderRepository } from '@/src/features/folders/infrastructure/FolderRepository';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { AttachmentTypeService } from '@/src/infrastructure/api/generated/services/AttachmentTypeService';
import I18nLocal from '@/src/infrastructure/localization/i18n';
import { usePicker } from '@/src/infrastructure/picker/PickerContext';
import { getAttachmentTypeLabel } from '@/src/utils/attachmentUtils';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AttachmentFilters } from '../../domain/Attachment';
import { FilterChips } from './filters/FilterChips';
import { FilterDateRange } from './filters/FilterDateRange';
import { FilterSection } from './filters/FilterSection';
import { FilterSelectInput } from './filters/FilterSelectInput';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'];

interface AttachmentType {
    id: string;
    name: string;
    icon: string;
    color: string;
}

interface FilterBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    filters: AttachmentFilters;
    onApply: (filters: AttachmentFilters) => void;
    onReset: () => void;
    onPickerOpen?: () => void;
}

export function FilterBottomSheet({
    visible,
    onClose,
    filters,
    onApply,
    onReset,
    onPickerOpen,
}: FilterBottomSheetProps) {
    const { colors } = useSettings();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { setFolderCallback, setTypeCallback } = usePicker();

    // Local filter state
    const [localFilters, setLocalFilters] = useState<AttachmentFilters>(filters);

    // Options
    const [folders, setFolders] = useState<Folder[]>([]);
    const [attachmentTypes, setAttachmentTypes] = useState<AttachmentType[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);

    // Load options
    useEffect(() => {
        if (visible && folders.length === 0) {
            loadFilterOptions();
        }
    }, [visible]);

    const loadFilterOptions = async () => {
        setLoadingOptions(true);
        try {
            const [foldersData, typesData] = await Promise.all([
                FolderRepository.getFolders(),
                AttachmentTypeService.getAttachmentTypes(),
            ]);
            setFolders(foldersData);
            setAttachmentTypes(typesData);
        } catch (err) {
            console.error('Failed to load filter options:', err);
        } finally {
            setLoadingOptions(false);
        }
    };

    // Reset local filters when external filters change
    useEffect(() => {
        setLocalFilters(filters);
    }, [filters]);

    // Navigation helper
    const navigateWithDelay = (path: string, params: any) => {
        onPickerOpen?.();
        onClose();

        // Simple timeout to allow Modal to dismiss natively before pushing new screen
        setTimeout(() => {
            // @ts-ignore
            router.push({ pathname: path, params });
        }, 400); // Slightly increased delay for safety
    };

    const triggerNavigation = (action: 'folder' | 'type') => {
        if (action === 'folder') {
            setFolderCallback((folder) => {
                updateFilter('folderId', folder ? folder.id : undefined);
            });
            navigateWithDelay('/picker/folder', { selectedId: localFilters.folderId || '' });
        } else {
            setTypeCallback((type) => {
                updateFilter('attachmentTypeId', type ? type.id : undefined);
            });
            navigateWithDelay('/picker/attachment-type', { selectedId: localFilters.attachmentTypeId || '' });
        }
    };

    const updateFilter = useCallback(<K extends keyof AttachmentFilters>(key: K, value: AttachmentFilters[K]) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleApply = useCallback(() => {
        const cleanFilters: AttachmentFilters = {};
        Object.entries(localFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                cleanFilters[key as keyof AttachmentFilters] = value;
            }
        });
        onApply(cleanFilters);
        onClose();
    }, [localFilters, onApply, onClose]);

    const handleReset = useCallback(() => {
        setLocalFilters({});
        onReset();
        onClose();
    }, [onReset, onClose]);

    // Helpers
    const selectedFolderName = useMemo(() => folders.find(f => f.id === localFilters.folderId)?.name, [folders, localFilters.folderId]);
    const selectedFolderIcon = useMemo(() => folders.find(f => f.id === localFilters.folderId)?.icon, [folders, localFilters.folderId]);
    const selectedTypeName = useMemo(() => {
        const type = attachmentTypes.find(t => t.id === localFilters.attachmentTypeId);
        return type ? getAttachmentTypeLabel(type.name) : undefined;
    }, [attachmentTypes, localFilters.attachmentTypeId]);
    const selectedTypeIcon = useMemo(() => attachmentTypes.find(t => t.id === localFilters.attachmentTypeId)?.icon, [attachmentTypes, localFilters.attachmentTypeId]);

    const activeFilterCount = useMemo(() => {
        return Object.values(localFilters).filter(v => v !== undefined && v !== null && v !== '').length;
    }, [localFilters]);

    const styles = useMemo(() => StyleSheet.create({
        modalContainer: {
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.5)',
        },
        backdrop: {
            ...StyleSheet.absoluteFillObject,
        },
        sheet: {
            backgroundColor: colors.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: '90%',
            overflow: 'hidden',
        },
        handleContainer: {
            alignItems: 'center',
            paddingVertical: 16,
            backgroundColor: colors.card,
        },
        handle: {
            width: 40,
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.border,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingBottom: 16,
            paddingTop: 8,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.headerBackground,
        },
        headerButton: {
            width: 60,
            alignItems: 'center',
        },
        headerTitle: {
            fontSize: 17,
            color: colors.text,
        },
        resetText: {
            color: colors.primary,
            fontSize: 15,
        },
        content: {
            flex: 1,
            paddingHorizontal: 16,
        },
        contentContainer: {
            paddingTop: 8,
            paddingBottom: 100,
        },
        rangeContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        rangeInput: {
            flex: 1,
        },
        input: {
            backgroundColor: colors.inputBackground,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 16,
            color: colors.text,
            borderWidth: 1,
            borderColor: colors.border,
        },
        rangeSeparator: {
            color: colors.textLight,
            fontSize: 16,
        },
        footer: {
            padding: 16,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
        },
        applyButton: {
            backgroundColor: colors.primary,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
        },
        applyButtonText: {
            color: colors.white,
            fontSize: 16,
            fontWeight: '600',
        },
        loadingContainer: {
            paddingVertical: 20,
            alignItems: 'center',
        },
    }), [colors]);

    return (
        <Modal
            transparent
            visible={visible}
            animationType="slide"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.modalContainer}>
                <Pressable style={styles.backdrop} onPress={onClose} />

                <View style={[styles.sheet, { paddingBottom: insets.bottom }]}>
                    <View style={styles.handleContainer}>
                        <View style={styles.handle} />
                    </View>

                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleReset} style={styles.headerButton}>
                            <ThemedText style={styles.resetText}>{I18nLocal.t('filters.reset')}</ThemedText>
                        </TouchableOpacity>
                        <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
                            {I18nLocal.t('filters.title')} {activeFilterCount > 0 && `(${activeFilterCount})`}
                        </ThemedText>
                        <TouchableOpacity onPress={onClose} style={styles.headerButton}>
                            <IconSymbol name="xmark" size={20} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={styles.contentContainer}
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                    >
                        {loadingOptions ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color={colors.primary} />
                            </View>
                        ) : (
                            <>
                                <FilterSection
                                    title={I18nLocal.t('filters.sections.folder')}
                                    onClear={localFilters.folderId ? () => updateFilter('folderId', undefined) : undefined}
                                >
                                    <FilterSelectInput
                                        placeholder={I18nLocal.t('filters.sections.folder_placeholder')}
                                        value={selectedFolderName}
                                        icon={selectedFolderIcon}
                                        onPress={() => triggerNavigation('folder')}
                                    />
                                </FilterSection>

                                <FilterSection
                                    title={I18nLocal.t('filters.sections.document_type')}
                                    onClear={localFilters.attachmentTypeId ? () => updateFilter('attachmentTypeId', undefined) : undefined}
                                >
                                    <FilterSelectInput
                                        placeholder={I18nLocal.t('filters.sections.type_placeholder')}
                                        value={selectedTypeName}
                                        icon={selectedTypeIcon}
                                        onPress={() => triggerNavigation('type')}
                                    />
                                </FilterSection>
                            </>
                        )}

                        <FilterSection
                            title={I18nLocal.t('filters.sections.currency')}
                            onClear={localFilters.currency ? () => updateFilter('currency', undefined) : undefined}
                        >
                            <FilterChips
                                options={CURRENCIES}
                                selected={localFilters.currency || undefined}
                                onSelect={(val) => updateFilter('currency', localFilters.currency === val ? undefined : val)}
                            />
                        </FilterSection>

                        <FilterSection
                            title={I18nLocal.t('filters.sections.amount_range')}
                            onClear={(localFilters.amountMin || localFilters.amountMax) ? () => {
                                updateFilter('amountMin', undefined);
                                updateFilter('amountMax', undefined);
                            } : undefined}
                        >
                            <View style={styles.rangeContainer}>
                                <View style={styles.rangeInput}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={I18nLocal.t('filters.placeholders.min')}
                                        placeholderTextColor={colors.gray}
                                        keyboardType="numeric"
                                        value={localFilters.amountMin?.toString() || ''}
                                        onChangeText={(text) => updateFilter('amountMin', text ? parseFloat(text) : undefined)}
                                    />
                                </View>
                                <ThemedText style={styles.rangeSeparator}>-</ThemedText>
                                <View style={styles.rangeInput}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={I18nLocal.t('filters.placeholders.max')}
                                        placeholderTextColor={colors.gray}
                                        keyboardType="numeric"
                                        value={localFilters.amountMax?.toString() || ''}
                                        onChangeText={(text) => updateFilter('amountMax', text ? parseFloat(text) : undefined)}
                                    />
                                </View>
                            </View>
                        </FilterSection>

                        <FilterSection
                            title={I18nLocal.t('filters.sections.date_range')}
                            onClear={(localFilters.documentDateFrom || localFilters.documentDateTo) ? () => {
                                updateFilter('documentDateFrom', undefined);
                                updateFilter('documentDateTo', undefined);
                            } : undefined}
                        >
                            <FilterDateRange
                                dateFrom={localFilters.documentDateFrom}
                                dateTo={localFilters.documentDateTo}
                                onDateFromChange={(d) => updateFilter('documentDateFrom', d)}
                                onDateToChange={(d) => updateFilter('documentDateTo', d)}
                            />
                        </FilterSection>

                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                            <ThemedText style={styles.applyButtonText}>{I18nLocal.t('filters.apply')}</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
