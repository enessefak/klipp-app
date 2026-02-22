import { FolderSelector } from '@/components/FolderSelector';
import { Button } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface SelectFolderStepProps {
    onNext: (folderId: string) => void;
    onClose: () => void;
    folders: any[];
    initialFolderId?: string;
    insets: { top: number };
    styles: any;
}

export const SelectFolderStep = ({
    onNext,
    onClose,
    folders,
    initialFolderId,
    insets,
    styles
}: SelectFolderStepProps) => {
    const { colors } = useSettings();
    // '__root__' means "Ana Dizin" (no folder), empty string means nothing selected yet
    const [selectedFolderId, setSelectedFolderId] = React.useState(initialFolderId || '');
    const isRootSelected = selectedFolderId === '__root__';

    const handleNext = () => {
        if (isRootSelected) {
            // Root = no folder, pass empty string (will be treated as null/undefined)
            onNext('');
        } else if (selectedFolderId) {
            onNext(selectedFolderId);
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.captureHeader}>
                    <View style={styles.headerSpacer} />
                    <ThemedText type="title" style={styles.headerTitle}>
                        {i18n.t('receipts.scan.folder_select_label')}
                    </ThemedText>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <ThemedText style={styles.closeButtonText}>✕</ThemedText>
                    </TouchableOpacity>
                </View>

                <View style={localStyles.content}>
                    <ThemedText style={localStyles.description}>
                        {i18n.t('receipts.scan.folder_select_description', { defaultValue: 'Belgenizi yüklemek için bir klasör seçin veya ana dizine ekleyin.' })}
                    </ThemedText>

                    {/* Ana Dizin option */}
                    <TouchableOpacity
                        style={[
                            localStyles.rootOption,
                            {
                                backgroundColor: isRootSelected ? colors.primary + '15' : colors.card,
                                borderColor: isRootSelected ? colors.primary : colors.cardBorder,
                            }
                        ]}
                        onPress={() => setSelectedFolderId('__root__')}
                        activeOpacity={0.7}
                    >
                        <View style={localStyles.rootOptionContent}>
                            <View style={[localStyles.rootIconContainer, { backgroundColor: colors.primary + '20' }]}>
                                <IconSymbol name="house.fill" size={20} color={colors.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <ThemedText style={[localStyles.rootOptionTitle, { color: colors.text }]}>
                                    {i18n.t('folders.picker.root_directory', { defaultValue: 'Ana Dizin' })}
                                </ThemedText>
                                <ThemedText style={[localStyles.rootOptionSubtitle, { color: colors.subtext }]}>
                                    {i18n.t('folders.picker.root_directory_desc', { defaultValue: 'Klasörsüz olarak kaydet' })}
                                </ThemedText>
                            </View>
                            {isRootSelected && (
                                <IconSymbol name="checkmark.circle.fill" size={22} color={colors.primary} />
                            )}
                        </View>
                    </TouchableOpacity>

                    <View style={localStyles.dividerRow}>
                        <View style={[localStyles.dividerLine, { backgroundColor: colors.border }]} />
                        <ThemedText style={[localStyles.dividerText, { color: colors.subtext }]}>
                            {i18n.t('common.or', { defaultValue: 'veya' })}
                        </ThemedText>
                        <View style={[localStyles.dividerLine, { backgroundColor: colors.border }]} />
                    </View>

                    <FolderSelector
                        label={i18n.t('folders.title')}
                        value={isRootSelected ? '' : selectedFolderId}
                        onSelect={(fid) => setSelectedFolderId(fid)}
                        placeholder={i18n.t('folders.picker.placeholder')}
                        folders={folders}
                        requiredPermission="CREATE"
                    />

                    <Button
                        title={i18n.t('common.actions.next', { defaultValue: 'Sonraki' })}
                        onPress={handleNext}
                        disabled={!selectedFolderId}
                        size="large"
                        style={localStyles.nextButton}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

const localStyles = StyleSheet.create({
    content: {
        paddingHorizontal: 20,
        paddingTop: 20,
        gap: 16,
    },
    description: {
        fontSize: 16,
        opacity: 0.7,
        marginBottom: 4,
    },
    rootOption: {
        borderRadius: 12,
        borderWidth: 1.5,
        padding: 16,
    },
    rootOptionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    rootIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rootOptionTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    rootOptionSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        fontSize: 13,
    },
    nextButton: {
        marginTop: 8,
    }
});
