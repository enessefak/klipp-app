import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { FileDownloadService } from '../features/attachments/application/FileDownloadService';

interface PdfViewerProps {
    visible: boolean;
    onClose: () => void;
    url: string;
    filename: string;
    headers?: Record<string, string>;
}

export function PdfViewer({ visible, onClose, url, filename, headers }: PdfViewerProps) {
    const { colors } = useSettings();
    const insets = useSafeAreaInsets();
    const [downloading, setDownloading] = useState(false);
    const [localUri, setLocalUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (visible && url) {
            setupPdf();
        } else {
            setLocalUri(null);
            setLoading(true);
        }
    }, [visible, url]);

    const setupPdf = async () => {
        try {
            setLoading(true);
            const uri = await FileDownloadService.downloadFile(url, filename);
            setLocalUri(uri);
        } catch (e) {
            console.error('PDF setup error', e);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            setDownloading(true);
            if (localUri) {
                const Sharing = require('expo-sharing');
                await Sharing.shareAsync(localUri, {
                    UTI: 'com.adobe.pdf',
                    mimeType: 'application/pdf',
                });
            } else {
                await FileDownloadService.downloadAndShare(url, filename);
            }
        } finally {
            setDownloading(false);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.headerBackground,
            paddingTop: insets.top > 0 ? insets.top : 16, // Add top inset
        },
        title: {
            flex: 1,
            marginHorizontal: 16,
            fontSize: 16,
            fontWeight: '600',
            textAlign: 'center',
        },
        content: {
            flex: 1,
            // Remove centering here so WebView can expand
        },
        centered: {
            justifyContent: 'center',
            alignItems: 'center',
        },
        androidMessage: {
            textAlign: 'center',
            marginBottom: 20,
            color: colors.text,
        },
        openButton: {
            backgroundColor: colors.primary,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 8,
        },
        openButtonText: {
            color: 'white',
            fontWeight: '600',
        }
    });

    if (!visible) return null;

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose}>
                        <IconSymbol name="xmark" size={24} color={colors.text} />
                    </TouchableOpacity>

                    <ThemedText style={styles.title} numberOfLines={1} ellipsizeMode="middle">
                        {filename}
                    </ThemedText>

                    <TouchableOpacity
                        onPress={handleDownload}
                        disabled={downloading}
                    >
                        {downloading ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                            <IconSymbol name="square.and.arrow.up" size={24} color={colors.primary} />
                        )}
                    </TouchableOpacity>
                </View>

                <View style={[styles.content, loading ? styles.centered : undefined]}>
                    {loading ? (
                        <ActivityIndicator size="large" color={colors.primary} />
                    ) : (
                        Platform.OS === 'ios' && localUri ? (
                            <WebView
                                source={{ uri: localUri }}
                                style={{ flex: 1 }}
                                originWhitelist={['*']}
                                allowFileAccess={true}
                                allowFileAccessFromFileURLs={true}
                                allowingReadAccessToURL={localUri}
                            />
                        ) : (
                            <View style={[styles.content, styles.centered]}>
                                <IconSymbol name="doc.text.fill" size={64} color={colors.primary} />
                                <View style={{ height: 20 }} />
                                <ThemedText style={styles.androidMessage}>
                                    {Platform.OS === 'android'
                                        ? i18n.t('receipts.detail.actions.pdf_android_hint')
                                        : i18n.t('receipts.detail.actions.error_opening_file')}
                                </ThemedText>
                                <TouchableOpacity
                                    style={styles.openButton}
                                    onPress={handleDownload}
                                >
                                    <ThemedText style={styles.openButtonText}>
                                        {i18n.t('receipts.detail.actions.open_external') || 'Dışarıda Aç'}
                                    </ThemedText>
                                </TouchableOpacity>
                            </View>
                        )
                    )}
                </View>
            </View>
        </Modal>
    );
}
