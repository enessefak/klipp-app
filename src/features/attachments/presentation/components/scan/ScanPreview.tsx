import { ThemedText } from '@/components/themed-text';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface ScanPreviewProps {
    fileUri: string | null;
    fileType: 'image' | 'document';
    fileName: string | null;
    mimeType: string;
    onRetake: () => void;
}

export function ScanPreview({ fileUri, fileType, fileName, mimeType, onRetake }: ScanPreviewProps) {
    const { colors } = useSettings();

    const styles = StyleSheet.create({
        container: {
            height: 200,
            backgroundColor: colors.card,
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.border,
            position: 'relative',
        },
        image: {
            width: '100%',
            height: '100%',
            resizeMode: 'cover',
        },
        documentPreview: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
        },
        documentIcon: {
            fontSize: 48,
            marginBottom: 12,
        },
        documentName: {
            fontSize: 16,
            textAlign: 'center',
            marginBottom: 4,
            color: colors.text,
        },
        documentType: {
            fontSize: 14,
            color: colors.subtext,
        },
        overlay: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding: 12,
            alignItems: 'center',
        },
        overlayText: {
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: '600',
        },
    });

    return (
        <TouchableOpacity style={styles.container} onPress={onRetake}>
            {fileType === 'image' && fileUri && (
                <Image source={{ uri: fileUri }} style={styles.image} />
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

            <View style={styles.overlay}>
                <ThemedText style={styles.overlayText}>{i18n.t('receipts.scan.tap_to_change')}</ThemedText>
            </View>
        </TouchableOpacity>
    );
}
