import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { AttachmentTypeSelector } from '@/components/AttachmentTypeSelector';
import { FolderSelector } from '@/components/FolderSelector';
import { Button, FormContainer, FormField, TextInput } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AttachmentService } from '@/src/features/attachments/data/AttachmentService';
import { AttachmentTypeIds } from '@/src/features/attachments/domain/Attachment';
import { AttachmentTypeFieldFactory, FieldConfig } from '@/src/features/attachments/domain/AttachmentTypeFields';
import { useAttachmentTypes } from '@/src/features/attachments/presentation/useAttachmentTypes';
import { useFolders } from '@/src/features/folders/presentation/useFolders';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CurrencySelect } from '../components/CurrencySelect';

const customFieldSchema = z.object({
    key: z.string(),
    value: z.string(),
});

const editSchema = z.object({
    title: z.string().min(1, i18n.t('receipts.scan.validation.title_required')),
    amount: z.string().optional(),
    currency: z.string(),
    attachmentTypeId: z.string().min(1, i18n.t('receipts.scan.validation.type_required')),
    folderId: z.string().min(1, i18n.t('receipts.scan.validation.folder_required')),
    documentDate: z.date(),
    details: z.record(z.string(), z.any()).optional(),
    description: z.string().optional(),
    customFields: z.array(customFieldSchema).optional(),
});

type EditFormData = z.infer<typeof editSchema>;

