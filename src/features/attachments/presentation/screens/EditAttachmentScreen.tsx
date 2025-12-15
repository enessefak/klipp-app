import { zodResolver } from '@hookform/resolvers/zod';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

import { AttachmentTypeSelector } from '@/components/AttachmentTypeSelector';
import { FolderSelector } from '@/components/FolderSelector';
import { Button, DatePickerField, FormContainer, FormField, TextInput } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AttachmentService } from '@/src/features/attachments/data/AttachmentService';
import { Attachment, AttachmentTypeIds } from '@/src/features/attachments/domain/Attachment';
import { AttachmentTypeFieldFactory, FieldConfig } from '@/src/features/attachments/domain/AttachmentTypeFields';
import { useAttachmentTypes } from '@/src/features/attachments/presentation/useAttachmentTypes';
import { useFolders } from '@/src/features/folders/presentation/useFolders';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { OpenAPI } from '@/src/infrastructure/api/generated/core/OpenAPI';
import i18n from '@/src/infrastructure/localization/i18n';
import { OCRService } from '../../data/OCRService';
import { CurrencySelect } from '../components/CurrencySelect';

// Conditionally import DocumentScanner (only works in dev builds, not Expo Go)
let DocumentScanner: any = null;
try {
    DocumentScanner = require('react-native-document-scanner-plugin').default;
} catch (e) {
    console.log('DocumentScanner not available (Expo Go mode)');
}

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

type Step = 'capture' | 'analyzing' | 'form';

