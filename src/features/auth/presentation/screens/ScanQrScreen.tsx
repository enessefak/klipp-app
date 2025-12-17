
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { WebSessionService } from '@/src/infrastructure/api/generated/services/WebSessionService';
import i18n from '@/src/infrastructure/localization/i18n';

export function ScanQrScreen() {
    const router = useRouter();
    const { colors } = useSettings();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const isProcessing = useRef(false); // Use ref for synchronous locking

    useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        }
    }, [permission]);

    const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
        // Immediate synchronous check
        if (isProcessing.current || scanned) return;

        isProcessing.current = true;
        setScanned(true);

        console.log('Scanned QR:', data);

        let sessionCode = '';

        try {
            // Check if it looks like JSON before parsing to avoid unnecessary throws
            if (data.trim().startsWith('{')) {
                const parsedData = JSON.parse(data);
                if (parsedData.type === 'klipp_web_login' && parsedData.code) {
                    sessionCode = parsedData.code;
                } else {
                    Alert.alert('Geçersiz QR', `Bu QR kod Klipp Web girişi için geçerli değil.\n\nTip: ${parsedData.type || 'Bilinmiyor'}`, [
                        { text: 'Tamam', onPress: () => resetScan() }
                    ]);
                    return;
                }
            } else {
                // Fallback for old format
                if (data.startsWith('kweb:')) {
                    sessionCode = data.replace('kweb:', '');
                } else if (data.startsWith('klipp_web:')) {
                    sessionCode = data.replace('klipp_web:', '');
                } else {
                    Alert.alert('Geçersiz QR', `Bu QR kod tanınmadı.\n\nVeri: ${data}`, [
                        { text: 'Tamam', onPress: () => resetScan() }
                    ]);
                    return;
                }
            }
        } catch (e) {
            console.error('QR Parse Error:', e);
            Alert.alert('Hata', 'QR kod okunamadı.', [
                { text: 'Tamam', onPress: () => resetScan() }
            ]);
            return;
        }

        try {
            console.log('Sending Web QR Confirm for code:', sessionCode);

            // Call Correct API Method
            await WebSessionService.postWebQrConfirm({ sessionCode: sessionCode });

            Alert.alert(
                i18n.t('common.actions.success'),
                i18n.t('scan_qr.success_message'),
                [{ text: i18n.t('common.actions.ok'), onPress: () => router.back() }]
            );
        } catch (error: any) {
            console.error('Web Login Error Full:', JSON.stringify(error, null, 2));

            let errorMessage = i18n.t('scan_qr.error_message');
            if (error?.body?.message) {
                errorMessage += `\n(${error.body.message})`;
            }

            Alert.alert(
                i18n.t('common.error'),
                errorMessage,
                [{
                    text: i18n.t('common.actions.ok'),
                    onPress: () => resetScan()
                }]
            );
        }
    };

    const resetScan = () => {
        setScanned(false);
        // Small delay to prevent immediate re-scan of same code
        setTimeout(() => {
            isProcessing.current = false;
        }, 1000);
    };

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <ThemedText style={{ textAlign: 'center' }}>{i18n.t('scan_qr.permission_message')}</ThemedText>
                <TouchableOpacity onPress={requestPermission} style={styles.button}>
                    <ThemedText style={styles.buttonText}>{i18n.t('common.actions.grant_permission')}</ThemedText>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFill}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
            />
            {/* Overlay renders on top of CameraView */}
            <SafeAreaView style={styles.overlay} pointerEvents="box-none">
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <IconSymbol name="xmark" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <ThemedText style={styles.title}>{i18n.t('scan_qr.title')}</ThemedText>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.scannerContainer}>
                    <View style={styles.scannerMarker} />
                    <ThemedText style={styles.instruction}>{isProcessing.current ? i18n.t('scan_qr.processing') : i18n.t('scan_qr.instruction')}</ThemedText>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFF',
    },
    scannerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scannerMarker: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: '#FFF',
        borderRadius: 16,
        backgroundColor: 'transparent',
    },
    instruction: {
        marginTop: 20,
        color: '#FFF',
        fontSize: 16,
        textAlign: 'center',
    },
    button: {
        padding: 16,
        backgroundColor: '#007AFF',
        borderRadius: 8,
        marginTop: 20,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
    },
});
