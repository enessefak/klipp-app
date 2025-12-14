import { ThemedText } from '@/components/themed-text';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

interface AttachmentTypeBadgeProps {
    typeId: string;
    icon?: string;
    color?: string;
}

export function AttachmentTypeBadge({ typeId, icon, color }: AttachmentTypeBadgeProps) {
    const { colors } = useSettings();
    const badgeColor = color || colors.primary;
    const label = i18n.t(`attachmentTypes.${typeId}` as any) || typeId;

    const styles = useMemo(() => StyleSheet.create({
        badge: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 4,
        },
        icon: {
            fontSize: 10,
        },
        text: {
            fontSize: 10,
            fontWeight: '600',
        },
    }), [colors]);

    return (
        <View style={[styles.badge, { backgroundColor: badgeColor + '20' }]}>
            {icon && <ThemedText style={styles.icon}>{icon}</ThemedText>}
            <ThemedText style={[styles.text, { color: badgeColor }]}>{label}</ThemedText>
        </View>
    );
}
