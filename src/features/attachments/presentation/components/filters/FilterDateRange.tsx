import { DatePickerField } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import I18nLocal from '@/src/infrastructure/localization/i18n';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

interface FilterDateRangeProps {
    dateFrom?: string;
    dateTo?: string;
    onDateFromChange: (date?: string) => void;
    onDateToChange: (date?: string) => void;
}

export function FilterDateRange({
    dateFrom,
    dateTo,
    onDateFromChange,
    onDateToChange,
}: FilterDateRangeProps) {
    const { colors } = useSettings();

    const styles = useMemo(() => StyleSheet.create({
        rangeContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        fieldContainer: {
            flex: 1,
            marginBottom: 0,
        },
        rangeSeparator: {
            color: colors.textLight,
            fontSize: 16,
        },
    }), [colors]);

    return (
        <View style={styles.rangeContainer}>
            <DatePickerField
                value={dateFrom ? new Date(dateFrom) : undefined}
                onChange={(date) => onDateFromChange(date.toISOString())}
                placeholder={I18nLocal.t('filters.placeholders.start')}
                maximumDate={new Date()}
                containerStyle={styles.fieldContainer}
            />

            <ThemedText style={styles.rangeSeparator}>-</ThemedText>

            <DatePickerField
                value={dateTo ? new Date(dateTo) : undefined}
                onChange={(date) => onDateToChange(date.toISOString())}
                placeholder={I18nLocal.t('filters.placeholders.end')}
                maximumDate={new Date()}
                containerStyle={styles.fieldContainer}
            />
        </View>
    );
}
