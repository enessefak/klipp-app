import { DatePickerField } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import I18nLocal from '@/src/infrastructure/localization/i18n';
import { useMemo } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { FieldConfig } from '../../../domain/AttachmentTypeFields';
import { FilterSection } from './FilterSection';

interface DynamicFilterSectionProps {
    fieldConfig: FieldConfig[];
    values: Record<string, any>;
    onChange: (key: string, value: any) => void;
}

export function DynamicFilterSection({ fieldConfig, values, onChange }: DynamicFilterSectionProps) {
    const { colors } = useSettings();

    const styles = useMemo(() => StyleSheet.create({
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
        row: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        halfInput: {
            flex: 1,
        },
        separator: {
            color: colors.textLight,
            fontSize: 16,
        },
    }), [colors]);

    const renderField = (field: FieldConfig) => {
        if (!field.filterable) return null;

        // Determine filter rendering based on filterType
        switch (field.filterType) {
            case 'dateRange':
                const dateKeyFrom = `${field.key}From`;
                const dateKeyTo = `${field.key}To`;
                return (
                    <FilterSection
                        key={field.key}
                        title={field.label}
                        onClear={
                            (values[dateKeyFrom] || values[dateKeyTo])
                                ? () => {
                                    onChange(dateKeyFrom, undefined);
                                    onChange(dateKeyTo, undefined);
                                }
                                : undefined
                        }
                    >
                        <View style={styles.row}>
                            <DatePickerField
                                value={values[dateKeyFrom] ? new Date(values[dateKeyFrom]) : undefined}
                                onChange={(date) => onChange(dateKeyFrom, date.toISOString())}
                                placeholder={I18nLocal.t('filters.placeholders.start')}
                                containerStyle={styles.halfInput}
                            />
                            <ThemedText style={styles.separator}>-</ThemedText>
                            <DatePickerField
                                value={values[dateKeyTo] ? new Date(values[dateKeyTo]) : undefined}
                                onChange={(date) => onChange(dateKeyTo, date.toISOString())}
                                placeholder={I18nLocal.t('filters.placeholders.end')}
                                containerStyle={styles.halfInput}
                            />
                        </View>
                    </FilterSection>
                );

            case 'amount':
                const minKey = `${field.key}Min`;
                const maxKey = `${field.key}Max`;
                return (
                    <FilterSection
                        key={field.key}
                        title={field.label}
                        onClear={
                            (values[minKey] || values[maxKey])
                                ? () => {
                                    onChange(minKey, undefined);
                                    onChange(maxKey, undefined);
                                }
                                : undefined
                        }
                    >
                        <View style={styles.row}>
                            <TextInput
                                style={[styles.input, styles.halfInput]}
                                placeholder="Min"
                                placeholderTextColor={colors.gray}
                                keyboardType="numeric"
                                value={values[minKey] || ''}
                                onChangeText={(text) => onChange(minKey, text)}
                            />
                            <ThemedText style={styles.separator}>-</ThemedText>
                            <TextInput
                                style={[styles.input, styles.halfInput]}
                                placeholder="Max"
                                placeholderTextColor={colors.gray}
                                keyboardType="numeric"
                                value={values[maxKey] || ''}
                                onChangeText={(text) => onChange(maxKey, text)}
                            />
                        </View>
                    </FilterSection>
                );

            case 'select':
                // For select, we can use a similar approach or a simple text input for now if options are complex
                // Or render custom Select if needed. For now, let's treat as text or simple select if options exist
                // Ideally this would open another picker, but inline simple text filter might be easier for v1
                return (
                    <FilterSection
                        key={field.key}
                        title={field.label}
                        onClear={values[field.key] ? () => onChange(field.key, undefined) : undefined}
                    >
                        <TextInput
                            style={styles.input}
                            placeholder={field.placeholder || field.label}
                            placeholderTextColor={colors.gray}
                            value={values[field.key] || ''}
                            onChangeText={(text) => onChange(field.key, text)}
                        />
                    </FilterSection>
                );

            case 'text':
            case 'number':
            default:
                return (
                    <FilterSection
                        key={field.key}
                        title={field.label}
                        onClear={values[field.key] ? () => onChange(field.key, undefined) : undefined}
                    >
                        <TextInput
                            style={styles.input}
                            placeholder={field.placeholder || field.label}
                            placeholderTextColor={colors.gray}
                            value={values[field.key] || ''}
                            onChangeText={(text) => onChange(field.key, text)}
                            keyboardType={field.filterType === 'number' ? 'numeric' : 'default'}
                        />
                    </FilterSection>
                );
        }
    };

    return (
        <View>
            {fieldConfig.map(renderField)}
        </View>
    );
}
