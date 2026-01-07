import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface LineItem {
    description?: string;
    quantity?: number;
    unitPrice?: number;
    vatRate?: number;
    totalAmount?: number;
    total?: number; // legacy/alternative key
}

interface LineItemsTableProps {
    items: LineItem[];
    label: string;
    currency?: string;
    variant?: 'default' | 'editable'; // Future proofing
    onEdit?: () => void;
}

export const LineItemsTable = ({ items, label, currency = 'TRY', variant = 'default', onEdit }: LineItemsTableProps) => {
    const { colors } = useSettings();
    const [isExpanded, setIsExpanded] = useState(false);

    if (!items || items.length === 0) return null;

    const formatCurrency = (value: number, curr: string) => {
        try {
            return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: curr }).format(value);
        } catch (e) {
            return `${value} ${curr}`;
        }
    };

    const styles = StyleSheet.create({
        container: {
            marginTop: 8,
            width: '100%',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 8,
            paddingHorizontal: 0,
        },
        headerLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        label: {
            fontSize: 14,
            fontWeight: '500',
            color: colors.textLight,
        },
        badge: {
            backgroundColor: colors.primary + '15',
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 12,
        },
        badgeText: {
            fontSize: 12,
            fontWeight: '600',
            color: colors.primary,
        },
        content: {
            marginTop: 8,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            overflow: 'hidden',
        },
        tableHeader: {
            flexDirection: 'row',
            backgroundColor: colors.card,
            padding: 10,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        tableHeaderText: {
            fontSize: 12,
            fontWeight: '600',
            color: colors.textLight,
        },
        tableRow: {
            flexDirection: 'row',
            padding: 10,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.surface,
        },
        tableCell: {
            fontSize: 13,
            color: colors.text,
        },
        actionsRow: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            padding: 8,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.card,
        }
    });

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.header}
                onPress={() => setIsExpanded(!isExpanded)}
                activeOpacity={0.7}
            >
                <View style={styles.headerLeft}>
                    <ThemedText style={styles.label}>{label}</ThemedText>
                    <View style={styles.badge}>
                        <ThemedText style={styles.badgeText}>{items.length}</ThemedText>
                    </View>
                </View>
                <IconSymbol name={isExpanded ? "chevron.up" : "chevron.down"} size={16} color={colors.textLight} />
            </TouchableOpacity>

            {isExpanded && (
                <View style={styles.content}>
                    {/* Header Row */}
                    <View style={styles.tableHeader}>
                        <ThemedText style={[styles.tableHeaderText, { flex: 3 }]}>Açıklama</ThemedText>
                        <ThemedText style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Adet</ThemedText>
                        <ThemedText style={[styles.tableHeaderText, { flex: 1.5, textAlign: 'right' }]}>Tutar</ThemedText>
                    </View>

                    {/* Rows */}
                    {items.map((item, idx) => (
                        <View key={idx} style={[styles.tableRow, idx === items.length - 1 && { borderBottomWidth: 0 }]}>
                            <View style={{ flex: 3, gap: 2 }}>
                                <ThemedText style={[styles.tableCell, { fontWeight: '500' }]}>{item.description || '-'}</ThemedText>
                                <View style={{ flexDirection: 'row', gap: 6 }}>
                                    {(item.vatRate ?? 0) > 0 && (
                                        <ThemedText style={{ fontSize: 11, color: colors.textLight }}>KDV: %{item.vatRate}</ThemedText>
                                    )}
                                    {(item.unitPrice ?? 0) > 0 && (
                                        <ThemedText style={{ fontSize: 11, color: colors.textLight }}>
                                            Birim: {formatCurrency(item.unitPrice!, currency)}
                                        </ThemedText>
                                    )}
                                </View>
                            </View>
                            <ThemedText style={[styles.tableCell, { flex: 1, textAlign: 'right' }]}>{item.quantity}</ThemedText>
                            <ThemedText style={[styles.tableCell, { flex: 1.5, textAlign: 'right', fontWeight: '600' }]}>
                                {formatCurrency(item.totalAmount || item.total || 0, currency)}
                            </ThemedText>
                        </View>
                    ))}

                    {/* Edit Action (if editable) */}
                    {variant === 'editable' && onEdit && (
                        <View style={styles.actionsRow}>
                            <TouchableOpacity onPress={onEdit}>
                                <ThemedText style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>Düzenle</ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};
