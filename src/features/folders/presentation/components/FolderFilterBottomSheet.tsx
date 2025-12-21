import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AttachmentFilters } from '@/src/features/attachments/domain/Attachment';
import { FieldConfig } from '@/src/features/attachments/domain/AttachmentTypeFields';
import { AttachmentFilterSections } from '@/src/features/attachments/presentation/components/AttachmentFilterSections';
import { FolderRepository } from '@/src/features/folders/infrastructure/FolderRepository';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { SharingService } from '@/src/features/sharing/data/SharingService';
import { AttachmentTypeService } from '@/src/infrastructure/api/generated/services/AttachmentTypeService';
import I18nLocal from '@/src/infrastructure/localization/i18n';
import { usePicker } from '@/src/infrastructure/picker/PickerContext';
import { getAttachmentTypeLabel } from '@/src/utils/attachmentUtils';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Folder } from '../../domain/Folder';
import { FolderFilters } from '../../domain/FolderFilters';
import { FolderFilterSection } from './filters/FolderFilterSection';

// Note: Reusing AttachmentType interface locally if not exported, or import if available
interface AttachmentType {
    id: string;
    name: string;
    icon: string;
    color: string;
}

interface FolderFilterBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    // We accept two sets of filters
    attachmentFilters: AttachmentFilters;
    folderFilters: FolderFilters;
    onApply: (attachmentFilters: AttachmentFilters, folderFilters: FolderFilters) => void;
    onReset: () => void;
    onPickerOpen?: () => void;
}

