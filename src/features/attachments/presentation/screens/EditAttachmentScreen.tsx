import { zodResolver } from '@hookform/resolvers/zod';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

import { AttachmentTypeSelector } from '@/components/AttachmentTypeSelector';
import { FolderSelector } from '@/components/FolderSelector';
import { Button, DatePickerField, FormContainer, FormField, TextInput } from '@/components/form';
import { Select, SelectOption } from '@/components/Select';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AttachmentService } from '@/src/features/attachments/data/AttachmentService';
import { Attachment, AttachmentTypeIds } from '@/src/features/attachments/domain/Attachment';
import { FieldConfig } from '@/src/features/attachments/domain/AttachmentTypeFields';
import { useAttachmentTypes } from '@/src/features/attachments/presentation/useAttachmentTypes';
import { useFolders } from '@/src/features/folders/presentation/useFolders';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { OpenAPI } from '@/src/infrastructure/api/generated/core/OpenAPI';
import { CategoryService } from '@/src/infrastructure/api/generated/services/CategoryService';
import i18n from '@/src/infrastructure/localization/i18n';
import { OCRService } from '../../data/OCRService';
import { CustomFieldsList } from '../components/scan/CustomFieldsList';
import { DynamicFieldsSection } from '../components/scan/DynamicFieldsSection';

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
    // amount: z.string().optional(),
    // currency: z.string(),
    attachmentTypeId: z.string().min(1, i18n.t('receipts.scan.validation.type_required')),
    folderId: z.string().min(1, i18n.t('receipts.scan.validation.folder_required')),
    categoryId: z.string().optional(),
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

    // Category State
    const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(false);

    // File state
    const [existingFiles, setExistingFiles] = useState<{ id: string; url: string; contentType?: string; filename: string }[]>([]);
    const [newFiles, setNewFiles] = useState<{ uri: string; type: 'image' | 'document'; mime: string }[]>([]);
    const [deletedFileIds, setDeletedFileIds] = useState<string[]>([]);

    // Preview state
    const [currentFileIndex, setCurrentFileIndex] = useState(0);

    // OCR state
    const [step, setStep] = useState<Step>('form'); // Start in form mode for edit

    const { attachmentTypes } = useAttachmentTypes();
    const { folders } = useFolders();

    const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<EditFormData>({
        resolver: zodResolver(editSchema),
        defaultValues: {
            title: '',
            // amount: '',
            // currency: 'TRY',
            attachmentTypeId: AttachmentTypeIds.RECEIPT,
            folderId: '',
            categoryId: '',
            documentDate: new Date(),
            details: {},
            description: '',
            customFields: [],
        },
    });

    const watchedTypeId = watch('attachmentTypeId');
    const watchedFolderId = watch('folderId');
    const watchedDetails = (watch('details') || {}) as Record<string, any>;
    const watchedCustomFields = watch('customFields') || [];

    const [user, setUser] = useState<{ id: string } | null>(null);
    const [originalAttachment, setOriginalAttachment] = useState<Attachment | null>(null);

    // Scroll ref for auto-scrolling to errors
    const scrollViewRef = useRef<ScrollView>(null);

    // Track previous new files length to detect additions
    const prevNewFilesLength = useRef(0);

    // Effect to handle file additions and index bounds
    useEffect(() => {
        const activeExisting = existingFiles.filter(f => !deletedFileIds.includes(f.id!));
        const totalCount = activeExisting.length + newFiles.length;

        if (newFiles.length > prevNewFilesLength.current) {
            // File added: switch to the last item
            setCurrentFileIndex(Math.max(0, totalCount - 1));
        } else if (currentFileIndex >= totalCount && totalCount > 0) {
            // Out of bounds (deleted): clamp to last item
            setCurrentFileIndex(totalCount - 1);
        }

        prevNewFilesLength.current = newFiles.length;
    }, [newFiles.length, deletedFileIds.length, existingFiles.length]);

    const onError = (errors: any) => {
        let scrollY = 0;

        // Determine scroll position based on error hierarchy (approximate)
        if (errors.title) scrollY = 0;
        else if (errors.documentDate) scrollY = 80;
        else if (errors.folderId) scrollY = 160;
        else if (errors.attachmentTypeId) scrollY = 240;
        else if (errors.details) scrollY = 320; // Dynamic fields start
        else if (errors.customFields) scrollY = 500;

        scrollViewRef.current?.scrollTo({ y: scrollY, animated: true });

        Alert.alert(i18n.t('common.error'), i18n.t('receipts.scan.validation.check_fields'));
    };

    // Initial Load
    // Initial Load
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
            setLoadingAttachment(true);
            const data = await AttachmentService.getAttachmentById(id!);
            setOriginalAttachment(data);

            // Fetch files
            // Fetch files
            try {
                const files = await AttachmentService.getAttachmentFiles(id!);
                const mappedFiles = files.map(f => ({
                    id: f.id,
                    url: `${OpenAPI.BASE}${f.viewUrl}`,
                    contentType: f.contentType,
                    filename: f.filename
                }));
                setExistingFiles(mappedFiles);
            } catch (e) {
                console.error('Failed to load files', e);
            }

            let details = data.details || {};

            // Merge category-specific data into details for the form
            // This ensures dynamic fields (including items) are populated
            const attachmentData = data as any;
            if (attachmentData.attachmentType?.category) {
                const categoryKey = attachmentData.attachmentType.category.toLowerCase();
                const categoryData = attachmentData[categoryKey];
                if (categoryData) {
                    details = { ...categoryData, ...details };
                }
            }

            // Ensure currency has a default value for the dynamic field
            if (!details.currency) {
                details.currency = 'TRY';
            }

            reset({
                title: data.title,
                // amount: data.details?.amount ? String(data.details.amount) : '',
                // currency: data.details?.currency || 'TRY',
                attachmentTypeId: data.attachmentTypeId,
                folderId: data.folderId,
                categoryId: (data as any).categoryId || '',
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
        const type = attachmentTypes.find(t => t.id === watchedTypeId);
        if (type?.fieldConfig && type.fieldConfig.length > 0) {
            setDynamicFields(type.fieldConfig);
        } else {
            setDynamicFields([]);
        }
    }, [watchedTypeId, attachmentTypes]);

    // Fetch Categories Logic
    useEffect(() => {
        const fetchCategories = async () => {
            if (!watchedFolderId) {
                setCategoryOptions([]);
                return;
            }

            setLoadingCategories(true);
            try {
                // Find folder owner
                const selectedFolder = folders.find(f => f.id === watchedFolderId);
                const currentUserId = user?.id;

                let ownerId = currentUserId;
                if (selectedFolder && selectedFolder.owner && selectedFolder.owner.id !== currentUserId) {
                    ownerId = selectedFolder.owner.id;
                }

                let items: any[] = [];
                if (ownerId !== currentUserId) {
                    // Fetch owner's categories
                    const response = await CategoryService.getCategoriesByOwner(ownerId!);
                    items = response.data?.items || [];
                } else {
                    // Fetch my categories
                    // Note: CategoryService.getCategories supports pagination but we want all list for picker?
                    // Typically select needs full list or search. For now getting first page or assuming unpaginated helper needed?
                    // The generated service has pagination. Let's try to get a reasonable amount
                    const response = await CategoryService.getCategories(undefined, 100);
                    items = response.data?.items || [];
                }

                const options: SelectOption[] = items.map(cat => ({
                    label: cat.name + (cat.accountCode ? ` (${cat.accountCode})` : ''),
                    value: cat.id,
                    icon: 'folder' // Default icon
                }));
                setCategoryOptions(options);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategoryOptions([]);
            } finally {
                setLoadingCategories(false);
            }
        };

        if (user && folders.length >= 0) { // folders might be empty initially but if hook loaded it's array
            fetchCategories();
        }
    }, [watchedFolderId, user, folders]);

    // File Processing (from ScanScreen)
    const processFileWithOCR = async (uri: string, type: 'image' | 'document', mime: string) => {
        // Add to new files list
        setNewFiles(prev => [...prev, { uri, type, mime }]);
        setStep('analyzing');

        try {
            // Only run OCR if it's the first file or explicitly requested?
            // For now, let's run OCR on the new file to potentially update fields
            const ocrResult = await OCRService.scanDocument([{ uri, mimeType: mime }]);

            const currentDetails = watch('details') || {};
            const newDetails = { ...currentDetails };

            if (ocrResult.extractedData.title) setValue('title', ocrResult.extractedData.title);
            if (ocrResult.extractedData.amount) newDetails.amount = ocrResult.extractedData.amount.toString();
            if (ocrResult.extractedData.currency) newDetails.currency = ocrResult.extractedData.currency;
            if (ocrResult.extractedData.date) setValue('documentDate', new Date(ocrResult.extractedData.date));

            setValue('details', newDetails);
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

            // 1. Update Metadata
            const updatedAttachment = await AttachmentService.updateAttachment(id!, {
                title: data.title,
                documentDate: data.documentDate.toISOString(),
                attachmentTypeId: data.attachmentTypeId,
                folderId: data.folderId,
                categoryId: data.categoryId,
                description: data.description,
                details: mergedDetails,
            } as any);

            // 2. Upload New Files
            if (newFiles.length > 0) {
                for (const file of newFiles) {
                    await AttachmentService.uploadFileToAttachment(id!, { fileUri: file.uri, mimeType: file.mime });
                }
            }

            // 3. Delete Removed Files
            if (deletedFileIds.length > 0) {
                for (const fileId of deletedFileIds) {
                    await AttachmentService.deleteFile(fileId);
                }
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
        container: { flex: 1 },
        header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.headerBackground },
        headerTitle: { fontSize: 18, color: colors.text, fontWeight: '600' },
        content: { paddingHorizontal: 16, paddingTop: 0, paddingBottom: 40 },
        form: { gap: 16 },
        sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 8 },
        row: { flexDirection: 'row', gap: 12 },
        half: { flex: 1 },
        datePickerContainer: { marginBottom: 16 },
        label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: colors.text },

        // File Preview Area
        filePreviewContainer: { marginBottom: 16, borderRadius: 0, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
        imagePreview: { width: '100%', height: 200, resizeMode: 'cover' },
        reuploadButton: { padding: 12, backgroundColor: colors.surface, alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border },
        reuploadText: { color: colors.primary, fontWeight: '600' },

        // Analyzing Overlay
        analyzingContainer: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
        analyzingText: { color: 'white', marginTop: 16, fontSize: 18, fontWeight: '600' },

        submitButton: { width: '100%' },

        // Collapsible & Custom Fields Styles (Copied)
        collapsibleHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card, borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: colors.cardBorder },
        collapsibleHeaderContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
        collapsibleTitle: { fontSize: 16, fontWeight: '600', color: colors.primary },
        customFieldsSection: { marginTop: 0 },
        customFieldRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
        customFieldKey: { flex: 1 },
        customFieldValue: { flex: 2 },
        removeFieldButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.error + '20', alignItems: 'center', justifyContent: 'center' },
        addFieldButton: { marginTop: 4, borderColor: colors.primary },
        footer: { padding: 16, backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border },
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

            <FormContainer ref={scrollViewRef} scrollable contentStyle={styles.content}>
                <View style={styles.form}>
                    {/* File Preview & Replace */}
                    <View style={styles.filePreviewContainer}>
                        {(() => {
                            // Calculate display files
                            const displayFiles = [
                                ...existingFiles.filter(f => !deletedFileIds.includes(f.id!)).map(f => ({ ...f, _source: 'existing' as const })),
                                ...newFiles.map((f, i) => ({ ...f, _source: 'new' as const, _index: i, id: `new-${i}`, filename: i18n.t('receipts.scan.methods.document') }))
                            ];

                            const file = displayFiles[currentFileIndex];
                            const totalFiles = displayFiles.length;

                            if (totalFiles === 0) {
                                return (
                                    <View style={{ width: '100%', height: 260, justifyContent: 'center', alignItems: 'center' }}>
                                        <IconSymbol name="doc.text" size={48} color={colors.textLight} />
                                        <ThemedText style={{ marginTop: 8, color: colors.textLight }}>{i18n.t('receipts.detail.sections.files')}</ThemedText>
                                    </View>
                                );
                            }

                            // Ensure index is valid safely
                            if (!file && totalFiles > 0) {
                                // If current index is out of bounds (e.g. after delete), fix it on next render
                                // But for now render nothing or fallback
                                return null;
                            }

                            const isImage = (file._source === 'existing' && file.contentType?.startsWith('image/')) || (file._source === 'new' && file.type === 'image');
                            const fileUri = (file as any).url || (file as any).uri;

                            return (
                                <View style={{ width: '100%', height: 260, position: 'relative', overflow: 'hidden' }}>
                                    {/* Main File View */}
                                    <View style={{ flex: 1, backgroundColor: colors.background, borderRadius: 12, overflow: 'hidden' }}>
                                        {isImage ? (
                                            <Image
                                                source={{ uri: fileUri }}
                                                style={{ width: '100%', height: '100%' }}
                                                contentFit="contain"
                                            />
                                        ) : (
                                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                                                <IconSymbol name="doc.text" size={64} color={colors.primary} />
                                                <ThemedText style={{ marginTop: 12, textAlign: 'center' }} numberOfLines={2} ellipsizeMode="middle">
                                                    {file.filename || i18n.t('receipts.scan.methods.document')}
                                                </ThemedText>
                                            </View>
                                        )}
                                    </View>

                                    {/* Navigation Arrows */}
                                    {totalFiles > 1 && (
                                        <>
                                            <TouchableOpacity
                                                style={{ position: 'absolute', left: 8, top: '50%', marginTop: -16, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 8 }}
                                                onPress={() => setCurrentFileIndex(prev => Math.max(0, prev - 1))}
                                                disabled={currentFileIndex === 0}
                                            >
                                                <IconSymbol name="chevron.left" size={20} color={currentFileIndex === 0 ? 'rgba(255,255,255,0.3)' : 'white'} />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={{ position: 'absolute', right: 8, top: '50%', marginTop: -16, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 8 }}
                                                onPress={() => setCurrentFileIndex(prev => Math.min(totalFiles - 1, prev + 1))}
                                                disabled={currentFileIndex === totalFiles - 1}
                                            >
                                                <IconSymbol name="chevron.right" size={20} color={currentFileIndex === totalFiles - 1 ? 'rgba(255,255,255,0.3)' : 'white'} />
                                            </TouchableOpacity>
                                        </>
                                    )}

                                    {/* Delete & Info Overlay */}
                                    <View style={{ position: 'absolute', top: 8, right: 8, flexDirection: 'row', gap: 8 }}>
                                        {/* Counter */}
                                        <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                                            <ThemedText style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>{currentFileIndex + 1} / {totalFiles}</ThemedText>
                                        </View>

                                        {/* Delete Button */}
                                        <TouchableOpacity
                                            style={{ backgroundColor: 'rgba(220, 38, 38, 0.9)', padding: 6, borderRadius: 20, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}
                                            onPress={() => {
                                                if (file._source === 'existing') {
                                                    setDeletedFileIds(prev => [...prev, file.id!]);
                                                } else {
                                                    setNewFiles(prev => prev.filter((_, i) => i !== (file as any)._index));
                                                }
                                                // Adjust index if we deleted the last item
                                                if (currentFileIndex >= totalFiles - 1) {
                                                    setCurrentFileIndex(Math.max(0, totalFiles - 2));
                                                }
                                            }}
                                        >
                                            <IconSymbol name="trash" size={14} color="white" />
                                        </TouchableOpacity>
                                    </View>

                                    {/* New Label */}
                                    {file._source === 'new' && (
                                        <View style={{ position: 'absolute', bottom: 8, left: 8, backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                                            <ThemedText style={{ color: 'white', fontSize: 12 }}>New</ThemedText>
                                        </View>
                                    )}
                                </View>
                            );
                        })()}

                        <TouchableOpacity style={styles.reuploadButton} onPress={() => {
                            Alert.alert(
                                i18n.t('common.actions.add_new_file'),
                                undefined,
                                [
                                    { text: i18n.t('receipts.scan.methods.camera'), onPress: takePhoto },
                                    { text: i18n.t('receipts.scan.methods.gallery'), onPress: pickImage },
                                    { text: i18n.t('receipts.scan.methods.document'), onPress: pickDocument },
                                    { text: i18n.t('common.actions.cancel'), style: 'cancel' }
                                ]
                            );
                        }}>
                            <ThemedText style={styles.reuploadText}>{i18n.t('common.actions.add_new_file')}</ThemedText>
                        </TouchableOpacity>
                    </View>

                    <View>
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

                        {/* Category Selector */}
                        <Controller
                            control={control}
                            name="categoryId"
                            render={({ field: { onChange, value } }) => (
                                <FormField label={i18n.t('attachments.categoryLabel') || "Kategori"} error={errors.categoryId?.message}>
                                    <Select
                                        label={i18n.t('attachments.categoryLabel') || "Kategori"}
                                        value={value || ''}
                                        onChange={onChange}
                                        options={categoryOptions}
                                        placeholder={i18n.t('attachments.selectCategory') || "Kategori seçiniz"}
                                        hideLabel
                                        disabled={loadingCategories}
                                    />
                                </FormField>
                            )}
                        />

                        {/* Dynamic Details */}
                        {dynamicFields.length > 0 && (
                            <View>
                                <ThemedText style={styles.sectionTitle}>{i18n.t('receipts.scan.details_section_title')}</ThemedText>
                                <DynamicFieldsSection
                                    control={control}
                                    dynamicFields={dynamicFields.filter(f => f.key !== 'documentDate')}
                                    watchedDetails={watchedDetails}
                                    watchedDocumentDate={watch('documentDate')}
                                    setValue={setValue}
                                    fieldStyle={attachmentTypes?.find(t => t.id === watchedTypeId)?.fieldStyle}
                                />
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
                            <CustomFieldsList
                                fields={watchedCustomFields}
                                onAdd={addCustomField}
                                onRemove={removeCustomField}
                                onUpdate={updateCustomField}
                                style={styles.customFieldsSection}
                            />
                        )}
                    </View>
                </View>
            </FormContainer>

            <View style={styles.footer}>
                <Button
                    title={i18n.t('common.actions.save')}
                    onPress={handleSubmit(onSubmit, onError)}
                    loading={submitting}
                    style={styles.submitButton}
                />
            </View>
        </SafeAreaView>
    );
}
