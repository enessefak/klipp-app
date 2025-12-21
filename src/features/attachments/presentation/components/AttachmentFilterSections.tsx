import I18nLocal from '@/src/infrastructure/localization/i18n';
import React from 'react';
import { AttachmentFilters } from '../../domain/Attachment';
import { FieldConfig } from '../../domain/AttachmentTypeFields';
import { DynamicFilterSection } from './filters/DynamicFilterSection';
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
}: AttachmentFilterSectionsProps) {

    return (
        <>
            <FilterSection
                title={I18nLocal.t('filters.sections.folder')}
                onClear={filters.folderId ? () => onUpdateFilter('folderId', undefined) : undefined}
            >
                <FilterSelectInput
                    placeholder={I18nLocal.t('filters.sections.folder_placeholder')}
                    value={selectedFolderName}
                    icon={selectedFolderIcon}
                    onPress={() => onTriggerNavigation('folder')}
                />
            </FilterSection>

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
