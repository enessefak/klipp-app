import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Folder } from '@/src/features/folders/domain/Folder';
import { FolderRepository } from '@/src/features/folders/infrastructure/FolderRepository';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import I18nLocal from '@/src/infrastructure/localization/i18n';
import { usePicker } from '@/src/infrastructure/picker/PickerContext';
import { getIconDisplay } from '@/src/utils/iconUtils';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface FolderSelectorProps {
    value: string;
    onSelect: (folderId: string) => void;
    label?: string;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
    folders?: Folder[]; // Optimization to avoid refetching
    requiredPermission?: 'VIEW' | 'EDIT' | 'CREATE' | 'FULL';
}

export function FolderSelector({
    value,
    onSelect,
    label,
    placeholder = I18nLocal.t('folders.picker.placeholder'),
    error,
    disabled = false,
    folders,
    requiredPermission,
}: FolderSelectorProps) {
    const router = useRouter();
    const { setFolderCallback } = usePicker();
    const { colors } = useSettings();
    const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

    const styles = useMemo(() => StyleSheet.create({
        container: {
            // marginBottom: 16, // Removed to let FormField handle spacing
        },
        label: {
            marginBottom: 8,
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
        },
        selector: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            minHeight: 56,
        },
        selectorError: {
            borderColor: colors.error,
        },
        selectorDisabled: {
            opacity: 0.6,
            backgroundColor: colors.background,
        },
        content: {
            flex: 1,
        },
        selectedContent: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        iconContainer: {
            width: 32,
            height: 32,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
        },
        iconEmoji: {
            fontSize: 18,
        },
        valueText: {
            fontSize: 16,
            color: colors.text,
            fontWeight: '500',
        },
        placeholder: {
            fontSize: 16,
            color: colors.textLight,
        },
        errorText: {
            marginTop: 4,
            fontSize: 12,
            color: colors.error,
        },
    }), [colors]);

    // Fetch folder details if value is present
    useEffect(() => {
        if (value) {
            loadFolderDetails();
        } else {
            setSelectedFolder(null);
        }
    }, [value]);

    const loadFolderDetails = async () => {
        try {
            // Optimization: In a real app we might want a synchronous way to get folder name from a cached list 
            // or pass the folder object directly. For now, we fetch or assume we can find it.
            // Since we don't have a direct "getById" that is synchronous, and we don't want to fetch all folders every time...
            // Let's assume for now we might need to fetch all to find it, or if we have a getById.
            // Looking at FolderRepository, it likely has getFolders.
            // Let's optimize by fetching all folders once or relying on a passed prop?
            // Existing FolderPicker fetched all folders.
            // Let's fetch all for now to implement this correctly.
            const folders = await FolderRepository.getFolders();
            const folder = folders.find(f => f.id === value);
            if (folder) setSelectedFolder(folder);
        } catch (error) {
            console.error('Failed to load folder details', error);
        }
    };

    const handlePress = () => {
        if (disabled) return;

        setFolderCallback((folder) => {
            if (folder) {
                onSelect(folder.id);
            }
        });

        // @ts-ignore
        router.push({
            pathname: '/picker/folder',
            params: {
                selectedId: value,
                requiredPermission
            }
        });
    };

    return (
        <View style={styles.container}>
            {label && <ThemedText style={styles.label}>{label}</ThemedText>}

            <TouchableOpacity
                style={[
                    styles.selector,
                    error ? styles.selectorError : null,
                    disabled ? styles.selectorDisabled : null
                ]}
                onPress={handlePress}
                activeOpacity={0.7}
                disabled={disabled}
            >
                <View style={styles.content}>
                    {selectedFolder ? (
                        <View style={styles.selectedContent}>
                            <View style={[styles.iconContainer, { backgroundColor: selectedFolder.color + '20' }]}>
                                <ThemedText style={styles.iconEmoji}>{getIconDisplay(selectedFolder.icon)}</ThemedText>
                            </View>
                            <ThemedText style={styles.valueText} numberOfLines={1}>
                                {selectedFolder.name}
                            </ThemedText>
                        </View>
                    ) : (
                        <ThemedText style={styles.placeholder}>{placeholder}</ThemedText>
                    )}
                </View>
                <IconSymbol name="chevron.right" size={20} color={colors.gray} />
            </TouchableOpacity>

            {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
        </View>
    );
}

