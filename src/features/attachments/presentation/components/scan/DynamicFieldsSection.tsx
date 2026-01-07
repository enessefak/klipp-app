import { DatePickerField, FormField, TextInput } from '@/components/form';
import { Select } from '@/components/Select';
import { ThemedText } from '@/components/themed-text';
import { FieldConfig, FieldStyle } from '@/src/features/attachments/domain/AttachmentTypeFields';
import { LineItemsTable } from '@/src/features/attachments/presentation/components/LineItemsTable';
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
    fieldStyle?: FieldStyle | null;
}

export function DynamicFieldsSection({
    control,
    dynamicFields,
    watchedDetails,
    watchedDocumentDate,
    setValue,
    fieldStyle
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
    };

    const renderField = (field: FieldConfig, flex = 1) => {
        return (
            <Controller
                key={field.key}
                control={control}
                name={`details.${field.key}`}
                defaultValue={watchedDetails?.[field.key]}
                render={({ field: { onChange, value } }) => (
                    <View style={{ flex }}>
                        <FormField label={field.label} required={field.required}>
                            {/* Line Items Editor */}
                            {(Array.isArray(value) && typeof value[0] === 'object') || field.key === 'items' || field.key === 'lineItems' ? (
                                <View style={{ marginBottom: 12 }}>
                                    {value && value.length > 0 ? (
                                        <LineItemsTable
                                            items={value}
                                            label={field.label}
                                            currency={watchedDetails?.currency || 'TRY'}
                                            variant="editable"
                                            onEdit={() => console.log('Edit Items')}
                                        />
                                    ) : (
                                        <View style={{ backgroundColor: colors.card, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }}>
                                            <ThemedText style={{ color: colors.textLight, marginBottom: 4 }}>{field.label}</ThemedText>
                                            <TouchableOpacity onPress={() => console.log('Add Item')} style={{ padding: 8 }}>
                                                <ThemedText style={{ color: colors.primary, fontWeight: '600' }}>+ {i18n.t('common.actions.add')}</ThemedText>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            ) : field.type === 'duration' ? (
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
                                    hideLabel
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
                    </View>
                )}
            />
        );
    };

    if (fieldStyle?.mobile?.gridTemplateAreas) {
        const gap = fieldStyle.mobile.gap ? parseInt(fieldStyle.mobile.gap) : 12;

        const rows = fieldStyle.mobile.gridTemplateAreas.map((rowStr: string) => {
            return rowStr.replace(/['"]+/g, '').trim().split(/\s+/).filter(Boolean);
        });

        return (
            <View style={{ gap }}>
                {rows.map((rowKeys: string[], rowIndex: number) => (
                    <View key={rowIndex} style={{ flexDirection: 'row', gap }}>
                        {rowKeys.map((key: string, colIndex: number) => {
                            // Skip if handled by span
                            if (colIndex > 0 && key === rowKeys[colIndex - 1]) return null;

                            // Calculate span
                            let span = 1;
                            for (let i = colIndex + 1; i < rowKeys.length; i++) {
                                if (rowKeys[i] === key) span++;
                                else break;
                            }

                            const field = dynamicFields.find(f => f.key === key);
                            // If field exists, render it. If not, maybe show placeholder or empty view?
                            // For now only render if field exists
                            if (!field) return <View key={key} style={{ flex: span }} />;

                            return renderField(field, span);
                        })}
                    </View>
                ))}
            </View>
        );
    }

    return (
        <View style={{ gap: 16 }}>
            {dynamicFields.map(field => renderField(field))}
        </View>
    );
}
