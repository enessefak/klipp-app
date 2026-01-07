import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useScanForm } from '@/src/features/attachments/presentation/hooks/useScanForm';
import { useScanLogic } from '@/src/features/attachments/presentation/hooks/useScanLogic';
import { createScanStyles } from '@/src/features/attachments/presentation/screens/ScanScreen.styles';
import { useFolders } from '@/src/features/folders/presentation/useFolders';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { useFolderSharing } from '@/src/features/sharing/presentation/useFolderSharing';

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
    const { sharedWithMe, loadSharedWithMe } = useFolderSharing();

    React.useEffect(() => {
        loadSharedWithMe('accepted');
    }, []);

    // Logic Hooks
    const scanForm = useScanForm();
    const scanLogic = useScanLogic({
        onOcrSuccess: (ocrResult, file) => {
            scanForm.actions.populateFormFromOcr(ocrResult, file);
        }
    });

    const handleMethodSelect = React.useCallback((method: 'scan' | 'camera' | 'gallery' | 'file') => {
        if (method === 'scan') scanLogic.scanDocument();
        else if (method === 'camera') scanLogic.takePhoto();
        else if (method === 'gallery') scanLogic.pickImage();
        else if (method === 'file') scanLogic.pickDocument();
    }, [scanLogic]);

    const handleClose = () => {
        router.back();
    };

    // Step Renderer
    const renderStep = () => {
        // 2. Analyzing
        if (scanLogic.isAnalyzing) {
            return (
                <AnalyzingStep
                    imageUri={scanLogic.analyzingPreviewUri || scanLogic.latestFile?.fileUri || scanLogic.primaryFile?.fileUri || null}
                    insets={insets}
                    styles={styles}
                />
            );
        }

        // 3. Form (Edit Details)
        if (scanLogic.files.length > 0) {
            // Merge personal and shared folders
            const allFolders = [...folders];
            sharedWithMe.forEach(sf => {
                allFolders.push({
                    id: sf.id,
                    name: sf.name,
                    icon: sf.icon,
                    color: sf.color,
                    parentId: undefined, // Shared folders appear at root
                    createdAt: sf.createdAt,
                    isShared: true,
                    permission: sf.permission,
                    owner: sf.owner ? {
                        id: sf.owner.id,
                        name: sf.owner.name,
                        email: sf.owner.email
                    } : undefined
                });
            });

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
                    onSubmit={(onError) => scanForm.actions.submitForm(scanLogic.files, onError)}
                    onAddCustomField={scanForm.actions.addCustomField}
                    onRemoveCustomField={scanForm.actions.removeCustomField}
                    onUpdateCustomField={scanForm.actions.updateCustomField}
                    onTypeSelect={scanForm.actions.handleTypeSelect}

                    // Scan Logic / File
                    files={scanLogic.files}
                    canAddMoreFiles={scanLogic.canAddMore}
                    maxFiles={scanLogic.maxFiles}
                    onRemoveFile={scanLogic.removeFile}
                    onSelectCaptureMethod={handleMethodSelect}
                    onRetake={scanLogic.resetScan}

                    // Others
                    folders={allFolders}
                    onClose={handleClose}
                    insets={insets}
                    styles={styles}
                />
            );
        }

        // 1. Capture (Default)
        return (
            <CaptureStep
                onMethodSelect={handleMethodSelect}
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
