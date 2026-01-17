import { FolderSelector } from '@/components/FolderSelector';
import { Button } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
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
    const [selectedFolderId, setSelectedFolderId] = React.useState(initialFolderId || '');

    const handleNext = () => {
        if (selectedFolderId) {
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
                        Belgenizi yüklemek için bir klasör seçin.
                    </ThemedText>

                    <FolderSelector
                        label={i18n.t('folders.title')}
                        value={selectedFolderId}
                        onSelect={setSelectedFolderId}
                        placeholder={i18n.t('folders.picker.placeholder')}
                        folders={folders}
                        requiredPermission="CREATE"
                    />

                    <Button
                        title="Sonraki"
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
        gap: 20,
    },
    description: {
        fontSize: 16,
        opacity: 0.7,
        marginBottom: 10,
    },
    nextButton: {
        marginTop: 20,
    }
});
