import { zodResolver } from '@hookform/resolvers/zod';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

import { AttachmentTypeSelector } from '@/components/AttachmentTypeSelector';
import { FolderSelector } from '@/components/FolderSelector';
import { Button, DatePickerField, FormContainer, FormField, TextInput } from '@/components/form';
import { Select } from '@/components/Select';
import { ThemedText } from '@/components/themed-text';
import { OCRService } from '@/src/features/attachments/data/OCRService';
import { AttachmentTypeIds, CreateAttachmentDTO } from '@/src/features/attachments/domain/Attachment';
import { AttachmentTypeFieldFactory, FieldConfig } from '@/src/features/attachments/domain/AttachmentTypeFields';
import { useAttachmentTypes } from '@/src/features/attachments/presentation/useAttachmentTypes';
import { useCreateAttachment } from '@/src/features/attachments/presentation/useCreateAttachment';
import { useFolders } from '@/src/features/folders/presentation/useFolders';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';

// Custom field schema for key-value pairs
const customFieldSchema = z.object({
    key: z.string(),
    value: z.string(),
});

// Base Zod schema for type inference
const baseScanFormSchema = z.object({
    title: z.string(),
    amount: z.string().optional(),
    currency: z.string(),
    attachmentTypeId: z.string(),
    folderId: z.string(),
    documentDate: z.date(),
    details: z.record(z.string(), z.any()).optional(),
    description: z.string().optional(),
    customFields: z.array(customFieldSchema).optional(),
});

type ScanFormData = z.infer<typeof baseScanFormSchema>;

// Conditionally import DocumentScanner (only works in dev builds, not Expo Go)
let DocumentScanner: any = null;
try {
    DocumentScanner = require('react-native-document-scanner-plugin').default;
} catch (e) {
    console.log('DocumentScanner not available (Expo Go mode)');
}

type Step = 'capture' | 'analyzing' | 'form';

