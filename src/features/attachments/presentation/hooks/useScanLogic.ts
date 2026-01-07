import { OCRResult, OCRService } from '@/src/features/attachments/data/OCRService';
import i18n from '@/src/infrastructure/localization/i18n';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

// Conditionally import DocumentScanner
let DocumentScanner: any = null;
try {
    DocumentScanner = require('react-native-document-scanner-plugin').default;
} catch (e) {
    console.log('DocumentScanner not available (Expo Go mode)');
}

export interface ScanResult {
    id: string;
    fileUri: string;
    fileType: 'image' | 'document';
    fileName: string | null;
    mimeType: string;
    ocrConfidence: number;
}

export const MAX_SCAN_FILES = 5;

interface UseScanLogicProps {
    onOcrStart?: () => void;
    onOcrSuccess?: (ocrResult: OCRResult, file: ScanResult) => void;
    onOcrError?: (error: any) => void;
}

export function useScanLogic({ onOcrStart, onOcrSuccess, onOcrError }: UseScanLogicProps = {}) {
    // Refs to hold latest callbacks to avoid stale closures during async OCR
    const onOcrSuccessRef = useRef(onOcrSuccess);
    const onOcrErrorRef = useRef(onOcrError);
    const onOcrStartRef = useRef(onOcrStart);

    // Update refs on every render
    useEffect(() => {
        onOcrSuccessRef.current = onOcrSuccess;
        onOcrErrorRef.current = onOcrError;
        onOcrStartRef.current = onOcrStart;
    });

    // Scan/File state
    const [files, setFiles] = useState<ScanResult[]>([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analyzingPreviewUri, setAnalyzingPreviewUri] = useState<string | null>(null);
    const filesRef = useRef<ScanResult[]>([]);
    const hasPopulatedFromOcrRef = useRef(false);

    useEffect(() => {
        filesRef.current = files;
    }, [files]);

    type PendingFile = {
        uri: string;
        type: 'image' | 'document';
        mimeType: string;
        name?: string | null;
    };

    const addFilesAndAnalyze = async (incomingFiles: PendingFile[]) => {
        const sanitized = incomingFiles.filter(file => !!file.uri);
        if (sanitized.length === 0) return;

        const availableSlots = MAX_SCAN_FILES - filesRef.current.length;
        if (availableSlots <= 0 || sanitized.length > availableSlots) {
            Alert.alert(i18n.t('common.error'), i18n.t('receipts.scan.file_limit_reached', { limit: MAX_SCAN_FILES }));
            return;
        }

        const newEntries: ScanResult[] = sanitized.map(file => ({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            fileUri: file.uri,
            fileType: file.type,
            fileName: file.name ?? null,
            mimeType: file.mimeType,
            ocrConfidence: 0,
        }));

        const nextFiles = [...filesRef.current, ...newEntries];
        filesRef.current = nextFiles;
        setFiles(nextFiles);

        const shouldPopulateFromOcr = !hasPopulatedFromOcrRef.current;
        setAnalyzingPreviewUri(sanitized[0].uri);
        setIsAnalyzing(true);

        onOcrStartRef.current?.();

        try {
            const ocrResult = await OCRService.scanDocument(
                nextFiles.map(file => ({ uri: file.fileUri, mimeType: file.mimeType }))
            );

            setFiles(prev => prev.map((file, index) =>
                index === 0 ? { ...file, ocrConfidence: ocrResult.confidence } : file
            ));

            if (shouldPopulateFromOcr && nextFiles.length > 0) {
                hasPopulatedFromOcrRef.current = true;
                onOcrSuccessRef.current?.(ocrResult, nextFiles[0]);
            }
        } catch (error) {
            console.error('OCR Process failed:', error);
            onOcrErrorRef.current?.(error);
        } finally {
            setIsAnalyzing(false);
            setAnalyzingPreviewUri(null);
        }
    };

    // 1. Pick Image from Gallery
    const pickImage = async () => {
        try {
            if (filesRef.current.length >= MAX_SCAN_FILES) {
                Alert.alert(i18n.t('common.error'), i18n.t('receipts.scan.file_limit_reached', { limit: MAX_SCAN_FILES }));
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: false,
                quality: 1,
                allowsMultipleSelection: true,
            });

            if (!result.canceled) {
                const assets = result.assets || [];
                const pending = assets.map(asset => ({
                    uri: asset.uri,
                    type: 'image' as const,
                    mimeType: asset.mimeType || 'image/jpeg',
                    name: (asset as any)?.fileName || (asset as any)?.filename || null,
                }));
                await addFilesAndAnalyze(pending);
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

                if (!result.canceled && result.assets?.length) {
                await addFilesAndAnalyze([{
                        uri: result.assets[0].uri,
                    type: 'image',
                    mimeType: 'image/jpeg',
                    name: (result.assets[0] as any)?.fileName || (result.assets[0] as any)?.filename || null,
                }]);
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
                if (result.scannedImages.length + filesRef.current.length > MAX_SCAN_FILES) {
                    Alert.alert(i18n.t('common.error'), i18n.t('receipts.scan.file_limit_reached', { limit: MAX_SCAN_FILES }));
                    return;
                }

                const payload = result.scannedImages.map((imageUri: string) => ({
                    uri: imageUri,
                    type: 'image' as const,
                    mimeType: 'image/jpeg',
                }));
                await addFilesAndAnalyze(payload);
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
                multiple: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const payload = result.assets.map(asset => ({
                    uri: asset.uri,
                    type: 'document' as const,
                    mimeType: asset.mimeType || 'application/pdf',
                    name: asset.name,
                }));
                if (payload.length + filesRef.current.length > MAX_SCAN_FILES) {
                    Alert.alert(i18n.t('common.error'), i18n.t('receipts.scan.file_limit_reached', { limit: MAX_SCAN_FILES }));
                    return;
                }

                await addFilesAndAnalyze(payload);
            }
        } catch (error) {
            console.error('Document pick failed:', error);
            Alert.alert(i18n.t('receipts.scan.file_pick_error.title'), i18n.t('receipts.scan.file_pick_error.message'));
            onOcrError?.(error);
        }
    };

    const resetScan = () => {
        setFiles([]);
        setIsAnalyzing(false);
        setAnalyzingPreviewUri(null);
        hasPopulatedFromOcrRef.current = false;
        filesRef.current = [];
    };

    const removeFile = (id: string) => {
        setFiles(prev => {
            const next = prev.filter(file => file.id !== id);
            if (next.length === 0) {
                hasPopulatedFromOcrRef.current = false;
            }
            filesRef.current = next;
            return next;
        });
    };

    const primaryFile = files[0] ?? null;
    const latestFile = files[files.length - 1] ?? null;

    return {
        // Methods
        pickImage,
        takePhoto,
        scanDocument,
        pickDocument,
        resetScan,
        removeFile,

        // State
        files,
        primaryFile,
        latestFile,
        isAnalyzing,
        analyzingPreviewUri,
        canAddMore: files.length < MAX_SCAN_FILES,
        maxFiles: MAX_SCAN_FILES,
    };
}
