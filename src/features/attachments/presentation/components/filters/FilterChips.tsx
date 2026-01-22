import { ThemedText } from '@/components/themed-text';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface FilterChipsProps {
    options: string[];
    selected?: string;
    onSelect: (value: string) => void;
    getLabel?: (option: string) => string;
}

export function FilterChips({ options, selected, onSelect, getLabel }: FilterChipsProps) {
    const { colors } = useSettings();

    const styles = useMemo(() => StyleSheet.create({
        chipContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        chip: {
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
        },
        chipActive: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        chipText: {
            fontSize: 14,
            color: colors.text,
        },
        chipTextActive: {
            color: colors.white,
        },
    }), [colors]);

    return (
        <View style={styles.chipContainer}>
            {options.map(option => (
                <TouchableOpacity
                    key={option}
                    style={[
                        styles.chip,
                        selected === option && styles.chipActive,
                    ]}
                    onPress={() => onSelect(option)}
                >
                    <ThemedText
                        style={[
                            styles.chipText,
                            selected === option && styles.chipTextActive,
                        ]}
                    >
                        {getLabel ? getLabel(option) : option}
                    </ThemedText>
                </TouchableOpacity>
            ))}
        </View>
    );
}
