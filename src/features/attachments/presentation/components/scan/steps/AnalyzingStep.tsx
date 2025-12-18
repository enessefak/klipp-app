import { ThemedText } from '@/components/themed-text';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import React from 'react';
import { ActivityIndicator, Image, View } from 'react-native';

interface AnalyzingStepProps {
    imageUri: string | null;
    insets: { top: number };
    styles: any;
}

export const AnalyzingStep = ({ imageUri, insets, styles }: AnalyzingStepProps) => {
    const { colors } = useSettings();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.analyzingContainer}>
                {imageUri && (
                    <Image source={{ uri: imageUri }} style={styles.analyzingImage} />
                )}
                <View style={styles.analyzingOverlay}>
                    <ActivityIndicator size="large" color={colors.accent} />
                    <ThemedText style={styles.analyzingText}>{i18n.t('receipts.scan.analyzing.title')}</ThemedText>
                    <ThemedText style={styles.analyzingSubtext}>{i18n.t('receipts.scan.analyzing.desc')}</ThemedText>
                </View>
            </View>
        </View>
    );
};
