import { ThemedText } from '@/components/themed-text';
import { ScanResult } from '@/src/features/attachments/presentation/hooks/useScanLogic';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface ScanPreviewProps {
    files: ScanResult[];
    maxFiles: number;
    canAddMore: boolean;
    onAddPress: () => void;
    onRemoveFile: (fileId: string) => void;
    onResetAll: () => void;
}

export function ScanPreview({ files, maxFiles, canAddMore, onAddPress, onRemoveFile, onResetAll }: ScanPreviewProps) {
    const { colors } = useSettings();

    const styles = StyleSheet.create({
        container: {
            marginBottom: 16,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
        },
        headerTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
        },
        headerActions: {
            flexDirection: 'row',
            alignItems: 'center',
            columnGap: 12,
        },
        actionText: {
            color: colors.primary,
            fontWeight: '600',
        },
        resetText: {
            color: colors.subtext,
        },
        list: {
            flexDirection: 'row',
            columnGap: 12,
        },
        card: {
            width: 140,
            height: 180,
            borderRadius: 16,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.cardBorder,
            backgroundColor: colors.card,
        },
        image: {
            width: '100%',
            height: '100%',
            resizeMode: 'cover',
        },
        docCard: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
        },
        docIcon: {
            fontSize: 36,
            marginBottom: 8,
        },
        docType: {
            fontSize: 14,
            color: colors.subtext,
            marginBottom: 4,
        },
        docName: {
            fontSize: 14,
            color: colors.text,
            textAlign: 'center',
        },
        removeButton: {
            position: 'absolute',
            top: 8,
            right: 8,
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: 'rgba(0,0,0,0.55)',
            alignItems: 'center',
            justifyContent: 'center',
        },
        removeText: {
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: '700',
        },
        footer: {
            flexDirection: 'row',
            justifyContent: 'flex-start',
            marginTop: 8,
        },
        footerText: {
            fontSize: 12,
            color: colors.subtext,
        },
        addDisabled: {
            opacity: 0.5,
        },
    });

    const renderDocumentPreview = (file: ScanResult) => (
        <View style={styles.docCard}>
            <ThemedText style={styles.docIcon}>📄</ThemedText>
            <ThemedText style={styles.docType}>
                {file.mimeType.includes('pdf') ? 'PDF' :
                    file.mimeType.includes('word') ? 'Word' :
                        file.mimeType.includes('excel') || file.mimeType.includes('spreadsheet') ? 'Excel' :
                            i18n.t('receipts.scan.default_document_name')}
            </ThemedText>
            <ThemedText style={styles.docName} numberOfLines={2}>
                {file.fileName || i18n.t('receipts.scan.default_document_name')}
            </ThemedText>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText type="subtitle" style={styles.headerTitle}>
                    {i18n.t('receipts.scan.files_section.title', { count: files.length, limit: maxFiles })}
                </ThemedText>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={onResetAll}>
                        <ThemedText style={styles.resetText}>{i18n.t('receipts.scan.files_section.clear')}</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={onAddPress}
                        disabled={!canAddMore}
                        style={!canAddMore ? styles.addDisabled : undefined}
                    >
                        <ThemedText style={styles.actionText}>{i18n.t('receipts.scan.files_section.add_more')}</ThemedText>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
                {files.map(file => (
                    <View key={file.id} style={styles.card}>
                        {file.fileType === 'image' ? (
                            <Image source={{ uri: file.fileUri }} style={styles.image} />
                        ) : (
                            renderDocumentPreview(file)
                        )}
                        <TouchableOpacity style={styles.removeButton} onPress={() => onRemoveFile(file.id)}>
                            <ThemedText style={styles.removeText}>✕</ThemedText>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            <View style={styles.footer}>
                <ThemedText style={styles.footerText}>
                    {i18n.t('receipts.scan.files_section.hint', { remaining: Math.max(0, maxFiles - files.length) })}
                </ThemedText>
            </View>
        </View>
    );
}
