import { ThemedText } from '@/components/themed-text';
import { ScanMethodSelector } from '@/src/features/attachments/presentation/components/scan/ScanMethodSelector';
import i18n from '@/src/infrastructure/localization/i18n';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

interface CaptureStepProps {
    onMethodSelect: (method: 'scan' | 'camera' | 'gallery' | 'file') => void;
    onClose: () => void;
    insets: { top: number };
    styles: any;
}

export const CaptureStep = ({ onMethodSelect, onClose, insets, styles }: CaptureStepProps) => {
    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header with close button */}
                <View style={styles.captureHeader}>
                    <View style={styles.headerSpacer} />
                    <ThemedText type="title" style={styles.headerTitle}>
                        {i18n.t('receipts.scan.title')}
                    </ThemedText>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <ThemedText style={styles.closeButtonText}>✕</ThemedText>
                    </TouchableOpacity>
                </View>

                <View style={styles.captureContainer}>
                    <ScanMethodSelector
                        onSelectMethod={onMethodSelect}
                    />
                </View>
            </ScrollView>
        </View>
    );
};
