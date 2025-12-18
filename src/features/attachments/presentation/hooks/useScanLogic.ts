import { OCRResult, OCRService } from '@/src/features/attachments/data/OCRService';
import i18n from '@/src/infrastructure/localization/i18n';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert } from 'react-native';

// Conditionally import DocumentScanner
let DocumentScanner: any = null;
try {
    DocumentScanner = require('react-native-document-scanner-plugin').default;
} catch (e) {
    console.log('DocumentScanner not available (Expo Go mode)');
}

export interface ScanResult {
    fileUri: string | null;
    fileType: 'image' | 'document';
    fileName: string | null;
    mimeType: string;
    ocrConfidence: number;
}

interface UseScanLogicProps {
    onOcrStart?: () => void;
    onOcrSuccess?: (ocrResult: OCRResult, file: ScanResult) => void;
    onOcrError?: (error: any) => void;
}

export function useScanLogic({ onOcrStart, onOcrSuccess, onOcrError }: UseScanLogicProps = {}) {
    // Scan/File state
    const [fileUri, setFileUri] = useState<string | null>(null);
    const [fileType, setFileType] = useState<'image' | 'document'>('image');
    const [fileName, setFileName] = useState<string | null>(null);
    const [mimeType, setMimeType] = useState<string>('image/jpeg');
    const [ocrConfidence, setOcrConfidence] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Helper to update local state and call handlers
    const processFileWithOCR = async (uri: string, type: 'image' | 'document', mime: string, name: string | null = null) => {
        setFileUri(uri);
        setFileType(type);
        setMimeType(mime);
        setFileName(name);
        setIsAnalyzing(true);

        onOcrStart?.();

        try {
            // Call OCR Service
            const ocrResult = await OCRService.scanDocument(uri, mime);
            setOcrConfidence(ocrResult.confidence);

            const scanResult: ScanResult = {
                fileUri: uri,
                fileType: type,
                fileName: name,
                mimeType: mime,
                ocrConfidence: ocrResult.confidence,
            };

            onOcrSuccess?.(ocrResult, scanResult);
        } catch (error) {
            console.error('OCR Process failed:', error);
            onOcrError?.(error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // 1. Pick Image from Gallery
    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 1,
            });

            if (!result.canceled) {
                await processFileWithOCR(result.assets[0].uri, 'image', 'image/jpeg');
            }
        } catch (error) {
            console.error('Gallery pick failed:', error);
            onOcrError?.(error);
        }
    };

    // 2. Take Photo
    const takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(i18n.t('receipts.scan.permissionTitle'), i18n.t('receipts.scan.permissionCamera'));
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: false,
                quality: 1,
            });

            if (!result.canceled) {
                await processFileWithOCR(result.assets[0].uri, 'image', 'image/jpeg');
            }
        } catch (error) {
            console.error('Camera capture failed:', error);
            onOcrError?.(error);
        }
    };

    // 3. Scan Document (Edge Detection)
    const scanDocument = async () => {
        if (!DocumentScanner) {
            Alert.alert(
                'Belge Tarayıcı Mevcut Değil',
                'Bu özellik Expo Go\'da çalışmaz. Lütfen "Fotoğraf Çek" veya "Galeriden Seç" kullanın.',
                [{ text: 'Tamam' }]
            );
            return;
        }

        try {
            const result = await DocumentScanner.scanDocument({
                croppedImageQuality: 100,
            });

            if (result.scannedImages && result.scannedImages.length > 0) {
                await processFileWithOCR(result.scannedImages[0], 'image', 'image/jpeg');
            }
        } catch (error) {
            console.error('Document scan failed:', error);
            Alert.alert(i18n.t('receipts.scan.document_scan_error.title'), i18n.t('receipts.scan.document_scan_error.message'));
            onOcrError?.(error);
        }
    };

    // 4. Pick File (PDF/Docs)
    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                const mime = asset.mimeType || 'application/pdf';

                await processFileWithOCR(asset.uri, 'document', mime, asset.name);
            }
        } catch (error) {
            console.error('Document pick failed:', error);
            Alert.alert(i18n.t('receipts.scan.file_pick_error.title'), i18n.t('receipts.scan.file_pick_error.message'));
            onOcrError?.(error);
        }
    };

    const resetScan = () => {
        setFileUri(null);
        setFileType('image');
        setFileName(null);
        setMimeType('image/jpeg');
        setOcrConfidence(0);
        setIsAnalyzing(false);
    };

    return {
        // Methods
        pickImage,
        takePhoto,
        scanDocument,
        pickDocument,
        resetScan,

        // State
        fileUri,
        fileType,
        fileName,
        mimeType,
        ocrConfidence,
        isAnalyzing,
    };
}