export default function EditAttachmentScreen() {
    const { colors } = useSettings();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // UI State
    const [showDetails, setShowDetails] = useState(true);
    const [dynamicFields, setDynamicFields] = useState<FieldConfig[]>([]);

    const { attachmentTypes } = useAttachmentTypes();
    const { folders } = useFolders();

    const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<EditFormData>({
        resolver: zodResolver(editSchema),
        defaultValues: {
            title: '',
            amount: '',
            currency: 'TRY',
            attachmentTypeId: AttachmentTypeIds.RECEIPT,
            folderId: '',
            documentDate: new Date(),
            details: {},
            description: '',
            customFields: [],
        },
    });

    const watchedTypeId = watch('attachmentTypeId');
    const watchedDetails = (watch('details') || {}) as Record<string, any>;
    const watchedCustomFields = watch('customFields') || [];

    const [user, setUser] = useState<{ id: string } | null>(null);

    // Load initial data
    useEffect(() => {
        // Fetch current user for ownership check
        import('@/src/features/auth/data/AuthService').then(({ AuthService }) => {
            AuthService.getUser().then(u => setUser(u)).catch(console.error);
        });

        if (id) {
            loadAttachment();
        }
    }, [id]);

    const loadAttachment = async () => {
        try {
            setLoading(true);
            const data = await AttachmentService.getAttachmentById(id!);

            // Transform details if needed
            let details = data.details || {};
            let customFields: { key: string; value: string }[] = [];

            // If there are details that don't belong to the schema, move them to customFields?
            // For now, let's just assume details match.
            // Ideally we should separate schema details from custom k/v pairs.
            // But current backend stores all in 'details' json column.

            reset({
                title: data.title,
                amount: data.amount ? String(data.amount) : '',
                currency: data.currency || 'TRY',
                attachmentTypeId: data.attachmentTypeId,
                folderId: data.folderId,
                documentDate: new Date(data.documentDate),
                description: data.description || '',
                details: details,
                customFields: [], // TODO: Parse custom fields from details if they are mixed
            });

            // Check permissions strictly
            // If it's not owned by current user (we need to wait for user to be loaded ideally, or fetch it here)
            // Since we can't easily wait for user state in this async function without complexity, 
            // let's fetch user directly here if needed or use a separate effect for the check?
            // Better: use the user state in a separate useEffect or fetch it here.

            // To be safe and synchronous-like, let's fetch user inside here if state is null
            let currentUser = user;
            if (!currentUser) {
                const { AuthService } = await import('@/src/features/auth/data/AuthService');
                currentUser = await AuthService.getUser().catch(() => null);
                setUser(currentUser);
            }

            const isOwner = currentUser?.id === data.userId;
            const hasEditPermission = data.permission === 'EDIT' || data.permission === 'FULL' || data.permission === 'CREATE';

            // If not owner AND (permission is explicitly VIEW or Permission is missing)
            // implicit permission is NONE/VIEW for shared items usually.
            if (!isOwner && !hasEditPermission) {
                Alert.alert(
                    i18n.t('common.error'),
                    i18n.t('receipts.detail.actions.error_permission'),
                    [{ text: i18n.t('common.actions.ok'), onPress: () => router.back() }]
                );
            }
        } catch (err) {
            console.error('Failed to load attachment:', err);
            Alert.alert(i18n.t('receipts.detail.actions.error_load'));
            router.back();
        } finally {
            setLoading(false);
        }
    };

    // Update dynamic fields when type changes
    useEffect(() => {
        const typeName = attachmentTypes.find(t => t.id === watchedTypeId)?.name || '';
        const fields = AttachmentTypeFieldFactory.getFields(typeName);
        setDynamicFields(fields);

        // Only set default details if we are not loading the initial data? 
        // Or if the type changed by user interaction. 
        // For simplicity, we keep existing details if they match keys, or merge defaults.
        if (!loading) {
            const defaultDetails = AttachmentTypeFieldFactory.getDefaultDetails(typeName);
            // We merge so we don't lose data when switching back and forth if keys exist
            const currentDetails = watch('details');
            setValue('details', { ...defaultDetails, ...currentDetails });
        }
    }, [watchedTypeId, attachmentTypes, loading]);

    const onSubmit = async (data: EditFormData) => {
        try {
            setSubmitting(true);

            // Merge custom fields into details
            const mergedDetails = { ...(data.details || {}) };
            (data.customFields || []).forEach(cf => {
                if (cf.key.trim() && cf.value.trim()) {
                    mergedDetails[cf.key.trim()] = cf.value.trim();
                }
            });

            await AttachmentService.updateAttachment(id!, {
                title: data.title,
                amount: data.amount ? parseFloat(data.amount) : undefined,
                currency: data.amount ? data.currency : undefined,
                documentDate: data.documentDate.toISOString(),
                attachmentTypeId: data.attachmentTypeId,
                folderId: data.folderId,
                description: data.description,
                details: mergedDetails,
            });

            Alert.alert(i18n.t('common.actions.success'), i18n.t('common.actions.saved'), [
                { text: i18n.t('common.actions.ok'), onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error('Failed to update attachment:', error);
            if (error?.status === 403 || error?.message?.includes('Forbidden')) {
                Alert.alert(i18n.t('common.error'), i18n.t('receipts.detail.actions.error_permission'));
            } else {
                Alert.alert(i18n.t('receipts.detail.actions.error_save'));
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Helper for custom fields
    const addCustomField = () => {
        setValue('customFields', [...watchedCustomFields, { key: '', value: '' }]);
    };

    const removeCustomField = (index: number) => {
        setValue('customFields', watchedCustomFields.filter((_, i) => i !== index));
    };

    const updateCustomField = (index: number, field: 'key' | 'value', text: string) => {
        const newFields = [...watchedCustomFields];
        newFields[index][field] = text;
        setValue('customFields', newFields);
    };

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.headerBackground,
        },
        headerTitle: {
            fontSize: 18,
            color: colors.text,
            fontWeight: '600',
        },
        cancelButton: {
            padding: 8,
            marginLeft: -8,
        },
        content: {
            padding: 24,
            paddingBottom: 100,
        },
        form: {
            gap: 16,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: colors.primary,
            marginTop: 8,
            marginBottom: 8,
        },
        row: {
            flexDirection: 'row',
            gap: 12,
        },
        half: {
            flex: 1,
        },
        datePickerContainer: {
            marginBottom: 16,
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 8,
            color: colors.text,
        },
        submitButton: {
            marginTop: 24,
        },
        // Collapsible & Custom Fields Styles
        collapsibleHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            marginTop: 24,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: colors.cardBorder,
        },
        collapsibleHeaderContent: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        collapsibleIcon: {
            fontSize: 20,
        },
        collapsibleTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.primary,
        },
        customFieldsSection: {
            marginTop: 8,
        },
        customFieldRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
        },
        customFieldKey: {
            flex: 1,
        },
        customFieldValue: {
            flex: 2,
        },
        removeFieldButton: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.error + '20',
            alignItems: 'center',
            justifyContent: 'center',
        },
        addFieldButton: {
            marginTop: 4,
            borderColor: colors.primary,
        },
    }), [colors]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <View style={styles.cancelButton}>
                    <ThemedText onPress={() => router.back()} style={{ fontSize: 16, color: colors.primary }}>{i18n.t('common.actions.cancel')}</ThemedText>
                </View>
                <ThemedText style={styles.headerTitle}>{i18n.t('receipts.detail.actions.edit')}</ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <FormContainer scrollable contentStyle={styles.content}>
                <View style={styles.form}>
                    {/* Basic Info */}
                    <Controller
                        control={control}
                        name="title"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <FormField label={i18n.t('receipts.scan.detailsTitle')} error={errors.title?.message}>
                                <TextInput
                                    placeholder={i18n.t('receipts.scan.titlePlaceholder')}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                />
                            </FormField>
                        )}
                    />

                    <View style={styles.row}>
                        <View style={styles.half}>
                            <Controller
                                control={control}
                                name="amount"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <FormField label={i18n.t('receipts.scan.amountPlaceholder')} error={errors.amount?.message}>
                                        <TextInput
                                            placeholder="0.00"
                                            keyboardType="numeric"
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                        />
                                    </FormField>
                                )}
                            />
                        </View>
                        <View style={styles.half}>
                            <Controller
                                control={control}
                                name="currency"
                                render={({ field: { onChange, value } }) => (
                                    <FormField label={i18n.t('receipts.scan.currency_select_label')}>
                                        <CurrencySelect
                                            value={value || 'TRY'}
                                            onSelect={onChange}
                                        />
                                    </FormField>
                                )}
                            />
                        </View>
                    </View>

                    <Controller
                        control={control}
                        name="documentDate"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.datePickerContainer}>
                                <ThemedText style={styles.label}>{i18n.t('receipts.scan.document_date')}</ThemedText>
                                <DateTimePicker
                                    value={value}
                                    mode="date"
                                    display="default"
                                    onChange={(event, selectedDate) => {
                                        if (selectedDate) onChange(selectedDate);
                                    }}
                                    style={{ alignSelf: 'flex-start' }}
                                />
                            </View>
                        )}
                    />

                    {/* Categorization */}
                    <Controller
                        control={control}
                        name="folderId"
                        render={({ field: { onChange, value } }) => (
                            <FormField label={i18n.t('receipts.scan.folder_select_label')} error={errors.folderId?.message}>
                                <FolderSelector
                                    folders={folders}
                                    value={value}
                                    onSelect={onChange}
                                />
                            </FormField>
                        )}
                    />

                    <Controller
                        control={control}
                        name="attachmentTypeId"
                        render={({ field: { onChange, value } }) => (
                            <FormField label={i18n.t('receipts.scan.type_select_label')} error={errors.attachmentTypeId?.message}>
                                <AttachmentTypeSelector
                                    types={attachmentTypes}
                                    value={value}
                                    onSelect={onChange}
                                />
                            </FormField>
                        )}
                    />

                    {/* Dynamic Details */}
                    {dynamicFields.length > 0 && (
                        <View>
                            <ThemedText style={styles.sectionTitle}>{i18n.t('receipts.scan.details_section_title')}</ThemedText>
                            {dynamicFields.map((field) => (
                                <View key={field.key} style={{ marginBottom: 16 }}>
                                    <ThemedText style={styles.label}>{field.label}</ThemedText>

                                    {field.type === 'date' ? (
                                        <DateTimePicker
                                            value={watchedDetails[field.key] ? new Date(watchedDetails[field.key]) : new Date()}
                                            mode="date"
                                            display="default"
                                            onChange={(event, selectedDate) => {
                                                if (selectedDate) {
                                                    setValue('details', {
                                                        ...watchedDetails,
                                                        [field.key]: selectedDate.toISOString()
                                                    });
                                                }
                                            }}
                                            style={{ alignSelf: 'flex-start' }}
                                        />
                                    ) : (
                                        <TextInput
                                            value={watchedDetails[field.key] ? String(watchedDetails[field.key]) : ''}
                                            onChangeText={(text) => {
                                                setValue('details', {
                                                    ...watchedDetails,
                                                    [field.key]: text
                                                });
                                            }}
                                            placeholder={field.placeholder}
                                            keyboardType={field.type === 'number' || field.type === 'duration' ? 'numeric' : 'default'}
                                            multiline={field.type === 'textarea'}
                                            style={field.type === 'textarea' ? { minHeight: 80, textAlignVertical: 'top' } : undefined}
                                        />
                                    )}
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Description */}
                    <Controller
                        control={control}
                        name="description"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <FormField label={i18n.t('receipts.detail.description')}>
                                <TextInput
                                    placeholder={i18n.t('receipts.detail.description')}
                                    multiline
                                    numberOfLines={4}
                                    style={{ height: 100, textAlignVertical: 'top' }}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                />
                            </FormField>
                        )}
                    />

                    {/* Collapsible Custom Fields */}
                    <TouchableOpacity
                        style={styles.collapsibleHeader}
                        onPress={() => setShowDetails(!showDetails)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.collapsibleHeaderContent}>
                            <IconSymbol name="list.bullet.rectangle" size={20} color={colors.primary} />
                            <ThemedText style={styles.collapsibleTitle}>
                                {i18n.t('receipts.scan.custom_fields_title')}
                            </ThemedText>
                        </View>
                        <IconSymbol
                            name={showDetails ? "chevron.up" : "chevron.down"}
                            size={12}
                            color={colors.gray}
                        />
                    </TouchableOpacity>

                    {showDetails && (
                        <View style={styles.customFieldsSection}>
                            {watchedCustomFields.map((field, index) => (
                                <View key={index} style={styles.customFieldRow}>
                                    <View style={styles.customFieldKey}>
                                        <TextInput
                                            placeholder={i18n.t('receipts.scan.custom_key_placeholder')}
                                            value={field.key}
                                            onChangeText={(text) => updateCustomField(index, 'key', text)}
                                            style={{ height: 40 }}
                                        />
                                    </View>
                                    <View style={styles.customFieldValue}>
                                        <TextInput
                                            placeholder={i18n.t('receipts.scan.custom_value_placeholder')}
                                            value={field.value}
                                            onChangeText={(text) => updateCustomField(index, 'value', text)}
                                            style={{ height: 40 }}
                                        />
                                    </View>
                                    <TouchableOpacity
                                        style={styles.removeFieldButton}
                                        onPress={() => removeCustomField(index)}
                                    >
                                        <IconSymbol name="trash" size={16} color={colors.error} />
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <Button
                                title={i18n.t('receipts.scan.add_custom_field')}
                                variant="outline"
                                onPress={addCustomField}
                                style={styles.addFieldButton}
                                icon={<IconSymbol name="plus" size={16} color={colors.primary} />}
                            />
                        </View>
                    )}

                    <Button
                        title={i18n.t('common.actions.save')}
                        onPress={handleSubmit(onSubmit)}
                        loading={submitting}
                        style={styles.submitButton}
                    />
                </View>
            </FormContainer>
        </SafeAreaView>
    );
}
