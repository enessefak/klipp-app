import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import I18nLocal from '@/src/infrastructure/localization/i18n';
import React, { useMemo } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { AttachmentFilters } from '../../domain/Attachment';
import { FieldConfig } from '../../domain/AttachmentTypeFields';
import { DynamicFilterSection } from './filters/DynamicFilterSection';
import { FilterChips } from './filters/FilterChips';
import { FilterDateRange } from './filters/FilterDateRange';
import { FilterSection } from './filters/FilterSection';
import { FilterSelectInput } from './filters/FilterSelectInput';

interface AttachmentFilterSectionsProps {
    filters: AttachmentFilters;
    dynamicValues: Record<string, any>;
    selectedFolderName?: string;
    selectedFolderIcon?: string;
    selectedTypeName?: string;
    selectedTypeIcon?: string;
    selectedTypeFieldConfig?: FieldConfig[];

    // New Props for dynamic visibility and logic
    showStatus?: boolean;
    showTransactionType?: boolean;
    disabledFolder?: boolean;

    onUpdateFilter: (key: keyof AttachmentFilters, value: any) => void;
    onUpdateDynamicValue: (key: string, value: any) => void;
    onTriggerNavigation: (target: 'folder' | 'type') => void;
    onClearType: () => void;
}

export function AttachmentFilterSections({
    filters,
    dynamicValues,
    selectedFolderName,
    selectedFolderIcon,
    selectedTypeName,
    selectedTypeIcon,
    selectedTypeFieldConfig,
    onUpdateFilter,
    onUpdateDynamicValue,
    onTriggerNavigation,
    onClearType,
    showStatus,
    showTransactionType,
    disabledFolder,
}: AttachmentFilterSectionsProps) {
    const { colors } = useSettings();

    const styles = useMemo(() => StyleSheet.create({
        input: {
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 12,
            fontSize: 16,
            color: colors.text,
            borderWidth: 1,
            borderColor: colors.border,
        }
    }), [colors]);

    return (
        <>
            <FilterSection
                title={I18nLocal.t('filters.sections.search')}
                onClear={filters.search ? () => onUpdateFilter('search', undefined) : undefined}
            >
                <TextInput
                    style={styles.input}
                    placeholder={I18nLocal.t('filters.sections.search_placeholder')}
                    value={filters.search}
                    onChangeText={(text) => {
                        console.log('[AttachmentFilterSections] Search text update:', text);
                        onUpdateFilter('search', text);
                    }}
                    placeholderTextColor={colors.textLight}
                />
            </FilterSection>

            <FilterSection
                title={I18nLocal.t('filters.sections.folder')}
                onClear={(!filters.folderId || disabledFolder) ? undefined : () => onUpdateFilter('folderId', undefined)}
            >
                <FilterSelectInput
                    placeholder={I18nLocal.t('filters.sections.folder_placeholder')}
                    value={selectedFolderName}
                    icon={selectedFolderIcon}
                    onPress={disabledFolder ? undefined : () => onTriggerNavigation('folder')}
                    disabled={disabledFolder}
                />
            </FilterSection>

            {showStatus && (
                <FilterSection
                    title={I18nLocal.t('filters.sections.status')}
                    onClear={filters.status ? () => onUpdateFilter('status', undefined) : undefined}
                >
                    <FilterChips
                        options={['PENDING', 'APPROVED', 'REJECTED']}
                        selected={filters.status}
                        onSelect={(val) => onUpdateFilter('status', val === filters.status ? undefined : val)}
                        getLabel={(opt) => I18nLocal.t(`status.${opt.toLowerCase()}`, { defaultValue: opt })}
                    />
                </FilterSection>
            )}

            {showTransactionType && (
                <FilterSection
                    title={I18nLocal.t('filters.sections.transaction_type')}
                    onClear={filters.transactionType ? () => onUpdateFilter('transactionType', undefined) : undefined}
                >
                    <FilterChips
                        options={['INCOME', 'EXPENSE']}
                        selected={filters.transactionType}
                        onSelect={(val) => onUpdateFilter('transactionType', val === filters.transactionType ? undefined : val)}
                        getLabel={(opt) => I18nLocal.t(`transaction_type.${opt.toLowerCase()}`, { defaultValue: opt })}
                    />
                </FilterSection>
            )}

            <FilterSection
                title={I18nLocal.t('filters.sections.document_type')}
                onClear={filters.attachmentTypeId ? onClearType : undefined}
            >
                <FilterSelectInput
                    placeholder={I18nLocal.t('filters.sections.type_placeholder')}
                    value={selectedTypeName}
                    icon={selectedTypeIcon}
                    onPress={() => onTriggerNavigation('type')}
                />
            </FilterSection>

            {selectedTypeFieldConfig && (
                <DynamicFilterSection
                    fieldConfig={selectedTypeFieldConfig}
                    values={dynamicValues}
                    onChange={onUpdateDynamicValue}
                />
            )}

            <FilterSection
                title={I18nLocal.t('filters.sections.date_range')}
                onClear={(filters.documentDateFrom || filters.documentDateTo) ? () => {
                    onUpdateFilter('documentDateFrom', undefined);
                    onUpdateFilter('documentDateTo', undefined);
                } : undefined}
            >
                <FilterDateRange
                    dateFrom={filters.documentDateFrom}
                    dateTo={filters.documentDateTo}
                    onDateFromChange={(d) => onUpdateFilter('documentDateFrom', d)}
                    onDateToChange={(d) => onUpdateFilter('documentDateTo', d)}
                />
            </FilterSection>
        </>
    );
}
