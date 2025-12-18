import { ThemedText } from '@/components/themed-text';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

type ScanMethod = 'scan' | 'camera' | 'gallery' | 'file';

interface ScanMethodSelectorProps {
    onSelectMethod: (method: ScanMethod) => void;
}

export function ScanMethodSelector({ onSelectMethod }: ScanMethodSelectorProps) {
    const { colors } = useSettings();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            paddingTop: 20,
        },
        subtitle: {
            fontSize: 16,
            color: colors.subtext,
            marginBottom: 24,
            textAlign: 'center',
        },
        button: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.card,
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: colors.border,
        },
        iconContainer: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
        },
        icon: {
            fontSize: 24,
        },
        textContainer: {
            flex: 1,
        },
        buttonTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
        },
        buttonDesc: {
            fontSize: 13,
            color: colors.subtext,
        },
    });

    const renderButton = (
        method: ScanMethod,
        icon: string,
        titleKey: string,
        descKey: string
    ) => (
        <TouchableOpacity style={styles.button} onPress={() => onSelectMethod(method)}>
            <View style={styles.iconContainer}>
                <ThemedText style={styles.icon}>{icon}</ThemedText>
            </View>
            <View style={styles.textContainer}>
                <ThemedText style={styles.buttonTitle}>{i18n.t(titleKey as any)}</ThemedText>
                <ThemedText style={styles.buttonDesc}>{i18n.t(descKey as any)}</ThemedText>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ThemedText style={styles.subtitle}>
                {i18n.t('receipts.scan.method_subtitle')}
            </ThemedText>

            {renderButton('scan', '📑', 'receipts.scan.scan_method.title', 'receipts.scan.scan_method.desc')}
            {renderButton('camera', '📷', 'receipts.scan.camera_method.title', 'receipts.scan.camera_method.desc')}
            {renderButton('gallery', '🖼️', 'receipts.scan.gallery_method.title', 'receipts.scan.gallery_method.desc')}
            {renderButton('file', '📄', 'receipts.scan.file_method.title', 'receipts.scan.file_method.desc')}
        </View>
    );
}
