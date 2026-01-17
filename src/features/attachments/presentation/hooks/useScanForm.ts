import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert } from 'react-native';
import { z } from 'zod';

import { OCRResult } from '@/src/features/attachments/data/OCRService';
import { AttachmentTypeIds, CreateAttachmentDTO } from '@/src/features/attachments/domain/Attachment';
import { FieldConfig } from '@/src/features/attachments/domain/AttachmentTypeFields';
import { useAttachmentTypes } from '@/src/features/attachments/presentation/useAttachmentTypes';
import { useCreateAttachment } from '@/src/features/attachments/presentation/useCreateAttachment';
import i18n from '@/src/infrastructure/localization/i18n';
import { ScanResult } from './useScanLogic';

// Custom field schema
const customFieldSchema = z.object({
    key: z.string(),
    value: z.string(),
});

// Zod schema
const scanFormSchema = z.object({
    title: z.string().min(1, i18n.t('receipts.scan.validation.title_required')),
    attachmentTypeId: z.string().min(1, i18n.t('receipts.scan.validation.type_required')),
    folderId: z.string().min(1, i18n.t('receipts.scan.validation.folder_required')),
    documentDate: z.date(),
    details: z.record(z.string(), z.any()).optional(),
    description: z.string().optional(),
    customFields: z.array(customFieldSchema).optional(),
});

export type ScanFormData = z.infer<typeof scanFormSchema>;

