import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import I18nLocal from '@/src/infrastructure/localization/i18n';
import { usePicker } from '@/src/infrastructure/picker/PickerContext';
import { getAttachmentTypeLabel } from '@/src/utils/attachmentUtils';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface AttachmentType {
    id: string;
    name: string;
    icon: string;
    color: string;
}

interface AttachmentTypeSelectorProps {
    value: string;
    onSelect: (typeId: string) => void;
    currentType?: AttachmentType; // Optional: Pass the full type object if available for immediate display
    types?: AttachmentType[]; // Added for optimization/lookup
    label?: string;
    placeholder?: string;
    error?: string;
    disabled?: boolean;
}

export function AttachmentTypeSelector({
    value,
    onSelect,
    currentType,
    types,
    label,
    placeholder = I18nLocal.t('folders.picker.placeholder'),
    error,
    disabled = false,
}: AttachmentTypeSelectorProps) {
    const router = useRouter();
    const { setTypeCallback } = usePicker();
    const { colors } = useSettings();

    // Resolve displayed type: use currentType or find in types array by value
    const displayedType = useMemo(() => {
        if (currentType) return currentType;
        if (types && value) {
            return types.find(t => t.id === value);
        }
        return null;
    }, [currentType, types, value]);

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

    const handlePress = () => {
        if (disabled) return;

        setTypeCallback((type) => {
            if (type) {
                onSelect(type.id);
            }
        });

        // Use push to navigate to the picker screen
        // @ts-ignore
        router.push({
            pathname: '/picker/attachment-type',
            params: { selectedId: value }
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
                    {displayedType ? (
                        <View style={styles.selectedContent}>
                            <View style={[styles.iconContainer, { backgroundColor: displayedType.color + '20' }]}>
                                <ThemedText style={styles.iconEmoji}>{displayedType.icon}</ThemedText>
                            </View>
                            <ThemedText style={styles.valueText}>
                                {getAttachmentTypeLabel(displayedType.name)}
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

