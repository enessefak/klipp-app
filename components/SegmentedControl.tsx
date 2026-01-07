import { ThemedText } from '@/components/themed-text';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface Segment {
    key: string;
    label: string;
    icon?: string;
}

interface SegmentedControlProps {
    segments: Segment[];
    selectedKey: string;
    onSelect: (key: string) => void;
    style?: object;
}

/**
 * SegmentedControl - iOS-style segmented tab control
 */
export function SegmentedControl({
    segments,
    selectedKey,
    onSelect,
    style,
}: SegmentedControlProps) {
    const { colors } = useSettings();

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flexDirection: 'row',
            backgroundColor: colors.inputBackground,
            borderRadius: 12,
            padding: 4,
        },
        segment: {
            flex: 1,
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
        selectedSegment: {
            backgroundColor: colors.card,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
        },
        segmentText: {
            fontSize: 14,
            color: colors.textLight,
            fontWeight: '500',
        },
        selectedSegmentText: {
            color: colors.text,
            fontWeight: '600',
        },
    }), [colors]);

    return (
        <View style={[styles.container, style]}>
            {segments.map((segment) => {
                const isSelected = segment.key === selectedKey;
                return (
                    <TouchableOpacity
                        key={segment.key}
                        style={[
                            styles.segment,
                            isSelected && styles.selectedSegment,
                        ]}
                        onPress={() => onSelect(segment.key)}
                        activeOpacity={0.7}
                    >
                        <ThemedText
                            style={[
                                styles.segmentText,
                                isSelected && styles.selectedSegmentText,
                            ]}
                        >
                            {segment.label}
                        </ThemedText>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
