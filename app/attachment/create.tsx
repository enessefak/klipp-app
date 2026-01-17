import { AttachmentTypeSelector } from '@/components/AttachmentTypeSelector';
import { FolderSelector } from '@/components/FolderSelector';
import { Button, DatePickerField, FormField, TextInput } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AttachmentService } from '@/src/features/attachments/data/AttachmentService';
import { CreateAttachmentDTO } from '@/src/features/attachments/domain/Attachment';
import { FieldConfig } from '@/src/features/attachments/domain/AttachmentTypeFields';
import { DynamicFieldsSection } from '@/src/features/attachments/presentation/components/scan/DynamicFieldsSection';
import { useFolders } from '@/src/features/folders/presentation/useFolders';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { AttachmentTypeService } from '@/src/infrastructure/api/generated/services/AttachmentTypeService';
import i18n from '@/src/infrastructure/localization/i18n';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FormData {
    folderId: string;
    attachmentTypeId: string;
    title: string;
    documentDate: Date;
    details: Record<string, any>;
}

export default function CreateRecordScreen() {
    const { colors } = useSettings();
    const router = useRouter();
    const { folderId: initialFolderId } = useLocalSearchParams<{ folderId?: string }>();

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [attachmentTypes, setAttachmentTypes] = useState<any[]>([]);
    const [typesLoading, setTypesLoading] = useState(true);

    // Fetch folders and types
    const { folders, loading: foldersLoading } = useFolders();

    const { control, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            folderId: initialFolderId || '',
            attachmentTypeId: '',
            title: '',
            documentDate: new Date(),
            details: {},
        }
    });

    const watchedTypeId = watch('attachmentTypeId');
    const watchedDetails = watch('details');
    const watchedDocumentDate = watch('documentDate');

    // Get selected type and its dynamic fields
    const selectedType = useMemo(() => {
        const type = attachmentTypes.find(t => t.id === watchedTypeId);
        console.log('Selected type:', type);
        console.log('fieldConfig:', type?.fieldConfig);
        return type;
    }, [attachmentTypes, watchedTypeId]);

    const dynamicFields = useMemo((): FieldConfig[] => {
        if (!selectedType?.fieldConfig) return [];
        console.log('Dynamic fields:', selectedType.fieldConfig);
        return selectedType.fieldConfig as FieldConfig[];
    }, [selectedType]);

    useEffect(() => {
        const loadTypes = async () => {
            try {
                const response = await AttachmentTypeService.getAttachmentTypes();
                console.log('AttachmentTypes API response:', response);
                console.log('AttachmentTypes data:', response.data);
                setAttachmentTypes((response.data || []) as any);
            } catch (error) {
                console.error('Failed to load attachment types', error);
            } finally {
                setTypesLoading(false);
            }
        };
        loadTypes();
    }, []);

    // Reset details when type changes
    const handleTypeSelect = useCallback((typeId: string) => {
        setValue('attachmentTypeId', typeId);
        // Reset details to default values for the new type
        const type = attachmentTypes.find(t => t.id === typeId);
        if (type?.defaultDetails) {
            setValue('details', { ...type.defaultDetails });
        } else {
            setValue('details', {});
        }
    }, [attachmentTypes, setValue]);

    const handleNext = useCallback(async () => {
        // Validate step 1 fields
        const isValid = await trigger(['folderId', 'title', 'attachmentTypeId']);
        if (isValid) {
            if (dynamicFields.length > 0) {
                setStep(2);
            } else {
                // No dynamic fields, submit directly
                handleSubmit(onSubmit)();
            }
        }
    }, [trigger, dynamicFields, handleSubmit]);

    const handleBack = useCallback(() => {
        if (step === 2) {
            setStep(1);
        } else {
            router.back();
        }
    }, [step, router]);

    const onSubmit = useCallback(async (data: FormData) => {
        setIsSubmitting(true);
        try {
            const dto: CreateAttachmentDTO = {
                folderId: data.folderId,
                attachmentTypeId: data.attachmentTypeId,
                title: data.title.trim(),
                documentDate: data.documentDate.toISOString(),
                details: data.details,
            };

            await AttachmentService.createAttachment(dto);

            Alert.alert(
                i18n.t('common.success'),
                i18n.t('manualRecord.created'),
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error: any) {
            console.error('Failed to create record', error);
            Alert.alert(
                i18n.t('common.error'),
                error?.body?.message || error?.message || i18n.t('common.errorOccurred')
            );
        } finally {
            setIsSubmitting(false);
        }
    }, [router]);

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        backButton: {
            padding: 8,
            marginRight: 8,
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            flex: 1,
        },
        stepIndicator: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 8,
        },
        stepDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors.border,
        },
        stepDotActive: {
            backgroundColor: colors.primary,
            width: 24,
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            padding: 16,
            paddingBottom: 100,
        },
        sectionTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.subtext,
            textTransform: 'uppercase',
            marginBottom: 16,
        },
        buttonContainer: {
            padding: 16,
            paddingBottom: 16,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.background,
        },
    }), [colors]);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <IconSymbol name="chevron.left" size={24} color={colors.text} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>
                    {i18n.t('manualRecord.title')}
                </ThemedText>
            </View>

            {/* Step Indicator */}
            {dynamicFields.length > 0 && (
                <View style={styles.stepIndicator}>
                    <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
                    <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
                </View>
            )}

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={true}
                >
                    {step === 1 ? (
                        <>
                            {/* Step 1: Basic Information */}
                            <ThemedText style={styles.sectionTitle}>
                                {i18n.t('manualRecord.basicInfo') || 'Basic Information'}
                            </ThemedText>

                            {/* Folder Selector */}
                            <Controller
                                control={control}
                                name="folderId"
                                rules={{ required: i18n.t('manualRecord.folderRequired') }}
                                render={({ field: { onChange, value } }) => (
                                    <FormField error={errors.folderId?.message}>
                                        <FolderSelector
                                            value={value}
                                            onSelect={onChange}
                                            label={i18n.t('manualRecord.folder')}
                                            placeholder={i18n.t('manualRecord.selectFolder')}
                                            folders={folders}
                                            requiredPermission="CREATE"
                                        />
                                    </FormField>
                                )}
                            />

                            {/* Title Input */}
                            <Controller
                                control={control}
                                name="title"
                                rules={{ required: i18n.t('manualRecord.titleRequired') }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <FormField label={i18n.t('manualRecord.documentName')} required error={errors.title?.message}>
                                        <TextInput
                                            placeholder={i18n.t('manualRecord.documentNamePlaceholder')}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            hasError={!!errors.title}
                                        />
                                    </FormField>
                                )}
                            />

                            {/* Date Picker */}
                            <Controller
                                control={control}
                                name="documentDate"
                                render={({ field: { onChange, value } }) => (
                                    <DatePickerField
                                        label={i18n.t('manualRecord.documentDate')}
                                        value={value}
                                        onChange={onChange}
                                        placeholder={i18n.t('manualRecord.documentDate')}
                                    />
                                )}
                            />

                            {/* Attachment Type Selector */}
                            <Controller
                                control={control}
                                name="attachmentTypeId"
                                rules={{ required: i18n.t('manualRecord.typeRequired') }}
                                render={({ field: { value } }) => (
                                    <FormField label={i18n.t('manualRecord.documentType')} required error={errors.attachmentTypeId?.message}>
                                        <AttachmentTypeSelector
                                            value={value}
                                            onSelect={handleTypeSelect}
                                            currentType={selectedType}
                                            placeholder={i18n.t('manualRecord.selectType')}
                                            disabled={typesLoading}
                                        />
                                    </FormField>
                                )}
                            />
                        </>
                    ) : (
                        <>
                            {/* Step 2: Dynamic Fields */}
                            <ThemedText style={styles.sectionTitle}>
                                {selectedType?.name || i18n.t('receipts.scan.section.extra')} ({dynamicFields.length})
                            </ThemedText>

                            <DynamicFieldsSection
                                control={control}
                                dynamicFields={dynamicFields}
                                watchedDetails={watchedDetails}
                                watchedDocumentDate={watchedDocumentDate}
                                setValue={setValue}
                                fieldStyle={selectedType?.fieldStyle}
                            />
                        </>
                    )}
                </ScrollView>

                {/* Bottom Button */}
                <View style={styles.buttonContainer}>
                    {step === 1 ? (
                        <Button
                            title={dynamicFields.length > 0 ? i18n.t('common.actions.next') || 'Next' : i18n.t('common.actions.save')}
                            onPress={dynamicFields.length > 0 ? handleNext : handleSubmit(onSubmit)}
                            loading={isSubmitting}
                            disabled={isSubmitting}
                            size="large"
                        />
                    ) : (
                        <Button
                            title={i18n.t('common.actions.save')}
                            onPress={handleSubmit(onSubmit)}
                            loading={isSubmitting}
                            disabled={isSubmitting}
                            size="large"
                        />
                    )}
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