export function ScanScreen() {
    const { colors } = useSettings();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Step management
    const [step, setStep] = useState<Step>('capture');

    // File state - can be image or document (PDF, Word, etc.)
    const [fileUri, setFileUri] = useState<string | null>(null);
    const [fileType, setFileType] = useState<'image' | 'document'>('image');
    const [fileName, setFileName] = useState<string | null>(null);
    const [mimeType, setMimeType] = useState<string>('image/jpeg');

    // Legacy image state for backward compatibility
    const image = fileType === 'image' ? fileUri : null;

    // OCR state
    const [ocrConfidence, setOcrConfidence] = useState(0);
    const [pendingOcrType, setPendingOcrType] = useState<string | null>(null);

    // UI state
    const [showDetails, setShowDetails] = useState(false); // Collapsible details section
    const [showDocDatePicker, setShowDocDatePicker] = useState(false);
    const [showDetailDatePickers, setShowDetailDatePickers] = useState<Record<string, boolean>>({});

    const { createAttachment, loading, error } = useCreateAttachment();
    const { attachmentTypes, loading: loadingTypes } = useAttachmentTypes();
    const { folders } = useFolders();

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        scrollContent: {
            padding: 20,
            paddingTop: 10,
            paddingBottom: 40,
        },
        captureHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
        },
        headerSpacer: {
            width: 36,
        },
        closeButton: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.card,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            borderWidth: 1,
            borderColor: colors.cardBorder,
        },
        closeButtonText: {
            fontSize: 18,
            color: colors.text,
            fontWeight: '600',
        },
        headerTitle: {
            fontSize: 28,
            fontWeight: 'bold',
            color: colors.primary,
            textAlign: 'center',
        },

        // Capture Step Styles
        captureContainer: {
            flex: 1,
            gap: 16,
        },
        captureSubtitle: {
            textAlign: 'center',
            color: colors.textLight,
            marginBottom: 20,
        },
        captureButton: {
            flexDirection: 'row',
            backgroundColor: colors.card,
            padding: 20,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
        },
        captureIconContainer: {
            width: 50,
            height: 50,
            borderRadius: 12,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
        },
        captureIcon: {
            fontSize: 24,
        },
        captureTextContainer: {
            flex: 1,
        },
        captureButtonTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
        },
        captureButtonDesc: {
            fontSize: 13,
            color: colors.textLight,
        },
        // Analyzing Step Styles
        analyzingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        analyzingImage: {
            width: '100%',
            height: '100%',
            resizeMode: 'contain',
            opacity: 0.3,
        },
        analyzingOverlay: {
            position: 'absolute',
            alignItems: 'center',
        },
        analyzingText: {
            marginTop: 20,
            fontSize: 18,
            fontWeight: '600',
            color: colors.primary,
        },
        analyzingSubtext: {
            marginTop: 8,
            fontSize: 14,
            color: colors.textLight,
        },
        // Form Step Styles
        formHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
        },
        backButton: {
            padding: 8,
        },
        backButtonText: {
            color: colors.primary,
            fontSize: 16,
        },
        formHeaderTitle: {
            flex: 1,
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.primary,
            textAlign: 'center',
        },
        headerCloseButton: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
        },
        imagePreviewContainer: {
            width: '100%',
            height: 150,
            borderRadius: 12,
            overflow: 'hidden',
            marginBottom: 20,
        },
        imagePreview: {
            width: '100%',
            height: '100%',
            resizeMode: 'cover',
        },
        documentPreview: {
            width: '100%',
            height: '100%',
            backgroundColor: colors.surface,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
        },
        documentIcon: {
            fontSize: 48,
            marginBottom: 8,
        },
        documentName: {
            fontSize: 14,
            color: colors.text,
            textAlign: 'center',
            fontWeight: '500',
        },
        documentType: {
            fontSize: 12,
            color: colors.textLight,
            marginTop: 4,
        },
        imagePreviewOverlay: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            padding: 8,
            alignItems: 'center',
        },
        imagePreviewText: {
            color: colors.white,
            fontSize: 12,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: colors.primary,
            marginTop: 0,
            marginBottom: 16,
        },
        textArea: {
            minHeight: 100,
            textAlignVertical: 'top',
        },
        amountContainer: {
            flexDirection: 'row',
            gap: 16,
            marginBottom: 4,
        },
        amountFieldContainer: {
            flex: 2,
        },
        currencyFieldContainer: {
            flex: 1,
        },
        dateSelectButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.inputBackground,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            minHeight: 56,
        },
        dateSelectContent: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        dateSelectIcon: {
            fontSize: 18,
        },
        dateSelectText: {
            fontSize: 16,
            color: colors.text,
        },
        dateSelectArrow: {
            fontSize: 12,
            color: colors.gray,
        },
        datePickerContainer: {
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 16,
            marginTop: 8,
            borderWidth: 1,
            borderColor: colors.cardBorder,
        },
        datePicker: {
            height: 120,
        },
        dateConfirmButton: {
            marginTop: 12,
        },
        durationRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        durationInput: {
            flex: 1,
            maxWidth: 100,
        },
        durationUnitSelector: {
            flexDirection: 'row',
            backgroundColor: colors.inputBackground,
            borderRadius: 8,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.border,
        },
        durationUnitButton: {
            flex: 1,
            paddingVertical: 12,
            borderRadius: 10,
            alignItems: 'center',
        },
        durationUnitButtonActive: {
            backgroundColor: colors.primary,
        },
        durationUnitText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.gray,
        },
        durationUnitTextActive: {
            color: colors.white,
        },
        error: {
            color: colors.error,
            fontSize: 14,
            marginBottom: 16,
            textAlign: 'center',
        },
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
        collapsibleArrow: {
            fontSize: 12,
            color: colors.gray,
        },
        expandHint: {
            fontSize: 12,
            color: colors.textLight,
            textAlign: 'center',
            marginTop: 8,
            marginBottom: 16,
            fontStyle: 'italic',
        },
        customFieldsSection: {
            marginTop: 24,
            paddingTop: 16,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        customFieldsSectionStandalone: {
            marginTop: 8,
        },
        customFieldsContent: {
            marginTop: 0,
        },
        customFieldsTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.textLight,
            marginBottom: 12,
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
        removeFieldButtonText: {
            color: colors.error,
            fontSize: 16,
            fontWeight: '600',
        },
        addFieldButton: {
            marginTop: 4,
            borderColor: colors.primary,
        },
        submitButton: {
            marginTop: 32,
        },
    }), [colors]);

    // React Hook Form setup
    const schema = useMemo(() => z.object({
        title: z.string().min(1, i18n.t('receipts.scan.validation.title_required')),
        amount: z.string().optional(),
        currency: z.string(),
        attachmentTypeId: z.string().min(1, i18n.t('receipts.scan.validation.type_required')),
        folderId: z.string().min(1, i18n.t('receipts.scan.validation.folder_required')),
        documentDate: z.date(),
        details: z.record(z.string(), z.any()).optional(),
        description: z.string().optional(),
        customFields: z.array(customFieldSchema).optional(),
    }), []);

    const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ScanFormData>({
        resolver: zodResolver(schema),
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

    // Watch form values
    const watchedTypeId = watch('attachmentTypeId');
    const watchedDetails = (watch('details') || {}) as Record<string, any>;
    const watchedDocumentDate = watch('documentDate');
    const watchedCustomFields = watch('customFields') || [];

    // Get dynamic fields for selected attachment type
    const [dynamicFields, setDynamicFields] = useState<FieldConfig[]>([]);

    // Find the selected type's name for field mapping
    const getTypeNameById = (typeId: string): string => {
        const type = attachmentTypes.find(t => t.id === typeId);
        return type?.name || '';
    };

    // Find attachment type ID by OCR detected type key
    const getTypeIdByOcrKey = (ocrTypeKey: string): string | undefined => {
        // Map OCR keys to Turkish type names (as returned from API)
        const ocrKeyToNameMap: Record<string, string[]> = {
            'warranty_document': ['Garanti Belgesi', 'Warranty', 'warranty'],
            'warranty': ['Garanti Belgesi', 'Warranty', 'warranty'],
            'invoice': ['Fatura', 'Invoice', 'invoice'],
            'receipt': ['Fiş', 'Receipt', 'receipt'],
            'check': ['Çek', 'Check', 'check'],
            'bank_slip': ['Dekont', 'Bank Slip', 'bank_slip'],
            'slip': ['Dekont', 'Bank Slip', 'bank_slip', 'slip'],
            'contract': ['Sözleşme', 'Contract', 'contract'],
            'insurance': ['Sigorta', 'Insurance', 'insurance'],
            'subscription': ['Abonelik', 'Subscription', 'subscription'],
            'medical_report': ['Sağlık Raporu', 'Medical Report', 'medical_report'],
            'prescription': ['Reçete', 'Prescription', 'prescription'],
            'bill': ['Fatura', 'Bill', 'bill'],
            'certificate': ['Sertifika', 'Certificate', 'certificate'],
            'license': ['Lisans', 'License', 'license'],
            'vehicle_document': ['Araç Belgesi', 'Vehicle Document', 'vehicle_document'],
        };

        const possibleNames = ocrKeyToNameMap[ocrTypeKey] || [ocrTypeKey];

        // Search for matching type in attachmentTypes
        for (const name of possibleNames) {
            const found = attachmentTypes.find(t =>
                t.name.toLowerCase() === name.toLowerCase() ||
                t.id.toLowerCase() === name.toLowerCase()
            );
            if (found) {
                return found.id;
            }
        }

        // Fallback: try to find by partial match
        const foundPartial = attachmentTypes.find(t =>
            t.name.toLowerCase().includes(ocrTypeKey.replace('_', ' ')) ||
            ocrTypeKey.toLowerCase().includes(t.name.toLowerCase())
        );

        return foundPartial?.id;
    };

    useEffect(() => {
        const typeName = getTypeNameById(watchedTypeId);
        const fields = AttachmentTypeFieldFactory.getFields(typeName);
        setDynamicFields(fields);

        // Initialize details with default values
        const defaultDetails = AttachmentTypeFieldFactory.getDefaultDetails(typeName);
        setValue('details', defaultDetails);
    }, [watchedTypeId, attachmentTypes]);

    // Process pending OCR type when attachmentTypes are loaded
    useEffect(() => {
        if (pendingOcrType && attachmentTypes.length > 0) {
            const typeId = getTypeIdByOcrKey(pendingOcrType);
            if (typeId) {
                setValue('attachmentTypeId', typeId);
            }
            setPendingOcrType(null);
        }
    }, [pendingOcrType, attachmentTypes]);

    // Process file with OCR (Image, PDF, or DOCX)
    const processFileWithOCR = async (uri: string, type: 'image' | 'document', mime: string) => {
        setFileUri(uri);
        setFileType(type);
        setMimeType(mime);
        setFileName(null);
        setStep('analyzing');

        try {
            // Use general scanDocument method that handles images, PDFs and DOCX
            const ocrResult = await OCRService.scanDocument(uri, mime);
            setOcrConfidence(ocrResult.confidence);

            // Auto-fill form fields using setValue
            if (ocrResult.extractedData.title) {
                setValue('title', ocrResult.extractedData.title);
            }
            if (ocrResult.extractedData.amount) {
                setValue('amount', ocrResult.extractedData.amount.toString());
            }
            if (ocrResult.extractedData.currency) {
                setValue('currency', ocrResult.extractedData.currency);
            }
            if (ocrResult.extractedData.date) {
                setValue('documentDate', new Date(ocrResult.extractedData.date));
            }
            if (ocrResult.extractedData.type) {
                // Convert OCR type key to actual attachment type ID
                if (attachmentTypes.length > 0) {
                    const typeId = getTypeIdByOcrKey(ocrResult.extractedData.type);
                    if (typeId) {
                        setValue('attachmentTypeId', typeId);
                    }
                } else {
                    // Store for later processing when attachmentTypes load
                    setPendingOcrType(ocrResult.extractedData.type);
                }
            }

            // Auto-fill type-specific details
            if (ocrResult.extractedData.details && Object.keys(ocrResult.extractedData.details).length > 0) {
                const currentDetails = watch('details') || {};
                setValue('details', {
                    ...currentDetails,
                    ...ocrResult.extractedData.details
                });
            }

            // Build description for search indexing (hidden field)
            const searchableFields: string[] = [];
            if (ocrResult.rawText) {
                // Add important lines from OCR (first 500 chars)
                searchableFields.push(ocrResult.rawText.substring(0, 500));
            }
            if (ocrResult.extractedData.title) {
                searchableFields.push(`Başlık: ${ocrResult.extractedData.title}`);
            }
            if (ocrResult.extractedData.amount) {
                searchableFields.push(`Tutar: ${ocrResult.extractedData.amount} ${ocrResult.extractedData.currency || 'TRY'}`);
            }
            if (ocrResult.extractedData.date) {
                searchableFields.push(`Tarih: ${new Date(ocrResult.extractedData.date).toLocaleDateString('tr-TR')}`);
            }
            if (ocrResult.extractedData.type) {
                searchableFields.push(`Tip: ${ocrResult.extractedData.type}`);
            }
            // Add extracted details
            if (ocrResult.extractedData.details) {
                Object.entries(ocrResult.extractedData.details).forEach(([key, value]) => {
                    if (value) {
                        searchableFields.push(`${key}: ${value}`);
                    }
                });
            }
            setValue('description', searchableFields.join(' | '));

            setStep('form');
        } catch (error) {
            console.error('OCR failed:', error);
            setStep('form'); // Continue to form even if OCR fails
        }
    };

    // Pick from gallery
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled) {
            await processFileWithOCR(result.assets[0].uri, 'image', 'image/jpeg');
        }
    };

    // Take photo with camera
    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(i18n.t('receipts.scan.permissionTitle'), i18n.t('receipts.scan.permissionCamera'));
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled) {
            await processFileWithOCR(result.assets[0].uri, 'image', 'image/jpeg');
        }
    };

    // Document scan with edge detection
    const scanDocument = async () => {
        if (!DocumentScanner) {
            Alert.alert(
                'Belge Tarayıcı Mevcut Değil',
                'Bu özellik Expo Go\'da çalışmaz. Lütfen "Fotoğraf Çek" veya "Galeriden Seç" kullanın.',
                [{ text: 'Tamam' }]
            );
            return;
        }

        try {
            const result = await DocumentScanner.scanDocument({
                croppedImageQuality: 100,
            });

            if (result.scannedImages && result.scannedImages.length > 0) {
                await processFileWithOCR(result.scannedImages[0], 'image', 'image/jpeg');
            }
        } catch (error) {
            console.error('Document scan failed:', error);
            Alert.alert(i18n.t('receipts.scan.document_scan_error.title'), i18n.t('receipts.scan.document_scan_error.message'));
        }
    };

    // Pick document file (PDF, Word, Excel)
    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    'application/pdf',
                    'application/msword',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel',
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                ],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const mime = asset.mimeType || 'application/pdf';
                setFileName(asset.name);

                // Auto-fill title from filename first (can be overwritten by OCR)
                const simpleName = asset.name.split('.').slice(0, -1).join('.') || asset.name;
                setValue('title', simpleName);

                // Process with OCR (Text Extraction)
                await processFileWithOCR(asset.uri, 'document', mime);
            }
        } catch (error) {
            console.error('Document pick failed:', error);
            Alert.alert(i18n.t('receipts.scan.file_pick_error.title'), i18n.t('receipts.scan.file_pick_error.message'));
        }
    };

    // Reset to capture step
    const resetCapture = () => {
        setStep('capture');
        setFileUri(null);
        setFileType('image');
        setFileName(null);
        setMimeType('image/jpeg');
        setOcrConfidence(0);
        setShowDetails(false);
        reset({
            title: '',
            amount: '',
            currency: 'TRY',
            attachmentTypeId: AttachmentTypeIds.RECEIPT,
            folderId: '',
            documentDate: new Date(),
            details: {},
            description: '',
            customFields: [],
        });
    };

    const onSubmit = async (data: ScanFormData) => {
        if (!fileUri) {
            Alert.alert(i18n.t('receipts.scan.file_required.title'), i18n.t('receipts.scan.file_required.message'));
            return;
        }

        console.log(JSON.stringify(data, null, 2));

        // Merge custom fields into details
        const mergedDetails = { ...(data.details || {}) };
        (data.customFields || []).forEach(cf => {
            if (cf.key.trim() && cf.value.trim()) {
                mergedDetails[cf.key.trim()] = cf.value.trim();
            }
        });

        const dto: CreateAttachmentDTO = {
            title: data.title,
            description: data.description || undefined, // Searchable OCR text
            amount: data.amount ? parseFloat(data.amount) : undefined,
            currency: data.amount ? data.currency : undefined,
            documentDate: data.documentDate.toISOString(),
            folderId: data.folderId,
            attachmentTypeId: data.attachmentTypeId,
            details: Object.keys(mergedDetails).length > 0 ? mergedDetails : undefined,
        };

        const result = await createAttachment(dto, fileUri, mimeType);
        if (result) {
            Alert.alert(i18n.t('receipts.scan.save_success.title'), i18n.t('receipts.scan.save_success.message'));
            resetCapture();
            // Replace instead of push to avoid modal stack issues
            router.replace('/(tabs)');
        } else {
            Alert.alert(i18n.t('receipts.scan.save_error.title'), i18n.t('receipts.scan.save_error.message'));
        }
    };

    const onChangeDocDate = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || watchedDocumentDate;
        setShowDocDatePicker(Platform.OS === 'ios');
        setValue('documentDate', currentDate);
    };

    const onChangeDetailDate = (fieldKey: string, event: any, selectedDate?: Date) => {
        if (selectedDate) {
            const currentDetails = watch('details') || {};
            setValue('details', {
                ...currentDetails,
                [fieldKey]: selectedDate.toISOString()
            });
        }
        setShowDetailDatePickers(prev => ({
            ...prev,
            [fieldKey]: Platform.OS === 'ios'
        }));
    };

    const updateDetailField = (key: string, value: any) => {
        const currentDetails = watch('details') || {};
        setValue('details', {
            ...currentDetails,
            [key]: value
        });
    };

    // Custom fields helpers
    const addCustomField = () => {
        const currentFields = watch('customFields') || [];
        setValue('customFields', [...currentFields, { key: '', value: '' }]);
    };

    const removeCustomField = (index: number) => {
        const currentFields = watch('customFields') || [];
        setValue('customFields', currentFields.filter((_, i) => i !== index));
    };

    const updateCustomField = (index: number, field: 'key' | 'value', value: string) => {
        const currentFields = [...(watch('customFields') || [])];
        currentFields[index] = { ...currentFields[index], [field]: value };
        setValue('customFields', currentFields);
    };

    // Close modal
    const closeModal = () => {
        router.back();
    };

    // STEP 1: Capture
    if (step === 'capture') {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header with close button */}
                    <View style={styles.captureHeader}>
                        <View style={styles.headerSpacer} />
                        <ThemedText type="title" style={styles.headerTitle}>
                            {i18n.t('receipts.scan.title')}
                        </ThemedText>
                        <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                            <ThemedText style={styles.closeButtonText}>✕</ThemedText>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.captureContainer}>
                        <ThemedText style={styles.captureSubtitle}>
                            {i18n.t('receipts.scan.method_subtitle')}
                        </ThemedText>

                        <TouchableOpacity style={styles.captureButton} onPress={scanDocument}>
                            <View style={styles.captureIconContainer}>
                                <ThemedText style={styles.captureIcon}>📑</ThemedText>
                            </View>
                            <View style={styles.captureTextContainer}>
                                <ThemedText style={styles.captureButtonTitle}>{i18n.t('receipts.scan.scan_method.title')}</ThemedText>
                                <ThemedText style={styles.captureButtonDesc}>{i18n.t('receipts.scan.scan_method.desc')}</ThemedText>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
                            <View style={styles.captureIconContainer}>
                                <ThemedText style={styles.captureIcon}>📷</ThemedText>
                            </View>
                            <View style={styles.captureTextContainer}>
                                <ThemedText style={styles.captureButtonTitle}>{i18n.t('receipts.scan.camera_method.title')}</ThemedText>
                                <ThemedText style={styles.captureButtonDesc}>{i18n.t('receipts.scan.camera_method.desc')}</ThemedText>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.captureButton} onPress={pickImage}>
                            <View style={styles.captureIconContainer}>
                                <ThemedText style={styles.captureIcon}>🖼️</ThemedText>
                            </View>
                            <View style={styles.captureTextContainer}>
                                <ThemedText style={styles.captureButtonTitle}>{i18n.t('receipts.scan.gallery_method.title')}</ThemedText>
                                <ThemedText style={styles.captureButtonDesc}>{i18n.t('receipts.scan.gallery_method.desc')}</ThemedText>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.captureButton} onPress={pickDocument}>
                            <View style={styles.captureIconContainer}>
                                <ThemedText style={styles.captureIcon}>📄</ThemedText>
                            </View>
                            <View style={styles.captureTextContainer}>
                                <ThemedText style={styles.captureButtonTitle}>{i18n.t('receipts.scan.file_method.title')}</ThemedText>
                                <ThemedText style={styles.captureButtonDesc}>{i18n.t('receipts.scan.file_method.desc')}</ThemedText>
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        );
    }

    // STEP 2: Analyzing
    if (step === 'analyzing') {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <View style={styles.analyzingContainer}>
                    {image && (
                        <Image source={{ uri: image }} style={styles.analyzingImage} />
                    )}
                    <View style={styles.analyzingOverlay}>
                        <ActivityIndicator size="large" color={colors.accent} />
                        <ThemedText style={styles.analyzingText}>{i18n.t('receipts.scan.analyzing.title')}</ThemedText>
                        <ThemedText style={styles.analyzingSubtext}>{i18n.t('receipts.scan.analyzing.desc')}</ThemedText>
                    </View>
                </View>
            </View>
        );
    }

    // STEP 3: Form
    return (
        <FormContainer
            contentStyle={[styles.scrollContent, { paddingTop: insets.top + 10 }]}
            keyboardOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            {/* Header with back/close button */}
            <View style={styles.formHeader}>
                <TouchableOpacity onPress={resetCapture} style={styles.backButton}>
                    <ThemedText style={styles.backButtonText}>{i18n.t('receipts.scan.back')}</ThemedText>
                </TouchableOpacity>
                <ThemedText type="title" style={styles.formHeaderTitle}>{i18n.t('receipts.scan.edit_details')}</ThemedText>
                <TouchableOpacity onPress={closeModal} style={styles.headerCloseButton}>
                    <ThemedText style={styles.closeButtonText}>✕</ThemedText>
                </TouchableOpacity>
            </View>

            {/* File Preview - Image or Document */}
            <TouchableOpacity style={styles.imagePreviewContainer} onPress={resetCapture}>
                {fileType === 'image' && fileUri && (
                    <Image source={{ uri: fileUri }} style={styles.imagePreview} />
                )}
                {fileType === 'document' && (
                    <View style={styles.documentPreview}>
                        <ThemedText style={styles.documentIcon}>📄</ThemedText>
                        <ThemedText type="defaultSemiBold" style={styles.documentName} numberOfLines={2}>
                            {fileName || i18n.t('receipts.scan.default_document_name')}
                        </ThemedText>
                        <ThemedText style={styles.documentType}>
                            {mimeType.includes('pdf') ? 'PDF' :
                                mimeType.includes('word') ? 'Word' :
                                    mimeType.includes('excel') || mimeType.includes('spreadsheet') ? 'Excel' :
                                        'Dosya'}
                        </ThemedText>
                    </View>
                )}
                <View style={styles.imagePreviewOverlay}>
                    <ThemedText style={styles.imagePreviewText}>{i18n.t('receipts.scan.tap_to_change')}</ThemedText>
                </View>
            </TouchableOpacity>

            {/* Folder Selection */}
            <Controller
                control={control}
                name="folderId"
                render={({ field: { onChange, value } }) => (
                    <FormField error={errors.folderId?.message}>
                        <FolderSelector
                            label={i18n.t('folders.title')}
                            value={value}
                            onSelect={onChange}
                            placeholder={i18n.t('folders.picker.placeholder')}
                            folders={folders}
                            requiredPermission="CREATE"
                        />
                    </FormField>
                )}
            />

            {/* Type Selection */}
            <Controller
                control={control}
                name="attachmentTypeId"
                render={({ field: { onChange, value } }) => {
                    const selectedType = attachmentTypes.find(t => t.id === value);
                    return (
                        <FormField
                            label={i18n.t('receipts.scan.detailsTitle')}
                            error={errors.attachmentTypeId?.message}
                            required
                        >
                            <AttachmentTypeSelector
                                value={value}
                                onSelect={onChange}
                                currentType={selectedType}
                                placeholder={i18n.t('filters.sections.type_placeholder')}
                                disabled={loadingTypes}
                            />
                        </FormField>
                    );
                }}
            />

            {/* Form Fields */}
            <ThemedText type="subtitle" style={styles.sectionTitle}>{i18n.t('receipts.scan.section.general')}</ThemedText>

            <Controller
                control={control}
                name="title"
                render={({ field: { onChange, onBlur, value } }) => (
                    <FormField label={i18n.t('receipts.scan.titlePlaceholder')} required error={errors.title?.message}>
                        <TextInput
                            placeholder={i18n.t('receipts.scan.titlePlaceholder')}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            hasError={!!errors.title}
                        />
                    </FormField>
                )}
            />

            <View style={styles.amountContainer}>
                <Controller
                    control={control}
                    name="amount"
                    render={({ field: { onChange, value } }) => (
                        <FormField label={i18n.t('receipts.scan.amountPlaceholder')} style={styles.amountFieldContainer}>
                            <TextInput
                                placeholder="0.00"
                                value={value}
                                onChangeText={onChange}
                                keyboardType="decimal-pad"
                            />
                        </FormField>
                    )}
                />
                <Controller
                    control={control}
                    name="currency"
                    render={({ field: { onChange, value } }) => (
                        <FormField label={i18n.t('receipts.scan.currency_label')} style={styles.currencyFieldContainer}>
                            <Select
                                label={i18n.t('receipts.scan.currency_select_label')}
                                value={value}
                                options={[
                                    { label: 'TRY', value: 'TRY', icon: '🇹🇷' },
                                    { label: 'USD', value: 'USD', icon: '🇺🇸' },
                                    { label: 'EUR', value: 'EUR', icon: '🇪🇺' },
                                    { label: 'GBP', value: 'GBP', icon: '🇬🇧' },
                                ]}
                                onChange={onChange}
                                hideLabel
                                compact
                            />
                        </FormField>
                    )}
                />
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

            {/* Dynamic Fields Based on Type - Collapsible */}
            {dynamicFields.length > 0 && (
                <>
                    <TouchableOpacity
                        style={styles.collapsibleHeader}
                        onPress={() => setShowDetails(!showDetails)}
                    >
                        <View style={styles.collapsibleHeaderContent}>
                            <ThemedText style={styles.collapsibleIcon}>{showDetails ? '📂' : '📁'}</ThemedText>
                            <ThemedText type="subtitle" style={styles.collapsibleTitle}>
                                {i18n.t('receipts.scan.section.extra')} ({dynamicFields.length})
                            </ThemedText>
                        </View>
                        <ThemedText style={styles.collapsibleArrow}>{showDetails ? '▲' : '▼'}</ThemedText>
                    </TouchableOpacity>
                    {showDetails && dynamicFields.map((field) => (
                        <FormField key={field.key} label={field.label} required={field.required}>
                            {field.type === 'duration' ? (
                                <View style={styles.durationRow}>
                                    <TextInput
                                        style={styles.durationInput}
                                        placeholder="0"
                                        value={watchedDetails[field.key]?.toString() || ''}
                                        onChangeText={(value) => {
                                            const numValue = parseInt(value) || 0;
                                            updateDetailField(field.key, numValue);
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
                                                    (watchedDetails[`${field.key}Unit`] || 'month') === unit && styles.durationUnitButtonActive
                                                ]}
                                                onPress={() => {
                                                    updateDetailField(`${field.key}Unit`, unit);
                                                    // Recalculate end date
                                                    const numValue = watchedDetails[field.key] || 0;
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
                                                    (watchedDetails[`${field.key}Unit`] || 'month') === unit && styles.durationUnitTextActive
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
                                    value={watchedDetails[field.key] ? new Date(watchedDetails[field.key]) : undefined}
                                    onChange={(date) => updateDetailField(field.key, date.toISOString())}
                                    placeholder={field.placeholder || i18n.t('common.actions.select_date')}
                                    error={field.required && !watchedDetails[field.key] ? 'Required' : undefined}
                                />
                            ) : field.type === 'textarea' ? (
                                <TextInput
                                    style={styles.textArea}
                                    placeholder={field.placeholder}
                                    value={watchedDetails[field.key] || ''}
                                    onChangeText={(value) => updateDetailField(field.key, value)}
                                    multiline
                                    numberOfLines={4}
                                />
                            ) : field.type === 'number' ? (
                                <TextInput
                                    placeholder={field.placeholder}
                                    value={watchedDetails[field.key]?.toString() || ''}
                                    onChangeText={(value) => updateDetailField(field.key, parseFloat(value) || '')}
                                    keyboardType="numeric"
                                />
                            ) : (
                                <TextInput
                                    placeholder={field.placeholder}
                                    value={watchedDetails[field.key] || ''}
                                    onChangeText={(value) => updateDetailField(field.key, value)}
                                />
                            )}
                        </FormField>
                    ))}

                    {/* Custom Key-Value Fields */}
                    <View style={styles.customFieldsSection}>
                        <ThemedText style={styles.customFieldsTitle}>{i18n.t('receipts.scan.section.custom_fields')}</ThemedText>

                        {watchedCustomFields.map((field, index) => (
                            <View key={index} style={styles.customFieldRow}>
                                <TextInput
                                    style={styles.customFieldKey}
                                    placeholder={i18n.t('receipts.scan.custom_fields.key_placeholder')}
                                    value={field.key}
                                    onChangeText={(text) => updateCustomField(index, 'key', text)}
                                />
                                <TextInput
                                    style={styles.customFieldValue}
                                    placeholder={i18n.t('receipts.scan.custom_fields.value_placeholder')}
                                    value={field.value}
                                    onChangeText={(text) => updateCustomField(index, 'value', text)}
                                />
                                <TouchableOpacity
                                    style={styles.removeFieldButton}
                                    onPress={() => removeCustomField(index)}
                                >
                                    <ThemedText style={styles.removeFieldButtonText}>✕</ThemedText>
                                </TouchableOpacity>
                            </View>
                        ))}

                        <Button
                            title={i18n.t('receipts.scan.custom_fields.add_button')}
                            variant="outline"
                            onPress={addCustomField}
                            style={styles.addFieldButton}
                        />
                    </View>
                </>
            )}

            {/* Custom Key-Value Fields - Always available for all types */}
            {dynamicFields.length === 0 && (
                <View style={styles.customFieldsSectionStandalone}>
                    <TouchableOpacity
                        style={styles.collapsibleHeader}
                        onPress={() => setShowDetails(!showDetails)}
                    >
                        <View style={styles.collapsibleHeaderContent}>
                            <ThemedText style={styles.collapsibleIcon}>{showDetails ? '📂' : '📁'}</ThemedText>
                            <ThemedText type="subtitle" style={styles.collapsibleTitle}>
                                {i18n.t('receipts.scan.section.custom_fields')} {watchedCustomFields.length > 0 && `(${watchedCustomFields.length})`}
                            </ThemedText>
                        </View>
                        <ThemedText style={styles.collapsibleArrow}>{showDetails ? '▲' : '▼'}</ThemedText>
                    </TouchableOpacity>

                    {showDetails && (
                        <View style={styles.customFieldsContent}>
                            {watchedCustomFields.map((field, index) => (
                                <View key={index} style={styles.customFieldRow}>
                                    <TextInput
                                        style={styles.customFieldKey}
                                        placeholder={i18n.t('receipts.scan.custom_fields.key_placeholder')}
                                        value={field.key}
                                        onChangeText={(text) => updateCustomField(index, 'key', text)}
                                    />
                                    <TextInput
                                        style={styles.customFieldValue}
                                        placeholder={i18n.t('receipts.scan.custom_fields.value_placeholder')}
                                        value={field.value}
                                        onChangeText={(text) => updateCustomField(index, 'value', text)}
                                    />
                                    <TouchableOpacity
                                        style={styles.removeFieldButton}
                                        onPress={() => removeCustomField(index)}
                                    >
                                        <ThemedText style={styles.removeFieldButtonText}>✕</ThemedText>
                                    </TouchableOpacity>
                                </View>
                            ))}

                            <Button
                                title={i18n.t('receipts.scan.custom_fields.add_button')}
                                variant="outline"
                                onPress={addCustomField}
                                style={styles.addFieldButton}
                            />
                        </View>
                    )}
                </View>
            )}

            {/* Hint to expand details */}
            {dynamicFields.length > 0 && !showDetails && (
                <ThemedText style={styles.expandHint}>
                    {i18n.t('receipts.scan.custom_fields.expand_hint')}
                </ThemedText>
            )}

            {error && <ThemedText style={styles.error}>{error}</ThemedText>}

            <Button
                title={i18n.t('receipts.scan.saveButton')}
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                disabled={loading}
                size="large"
                style={styles.submitButton}
            />
        </FormContainer>
    );
}
