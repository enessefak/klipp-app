import { FilterSection } from '@/src/features/attachments/presentation/components/filters/FilterSection';
import { FilterSelectInput } from '@/src/features/attachments/presentation/components/filters/FilterSelectInput';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import I18nLocal from '@/src/infrastructure/localization/i18n';
import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { FolderFilters } from '../../../domain/FolderFilters';

interface FolderFilterSectionProps {
    filters: FolderFilters;
    onUpdateFilter: (key: keyof FolderFilters, value: any) => void;
    onTriggerIconPicker: () => void;
}

export function FolderFilterSection({
    filters,
    onUpdateFilter,
    onTriggerIconPicker
}: FolderFilterSectionProps) {
    const { colors } = useSettings();

    return (
        <>
            <FilterSection
                title={I18nLocal.t('folders.picker.icon')}
                onClear={filters.folderIcon ? () => onUpdateFilter('folderIcon', undefined) : undefined}
            >
                <FilterSelectInput
                    placeholder={I18nLocal.t('folders.picker.icon_placeholder')}
                    value={filters.folderIcon}
                    icon={filters.folderIcon}
                    onPress={onTriggerIconPicker}
                />
            </FilterSection>

            <FilterSection
                title={I18nLocal.t('folders.picker.color')}
                onClear={filters.folderColor ? () => onUpdateFilter('folderColor', undefined) : undefined}
            >
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 8 }}>
                    {['#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#FF2D55', '#8E8E93'].map(color => (
                        <TouchableOpacity
                            key={color}
                            onPress={() => onUpdateFilter('folderColor', filters.folderColor === color ? undefined : color)}
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: 18,
                                backgroundColor: color,
                                borderWidth: filters.folderColor === color ? 3 : 0,
                                borderColor: colors.text
                            }}
                        />
                    ))}
                </ScrollView>
            </FilterSection>
        </>
    );
}
