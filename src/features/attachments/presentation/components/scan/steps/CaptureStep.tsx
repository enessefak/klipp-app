import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ScanMethodSelector } from '@/src/features/attachments/presentation/components/scan/ScanMethodSelector';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

interface CaptureStepProps {
    onMethodSelect: (method: 'scan' | 'camera' | 'gallery' | 'file') => void;
    onClose: () => void;
    insets: { top: number };
    styles: any;
    allowedTypeLabels?: string | null;
}

export const CaptureStep = ({ onMethodSelect, onClose, insets, styles, allowedTypeLabels }: CaptureStepProps) => {
    const { colors } = useSettings();
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

                {allowedTypeLabels && (
                    <View style={{ backgroundColor: colors.primary + '15', borderRadius: 10, padding: 12, marginHorizontal: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                        <IconSymbol name="info.circle.fill" size={15} color={colors.primary} style={{ marginTop: 1 }} />
                        <ThemedText style={{ fontSize: 13, color: colors.primary, flex: 1, lineHeight: 18 }}>
                            {i18n.t('folders.restrictions.allowed_types_info', { types: allowedTypeLabels })}
                        </ThemedText>
                    </View>
                )}

                <View style={styles.captureContainer}>
                    <ScanMethodSelector
                        onSelectMethod={onMethodSelect}
                    />
                </View>
            </ScrollView>
        </View>
    );
};