export default function EditAttachmentScreen() {
    const { colors } = useSettings();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const insets = useSafeAreaInsets();

    // UI State
    const [loading, setLoading] = useState(true);
    const [loadingAttachment, setLoadingAttachment] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showDetails, setShowDetails] = useState(true);
    const [dynamicFields, setDynamicFields] = useState<FieldConfig[]>([]);

    // File state
    const [newFileUri, setNewFileUri] = useState<string | null>(null);
    const [existingFileUri, setExistingFileUri] = useState<string | null>(null);
    const [fileType, setFileType] = useState<'image' | 'document'>('image');

    // OCR state
    const [step, setStep] = useState<Step>('form'); // Start in form mode for edit

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
    const [originalAttachment, setOriginalAttachment] = useState<Attachment | null>(null);

    // Initial Load
    // Initial Load
    useEffect(() => {
        // Fetch current user for ownership check
        import('@/src/features/auth/data/AuthService').then(({ AuthService }) => {
            AuthService.getUser().then(u => setUser(u)).catch(console.error);
        });

        if (id && attachmentTypes.length > 0) {
            loadAttachment();
        }
    }, [id, attachmentTypes.length]);

    const loadAttachment = async () => {
        try {
            setLoadingAttachment(true);
            const data = await AttachmentService.getAttachmentById(id!);
            setOriginalAttachment(data);

            // Fetch files
            try {
                const files = await AttachmentService.getAttachmentFiles(id!);
                if (files.length > 0) {
                    // Construct full URL
                    const fullUrl = `${OpenAPI.BASE}${files[0].viewUrl}`;
                    setExistingFileUri(fullUrl);
                }
            } catch (e) {
                console.error('Failed to load files', e);
            }

            let details = data.details || {};

            reset({
                title: data.title,
                amount: data.amount ? String(data.amount) : '',
                currency: data.currency || 'TRY',
                attachmentTypeId: data.attachmentTypeId,
                folderId: data.folderId,
                documentDate: new Date(data.documentDate),
                description: data.description || '',
                details: details,
                customFields: [],
            });

            // Permission Check logic (retained)
            let currentUser = user;
            if (!currentUser) {
                const { AuthService } = await import('@/src/features/auth/data/AuthService');
                currentUser = await AuthService.getUser().catch(() => null);
                setUser(currentUser);
            }

            const isOwner = currentUser?.id === data.userId;
            let effectivePermission = data.permission;

            if (!isOwner && !effectivePermission && data.folderId) {
                try {
                    const { FolderRepository } = await import('@/src/features/folders/infrastructure/FolderRepository');
                    const folders = await FolderRepository.getFolders();
                    const folder = folders.find(f => f.id === data.folderId);
                    if (folder) effectivePermission = folder.permission;
                } catch (err) { }
            }

            const hasEditPermission = effectivePermission === 'EDIT' || effectivePermission === 'FULL' || effectivePermission === 'CREATE';
            if (!isOwner && !hasEditPermission) {
                Alert.alert(i18n.t('common.error'), i18n.t('receipts.detail.actions.error_permission'),
                    [{ text: i18n.t('common.actions.ok'), onPress: () => router.back() }]);
            }
        } catch (err) {
            console.error('Failed to load attachment:', err);
            Alert.alert(i18n.t('receipts.detail.actions.error_load'));
            router.back();
        } finally {
            setLoadingAttachment(false);
        }
    };

    // Dynamic Fields Logic (from ScanScreen)
    useEffect(() => {
        const typeName = attachmentTypes.find(t => t.id === watchedTypeId)?.name || '';
        const fields = AttachmentTypeFieldFactory.getFields(typeName);
        setDynamicFields(fields);

        // Preserve existing details if keys match, otherwise defaults?
        // In Edit mode, we don't want to overwrite loaded details with defaults unless type changed significantly
        // For now, let's just update fields config
    }, [watchedTypeId, attachmentTypes]);

    // File Processing (from ScanScreen)
    const processFileWithOCR = async (uri: string, type: 'image' | 'document', mime: string) => {
        setNewFileUri(uri);
        setFileType(type);
        setStep('analyzing');

        try {
            const ocrResult = await OCRService.scanDocument(uri, mime);

            // Auto-fill form fields (only empty ones or overwrite all? usually specific update)
            // For logic consistency: let's overwrite for now or ask user?
            // "Updated from new file"
            if (ocrResult.extractedData.title) setValue('title', ocrResult.extractedData.title);
            if (ocrResult.extractedData.amount) setValue('amount', ocrResult.extractedData.amount.toString());
            if (ocrResult.extractedData.currency) setValue('currency', ocrResult.extractedData.currency);
            if (ocrResult.extractedData.date) setValue('documentDate', new Date(ocrResult.extractedData.date));
            // Type detection logic... (omitted for brevity, can copy if needed)

            setStep('form');
        } catch (error) {
            console.error('OCR failed:', error);
            setStep('form');
        }
    };

    // Pickers (from ScanScreen)
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
        if (!result.canceled) await processFileWithOCR(result.assets[0].uri, 'image', 'image/jpeg');
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return Alert.alert(i18n.t('receipts.scan.permissionTitle'), i18n.t('receipts.scan.permissionCamera'));
        const result = await ImagePicker.launchCameraAsync({ quality: 1 });
        if (!result.canceled) await processFileWithOCR(result.assets[0].uri, 'image', 'image/jpeg');
    };

    const scanDocument = async () => {
        if (!DocumentScanner) return Alert.alert('Error', 'Feature not available inside Expo Go');
        try {
            const result = await DocumentScanner.scanDocument({ croppedImageQuality: 100 });
            if (result.scannedImages?.length > 0) await processFileWithOCR(result.scannedImages[0], 'image', 'image/jpeg');
        } catch (e) { console.error(e); }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'application/msword'], copyToCacheDirectory: true });
            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                await processFileWithOCR(asset.uri, 'document', asset.mimeType || 'application/pdf');
            }
        } catch (e) { console.error(e); }
    };

    const onSubmit = async (data: EditFormData) => {
        try {
            setSubmitting(true);

            const mergedDetails = { ...(data.details || {}) };
            (data.customFields || []).forEach(cf => {
                if (cf.key.trim() && cf.value.trim()) mergedDetails[cf.key.trim()] = cf.value.trim();
            });

            // 1. Check if file is changed
            if (newFileUri && id) {
                // DELETE old one first
                await AttachmentService.deleteAttachment(id);

                // CREATE new one
                await AttachmentService.createAttachmentWithFile({
                    title: data.title,
                    amount: data.amount ? parseFloat(data.amount) : undefined,
                    currency: data.amount ? data.currency : undefined,
                    documentDate: data.documentDate.toISOString(),
                    attachmentTypeId: data.attachmentTypeId,
                    folderId: data.folderId,
                    description: data.description, // Can be hidden in UI but passed if needed (e.g. from OCR)
                    details: mergedDetails,
                }, newFileUri, fileType === 'image' ? 'image/jpeg' : 'application/pdf');
                // Note: simplified mime type for now
            } else {
                // UPDATE Metadata only
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
            }

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
    const addCustomField = () => setValue('customFields', [...watchedCustomFields, { key: '', value: '' }]);
    const removeCustomField = (index: number) => setValue('customFields', watchedCustomFields.filter((_, i) => i !== index));
    const updateCustomField = (index: number, field: 'key' | 'value', text: string) => {
        const newFields = [...watchedCustomFields];
        newFields[index][field] = text;
        setValue('customFields', newFields);
    };

    const styles = useMemo(() => StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.headerBackground },
        headerTitle: { fontSize: 18, color: colors.text, fontWeight: '600' },
        content: { padding: 24, paddingBottom: 100 },
        form: { gap: 16 },
        sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.primary, marginTop: 16, marginBottom: 8 },
        row: { flexDirection: 'row', gap: 12 },
        half: { flex: 1 },
        datePickerContainer: { marginBottom: 16 },
        label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: colors.text },

        // File Preview Area
        filePreviewContainer: { marginBottom: 20, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
        imagePreview: { width: '100%', height: 200, resizeMode: 'cover' },
        reuploadButton: { padding: 12, backgroundColor: colors.surface, alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border },
        reuploadText: { color: colors.primary, fontWeight: '600' },

        // Analyzing Overlay
        analyzingContainer: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
        analyzingText: { color: 'white', marginTop: 16, fontSize: 18, fontWeight: '600' },

        submitButton: { marginTop: 32 },

        // Collapsible & Custom Fields Styles (Copied)
        collapsibleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card, borderRadius: 12, padding: 16, marginTop: 24, marginBottom: 16, borderWidth: 1, borderColor: colors.cardBorder },
        collapsibleHeaderContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
        collapsibleTitle: { fontSize: 16, fontWeight: '600', color: colors.primary },
        customFieldsSection: { marginTop: 8 },
        customFieldRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
        customFieldKey: { flex: 1 },
        customFieldValue: { flex: 2 },
        removeFieldButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.error + '20', alignItems: 'center', justifyContent: 'center' },
        addFieldButton: { marginTop: 4, borderColor: colors.primary },
    }), [colors]);

    if (loadingAttachment) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={colors.primary} /></View>;
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {step === 'analyzing' && (
                <View style={styles.analyzingContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                    <ThemedText style={styles.analyzingText}>{i18n.t('receipts.scan.analyzing.title')}</ThemedText>
                </View>
            )}

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ThemedText style={{ fontSize: 16, color: colors.primary }}>{i18n.t('common.actions.cancel')}</ThemedText>
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>{i18n.t('receipts.detail.actions.edit')}</ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <FormContainer scrollable contentStyle={styles.content}>
                <View style={styles.form}>

                    {/* File Preview & Replace */}
                    {/* File Preview & Replace */}
                    <View style={styles.filePreviewContainer}>
                        {newFileUri ? (
                            <Image source={{ uri: newFileUri }} style={styles.imagePreview} contentFit="contain" />
                        ) : existingFileUri ? (
                            <Image
                                source={{ uri: existingFileUri }}
                                style={styles.imagePreview}
                                contentFit="contain"
                                transition={1000}
                            />
                        ) : (
                            <View style={{ height: 150, justifyContent: 'center', alignItems: 'center' }}>
                                <IconSymbol name="doc.text" size={48} color={colors.textLight} />
                                <ThemedText style={{ marginTop: 8, color: colors.textLight }}>{i18n.t('receipts.detail.sections.files')}</ThemedText>
                            </View>
                        )}
                        <TouchableOpacity style={styles.reuploadButton} onPress={() => {
                            Alert.alert(
                                i18n.t('common.actions.change_file'),
                                undefined,
                                [
                                    { text: i18n.t('receipts.scan.methods.camera'), onPress: takePhoto },
                                    { text: i18n.t('receipts.scan.methods.gallery'), onPress: pickImage },
                                    { text: i18n.t('receipts.scan.methods.document'), onPress: pickDocument },
                                    { text: i18n.t('common.actions.cancel'), style: 'cancel' }
                                ]
                            );
                        }}>
                            <ThemedText style={styles.reuploadText}>{newFileUri ? i18n.t('common.actions.change_file') : i18n.t('common.actions.add_new_file')}</ThemedText>
                        </TouchableOpacity>
                    </View>

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
                                        <CurrencySelect value={value || 'TRY'} onSelect={onChange} />
                                    </FormField>
                                )}
                            />
                        </View>
                    </View>

                    <Controller
                        control={control}
                        name="documentDate"
                        render={({ field: { onChange, value } }) => (
                            <DatePickerField
                                label={i18n.t('receipts.scan.document_date')}
                                value={value}
                                onChange={onChange}
                                placeholder={i18n.t('receipts.scan.document_date')}
                            />
                        )}
                    />

                    {/* Categorization */}
                    <Controller
                        control={control}
                        name="folderId"
                        render={({ field: { onChange, value } }) => (
                            <FormField label={i18n.t('receipts.scan.folder_select_label')} error={errors.folderId?.message}>
                                <FolderSelector folders={folders} value={value} onSelect={onChange} />
                            </FormField>
                        )}
                    />

                    <Controller
                        control={control}
                        name="attachmentTypeId"
                        render={({ field: { onChange, value } }) => (
                            <FormField label={i18n.t('receipts.scan.type_select_label')} error={errors.attachmentTypeId?.message}>
                                <AttachmentTypeSelector types={attachmentTypes} value={value} onSelect={onChange} />
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
                                        <DatePickerField
                                            value={watchedDetails[field.key] ? new Date(watchedDetails[field.key]) : undefined}
                                            onChange={(date) => setValue('details', { ...watchedDetails, [field.key]: date.toISOString() })}
                                            placeholder={field.placeholder || i18n.t('common.actions.select_date')}
                                        />
                                    ) : (
                                        <TextInput
                                            value={watchedDetails[field.key] ? String(watchedDetails[field.key]) : ''}
                                            onChangeText={(text) => setValue('details', { ...watchedDetails, [field.key]: text })}
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

                    {/* Description Hidden */}

                    {/* Collapsible Custom Fields */}
                    <TouchableOpacity style={styles.collapsibleHeader} onPress={() => setShowDetails(!showDetails)} activeOpacity={0.7}>
                        <View style={styles.collapsibleHeaderContent}>
                            <IconSymbol name="list.bullet.rectangle" size={20} color={colors.primary} />
                            <ThemedText style={styles.collapsibleTitle}>{i18n.t('receipts.scan.custom_fields_title')}</ThemedText>
                        </View>
                        <IconSymbol name={showDetails ? "chevron.up" : "chevron.down"} size={12} color={colors.gray} />
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
                                    <TouchableOpacity style={styles.removeFieldButton} onPress={() => removeCustomField(index)}>
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
