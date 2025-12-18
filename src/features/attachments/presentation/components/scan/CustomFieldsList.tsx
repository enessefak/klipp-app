import { Button, TextInput } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export interface CustomField {
    key: string;
    value: string;
}

interface CustomFieldsListProps {
    fields: CustomField[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    onUpdate: (index: number, field: 'key' | 'value', value: string) => void;
    title?: string;
    style?: any;
}

export function CustomFieldsList({ fields, onAdd, onRemove, onUpdate, title, style }: CustomFieldsListProps) {
    const { colors } = useSettings();

    const styles = StyleSheet.create({
        container: {
            marginTop: 16,
        },
        title: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 12,
        },
        row: {
            flexDirection: 'row',
            marginBottom: 8,
            alignItems: 'center',
            gap: 8,
        },
        keyInput: {
            flex: 1,
        },
        valueInput: {
            flex: 2,
        },
        removeButton: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.error + '20',
            alignItems: 'center',
            justifyContent: 'center',
        },
        removeButtonText: {
            color: colors.error,
            fontSize: 16,
            fontWeight: '600',
        },
        addButton: {
            marginTop: 4,
            borderColor: colors.primary,
        },
    });

    return (
        <View style={[styles.container, style]}>
            {title && <ThemedText style={styles.title}>{title}</ThemedText>}

            {fields.map((field, index) => (
                <View key={index} style={styles.row}>
                    <TextInput
                        style={styles.keyInput}
                        placeholder={i18n.t('receipts.scan.custom_fields.key_placeholder')}
                        value={field.key}
                        onChangeText={(text) => onUpdate(index, 'key', text)}
                    />
                    <TextInput
                        style={styles.valueInput}
                        placeholder={i18n.t('receipts.scan.custom_fields.value_placeholder')}
                        value={field.value}
                        onChangeText={(text) => onUpdate(index, 'value', text)}
                    />
                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => onRemove(index)}
                    >
                        <ThemedText style={styles.removeButtonText}>✕</ThemedText>
                    </TouchableOpacity>
                </View>
            ))}

            <Button
                title={i18n.t('receipts.scan.custom_fields.add_button')}
                variant="outline"
                onPress={onAdd}
                style={styles.addButton}
            />
        </View>
    );
}
