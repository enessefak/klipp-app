import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { getIconDisplay } from '@/src/utils/iconUtils';
import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface FilterSelectInputProps {
    placeholder: string;
    value?: string;
    icon?: string;
    onPress?: () => void;
    disabled?: boolean;
}

export function FilterSelectInput({ placeholder, value, icon, onPress, disabled }: FilterSelectInputProps) {
    const { colors } = useSettings();

    const styles = useMemo(() => StyleSheet.create({
        selectInput: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.background,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderWidth: 1,
            borderColor: colors.border,
        },
        disabledInput: {
            opacity: 0.5,
            backgroundColor: colors.background, // Ensure background matches
        },
        selectedItem: {
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
        selectedIcon: {
            fontSize: 18,
        },
        selectedText: {
            fontSize: 15,
            color: colors.text,
            fontWeight: '500',
        },
        placeholderText: {
            fontSize: 15,
            color: colors.gray,
        },
    }), [colors]);

    return (
        <TouchableOpacity
            style={[styles.selectInput, disabled && styles.disabledInput]}
            onPress={onPress}
            disabled={disabled}
        >
            {value ? (
                <View style={styles.selectedItem}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                        <ThemedText style={styles.selectedIcon}>{getIconDisplay(icon)}</ThemedText>
                    </View>
                    <ThemedText style={styles.selectedText}>{value}</ThemedText>
                </View>
            ) : (
                <ThemedText style={styles.placeholderText}>{placeholder}</ThemedText>
            )}
            {!disabled && <IconSymbol name="chevron.right" size={20} color={colors.gray} />}
        </TouchableOpacity>
    );
}
