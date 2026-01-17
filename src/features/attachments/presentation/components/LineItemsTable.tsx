import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import React, { useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface LineItemsTableProps {
    items: any[];
    label?: string;
    currency?: string;
    itemsConfig?: any[]; // Dynamic column configuration
    variant?: 'default' | 'editable';
    onEdit?: () => void;
    onItemPress?: (item: any, index: number) => void;
}

export const LineItemsTable = ({ items, label, currency = 'TRY', itemsConfig, variant = 'default', onEdit, onItemPress }: LineItemsTableProps) => {
    const { colors } = useSettings();
    const [isExpanded, setIsExpanded] = useState(true);

    const styles = useMemo(() => StyleSheet.create({
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
            backgroundColor: colors.card,
        },
        itemContainer: {
            padding: 12,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            gap: 8,
        },
        descriptionRow: {
            marginBottom: 4,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
        },
        descriptionLabel: {
            fontSize: 10,
            color: colors.textLight,
            textTransform: 'uppercase',
            marginBottom: 2,
        },
        descriptionValue: {
            fontSize: 13,
            color: colors.text,
            fontWeight: '500',
        },
        metricsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
        },
        metricItem: {
            minWidth: '30%', // Ensure roughly 3 items per row
            flex: 1,
        },
        metricLabel: {
            fontSize: 10,
            color: colors.textLight,
            marginBottom: 2,
        },
        metricValue: {
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
    }), [colors]);

    if (!items || items.length === 0) return null;

    // Default configuration (backward compatibility) matching Web
    const defaultColumns = [
        { key: 'description', label: 'attachments.items.description', type: 'text' },
        { key: 'quantity', label: 'attachments.items.quantity', type: 'number' },
        { key: 'unitCode', label: 'attachments.items.unitCode', type: 'text' },
        { key: 'unitPrice', label: 'attachments.items.unitPrice', type: 'number' },
        { key: 'discountAmount', label: 'attachments.items.discountAmount', type: 'number' },
        { key: 'totalAmount', label: 'attachments.items.totalAmount', type: 'number' },
        { key: 'vatRate', label: 'attachments.items.vat', type: 'number', suffix: '%' },
        { key: 'vatAmount', label: 'attachments.items.vatAmount', type: 'number' },
        { key: 'totalAmountInc', label: 'attachments.items.totalAmountInc', type: 'number' }
    ];

    // Use itemsConfig if available, otherwise defaults
    const columns = itemsConfig && Array.isArray(itemsConfig) ? itemsConfig : defaultColumns;

    const formatCurrency = (amount: number) => {
        try {
            return new Intl.NumberFormat(i18n.locale === 'tr' ? 'tr-TR' : 'en-US', {
                style: 'currency',
                currency: currency,
            }).format(amount);
        } catch (e) {
            return `${amount} ${currency}`;
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.header}
                onPress={() => setIsExpanded(!isExpanded)}
                activeOpacity={0.7}
            >
                <View style={styles.headerLeft}>
                    {label && <ThemedText style={styles.label}>{label}</ThemedText>}
                    <View style={styles.badge}>
                        <ThemedText style={styles.badgeText}>{items.length}</ThemedText>
                    </View>
                </View>
                <IconSymbol name={isExpanded ? "chevron.up" : "chevron.down"} size={16} color={colors.textLight} />
            </TouchableOpacity>

            {isExpanded && (
                <View style={styles.content}>
                    {items.map((item, index) => {
                        // Separate description from other columns
                        const descCol = columns.find((c: any) => c.key === 'description');
                        const otherCols = columns.filter((c: any) => c.key !== 'description');
                        const descVal = descCol ? item[descCol.key] : null; // Define descVal here
                        const RowComponent = (variant === 'editable' && onItemPress) ? TouchableOpacity : View;

                        return (
                            <RowComponent
                                key={index}
                                style={[styles.itemContainer, index === items.length - 1 && { borderBottomWidth: 0 }]}
                                onPress={() => onItemPress && onItemPress(item, index)}
                                activeOpacity={0.7}
                            >
                                {/* Description Row with Edit Icon */}
                                {descVal && (
                                    <View style={styles.descriptionRow}>
                                        <View style={{ flex: 1 }}>
                                            <ThemedText style={styles.descriptionLabel}>
                                                {i18n.t(descCol.label as any, { defaultValue: descCol.label })}
                                            </ThemedText>
                                            <ThemedText style={styles.descriptionValue}>{descVal}</ThemedText>
                                        </View>
                                        {variant === 'editable' && (
                                            <IconSymbol name="pencil" size={16} color={colors.primary} />
                                        )}
                                    </View>
                                )}

                                {/* Metrics Grid */}
                                <View style={styles.metricsGrid}>
                                    {otherCols.map((col: any) => {
                                        let val = item[col.key];

                                        // Fallbacks
                                        if ((val === undefined || val === null) && col.fallbackKeys) {
                                            for (const k of col.fallbackKeys) {
                                                if (item[k] !== undefined && item[k] !== null) {
                                                    val = item[k];
                                                    break;
                                                }
                                            }
                                        }

                                        let displayVal = val;
                                        if (val === null || val === undefined || val === '') {
                                            displayVal = '-';
                                        } else if (col.type === 'number') {
                                            if (['unitPrice', 'totalAmount', 'discountAmount', 'vatAmount', 'totalAmountInc', 'total', 'amount'].includes(col.key)) {
                                                displayVal = formatCurrency(Number(val));
                                            } else {
                                                displayVal = col.suffix ? `${val}${col.suffix}` : String(val);
                                            }
                                        }

                                        return (
                                            <View key={col.key} style={styles.metricItem}>
                                                <ThemedText style={styles.metricLabel} numberOfLines={1}>
                                                    {i18n.t(col.label as any, { defaultValue: col.label })}
                                                </ThemedText>
                                                <ThemedText style={[styles.metricValue, col.type === 'number' && { fontWeight: '500' }]}>
                                                    {displayVal}
                                                </ThemedText>
                                            </View>
                                        );
                                    })}
                                </View>
                            </RowComponent>
                        );
                    })}

                    {/* Edit Action (if editable) */}
                </View>
            )}
        </View>
    );
};