export function FolderFilterBottomSheet({
    visible,
    onClose,
    attachmentFilters,
    folderFilters,
    onApply,
    onReset,
    onPickerOpen,
}: FolderFilterBottomSheetProps) {
    const { colors } = useSettings();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { setFolderCallback, setTypeCallback, setIconCallback } = usePicker();

    // Local filter states
    const [localAttachmentFilters, setLocalAttachmentFilters] = useState<AttachmentFilters>(attachmentFilters);
    const [localFolderFilters, setLocalFolderFilters] = useState<FolderFilters>(folderFilters);
    const [dynamicValues, setDynamicValues] = useState<Record<string, any>>({});

    // Parse initial detailsFilter
    useEffect(() => {
        if (attachmentFilters.detailsFilter) {
            try {
                setDynamicValues(JSON.parse(attachmentFilters.detailsFilter));
            } catch (e) {
                console.warn('Failed to parse detailsFilter', e);
                setDynamicValues({});
            }
        } else {
            setDynamicValues({});
        }
    }, [attachmentFilters.detailsFilter]);

    // Options Loading Logic (Duplicated from FilterBottomSheet for independence)
    const [folders, setFolders] = useState<Folder[]>([]);
    const [attachmentTypes, setAttachmentTypes] = useState<AttachmentType[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);

    useEffect(() => {
        if (visible && folders.length === 0) {
            loadFilterOptions();
        }
    }, [visible]);

    const loadFilterOptions = async () => {
        setLoadingOptions(true);
        try {
            const [foldersData, sharedResponse, typesResponse] = await Promise.all([
                FolderRepository.getFolders(),
                SharingService.getSharedWithMe('accepted'),
                AttachmentTypeService.getAttachmentTypes(),
            ]);

            const typesData = Array.isArray(typesResponse) ? typesResponse : ((typesResponse as any).items || []);
            const sharedFolders = Array.isArray(sharedResponse) ? sharedResponse : [];

            // Map shared folders logic... (simplified reusing existing mapping logic if possible, or repeat)
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

            const allFolders = [];
            if (Array.isArray(foldersData)) {
                allFolders.push(...foldersData);
            }
            allFolders.push(...mappedSharedFolders);

            setFolders(allFolders);
            setAttachmentTypes(typesData);
        } catch (err) {
            console.error('Failed to load filter options:', err);
        } finally {
            setLoadingOptions(false);
        }
    };

    const updateAttachmentFilter = useCallback((key: keyof AttachmentFilters, value: any) => {
        setLocalAttachmentFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const updateFolderFilter = useCallback((key: keyof FolderFilters, value: any) => {
        setLocalFolderFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const triggerNavigation = useCallback((target: 'folder' | 'type' | 'icon') => {
        if (onPickerOpen) {
            onPickerOpen();
        }
        if (target === 'folder') {
            setFolderCallback((folder) => {
                updateAttachmentFilter('folderId', folder?.id);
            });
            onClose();
            router.push('/picker/folder');
        } else if (target === 'type') {
            setTypeCallback((type) => {
                updateAttachmentFilter('attachmentTypeId', type?.id);
                setDynamicValues({});
            });
            onClose();
            router.push('/picker/attachment-type');
        } else if (target === 'icon') {
            setIconCallback((icon) => {
                updateFolderFilter('folderIcon', icon);
            });
            onClose();
            router.push('/picker/icon' as any);
        }
    }, [onClose, router, setFolderCallback, setTypeCallback, setIconCallback, updateAttachmentFilter, updateFolderFilter, onPickerOpen]);

    const handleApply = useCallback(() => {
        // Clean Attachment Filters
        const cleanAttachmentFilters: AttachmentFilters = {};
        Object.entries(localAttachmentFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                cleanAttachmentFilters[key as keyof AttachmentFilters] = value;
            }
        });
        if (Object.keys(dynamicValues).length > 0) {
            cleanAttachmentFilters.detailsFilter = JSON.stringify(dynamicValues);
        }

        // Clean Folder Filters
        const cleanFolderFilters: FolderFilters = {};
        Object.entries(localFolderFilters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                cleanFolderFilters[key as keyof FolderFilters] = value;
            }
        });

        onApply(cleanAttachmentFilters, cleanFolderFilters);
        onClose();
    }, [localAttachmentFilters, localFolderFilters, dynamicValues, onApply, onClose]);

    const handleReset = useCallback(() => {
        setLocalAttachmentFilters({});
        setLocalFolderFilters({});
        setDynamicValues({});
        onReset();
        onClose();
    }, [onReset, onClose]);

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

    // Helpers for display
    const selectedFolder = folders.find(f => f.id === localAttachmentFilters.folderId);
    const selectedType = attachmentTypes?.find((t) => t.id === localAttachmentFilters.attachmentTypeId);
    const selectedTypeName = selectedType ? getAttachmentTypeLabel(selectedType.name) : undefined;
    const selectedTypeFieldConfig = (selectedType as any)?.fieldConfig as FieldConfig[] | undefined;

    const activeFilterCount = useMemo(() => {
        let count = Object.values(localAttachmentFilters).filter(v => v !== undefined && v !== null && v !== '').length;
        if (Object.keys(dynamicValues).length > 0) count += Object.keys(dynamicValues).length;
        count += Object.values(localFolderFilters).filter(v => v !== undefined && v !== null && v !== '').length;
        return count;
    }, [localAttachmentFilters, localFolderFilters, dynamicValues]);

    const styles = useMemo(() => StyleSheet.create({
        modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
        backdrop: { ...StyleSheet.absoluteFillObject },
        sheet: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '90%', overflow: 'hidden' },
        handleContainer: { alignItems: 'center', paddingVertical: 16, backgroundColor: colors.card },
        handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border },
        header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.headerBackground },
        headerButton: { width: 60, alignItems: 'center' },
        headerTitle: { fontSize: 17, color: colors.text },
        resetText: { color: colors.primary, fontSize: 15 },
        content: { flex: 1, paddingHorizontal: 16 },
        contentContainer: { paddingTop: 8, paddingBottom: 100 },
        footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background },
        applyButton: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
        applyButtonText: { color: colors.white, fontSize: 16, fontWeight: '600' },
        loadingContainer: { paddingVertical: 20, alignItems: 'center' },
    }), [colors]);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalContainer}>
                <Pressable style={styles.backdrop} onPress={onClose} />
                <View style={[styles.sheet, { paddingBottom: insets.bottom }]}>
                    <View style={styles.handleContainer}><View style={styles.handle} /></View>

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

                    <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false} bounces={false}>
                        {loadingOptions ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color={colors.primary} />
                            </View>
                        ) : (
                            <>
                                <AttachmentFilterSections
                                    filters={localAttachmentFilters}
                                    dynamicValues={dynamicValues}
                                    selectedFolderName={selectedFolder?.name}
                                    selectedFolderIcon={selectedFolder?.icon}
                                    selectedTypeName={selectedTypeName}
                                    selectedTypeIcon={selectedType?.icon}
                                    selectedTypeFieldConfig={selectedTypeFieldConfig}
                                    onUpdateFilter={updateAttachmentFilter}
                                    onUpdateDynamicValue={handleDynamicChange}
                                    onTriggerNavigation={triggerNavigation}
                                    onClearType={() => {
                                        updateAttachmentFilter('attachmentTypeId', undefined);
                                        setDynamicValues({});
                                    }}
                                />
                                <FolderFilterSection
                                    filters={localFolderFilters}
                                    onUpdateFilter={updateFolderFilter}
                                    onTriggerIconPicker={() => triggerNavigation('icon')}
                                />
                            </>
                        )}
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
