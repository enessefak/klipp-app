import { ThemedText } from '@/components/themed-text';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import React, { ReactNode, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import I18nLocal from '@/src/infrastructure/localization/i18n';

interface FilterSectionProps {
    title: string;
    children: ReactNode;
    style?: any;
    onClear?: () => void;
}

export function FilterSection({ title, children, style, onClear }: FilterSectionProps) {
    const { colors } = useSettings();

    const styles = useMemo(() => StyleSheet.create({
        section: {
            paddingVertical: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        sectionTitle: {
            fontSize: 15,
            fontWeight: '600',
            color: colors.text,
        },
        clearText: {
            fontSize: 13,
            color: colors.primary,
            fontWeight: '500',
        },
    }), [colors]);

    return (
        <View style={[styles.section, style]}>
            <View style={styles.header}>
                <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
                {onClear && (
                    <TouchableOpacity onPress={onClear}>
                        <ThemedText style={styles.clearText}>{I18nLocal.t('filters.clear')}</ThemedText>
                    </TouchableOpacity>
                )}
            </View>
            {children}
        </View>
    );
}
