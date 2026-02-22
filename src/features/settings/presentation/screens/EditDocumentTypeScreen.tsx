import { Select } from '@/components/Select';
import { FormField, TextInput } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAttachmentTypes } from '@/src/features/attachments/presentation/useAttachmentTypes';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

const buildFieldConfigSchema = () => {
    const requiredMessage = i18n.t('validation.required') as string;
    const fieldLabelRequired = (i18n.t('settings.documentTypes.validation.fieldLabelRequired') as string) || requiredMessage;

    return z.object({
        key: z.string().min(1, requiredMessage),
        label: z.string().min(1, fieldLabelRequired),
        type: z.enum(['text', 'number', 'date', 'select', 'textarea']),
        required: z.boolean(),
    });
};

const buildFormSchema = () => {
    const nameRequired = (i18n.t('settings.documentTypes.validation.nameRequired') as string) || (i18n.t('validation.required') as string);
    const iconRequired = (i18n.t('settings.documentTypes.validation.iconRequired') as string) || (i18n.t('validation.required') as string);
    const fieldSchema = buildFieldConfigSchema();

    return z.object({
        name: z.string().min(1, nameRequired),
        icon: z.string().min(1, iconRequired),
        color: z.string(),
        category: z.enum(['FINANCIAL', 'IDENTITY', 'INSURANCE', 'CONTRACT', 'MEDICAL', 'VEHICLE', 'EDUCATION', 'PERSONNEL', 'OTHER']),
        transactionType: z.enum(['INCOME', 'EXPENSE', 'NEUTRAL']),
        fields: z.array(fieldSchema),
        fieldStyle: z.object({
            mobile: z.object({
                gridTemplateAreas: z.array(z.string())
            }).optional()
        }).optional()
    });
};

type FormSchema = ReturnType<typeof buildFormSchema>;
type FormValues = z.infer<FormSchema>;

interface EditDocumentTypeScreenProps {
    mode: 'create' | 'edit';
}

const slugify = (text: string) => {
    return text.toLowerCase()
        .replace(/[^a-z0-9_ğüşöçı]/g, '')
        .replace(/\s+/g, '_');
};

