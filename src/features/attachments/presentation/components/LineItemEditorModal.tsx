
import { Button, FormField, TextInput } from '@/components/form';
import { Select } from '@/components/Select';
import { ThemedText } from '@/components/themed-text';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface LineItemEditorModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (item: any) => void;
    initialItem?: any;
    itemsConfig?: any[]; // Dynamic configuration
    currency?: string;
}

const UNIT_OPTIONS = [
    { label: 'Adet (C62)', value: 'C62' },
    { label: 'Kilogram (KGM)', value: 'KGM' },
    { label: 'Litre (LTR)', value: 'LTR' },
    { label: 'Saat (HUR)', value: 'HUR' },
    { label: 'Gün (DAY)', value: 'DAY' },
    { label: 'Ay (MON)', value: 'MON' },
    { label: 'Yıl (ANN)', value: 'ANN' },
    { label: 'Paket (PA)', value: 'PA' },
    { label: 'Kutu (BX)', value: 'BX' },
    { label: 'Metre (MTR)', value: 'MTR' },
];

export const LineItemEditorModal = ({ visible, onClose, onSave, initialItem, itemsConfig, currency = 'TRY' }: LineItemEditorModalProps) => {
    const { colors } = useSettings();
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (visible) {
            const initialData = initialItem || {};
            setFormData(updateCalculations(initialData));
        }
    }, [visible, initialItem]);

    // Helper to update calculations
    const updateCalculations = (newData: any) => {
        const qty = parseFloat(newData.quantity) || 0;
        const price = parseFloat(newData.unitPrice) || 0;
        const discount = parseFloat(newData.discountAmount) || 0;
        const vatRate = parseFloat(newData.vatRate) || 0;

        // Calculate Totals
        // totalAmount (Tutar) usually refers to the Net Amount (LineExtensionAmount) in UBL, which is (Price * Qty) - Discount
        const grossTotal = qty * price;
        const totalAmount = Math.max(0, grossTotal - discount); // Net Amount
        const vatAmount = totalAmount * (vatRate / 100);
        const totalAmountInc = totalAmount + vatAmount;

        return {
            ...newData,
            totalAmount: Number(totalAmount.toFixed(2)), // Net Amount (Gross - Discount)
            vatAmount: Number(vatAmount.toFixed(2)),
            totalAmountInc: Number(totalAmountInc.toFixed(2))
        };
    };

    const handleChange = (key: string, value: string | number) => {
        setFormData((prev: any) => {
            const newData = { ...prev, [key]: value };

            // Trigger calculation if relevant fields change
            if (['quantity', 'unitPrice', 'discountAmount', 'vatRate'].includes(key)) {
                return updateCalculations(newData);
            }
            return newData;
        });
    };

    const handleSave = () => {
        // Basic validation?
        onSave(formData);
        onClose();
    };

    // Default configuration if none provided
    const defaultColumns = [
        { key: 'description', label: 'attachments.items.description', type: 'textarea' },
        { key: 'quantity', label: 'attachments.items.quantity', type: 'number' },
        { key: 'unitCode', label: 'attachments.items.unitCode', type: 'select', options: UNIT_OPTIONS },
        { key: 'unitPrice', label: 'attachments.items.unitPrice', type: 'number' },
        { key: 'discountAmount', label: 'attachments.items.discountAmount', type: 'number' },
        { key: 'vatRate', label: 'attachments.items.vat', type: 'number' },
        { key: 'vatAmount', label: 'attachments.items.vatAmount', type: 'number' }, // Calculated
        { key: 'totalAmount', label: 'attachments.items.totalAmount', type: 'number' }, // Gross
        { key: 'totalAmountInc', label: 'attachments.items.totalAmountInc', type: 'number' }, // Net + VAT
    ];

    const fields = itemsConfig && Array.isArray(itemsConfig) ? itemsConfig : defaultColumns;

    const styles = StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
        },
        container: {
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: '90%',
            padding: 20,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
        },
        title: {
            fontSize: 18,
            fontWeight: '600',
        },
        closeButton: {
            padding: 8,
        },
        content: {
            flex: 1,
        },
        footer: {
            marginTop: 20,
            gap: 12,
        },
    });

    // Ensure itemsConfig passed has 'select' type for unitCode if we want to force it?
    // Or we just check key === 'unitCode'

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <ThemedText style={styles.title}>
                            {initialItem ? i18n.t('common.actions.edit') : i18n.t('common.actions.add')}
                        </ThemedText>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <ThemedText>✕</ThemedText>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {fields.map((field: any) => {
                            // Determine input type
                            const isNumber = field.type === 'number';
                            const isTextArea = field.type === 'textarea' || field.key === 'description';
                            const isSelect = field.type === 'select' || field.key === 'unitCode';

                            if (isSelect) {
                                return (
                                    <FormField key={field.key} label={i18n.t(field.label, { defaultValue: field.label })}>
                                        <Select
                                            options={field.options || UNIT_OPTIONS}
                                            value={formData[field.key]}
                                            onChange={(val: string) => handleChange(field.key, val)}
                                            label={i18n.t(field.label, { defaultValue: field.label })}
                                            placeholder={i18n.t(field.label, { defaultValue: field.label })}
                                            hideLabel
                                        />
                                    </FormField>
                                );
                            }

                            return (
                                <FormField key={field.key} label={i18n.t(field.label, { defaultValue: field.label })}>
                                    <TextInput
                                        value={formData[field.key]?.toString() || ''}
                                        onChangeText={(text) => {
                                            if (isNumber) {
                                                handleChange(field.key, text);
                                            } else {
                                                handleChange(field.key, text);
                                            }
                                        }}
                                        keyboardType={isNumber ? 'numeric' : 'default'}
                                        multiline={isTextArea}
                                        numberOfLines={isTextArea ? 3 : 1}
                                        style={isTextArea ? { height: 80, textAlignVertical: 'top' } : undefined}
                                        placeholder={i18n.t(field.label, { defaultValue: field.label })}
                                    />
                                </FormField>
                            );
                        })}
                    </ScrollView>

                    <View style={styles.footer}>
                        <Button title={i18n.t('common.actions.save')} onPress={handleSave} />
                        <Button title={i18n.t('common.actions.cancel')} variant="outline" onPress={onClose} />
                    </View>
                </View>
            </View>
        </Modal>
    );
};
