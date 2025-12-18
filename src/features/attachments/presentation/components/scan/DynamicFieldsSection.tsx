import { DatePickerField, FormField, TextInput } from '@/components/form';
import { Select } from '@/components/Select';
import { ThemedText } from '@/components/themed-text';
import { FieldConfig } from '@/src/features/attachments/domain/AttachmentTypeFields';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import React from 'react';
import { Control, Controller, UseFormSetValue } from 'react-hook-form';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface DynamicFieldsSectionProps {
    control: Control<any>;
    dynamicFields: FieldConfig[];
    watchedDetails: any;
    watchedDocumentDate: Date;
    setValue: UseFormSetValue<any>;
}

export function DynamicFieldsSection({
    control,
    dynamicFields,
    watchedDetails,
    watchedDocumentDate,
    setValue
}: DynamicFieldsSectionProps) {
    const { colors } = useSettings();

    const styles = StyleSheet.create({
        durationRow: {
            flexDirection: 'row',
            gap: 12,
        },
        durationInput: {
            flex: 1,
        },
        durationUnitSelector: {
            flex: 2,
            flexDirection: 'row',
            backgroundColor: colors.card,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 4,
        },
        durationUnitButton: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            paddingVertical: 8,
        },
        durationUnitButtonActive: {
            backgroundColor: colors.primary,
        },
        durationUnitText: {
            fontSize: 13,
            color: colors.subtext,
        },
        durationUnitTextActive: {
            color: '#FFFFFF',
            fontWeight: '600',
        },
        textArea: {
            height: 100,
            textAlignVertical: 'top',
        },
    });

    const updateDetailField = (key: string, value: any) => {
        // Granular update to trigger Controller re-renders
        setValue(`details.${key}`, value, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
        });

        // We probably don't need to update the whole 'details' object here 
        // if we are binding everything properly, but let's keep it safe if needed.
        // Actually, for side effects like warrantyEndDate, granular is better.
    };

    return (
        <>
            {dynamicFields.map((field) => (
                <Controller
                    key={field.key}
                    control={control}
                    name={`details.${field.key}`}
                    defaultValue={watchedDetails?.[field.key]}
                    render={({ field: { onChange, value } }) => (
                        <FormField label={field.label} required={field.required}>
                            {field.type === 'duration' ? (
                                <View style={styles.durationRow}>
                                    <TextInput
                                        style={styles.durationInput}
                                        placeholder="0"
                                        value={value?.toString() || ''}
                                        onChangeText={(text) => {
                                            const numValue = parseInt(text) || 0;
                                            onChange(numValue);

                                            // Auto-calculate end date based on duration
                                            if (field.key === 'warrantyDuration') {
                                                const endDate = new Date(watchedDocumentDate);
                                                const unit = watchedDetails.warrantyDurationUnit || 'month';
                                                if (unit === 'day') {
                                                    endDate.setDate(endDate.getDate() + numValue);
                                                } else if (unit === 'month') {
                                                    endDate.setMonth(endDate.getMonth() + numValue);
                                                } else if (unit === 'year') {
                                                    endDate.setFullYear(endDate.getFullYear() + numValue);
                                                }
                                                updateDetailField('warrantyEndDate', endDate.toISOString());
                                            }
                                        }}
                                        keyboardType="numeric"
                                    />
                                    <View style={styles.durationUnitSelector}>
                                        {['day', 'month', 'year'].map((unit) => (
                                            <TouchableOpacity
                                                key={unit}
                                                style={[
                                                    styles.durationUnitButton,
                                                    (watchedDetails?.[`${field.key}Unit`] || 'month') === unit && styles.durationUnitButtonActive
                                                ]}
                                                onPress={() => {
                                                    updateDetailField(`${field.key}Unit`, unit);

                                                    // Recalculate end date
                                                    const numValue = watchedDetails?.[field.key] || 0;
                                                    const endDate = new Date(watchedDocumentDate);
                                                    if (unit === 'day') {
                                                        endDate.setDate(endDate.getDate() + numValue);
                                                    } else if (unit === 'month') {
                                                        endDate.setMonth(endDate.getMonth() + numValue);
                                                    } else if (unit === 'year') {
                                                        endDate.setFullYear(endDate.getFullYear() + numValue);
                                                    }
                                                    updateDetailField('warrantyEndDate', endDate.toISOString());
                                                }}
                                            >
                                                <ThemedText style={[
                                                    styles.durationUnitText,
                                                    (watchedDetails?.[`${field.key}Unit`] || 'month') === unit && styles.durationUnitTextActive
                                                ]}>
                                                    {i18n.t(`common.units.${unit}` as any)}
                                                </ThemedText>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            ) : field.type === 'date' ? (
                                <DatePickerField
                                    label={field.label}
                                    value={value ? new Date(value) : undefined}
                                    onChange={(date) => onChange(date.toISOString())}
                                    placeholder={field.placeholder || i18n.t('common.actions.select_date')}
                                    error={field.required && !value ? 'Required' : undefined}
                                />
                            ) : field.type === 'textarea' ? (
                                <TextInput
                                    style={styles.textArea}
                                    placeholder={field.placeholder}
                                    value={value || ''}
                                    onChangeText={onChange}
                                    multiline
                                    numberOfLines={4}
                                />
                            ) : field.type === 'select' ? (
                                <Select
                                    label={field.label}
                                    value={value}
                                    options={(field.options || []).map((opt) => ({ label: opt, value: opt }))}
                                    onChange={onChange}
                                    placeholder={field.placeholder}
                                />
                            ) : field.type === 'number' ? (
                                <TextInput
                                    placeholder={field.placeholder}
                                    value={value?.toString() || ''}
                                    onChangeText={(text) => onChange(parseFloat(text) || '')}
                                    keyboardType="numeric"
                                />
                            ) : (
                                <TextInput
                                    placeholder={field.placeholder}
                                    value={value || ''}
                                    onChangeText={onChange}
                                />
                            )}
                        </FormField>
                    )}
                />
            ))}
        </>
    );
}
