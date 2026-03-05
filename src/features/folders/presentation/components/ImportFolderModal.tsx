import { Button } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { OpenAPI } from '@/src/infrastructure/api/generated/core/OpenAPI';
import i18n from '@/src/infrastructure/localization/i18n';
import * as DocumentPicker from 'expo-document-picker';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface ImportFolderModalProps {
    visible: boolean;
    onClose: () => void;
    folderId: string;
    onSuccess: () => void;
}

interface PickedFile {
    name: string;
    uri: string;
    mimeType?: string;
    size?: number;
}

interface PreviewItem {
    title: string;
    invoiceNumber?: string | null;
    issueDate?: string | null;
    senderName?: string | null;
    amount?: number | null;
    currency?: string;
}

type Step = 'select' | 'preview';

export function ImportFolderModal({ visible, onClose, folderId, onSuccess }: ImportFolderModalProps) {
    const { colors } = useSettings();
    const [file, setFile] = useState<PickedFile | null>(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<Step>('select');
    const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);

    const handlePickFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['application/json', 'text/xml', 'application/xml', 'application/zip', 'application/x-zip-compressed'],
            copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets.length > 0) {
            const asset = result.assets[0];
            const picked = { name: asset.name, uri: asset.uri, mimeType: asset.mimeType ?? undefined, size: asset.size ?? undefined };
            setFile(picked);
            await handlePreview(picked);
        }
    };

    const buildFormData = (picked: PickedFile) => {
        const formData = new FormData();
        formData.append('file', {
            uri: picked.uri,
            name: picked.name,
            type: picked.mimeType || 'application/octet-stream',
        } as any);
        return formData;
    };

    const handlePreview = async (picked: PickedFile) => {
        setLoading(true);
        try {
            const url = `${OpenAPI.BASE}/import/folder/${folderId}?preview=true`;
            const token = typeof OpenAPI.TOKEN === 'function' ? await OpenAPI.TOKEN({} as any) : OpenAPI.TOKEN;

            const response = await fetch(url, {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: buildFormData(picked),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || i18n.t('folders.import_modal.error'));
            }

            const items: PreviewItem[] = data?.data?.items ?? data?.items ?? [];
            setPreviewItems(items);
            setStep('preview');
        } catch (error: any) {
            Alert.alert(i18n.t('common.error'), error?.message || i18n.t('folders.import_modal.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const url = `${OpenAPI.BASE}/import/folder/${folderId}`;
            const token = typeof OpenAPI.TOKEN === 'function' ? await OpenAPI.TOKEN({} as any) : OpenAPI.TOKEN;

            const response = await fetch(url, {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: buildFormData(file),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || i18n.t('folders.import_modal.error'));
            }

            const imported = data?.data?.importedCount ?? data?.importedCount ?? 0;

            Alert.alert(
                i18n.t('folders.import_modal.success_title'),
                i18n.t('folders.import_modal.success_message', { count: imported }),
                [{ text: 'OK' }]
            );

            handleClose();
            onSuccess();
        } catch (error: any) {
            Alert.alert(i18n.t('common.error'), error?.message || i18n.t('folders.import_modal.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        setFile(null);
        setPreviewItems([]);
        setStep('select');
        onClose();
    };

    const handleBack = () => {
        setStep('select');
        setFile(null);
        setPreviewItems([]);
    };

    const fileIcon = file?.name.endsWith('.json') ? 'doc.text.fill' : file?.name.endsWith('.xml') ? 'doc.badge.gearshape.fill' : file?.name.endsWith('.zip') ? 'archivebox.fill' : 'doc.fill';

    const styles = useMemo(() => StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            padding: 20,
        },
        container: {
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 24,
            gap: 16,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            maxHeight: '85%',
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 4,
        },
        description: {
            color: colors.subtext,
            fontSize: 14,
            lineHeight: 20,
        },
        dropZone: {
            borderWidth: 2,
            borderColor: colors.border,
            borderStyle: 'dashed',
            borderRadius: 12,
            padding: 24,
            alignItems: 'center',
            gap: 8,
            backgroundColor: colors.inputBackground,
        },
        dropZoneActive: {
            borderColor: colors.primary,
            backgroundColor: colors.primary + '08',
        },
        dropZoneText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
        },
        dropZoneHint: {
            fontSize: 12,
            color: colors.subtext,
        },
        fileName: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
        },
        fileSize: {
            fontSize: 12,
            color: colors.subtext,
        },
        removeText: {
            fontSize: 12,
            color: colors.error,
            marginTop: 4,
        },
        note: {
            flexDirection: 'row',
            gap: 8,
            backgroundColor: colors.warning + '15',
            borderRadius: 10,
            padding: 12,
            alignItems: 'flex-start',
        },
        noteText: {
            fontSize: 13,
            color: colors.text,
            flex: 1,
            lineHeight: 18,
        },
        actions: {
            flexDirection: 'row',
            gap: 12,
            marginTop: 4,
        },
        previewHeader: {
            fontSize: 13,
            color: colors.subtext,
            marginBottom: 4,
        },
        previewItem: {
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 10,
            backgroundColor: colors.inputBackground,
            marginBottom: 6,
            gap: 2,
        },
        previewItemTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
        },
        previewItemSub: {
            fontSize: 12,
            color: colors.subtext,
        },
        previewList: {
            maxHeight: 300,
        },
        loadingContainer: {
            alignItems: 'center',
            paddingVertical: 24,
            gap: 12,
        },
    }), [colors]);

    const formatAmount = (amount?: number | null, currency?: string) => {
        if (amount == null) return null;
        return `${amount.toLocaleString()} ${currency || 'TRY'}`;
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <TouchableWithoutFeedback onPress={handleClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.container}>
                            {step === 'select' ? (
                                <>
                                    <ThemedText style={styles.title}>{i18n.t('folders.import_modal.title')}</ThemedText>
                                    <ThemedText style={styles.description}>{i18n.t('folders.import_modal.description')}</ThemedText>

                                    {loading ? (
                                        <View style={styles.loadingContainer}>
                                            <ActivityIndicator color={colors.primary} />
                                            <ThemedText style={styles.previewHeader}>{i18n.t('folders.import_modal.previewing')}</ThemedText>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            style={[styles.dropZone, file && styles.dropZoneActive]}
                                            onPress={handlePickFile}
                                            activeOpacity={0.7}
                                            disabled={loading}
                                        >
                                            {file ? (
                                                <>
                                                    <IconSymbol name={fileIcon as any} size={36} color={colors.primary} />
                                                    <ThemedText style={styles.fileName}>{file.name}</ThemedText>
                                                    {file.size != null && (
                                                        <ThemedText style={styles.fileSize}>
                                                            {(file.size / 1024).toFixed(1)} KB
                                                        </ThemedText>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <IconSymbol name="square.and.arrow.down" size={36} color={colors.subtext} />
                                                    <ThemedText style={styles.dropZoneText}>{i18n.t('folders.import_modal.pick_file')}</ThemedText>
                                                    <ThemedText style={styles.dropZoneHint}>.json, .xml, .zip</ThemedText>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    )}

                                    <View style={styles.note}>
                                        <IconSymbol name="info.circle.fill" size={16} color={colors.warning} />
                                        <ThemedText style={styles.noteText}>{i18n.t('folders.import_modal.note')}</ThemedText>
                                    </View>

                                    <View style={styles.actions}>
                                        <Button
                                            title={i18n.t('common.actions.cancel')}
                                            variant="secondary"
                                            onPress={handleClose}
                                            style={{ flex: 1 }}
                                            disabled={loading}
                                        />
                                    </View>
                                </>
                            ) : (
                                <>
                                    <ThemedText style={styles.title}>{i18n.t('folders.import_modal.preview_title')}</ThemedText>
                                    <ThemedText style={styles.previewHeader}>
                                        {i18n.t('folders.import_modal.preview_count', { count: previewItems.length })}
                                    </ThemedText>

                                    <FlatList
                                        style={styles.previewList}
                                        data={previewItems}
                                        keyExtractor={(_, index) => String(index)}
                                        renderItem={({ item }) => (
                                            <View style={styles.previewItem}>
                                                <ThemedText style={styles.previewItemTitle}>{item.title}</ThemedText>
                                                {item.senderName && (
                                                    <ThemedText style={styles.previewItemSub}>{item.senderName}</ThemedText>
                                                )}
                                                {formatAmount(item.amount, item.currency) && (
                                                    <ThemedText style={styles.previewItemSub}>{formatAmount(item.amount, item.currency)}</ThemedText>
                                                )}
                                            </View>
                                        )}
                                        ListEmptyComponent={
                                            <ThemedText style={styles.previewItemSub}>{i18n.t('folders.import_modal.preview_empty')}</ThemedText>
                                        }
                                    />

                                    <View style={styles.actions}>
                                        <Button
                                            title={i18n.t('common.actions.back')}
                                            variant="secondary"
                                            onPress={handleBack}
                                            style={{ flex: 1 }}
                                            disabled={loading}
                                        />
                                        <Button
                                            title={i18n.t('folders.import_modal.action_count', { count: previewItems.length })}
                                            onPress={handleImport}
                                            style={{ flex: 1 }}
                                            disabled={previewItems.length === 0 || loading}
                                            loading={loading}
                                        />
                                    </View>
                                </>
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}
