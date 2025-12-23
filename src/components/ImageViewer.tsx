import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FileDownloadService } from '../features/attachments/application/FileDownloadService';

interface ImageViewerProps {
    visible: boolean;
    onClose: () => void;
    url: string;
    filename: string;
    headers?: Record<string, string>;
}

export function ImageViewer({ visible, onClose, url, filename, headers }: ImageViewerProps) {
    const { colors } = useSettings();
    const insets = useSafeAreaInsets();
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        try {
            setDownloading(true);
            const success = await FileDownloadService.downloadAndShare(url, filename);
            if (!success) {
                // error handling if needed, or toast
            }
        } finally {
            setDownloading(false);
        }
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: 'black',
        },
        header: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: 'rgba(0,0,0,0.5)',
            paddingTop: insets.top > 0 ? insets.top : 16,
        },
        closeButton: {
            padding: 8,
        },
        actionButton: {
            padding: 8,
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 8,
        },
        imageContainer: {
            flex: 1,
        },
        image: {
            width: '100%',
            height: '100%',
        },
    });

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <IconSymbol name="xmark" size={24} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleDownload}
                        style={styles.actionButton}
                        disabled={downloading}
                    >
                        {downloading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <IconSymbol name="square.and.arrow.up" size={20} color="white" />
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.imageContainer}>
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
                        minimumZoomScale={1}
                        maximumZoomScale={3}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        centerContent={true}
                    >
                        <Image
                            source={{
                                uri: url,
                                headers: headers,
                            }}
                            style={{ width: '100%', height: '100%' }}
                            contentFit="contain"
                        />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