export function useScanForm() {
    const router = useRouter();
    const { createAttachment, loading: isSubmitting, error: submitError } = useCreateAttachment();
    const { attachmentTypes, loading: loadingTypes } = useAttachmentTypes();

    const [dynamicFields, setDynamicFields] = useState<FieldConfig[]>([]);
    const [pendingOcrType, setPendingOcrType] = useState<string | null>(null);

    // Track if type change is manual
    const isUserTypeSelection = useRef(false);

    const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<ScanFormData>({
        resolver: zodResolver(scanFormSchema),
        shouldUnregister: false,
        defaultValues: {
            title: '',
            attachmentTypeId: '',
            folderId: '',
            documentDate: new Date(),
            details: {},
            description: '',
            customFields: [],
        },
    });

    const watchedTypeId = watch('attachmentTypeId');
    const watchedDetails = (watch('details') || {}) as Record<string, any>;
    const watchedDocumentDate = watch('documentDate');
    const watchedCustomFields = watch('customFields') || [];

    // --- Type & Dynamic Fields Logic ---

    // Set default type on load
    useEffect(() => {
        if (attachmentTypes.length > 0 && !watch('attachmentTypeId')) {
            const defaultType = attachmentTypes.find(t =>
                t.name.toLowerCase() === 'receipt' ||
                t.name.toLowerCase() === 'fiş' ||
                t.id === AttachmentTypeIds.RECEIPT
            );

            if (defaultType) {
                setValue('attachmentTypeId', defaultType.id);
            } else if (attachmentTypes.length > 0) {
                setValue('attachmentTypeId', attachmentTypes[0].id);
            }
        }
    }, [attachmentTypes]);

    // Handle Type Change & Dynamic Fields
    useEffect(() => {
        const type = attachmentTypes.find(t => t.id === watchedTypeId);

        if (type?.fieldConfig && type.fieldConfig.length > 0) {
            setDynamicFields(type.fieldConfig);

            if (type.defaultDetails && isUserTypeSelection.current) {
                setValue('details', type.defaultDetails);
            }
        } else {
            setDynamicFields([]);
        }

        // Reset manual selection flag? No, keep it as is, usually reset by OCR process
    }, [watchedTypeId, attachmentTypes]);

    // Pending OCR Type
    useEffect(() => {
        if (pendingOcrType && attachmentTypes.length > 0) {
            const typeId = getTypeIdByOcrKey(pendingOcrType);
            if (typeId) {
                setValue('attachmentTypeId', typeId);
            }
            setPendingOcrType(null);
        }
    }, [pendingOcrType, attachmentTypes]);

    // --- Helpers ---

    const getTypeIdByOcrKey = (ocrTypeKey: string): string | undefined => {
        console.log('[getTypeIdByOcrKey] Trying to match key:', ocrTypeKey);

        const ocrKeyToNameMap: Record<string, string[]> = {
            'warranty_document': ['Garanti Belgesi', 'Warranty', 'warranty'],
            'invoice': ['Fatura', 'Invoice', 'invoice'],
            'receipt': ['Fiş', 'Receipt', 'receipt'],
            'check': ['Çek', 'Check', 'check'],
            'slip': ['Dekont', 'Bank Slip', 'bank_slip', 'slip'],
            'bank_slip': ['Dekont', 'Bank Slip', 'bank_slip', 'slip'],
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
        console.log('[getTypeIdByOcrKey] Possible names:', possibleNames);

        for (const name of possibleNames) {
            const found = attachmentTypes?.find?.(t => {
                const nameMatch = t.name.toLowerCase() === name.toLowerCase();
                const idMatch = t.id.toLowerCase() === name.toLowerCase();
                // console.log(`Checking vs ${t.name} (${t.id}): nameMatch=${nameMatch}, idMatch=${idMatch}`);
                return nameMatch || idMatch;
            });
            if (found) {
                console.log('[getTypeIdByOcrKey] Found match:', found.id);
                return found.id;
            }
        }

        const foundPartial = attachmentTypes?.find?.(t =>
            t.name.toLowerCase().includes(ocrTypeKey.replace('_', ' ')) ||
            ocrTypeKey.toLowerCase().includes(t.name.toLowerCase())
        );
        if (foundPartial) console.log('[getTypeIdByOcrKey] Found partial match:', foundPartial.id);

        return foundPartial?.id;
    };

    // --- OCR Population Logic ---

    const populateFormFromOcr = (ocrResult: OCRResult, file: ScanResult) => {
        // Reset manual type selection flag to prevent overriding OCR type
        isUserTypeSelection.current = false;

        // Title
        if (ocrResult.extractedData.title) {
            setValue('title', ocrResult.extractedData.title);
        } else if (file.fileName) {
            const simpleName = file.fileName.split('.').slice(0, -1).join('.') || file.fileName;
            setValue('title', simpleName);
        }

        // Base Details
        const currentDetails = watch('details') || {};
        const newDetails = { ...currentDetails };

        if (ocrResult.extractedData.amount) {
            newDetails.amount = ocrResult.extractedData.amount.toString();
        }
        if (ocrResult.extractedData.currency) {
            newDetails.currency = ocrResult.extractedData.currency;
        } else if (!newDetails.currency) {
            newDetails.currency = 'TRY';
        }
        setValue('details', newDetails);

        // Date
        if (ocrResult.extractedData.date) {
            setValue('documentDate', new Date(ocrResult.extractedData.date));
        }

        // Type
        if (ocrResult.extractedData.type) {
            if (attachmentTypes.length > 0) {
                const typeId = getTypeIdByOcrKey(ocrResult.extractedData.type);
                if (typeId) {
                    setValue('attachmentTypeId', typeId);

                    // Force update dynamic fields based on this type immediately
                    // The useEffect will handle it but we want to ensure any details matching fields are kept
                }
            } else {
                setPendingOcrType(ocrResult.extractedData.type);
            }
        }

        // Granular Details
        if (ocrResult.extractedData.details && Object.keys(ocrResult.extractedData.details).length > 0) {
            const currentD = watch('details') || {};
            const newData = ocrResult.extractedData.details;

            Object.entries(newData).forEach(([key, value]) => {
                setValue(`details.${key}`, value as any, {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true
                });
            });

            setValue('details', { ...currentD, ...newData });
        }

        // Description - Use suggested description directly
        if (ocrResult.extractedData.description) {
            setValue('description', ocrResult.extractedData.description);
        }
    };

    // --- Submit Logic ---

    const submitForm = async (files: ScanResult[], onError?: (errors: any) => void) => {
        return handleSubmit(async (data) => {
            if (!files || files.length === 0) {
                Alert.alert(i18n.t('receipts.scan.file_required.title'), i18n.t('receipts.scan.file_required.message'));
                return;
            }

            // Merge custom fields
            const mergedDetails = { ...(data.details || {}) };
            (data.customFields || []).forEach(cf => {
                if (cf.key.trim() && cf.value.trim()) {
                    mergedDetails[cf.key.trim()] = cf.value.trim();
                }
            });

            const dto: CreateAttachmentDTO = {
                title: data.title,
                description: data.description || undefined,
                documentDate: data.documentDate.toISOString(),
                folderId: data.folderId,
                attachmentTypeId: data.attachmentTypeId,
                details: Object.keys(mergedDetails).length > 0 ? mergedDetails : undefined,
            };

            try {
                const payload = files.map(item => ({
                    fileUri: item.fileUri,
                    mimeType: item.mimeType,
                }));

                const result = await createAttachment(dto, payload);
                if (result) {
                    Alert.alert(i18n.t('receipts.scan.save_success.title'), i18n.t('receipts.scan.save_success.message'));
                    router.replace('/(tabs)');
                }
            } catch (error: any) {
                console.error('ScanScreen submit error:', error);
                if (error?.body?.code === 'SUBSCRIPTION_REQUIRED') {
                    Alert.alert(
                        'Abonelik Gerekli',
                        'Ücretsiz kullanım limitiniz dolmuştur. Devam etmek için lütfen aboneliğinizi yükseltin.',
                        [
                            { text: 'Vazgeç', style: 'cancel' },
                            { text: 'Premium Al', onPress: () => router.push('/(tabs)/profile') }
                        ]
                    );
                } else {
                    Alert.alert(i18n.t('receipts.scan.save_error.title'), i18n.t('receipts.scan.save_error.message'));
                }
            }
        }, onError)();
    };

    // --- Custom Field Actions ---
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

    const handleTypeSelect = (typeId: string) => {
        isUserTypeSelection.current = true;
        setValue('attachmentTypeId', typeId);
    };

    return {
        form: {
            control,
            handleSubmit,
            setValue,
            watch,
            reset,
            errors,
            isSubmitting,
            submitError,
        },
        state: {
            attachmentTypes,
            loadingTypes,
            dynamicFields,
            watchedDetails,
            watchedDocumentDate,
            watchedCustomFields,
            watchedTypeId,
        },
        actions: {
            populateFormFromOcr,
            submitForm,
            addCustomField,
            removeCustomField,
            updateCustomField,
            handleTypeSelect,
        }
    };
}
