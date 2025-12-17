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
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AttachmentFilters } from '../../domain/Attachment';
import { FieldConfig } from '../../domain/AttachmentTypeFields';
import { DynamicFilterSection } from './filters/DynamicFilterSection';
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
    const [dynamicValues, setDynamicValues] = useState<Record<string, any>>({});

    // Parse initial detailsFilter
    useEffect(() => {
        if (filters.detailsFilter) {
            try {
                setDynamicValues(JSON.parse(filters.detailsFilter));
            } catch (e) {
                console.warn('Failed to parse detailsFilter', e);
                setDynamicValues({});
            }
        } else {
            setDynamicValues({});
        }
    }, [filters.detailsFilter]);

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
            const [foldersData, typesResponse] = await Promise.all([
                FolderRepository.getFolders(),
                AttachmentTypeService.getAttachmentTypes(),
            ]);

            // Handle paginated response
            const typesData = Array.isArray(typesResponse) ? typesResponse : ((typesResponse as any).items || []);

            setFolders(foldersData);
            setAttachmentTypes(typesData);
        } catch (err) {
            console.error('Failed to load filter options:', err);
        } finally {
            setLoadingOptions(false);
        }
    };

    const updateFilter = useCallback((key: keyof AttachmentFilters, value: any) => {
        setLocalFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const triggerNavigation = useCallback((target: 'folder' | 'type') => {
        if (onPickerOpen) {
            onPickerOpen();
        }
        if (target === 'folder') {
            setFolderCallback((folder) => {
                updateFilter('folderId', folder.id);
                // Optionally re-open or handle UI state if needed
            });
            onClose(); // Close sheet to show picker
            router.push('/picker/folder');
        } else {
            setTypeCallback((type) => {
                updateFilter('attachmentTypeId', type.id);
                setDynamicValues({}); // Reset dynamic values when type changes
            });
            onClose(); // Close sheet to show picker
            router.push('/picker/attachment-type');
        }
    }, [onClose, router, setFolderCallback, setTypeCallback, updateFilter, onPickerOpen]);
    const handleApply = useCallback(() => {
        const cleanFilters: AttachmentFilters = {};
        Object.entries(localFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                cleanFilters[key as keyof AttachmentFilters] = value;
            }
        });

        // Add dynamic filters if any exist
        if (Object.keys(dynamicValues).length > 0) {
            cleanFilters.detailsFilter = JSON.stringify(dynamicValues);
        }

        onApply(cleanFilters);
        onClose();
    }, [localFilters, dynamicValues, onApply, onClose]);

    const handleReset = useCallback(() => {
        setLocalFilters({});
        setDynamicValues({});
        onReset();
        onClose();
    }, [onReset, onClose]);

    // Helpers
    const selectedFolder = folders.find(f => f.id === localFilters.folderId);
    const selectedFolderName = selectedFolder?.name;
    const selectedFolderIcon = selectedFolder?.icon;

    const selectedType = attachmentTypes?.find((t) => t.id === localFilters.attachmentTypeId);
    const selectedTypeName = selectedType ? getAttachmentTypeLabel(selectedType.name) : undefined;
    const selectedTypeIcon = selectedType?.icon;

    // Get field config for selected type from the FULL type object (assuming it has fieldConfig)
    // Note: attachmentTypes state comes from API which should include fieldConfig
    const selectedTypeFieldConfig = (selectedType as any)?.fieldConfig as FieldConfig[] | undefined;

    const activeFilterCount = useMemo(() => {
        let count = Object.values(localFilters).filter(v => v !== undefined && v !== null && v !== '').length;
        if (Object.keys(dynamicValues).length > 0) {
            count += Object.keys(dynamicValues).length;
        }
        return count;
    }, [localFilters, dynamicValues]);

    const handleDynamicChange = useCallback((key: string, value: any) => {
        setDynamicValues(prev => {
            if (value === undefined || value === '') {
                const next = { ...prev };
                delete next[key];
                return next;
            }
            return { ...prev, [key]: value };
        });
    }, []);

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
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <Pressable style={styles.backdrop} onPress={onClose} />

                <View style={[styles.sheet, { paddingBottom: insets.bottom }]}>
                    {/* ... (handle and header) */}
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
                                {/* ... (Folder and Type sections) */}
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
                                    onClear={localFilters.attachmentTypeId ? () => {
                                        updateFilter('attachmentTypeId', undefined);
                                        setDynamicValues({}); // Clear dynamic values when type is cleared
                                    } : undefined}
                                >
                                    <FilterSelectInput
                                        placeholder={I18nLocal.t('filters.sections.type_placeholder')}
                                        value={selectedTypeName}
                                        icon={selectedTypeIcon}
                                        onPress={() => triggerNavigation('type')}
                                    />
                                </FilterSection>

                                {/* Dynamic Fields Section */}
                                {selectedTypeFieldConfig && (
                                    <DynamicFilterSection
                                        fieldConfig={selectedTypeFieldConfig}
                                        values={dynamicValues}
                                        onChange={handleDynamicChange}
                                    />
                                )}
                            </>
                        )}

                        {/* Standard Date Range Filter */}
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
