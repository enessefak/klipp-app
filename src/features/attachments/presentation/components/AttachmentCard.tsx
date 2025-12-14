import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol, IconSymbolName } from '@/components/ui/icon-symbol';
import i18n from '@/src/infrastructure/localization/i18n';
import { ThemeColors } from '@/src/infrastructure/theme/Colors';

import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { Attachment } from '../../domain/Attachment';

// Format date to locale
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

// Format currency
const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(i18n.locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
    }).format(amount);
};

// Calculate remaining days from a date string
const getRemainingDays = (dateString: string): number => {
    const endDate = new Date(dateString);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Format remaining time in a human readable way
const formatRemainingTime = (days: number, colors: ThemeColors): { text: string; color: string; icon: IconSymbolName } => {
    if (days < 0) {
        return { text: i18n.t('attachment_card.expired'), color: colors.error, icon: 'exclamationmark.circle.fill' };
    }
    if (days === 0) {
        return { text: i18n.t('attachment_card.expires_today'), color: colors.error, icon: 'exclamationmark.circle.fill' };
    }
    if (days <= 7) {
        return { text: i18n.t('attachment_card.days_left', { count: days }), color: colors.error, icon: 'clock.fill' };
    }
    if (days <= 30) {
        return { text: i18n.t('attachment_card.days_left', { count: days }), color: '#FF9800', icon: 'clock.fill' };
    }
    if (days <= 90) {
        const months = Math.floor(days / 30);
        return { text: i18n.t('attachment_card.months_left', { count: months }), color: '#FF9800', icon: 'clock.fill' };
    }
    if (days <= 365) {
        const months = Math.floor(days / 30);
        return { text: i18n.t('attachment_card.months_left_exact', { count: months }), color: '#4CAF50', icon: 'checkmark.circle.fill' };
    }
    const years = Math.floor(days / 365);
    const remainingMonths = Math.floor((days % 365) / 30);
    if (remainingMonths > 0) {
        return { text: i18n.t('attachment_card.years_months_left', { years, months: remainingMonths }), color: '#4CAF50', icon: 'checkmark.circle.fill' };
    }
    return { text: i18n.t('attachment_card.years_left', { count: years }), color: '#4CAF50', icon: 'checkmark.circle.fill' };
};

// Get important field info based on attachment type (using typeName from details or title inference)
const getImportantFieldInfo = (attachment: Attachment, colors: ThemeColors): { text: string; color: string; icon: IconSymbolName } | null => {
    const details = attachment.details;
    const title = attachment.title.toLowerCase();

    // Check for warranty end date
    if (details?.warrantyEndDate) {
        const days = getRemainingDays(details.warrantyEndDate);
        return formatRemainingTime(days, colors);
    }

    // Check for subscription end date
    if (details?.subscriptionEndDate) {
        const days = getRemainingDays(details.subscriptionEndDate);
        return formatRemainingTime(days, colors);
    }

    // Check for insurance/policy expiry date
    if (details?.expiryDate) {
        const days = getRemainingDays(details.expiryDate);
        return formatRemainingTime(days, colors);
    }

    // Check for contract end date
    if (details?.endDate) {
        const days = getRemainingDays(details.endDate);
        return formatRemainingTime(days, colors);
    }

    // If title suggests warranty but no end date in details
    if ((title.includes('garanti') || title.includes('warranty')) && !details?.warrantyEndDate) {
        return null;
    }

    return null;
};

// Get icon based on attachment type or title
const getAttachmentIcon = (attachment: Attachment, colors: ThemeColors): { icon: IconSymbolName; color: string } => {
    const title = attachment.title.toLowerCase();

    // Check title for common patterns
    if (title.includes('fatura') || title.includes('invoice')) {
        return { icon: 'doc.text.fill', color: '#4CAF50' };
    }
    if (title.includes('fiş') || title.includes('receipt') || title.includes('market')) {
        return { icon: 'receipt', color: '#FF9800' };
    }
    if (title.includes('garanti') || title.includes('warranty')) {
        return { icon: 'shield.fill', color: '#2196F3' };
    }
    if (title.includes('sözleşme') || title.includes('contract')) {
        return { icon: 'doc.plaintext.fill', color: '#9C27B0' };
    }
    if (title.includes('sigorta') || title.includes('insurance')) {
        return { icon: 'heart.text.square.fill', color: '#E91E63' };
    }

    return { icon: 'doc.fill', color: colors.accent };
};

interface AttachmentCardProps {
    attachment: Attachment;
    onPress: () => void;
}

export function AttachmentCard({ attachment, onPress }: AttachmentCardProps) {
    const { colors } = useSettings();
    const { icon, color } = getAttachmentIcon(attachment, colors);
    const hasAmount = attachment.amount !== null && attachment.amount > 0 && attachment.currency;
    const importantInfo = getImportantFieldInfo(attachment, colors);

    const styles = useMemo(() => StyleSheet.create({
        card: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            backgroundColor: colors.card,
            borderRadius: 16,
            marginBottom: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
            borderWidth: 1,
            borderColor: colors.cardBorder,
        },
        iconContainer: {
            width: 48,
            height: 48,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
        },
        content: {
            flex: 1,
            marginRight: 8,
        },
        topRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 6,
        },
        title: {
            fontSize: 16,
            color: colors.text,
            flex: 1,
            marginRight: 8,
        },
        amount: {
            fontSize: 16,
            color: colors.primary,
        },
        bottomRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        dateContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        date: {
            fontSize: 13,
            color: colors.subtext,
        },
        description: {
            fontSize: 13,
            color: colors.subtext,
            flex: 1,
        },
        statusBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 12,
        },
        statusText: {
            fontSize: 12,
            fontWeight: '600',
        },
    }), [colors]);

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
                <IconSymbol name={icon} size={24} color={color} />
            </View>

            <View style={styles.content}>
                <View style={styles.topRow}>
                    <ThemedText type="defaultSemiBold" style={styles.title} numberOfLines={1}>
                        {attachment.title}
                    </ThemedText>
                    {hasAmount && (
                        <ThemedText type="defaultSemiBold" style={styles.amount}>
                            {formatCurrency(attachment.amount!, attachment.currency!)}
                        </ThemedText>
                    )}
                </View>

                <View style={styles.bottomRow}>
                    <View style={styles.dateContainer}>
                        <IconSymbol name="calendar" size={12} color={colors.subtext} />
                        <ThemedText style={styles.date}>
                            {formatDate(attachment.documentDate)}
                        </ThemedText>
                    </View>

                    {importantInfo ? (
                        <View style={[styles.statusBadge, { backgroundColor: importantInfo.color + '15' }]}>
                            <IconSymbol name={importantInfo.icon} size={12} color={importantInfo.color} />
                            <ThemedText style={[styles.statusText, { color: importantInfo.color }]}>
                                {importantInfo.text}
                            </ThemedText>
                        </View>
                    ) : attachment.description ? (
                        <ThemedText style={styles.description} numberOfLines={1}>
                            {attachment.description}
                        </ThemedText>
                    ) : null}
                </View>
            </View>

            <IconSymbol name="chevron.right" size={16} color={colors.subtext} />
        </TouchableOpacity>
    );
}
