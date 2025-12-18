import React, { useState } from 'react';
import { Control, Controller, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { Platform, TouchableOpacity, View } from 'react-native';

import { AttachmentTypeSelector } from '@/components/AttachmentTypeSelector';
import { FolderSelector } from '@/components/FolderSelector';
import { Button, DatePickerField, FormContainer, FormField, TextInput } from '@/components/form';
import { ThemedText } from '@/components/themed-text';

import { FieldConfig } from '@/src/features/attachments/domain/AttachmentTypeFields';
import { CustomFieldsList } from '@/src/features/attachments/presentation/components/scan/CustomFieldsList';
import { DynamicFieldsSection } from '@/src/features/attachments/presentation/components/scan/DynamicFieldsSection';
import { ScanPreview } from '@/src/features/attachments/presentation/components/scan/ScanPreview';
import { ScanFormData } from '@/src/features/attachments/presentation/hooks/useScanForm';
import { ScanResult } from '@/src/features/attachments/presentation/hooks/useScanLogic';
import i18n from '@/src/infrastructure/localization/i18n';

interface EditDetailsStepProps {
    // Form Props
    control: Control<ScanFormData>;
    errors: FieldErrors<ScanFormData>;
    setValue: UseFormSetValue<ScanFormData>;
    handleSubmit: (fn: (data: ScanFormData) => void) => () => Promise<void>;
    isSubmitting: boolean;

    // State Props
    attachmentTypes: any[];
    loadingTypes: boolean;
    dynamicFields: FieldConfig[];
    watchedDetails: Record<string, any>;
    watchedDocumentDate: Date;
    watchedCustomFields: any[];
    watchedTypeId: string;

    // Actions
    onSubmit: () => void;
    onAddCustomField: () => void;
    onRemoveCustomField: (index: number) => void;
    onUpdateCustomField: (index: number, field: 'key' | 'value', value: string) => void;
    onTypeSelect: (typeId: string) => void;

    // File
    file: ScanResult;

    // Others
    folders: any[];
    onRetake: () => void;
    onClose: () => void;
    insets: { top: number };
    styles: any;
}

export const EditDetailsStep = ({
    control,
    errors,
    setValue,
    handleSubmit,
    isSubmitting,
    attachmentTypes,
    loadingTypes,
    dynamicFields,
    watchedDetails,
    watchedDocumentDate,
    watchedCustomFields,
    watchedTypeId,
    onSubmit,
    onAddCustomField,
    onRemoveCustomField,
    onUpdateCustomField,
    onTypeSelect,
    file,
    folders,
    onRetake,
    onClose,
    insets,
    styles,
}: EditDetailsStepProps) => {
    const [showDetails, setShowDetails] = useState(true);

    return (
        <FormContainer
            contentStyle={[styles.scrollContent, { paddingTop: insets.top + 10 }]}
            keyboardOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            {/* Header with back/close button */}
            <View style={styles.formHeader}>
                <TouchableOpacity onPress={onRetake} style={styles.backButton}>
                    <ThemedText style={styles.backButtonText}>{i18n.t('receipts.scan.back')}</ThemedText>
                </TouchableOpacity>
                <ThemedText type="title" style={styles.formHeaderTitle}>{i18n.t('receipts.scan.edit_details')}</ThemedText>
                <TouchableOpacity onPress={onClose} style={styles.headerCloseButton}>
                    <ThemedText style={styles.closeButtonText}>✕</ThemedText>
                </TouchableOpacity>
            </View>

            {/* File Preview */}
            <ScanPreview
                fileUri={file.fileType === 'image' ? file.fileUri : null}
                fileType={file.fileType}
                fileName={file.fileName}
                mimeType={file.mimeType}
                onRetake={onRetake}
            />

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
                    const selectedType = attachmentTypes?.find?.(t => t.id === value);
                    return (
                        <FormField
                            label={i18n.t('receipts.scan.detailsTitle')}
                            error={errors.attachmentTypeId?.message}
                            required
                        >
                            <AttachmentTypeSelector
                                value={value}
                                onSelect={(typeId) => {
                                    onTypeSelect(typeId);
                                    onChange(typeId);
                                }}
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
                    {showDetails && (
                        <>
                            <DynamicFieldsSection
                                control={control}
                                dynamicFields={dynamicFields}
                                watchedDetails={watchedDetails}
                                watchedDocumentDate={watchedDocumentDate}
                                setValue={setValue}
                            />

                            {/* Custom Key-Value Fields */}
                            <CustomFieldsList
                                title={i18n.t('receipts.scan.section.custom_fields')}
                                fields={watchedCustomFields}
                                onAdd={onAddCustomField}
                                onRemove={onRemoveCustomField}
                                onUpdate={onUpdateCustomField}
                            />
                        </>
                    )}
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
                        <CustomFieldsList
                            style={styles.customFieldsContent}
                            fields={watchedCustomFields}
                            onAdd={onAddCustomField}
                            onRemove={onRemoveCustomField}
                            onUpdate={onUpdateCustomField}
                        />
                    )}
                </View>
            )}

            {/* Hint to expand details */}
            {dynamicFields.length > 0 && !showDetails && (
                <ThemedText style={styles.expandHint}>
                    {i18n.t('receipts.scan.custom_fields.expand_hint')}
                </ThemedText>
            )}

            <Button
                title={i18n.t('receipts.scan.saveButton')}
                onPress={onSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
                size="large"
                style={styles.submitButton}
            />
        </FormContainer>
    );
};
