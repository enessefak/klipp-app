
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { WebSessionRepository } from '@/src/features/auth/infrastructure/WebSessionRepository';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function ScanQrLoginScreen() {
    const { colors } = useSettings();
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [processing, setProcessing] = useState(false);

    if (!permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
                <IconSymbol name="camera.fill" size={64} color={colors.textLight} />
                <ThemedText style={{ textAlign: 'center', marginTop: 16, marginBottom: 24 }}>
                    {i18n.t('scan_qr.permission_message', { defaultValue: 'Web giriş için kamerayı kullanmamız gerekiyor.' })}
                </ThemedText>
                <TouchableOpacity onPress={requestPermission} style={[styles.button, { backgroundColor: colors.primary }]}>
                    <ThemedText style={styles.buttonText}>{i18n.t('common.actions.grant_permission', { defaultValue: 'İzin Ver' })}</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
                    <ThemedText style={{ color: colors.textLight }}>{i18n.t('common.actions.cancel')}</ThemedText>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
        if (scanned || processing) return;

        // Simple validation: assume generic session code or check prefix if specified
        // For now, any string
        setScanned(true);
        setProcessing(true);

        try {
            console.log('QR Scanned:', data);
            // Optional: check format, e.g. "kweb:..."
            const sessionCode = data;

            const result = await WebSessionRepository.confirmSession(sessionCode);

            if (result.success) {
                Alert.alert(
                    i18n.t('common.success'),
                    i18n.t('scan_qr.success_message', { defaultValue: 'Web oturumu başarıyla açıldı.' }),
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            } else {
                Alert.alert(
                    i18n.t('common.error'),
                    result.message || i18n.t('scan_qr.error_message', { defaultValue: 'Geçersiz veya süresi dolmuş kod.' }),
                    [{ text: 'OK', onPress: () => { setScanned(false); setProcessing(false); } }]
                );
            }
        } catch (error) {
            console.error('QR Login error:', error);
            Alert.alert(
                i18n.t('common.error'),
                i18n.t('scan_qr.connection_error', { defaultValue: 'Bağlantı hatası oluştu.' }),
                [{ text: 'OK', onPress: () => { setScanned(false); setProcessing(false); } }]
            );
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: 'black' }]}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
            />

            <SafeAreaView style={styles.overlay}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                        <IconSymbol name="xmark" size={24} color="white" />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>{i18n.t('scan_qr.title', { defaultValue: 'Web Giriş' })}</ThemedText>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.scanAreaContainer}>
                    <View style={styles.scanFrame}>
                        <View style={[styles.corner, styles.tl]} />
                        <View style={[styles.corner, styles.tr]} />
                        <View style={[styles.corner, styles.bl]} />
                        <View style={[styles.corner, styles.br]} />
                    </View>
                    <ThemedText style={styles.instructionText}>
                        {processing
                            ? i18n.t('scan_qr.processing', { defaultValue: 'Giriş yapılıyor...' })
                            : i18n.t('scan_qr.instruction', { defaultValue: 'Bilgisayarınızdaki QR kodu okutun' })
                        }
                    </ThemedText>
                    {processing && <ActivityIndicator color="white" style={{ marginTop: 20 }} size="large" />}
                </View>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    closeButton: {
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
    },
    scanAreaContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 100,
    },
    scanFrame: {
        width: 250,
        height: 250,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: 'white',
        borderWidth: 4,
    },
    tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
    tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
    bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
    br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
    instructionText: {
        color: 'white',
        marginTop: 24,
        fontSize: 16,
        textAlign: 'center',
        paddingHorizontal: 40,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    button: {
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
    }
});