export function EditDocumentTypeScreen({ mode }: EditDocumentTypeScreenProps) {
    const { colors } = useSettings();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { attachmentTypes, createType, updateType, refresh, loading: typesLoading } = useAttachmentTypes();
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'definition' | 'layout'>('definition');
    const [activeRowIndex, setActiveRowIndex] = useState(0);

    const targetType = useMemo(() => attachmentTypes.find(t => t.id === id), [attachmentTypes, id]);

    const locale = i18n.locale;
    const formSchema = useMemo(() => buildFormSchema(), [locale]);
    const resolver = useMemo(() => zodResolver(formSchema), [formSchema]);

    const form = useForm<FormValues>({
        resolver,
        defaultValues: {
            name: '',
            icon: '📄',
            color: '#AF52DE',
            category: 'OTHER',
            transactionType: 'NEUTRAL',
            fields: [],
            fieldStyle: { mobile: { gridTemplateAreas: [] } }
        }
    });

    const { control, handleSubmit, reset, watch } = form;
    const watchedFields = watch('fields');
    const layoutRows = watch('fieldStyle.mobile.gridTemplateAreas') || [];
    const availableFieldKeys = watchedFields.map((field, idx) => field.key || `field_${idx + 1}`);
    const parsedLayoutRows = layoutRows.map(row => (row ? row.split(/\s+/).filter(Boolean) : []));
    useEffect(() => {
        if (layoutRows.length === 0) {
            setActiveRowIndex(0);
            return;
        }
        if (activeRowIndex > layoutRows.length - 1) {
            setActiveRowIndex(Math.max(layoutRows.length - 1, 0));
        }
    }, [layoutRows, activeRowIndex]);
    const { fields, append, remove, move } = useFieldArray({ control, name: 'fields' });

    useEffect(() => {
        if (mode === 'edit' && targetType) {
            reset({
                name: targetType.name || '',
                icon: targetType.icon || '📄',
                color: targetType.color || '#AF52DE',
                category: (targetType.category as any) || 'OTHER',
                transactionType: targetType.transactionType?.name || 'NEUTRAL',
                fields: (targetType.fieldConfig || []).map(f => ({
                    key: f.key,
                    label: f.label,
                    type: f.type as any,
                    required: !!f.required,
                })),
                fieldStyle: targetType.fieldStyle || { mobile: { gridTemplateAreas: [] } }
            });
        }
    }, [mode, targetType, reset]);

    const styles = useMemo(() => StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
            backgroundColor: colors.headerBackground,
        },
        headerTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
        content: { padding: 16 },
        sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12, marginTop: 24 },
        sectionTitleContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 24,
            marginBottom: 12,
            gap: 12,
        },
        sectionSubtitle: { color: colors.textLight, fontSize: 13 },
        card: { backgroundColor: colors.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.cardBorder, marginBottom: 16 },
        fieldItem: { backgroundColor: colors.background, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 12 },
        fieldHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
        fieldActions: { flexDirection: 'row', gap: 8 },
        actionBtn: { padding: 4 },
        row: { flexDirection: 'row', gap: 12 },
        col: { flex: 1 },
        pickerContainer: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, backgroundColor: colors.card, overflow: 'hidden', height: 48, justifyContent: 'center' },
        tabBar: {
            flexDirection: 'row',
            marginHorizontal: 16,
            marginTop: 8,
            borderRadius: 12,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            overflow: 'hidden'
        },
        tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center' },
        tabButtonActive: { backgroundColor: colors.primary + '22' },
        tabButtonLabel: { color: colors.textLight, fontWeight: '600' },
        tabButtonLabelActive: { color: colors.primary },
        previewEmpty: { color: colors.textLight, fontSize: 13 },
        previewRowLabel: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.cardBorder,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
        },
        previewRowLabelText: { color: colors.text, fontWeight: '600' },
        chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
        resetButton: { color: colors.primary, fontWeight: '600' },
        addRowLabel: { fontWeight: '600' },
        addRowPill: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: colors.primary,
            backgroundColor: colors.card,
        },
        emptyStateCard: {
            borderWidth: 1,
            borderColor: colors.cardBorder,
            borderRadius: 12,
            padding: 24,
            alignItems: 'center',
            backgroundColor: colors.card,
        },
        layoutRow: {
            borderWidth: 1,
            borderColor: colors.cardBorder,
            borderRadius: 12,
            padding: 12,
            backgroundColor: colors.card,
        },
        layoutRowActive: {
            borderColor: colors.primary,
            shadowColor: colors.primary,
            shadowOpacity: 0.12,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
        },
        layoutRowHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 8,
        },
        layoutRowChips: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        rowChip: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
        },
        rowChipText: { color: colors.text },
        rowRemoveButton: { padding: 4 },
        keyChip: {
            borderRadius: 999,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            paddingVertical: 6,
            paddingHorizontal: 14,
            backgroundColor: colors.background,
        },
        keyChipDisabled: { opacity: 0.3 },
        keyChipText: { color: colors.text, fontSize: 13 },
    }), [colors]);

    const categoryOptions = useMemo(() => {
        const values: FormValues['category'][] = ['OTHER', 'FINANCIAL', 'IDENTITY', 'CONTRACT', 'INSURANCE', 'MEDICAL', 'VEHICLE', 'EDUCATION', 'PERSONNEL'];
        return values.map((value) => ({
            label: `${i18n.t(`settings.documentTypes.form.categories.${value}`) as string} (${value})`,
            value,
        }));
    }, [locale]);

    const transactionTypeOptions = useMemo(() => {
        const values: FormValues['transactionType'][] = ['NEUTRAL', 'INCOME', 'EXPENSE'];
        return values.map((value) => ({
            label: `${i18n.t(`settings.documentTypes.form.transactionTypes.${value}`) as string} (${value})`,
            value,
        }));
    }, [locale]);

    const fieldTypeOptions = useMemo(() => {
        const values: Array<FormValues['fields'][number]['type']> = ['text', 'number', 'date', 'select', 'textarea'];
        return values.map((value) => ({
            label: i18n.t(`settings.documentTypes.form.fieldTypes.${value}`) as string,
            value,
        }));
    }, [locale]);

    const addFieldLabel = (i18n.t('settings.documentTypes.form.addField') as string) || 'Alan Ekle';
    const noFieldsText = (i18n.t('settings.documentTypes.form.noFields') as string) || 'Özel alan eklenmedi.';
    const fieldLabelForIndex = (index: number) => (i18n.t('settings.documentTypes.form.fieldLabel', { index: index + 1 }) as string) || `Alan ${index + 1}`;
    const definitionTabLabel = (i18n.t('settings.documentTypes.form.tabs.definition') as string) || 'Definition';
    const layoutTabLabel = (i18n.t('settings.documentTypes.form.tabs.layout') as string) || 'Layout';
    const layoutAvailableKeysLabel = (i18n.t('settings.documentTypes.form.layout.availableKeys') as string) || 'Kullanılabilir Alan Anahtarları';
    const layoutAddRowLabel = (i18n.t('settings.documentTypes.form.layout.addRow') as string) || 'Satır Ekle';
    const layoutResetLabel = (i18n.t('settings.documentTypes.form.layout.reset') as string) || 'Yerleşimi Temizle';
    const layoutRowsTitle = (i18n.t('settings.documentTypes.form.layout.rowsTitle') as string) || 'Satırlar';
    const layoutNoRowsText = (i18n.t('settings.documentTypes.form.layout.noRows') as string) || 'Yerleşim oluşturmak için satır ekleyin.';
    const layoutAddFieldHint = (i18n.t('settings.documentTypes.form.layout.addFieldHint') as string) || 'Bir satırı seçin ve aşağıdaki anahtarlara dokunarak alan ekleyin.';
    const layoutRowEmptyText = (i18n.t('settings.documentTypes.form.layout.rowEmpty') as string) || 'Alan eklemek için bir anahtar seçin.';
    const layoutRemoveRowLabel = (i18n.t('settings.documentTypes.form.layout.removeRow') as string) || 'Satırı Sil';

    const setLayoutRowsValue = (rows: string[]) => {
        form.setValue('fieldStyle.mobile.gridTemplateAreas', rows);
    };

    const handleAddLayoutRow = () => {
        const newRows = [...layoutRows, ''];
        setLayoutRowsValue(newRows);
        setActiveRowIndex(newRows.length - 1);
    };

    const handleResetLayout = () => {
        setLayoutRowsValue([]);
        setActiveRowIndex(0);
    };

    const updateRowTokens = (rowIndex: number, tokens: string[], baseRows: string[] = layoutRows) => {
        const updatedRows = [...baseRows];
        updatedRows[rowIndex] = tokens.join(' ').trim();
        setLayoutRowsValue(updatedRows);
    };

    const handleAddFieldToRow = (key: string) => {
        if (!availableFieldKeys.includes(key)) return;
        if (layoutRows.length === 0) {
            const newRows = [`${key}`];
            setLayoutRowsValue(newRows);
            setActiveRowIndex(0);
            return;
        }
        const targetIndex = Math.min(activeRowIndex, Math.max(layoutRows.length - 1, 0));
        const tokens = parsedLayoutRows[targetIndex] || [];
        if (tokens.includes(key)) return;
        updateRowTokens(targetIndex, [...tokens, key]);
    };

    const handleRemoveFieldFromRow = (rowIndex: number, key: string) => {
        const tokens = parsedLayoutRows[rowIndex] || [];
        updateRowTokens(rowIndex, tokens.filter(token => token !== key));
    };

    const handleRemoveRow = (rowIndex: number) => {
        const updatedRows = layoutRows.filter((_, idx) => idx !== rowIndex);
        setLayoutRowsValue(updatedRows);
        if (activeRowIndex >= updatedRows.length) {
            setActiveRowIndex(Math.max(updatedRows.length - 1, 0));
        }
    };

    const renderDefinitionTab = () => (
        <>
            <ThemedText style={[styles.sectionTitle, { marginTop: 0 }]}>
                {i18n.t('settings.documentTypes.form.generalInfo') || 'Genel Bilgiler'}
            </ThemedText>
            <View style={styles.card}>
                <View style={styles.row}>
                    <View style={styles.col}>
                        <Controller
                            control={control}
                            name="name"
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                <FormField
                                    label={i18n.t('settings.documentTypes.form.nameLabel') || 'İsim'}
                                    error={error?.message}
                                    required
                                >
                                    <TextInput
                                        value={value}
                                        onChangeText={onChange}
                                        placeholder={i18n.t('settings.documentTypes.form.namePlaceholder') || 'Örn: Rapor'}
                                    />
                                </FormField>
                            )}
                        />
                    </View>
                    <View style={{ width: 80 }}>
                        <Controller
                            control={control}
                            name="icon"
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                <FormField
                                    label={i18n.t('settings.documentTypes.form.iconLabel') || 'İkon'}
                                    error={error?.message}
                                    required
                                >
                                    <TextInput
                                        value={value}
                                        onChangeText={onChange}
                                        placeholder="📄"
                                        textAlign="center"
                                    />
                                </FormField>
                            )}
                        />
                    </View>
                </View>

                <Controller
                    control={control}
                    name="category"
                    render={({ field: { onChange, value } }) => (
                        <Select
                            label={i18n.t('settings.documentTypes.form.categoryLabel') || 'Kategori'}
                            value={value}
                            onChange={onChange}
                            options={categoryOptions}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="transactionType"
                    render={({ field: { onChange, value } }) => (
                        <Select
                            label={i18n.t('settings.documentTypes.form.transactionTypeLabel') || 'İşlem Tipi'}
                            value={value}
                            onChange={onChange}
                            options={transactionTypeOptions}
                        />
                    )}
                />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 }}>
                <ThemedText style={[styles.sectionTitle, { marginTop: 0, marginBottom: 0 }]}>
                    {i18n.t('settings.documentTypes.form.customFieldsTitle') || 'İlave Alanlar'}
                </ThemedText>
                <TouchableOpacity onPress={() => append({ key: '', label: '', type: 'text', required: false })}>
                    <ThemedText style={{ color: colors.primary, fontWeight: '600' }}>+ {addFieldLabel}</ThemedText>
                </TouchableOpacity>
            </View>

            <View style={[styles.card, { backgroundColor: 'transparent', borderColor: 'transparent', padding: 0 }]}>
                {fields.length === 0 ? (
                    <View style={[styles.card, { alignItems: 'center', padding: 32 }]}>
                        <ThemedText style={{ color: colors.textLight }}>{noFieldsText}</ThemedText>
                    </View>
                ) : (
                    fields.map((field, index) => (
                        <View key={field.id} style={styles.fieldItem}>
                            <View style={styles.fieldHeader}>
                                <ThemedText style={{ fontWeight: '600', color: colors.text }}>{fieldLabelForIndex(index)}</ThemedText>
                                <View style={styles.fieldActions}>
                                    <TouchableOpacity disabled={index === 0} onPress={() => move(index, index - 1)} style={styles.actionBtn}>
                                        <IconSymbol name="arrow.up" size={16} color={index === 0 ? colors.border : colors.textLight} />
                                    </TouchableOpacity>
                                    <TouchableOpacity disabled={index === fields.length - 1} onPress={() => move(index, index + 1)} style={styles.actionBtn}>
                                        <IconSymbol name="arrow.down" size={16} color={index === fields.length - 1 ? colors.border : colors.textLight} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => remove(index)} style={styles.actionBtn}>
                                        <IconSymbol name="trash" size={16} color={colors.error} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Controller
                                control={control}
                                name={`fields.${index}.label`}
                                render={({ field: { onChange, value }, fieldState: { error } }) => (
                                    <FormField
                                        label={i18n.t('settings.documentTypes.form.fieldNameLabel') || 'Alan Adı (Örn: Plaka)'}
                                        error={error?.message}
                                    >
                                        <TextInput
                                            value={value}
                                            onChangeText={(val) => {
                                                onChange(val);
                                                form.setValue(`fields.${index}.key`, slugify(val));
                                            }}
                                            placeholder={i18n.t('settings.documentTypes.form.fieldNamePlaceholder') || 'Alan Adı'}
                                        />
                                    </FormField>
                                )}
                            />

                            <Controller
                                control={control}
                                name={`fields.${index}.type`}
                                render={({ field: { onChange, value } }) => (
                                    <Select
                                        label={i18n.t('settings.documentTypes.form.fieldTypeLabel') || 'Veri Tipi'}
                                        value={value}
                                        onChange={onChange}
                                        options={fieldTypeOptions}
                                    />
                                )}
                            />
                        </View>
                    ))
                )}
            </View>
        </>
    );

    const renderLayoutRow = (idx: number) => {
        const tokens = parsedLayoutRows[idx] || [];
        const isActive = idx === Math.min(activeRowIndex, layoutRows.length - 1);
        return (
            <View key={`layout-row-${idx}`} style={[styles.layoutRow, isActive && styles.layoutRowActive]}>
                <TouchableOpacity style={styles.layoutRowHeader} onPress={() => setActiveRowIndex(idx)}>
                    <View style={styles.previewRowLabel}>
                        <ThemedText style={styles.previewRowLabelText}>{`R${idx + 1}`}</ThemedText>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveRow(idx)} style={styles.rowRemoveButton}>
                        <IconSymbol name="trash" size={16} color={colors.error} />
                    </TouchableOpacity>
                </TouchableOpacity>
                <View style={styles.layoutRowChips}>
                    {tokens.length === 0 ? (
                        <ThemedText style={styles.previewEmpty}>{layoutRowEmptyText}</ThemedText>
                    ) : (
                        tokens.map((token) => (
                            <View key={`${token}-${idx}`} style={styles.rowChip}>
                                <ThemedText style={styles.rowChipText}>{token}</ThemedText>
                                <TouchableOpacity onPress={() => handleRemoveFieldFromRow(idx, token)}>
                                    <IconSymbol name="xmark" size={14} color={colors.textLight} />
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </View>
            </View>
        );
    };

    const selectedRowTokens = parsedLayoutRows[Math.min(activeRowIndex, parsedLayoutRows.length - 1)] || [];

    const renderLayoutTab = () => (
        <>
            <View style={styles.sectionTitleContainer}>
                <ThemedText style={styles.sectionTitle}>{layoutRowsTitle}</ThemedText>
                <TouchableOpacity onPress={handleAddLayoutRow} style={styles.addRowPill}>
                    <IconSymbol name="plus" size={16} color={colors.primary} />
                    <ThemedText style={[styles.addRowLabel, { color: colors.primary }]}>{layoutAddRowLabel}</ThemedText>
                </TouchableOpacity>
            </View>

            {layoutRows.length === 0 ? (
                <View style={styles.emptyStateCard}>
                    <ThemedText style={styles.previewEmpty}>{layoutNoRowsText}</ThemedText>
                    <TouchableOpacity onPress={handleAddLayoutRow}>
                        <ThemedText style={[styles.addRowLabel, { color: colors.primary, marginTop: 8 }]}>{layoutAddRowLabel}</ThemedText>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={{ gap: 12 }}>
                    {layoutRows.map((_, idx) => renderLayoutRow(idx))}
                </View>
            )}

            <View style={[styles.sectionTitleContainer, { marginTop: 24 }]}>
                <View>
                    <ThemedText style={styles.sectionTitle}>{layoutAvailableKeysLabel}</ThemedText>
                    <ThemedText style={styles.sectionSubtitle}>{layoutAddFieldHint}</ThemedText>
                </View>
                <TouchableOpacity onPress={handleResetLayout}>
                    <ThemedText style={styles.resetButton}>{layoutResetLabel}</ThemedText>
                </TouchableOpacity>
            </View>

            <View style={styles.chipRow}>
                {availableFieldKeys.length === 0 ? (
                    <ThemedText style={styles.previewEmpty}>+ {addFieldLabel}</ThemedText>
                ) : (
                    availableFieldKeys.map((key, idx) => {
                        const disabled = selectedRowTokens.includes(key) && layoutRows.length > 0;
                        return (
                            <TouchableOpacity
                                key={`${key}-${idx}`}
                                style={[styles.keyChip, disabled && styles.keyChipDisabled]}
                                onPress={() => !disabled && handleAddFieldToRow(key)}
                                disabled={disabled || layoutRows.length === 0}
                            >
                                <ThemedText style={styles.keyChipText}>{key}</ThemedText>
                            </TouchableOpacity>
                        );
                    })
                )}
            </View>
        </>
    );

    const onSubmit = async (data: FormValues) => {
        try {
            setSubmitting(true);
            if (mode === 'create') {
                await createType(data);
                Alert.alert(
                    i18n.t('common.success') || 'Başarılı',
                    (i18n.t('settings.documentTypes.form.alerts.createSuccess') as string) || 'Belge türü oluşturuldu.'
                );
            } else {
                await updateType(id!, data);
                Alert.alert(
                    i18n.t('common.success') || 'Başarılı',
                    (i18n.t('settings.documentTypes.form.alerts.updateSuccess') as string) || 'Belge türü güncellendi.'
                );
            }
            router.back();
        } catch (err) {
            Alert.alert(
                i18n.t('common.error') || 'Hata',
                (i18n.t('settings.documentTypes.form.alerts.genericError') as string) || 'İşlem başarısız oldu.'
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
                    <IconSymbol name="xmark" size={24} color={colors.text} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>
                    {mode === 'create'
                        ? (i18n.t('settings.documentTypes.form.headerCreate') as string) || 'Yeni Belge Türü'
                        : (i18n.t('settings.documentTypes.form.headerEdit') as string) || 'Belge Türünü Düzenle'}
                </ThemedText>
                <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={submitting} style={{ padding: 4 }}>
                    <ThemedText style={{ color: colors.primary, fontWeight: '600' }}>
                        {i18n.t('common.actions.save') || 'Kaydet'}
                    </ThemedText>
                </TouchableOpacity>
            </View>
            <View style={styles.tabBar}>
                {(['definition', 'layout'] as const).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <ThemedText
                            style={[styles.tabButtonLabel, activeTab === tab && styles.tabButtonLabelActive]}
                        >
                            {tab === 'definition' ? definitionTabLabel : layoutTabLabel}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
                {activeTab === 'definition' ? renderDefinitionTab() : renderLayoutTab()}
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}
