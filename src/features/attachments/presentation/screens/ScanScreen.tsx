import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScanForm } from '@/src/features/attachments/presentation/hooks/useScanForm';
import { useScanLogic } from '@/src/features/attachments/presentation/hooks/useScanLogic';
import { createScanStyles } from '@/src/features/attachments/presentation/screens/ScanScreen.styles';
import { useFolders } from '@/src/features/folders/presentation/useFolders';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';

// Steps
import { AnalyzingStep } from '@/src/features/attachments/presentation/components/scan/steps/AnalyzingStep';
import { CaptureStep } from '@/src/features/attachments/presentation/components/scan/steps/CaptureStep';
import { EditDetailsStep } from '@/src/features/attachments/presentation/components/scan/steps/EditDetailsStep';

export function ScanScreen() {
    const { colors } = useSettings();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const styles = createScanStyles(colors);

    // Data
    const { folders } = useFolders();

    // Logic Hooks
    const scanForm = useScanForm();
    const scanLogic = useScanLogic({
        onOcrSuccess: (ocrResult, file) => {
            scanForm.actions.populateFormFromOcr(ocrResult, file);
        }
    });

    const handleClose = () => {
        router.back();
    };

    // Step Renderer
    const renderStep = () => {
        // 2. Analyzing
        if (scanLogic.isAnalyzing) {
            return (
                <AnalyzingStep
                    imageUri={scanLogic.fileUri}
                    insets={insets}
                    styles={styles}
                />
            );
        }

        // 3. Form (Edit Details)
        if (scanLogic.fileUri) {
            return (
                <EditDetailsStep
                    // Form
                    control={scanForm.form.control}
                    handleSubmit={scanForm.form.handleSubmit}
                    setValue={scanForm.form.setValue}
                    errors={scanForm.form.errors}
                    isSubmitting={scanForm.form.isSubmitting}

                    // State
                    attachmentTypes={scanForm.state.attachmentTypes}
                    loadingTypes={scanForm.state.loadingTypes}
                    dynamicFields={scanForm.state.dynamicFields}
                    watchedDetails={scanForm.state.watchedDetails}
                    watchedDocumentDate={scanForm.state.watchedDocumentDate}
                    watchedCustomFields={scanForm.state.watchedCustomFields}
                    watchedTypeId={scanForm.state.watchedTypeId}

                    // Actions
                    onSubmit={() => scanForm.actions.submitForm({
                        fileUri: scanLogic.fileUri,
                        fileType: scanLogic.fileType,
                        fileName: scanLogic.fileName,
                        mimeType: scanLogic.mimeType,
                        ocrConfidence: scanLogic.ocrConfidence
                    })}
                    onAddCustomField={scanForm.actions.addCustomField}
                    onRemoveCustomField={scanForm.actions.removeCustomField}
                    onUpdateCustomField={scanForm.actions.updateCustomField}
                    onTypeSelect={scanForm.actions.handleTypeSelect}

                    // Scan Logic / File
                    file={{
                        fileUri: scanLogic.fileUri,
                        fileType: scanLogic.fileType,
                        fileName: scanLogic.fileName,
                        mimeType: scanLogic.mimeType,
                        ocrConfidence: scanLogic.ocrConfidence
                    }}
                    onRetake={scanLogic.resetScan}

                    // Others
                    folders={folders}
                    onClose={handleClose}
                    insets={insets}
                    styles={styles}
                />
            );
        }

        // 1. Capture (Default)
        return (
            <CaptureStep
                onMethodSelect={(method) => {
                    if (method === 'scan') scanLogic.scanDocument();
                    else if (method === 'camera') scanLogic.takePhoto();
                    else if (method === 'gallery') scanLogic.pickImage();
                    else if (method === 'file') scanLogic.pickDocument();
                }}
                onClose={handleClose}
                insets={insets}
                styles={styles}
            />
        );
    };

    return (
        <View style={styles.container}>
            {renderStep()}
        </View>
    );
}
