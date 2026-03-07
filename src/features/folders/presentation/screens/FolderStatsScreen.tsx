import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { FolderAccountingService } from '@/src/infrastructure/api/generated/services/FolderAccountingService';
import i18n from '@/src/infrastructure/localization/i18n';

const MONTH_KEYS = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december',
] as const;

const CATEGORY_ICONS: Record<string, string> = {
    FINANCIAL: 'creditcard.fill',
    INSURANCE: 'shield.fill',
    CONTRACT: 'doc.text.fill',
    IDENTITY: 'person.text.rectangle.fill',
    MEDICAL: 'heart.fill',
    VEHICLE: 'car.fill',
    EDUCATION: 'graduationcap.fill',
    PERSONNEL: 'person.fill',
    OTHER: 'doc.fill',
};

const CATEGORY_COLORS: Record<string, string> = {
    FINANCIAL: '#3B82F6',
    INSURANCE: '#8B5CF6',
    CONTRACT: '#F59E0B',
    IDENTITY: '#10B981',
    MEDICAL: '#EF4444',
    VEHICLE: '#6366F1',
    EDUCATION: '#EC4899',
    PERSONNEL: '#14B8A6',
    OTHER: '#6B7280',
};

interface FolderStats {
    folder?: { id?: string; name?: string; icon?: string; color?: string };
    isOwner?: boolean;
    isFinancial?: boolean;
    attachmentCount?: number;
    byStatus?: Record<string, number>;
    byType?: Record<string, number>;
    byDocumentCategory?: Record<string, {
        count: number;
        expiringCount?: number;
        types: Array<{ name: string; label: string; count: number }>;
        stats?: Record<string, any>;
    }>;
    expiringCount?: number;
    lastUpdated?: string;
    financial?: {
        combined?: {
            totalIncome?: number;
            totalExpense?: number;
            totalTax?: number;
            netBalance?: number;
            baseCurrency?: string;
        };
        byCurrency?: Array<{
            currency?: string;
            income?: number;
            expense?: number;
            tax?: number;
        }>;
    } | null;
}

export function FolderStatsScreen() {
    const { colors } = useSettings();
    const router = useRouter();
    const params = useLocalSearchParams<{ id: string; folderName?: string }>();
    const folderId = params.id;
    const folderName = params.folderName || i18n.t('folders.default_name');

    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(String(currentYear));
    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
    const [stats, setStats] = useState<FolderStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

    const loadStats = useCallback(async () => {
        if (!folderId) return;
        setLoading(true);
        try {
            const response = await FolderAccountingService.getFoldersStats(
                folderId,
                selectedYear,
                selectedMonth || undefined,
            );
            setStats(response.data as FolderStats);
        } catch (err) {
            console.error('Failed to load folder stats:', err);
        } finally {
            setLoading(false);
        }
    }, [folderId, selectedYear, selectedMonth]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    const formatCurrency = (amount: number | undefined, cur = 'TRY') => {
        if (amount === undefined || amount === null) return '—';
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: cur,
            minimumFractionDigits: 2,
        }).format(amount);
    };

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(category)) {
                next.delete(category);
            } else {
                next.add(category);
            }
            return next;
        });
    };

    const sortedCategories = useMemo(() => {
        if (!stats?.byDocumentCategory) return [];
        return Object.entries(stats.byDocumentCategory).sort(([, a], [, b]) => b.count - a.count);
    }, [stats?.byDocumentCategory]);

    const totalDocs = stats?.attachmentCount || 0;
    const financial = stats?.financial?.combined;
    const currency = financial?.baseCurrency || 'TRY';

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: colors.card,
            borderBottomWidth: 1,
            borderBottomColor: colors.cardBorder,
        },
        backButton: {
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 8,
        },
        headerTitle: {
            flex: 1,
            fontSize: 17,
            color: colors.text,
        },
        scrollContent: {
            paddingBottom: 100,
        },
        // Period filter
        periodContainer: {
            flexDirection: 'row',
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 8,
            backgroundColor: colors.card,
            borderBottomWidth: 1,
            borderBottomColor: colors.cardBorder,
        },
        yearScroll: {
            flexDirection: 'row',
            gap: 6,
        },
        yearChip: {
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderRadius: 16,
            backgroundColor: colors.inputBackground,
        },
        yearChipActive: {
            backgroundColor: colors.primary,
        },
        yearChipText: {
            fontSize: 13,
            fontWeight: '600',
            color: colors.textLight,
        },
        yearChipTextActive: {
            color: colors.white,
        },
        monthScroll: {
            flexDirection: 'row',
            gap: 6,
            paddingHorizontal: 16,
            paddingVertical: 8,
        },
        monthChip: {
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 14,
            backgroundColor: colors.inputBackground,
        },
        monthChipActive: {
            backgroundColor: colors.primary + '20',
            borderWidth: 1,
            borderColor: colors.primary,
        },
        monthChipText: {
            fontSize: 12,
            color: colors.textLight,
        },
        monthChipTextActive: {
            color: colors.primary,
            fontWeight: '600',
        },
        // Summary cards
        summaryRow: {
            flexDirection: 'row',
            paddingHorizontal: 16,
            paddingTop: 16,
            gap: 10,
        },
        summaryCard: {
            flex: 1,
            alignItems: 'center',
            paddingVertical: 16,
            borderRadius: 12,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.cardBorder,
        },
        summaryValue: {
            fontSize: 24,
            fontWeight: '700',
            color: colors.text,
        },
        summaryLabel: {
            fontSize: 11,
            color: colors.textLight,
            marginTop: 4,
        },
        // Financial card
        financialCard: {
            marginHorizontal: 16,
            marginTop: 16,
            borderRadius: 12,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            overflow: 'hidden',
        },
        financialHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 10,
        },
        financialTitle: {
            fontSize: 15,
            fontWeight: '600',
            color: colors.text,
        },
        financialRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 10,
        },
        financialLabel: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        financialLabelText: {
            fontSize: 14,
            color: colors.textLight,
        },
        financialValue: {
            fontSize: 14,
            fontWeight: '600',
        },
        financialDivider: {
            height: 1,
            backgroundColor: colors.border,
            marginHorizontal: 16,
        },
        netBalanceRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 14,
            backgroundColor: colors.inputBackground,
        },
        netBalanceLabel: {
            fontSize: 15,
            fontWeight: '600',
            color: colors.text,
        },
        netBalanceValue: {
            fontSize: 18,
            fontWeight: '700',
        },
        // Section
        sectionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 16,
            paddingTop: 24,
            paddingBottom: 8,
        },
        sectionTitle: {
            fontSize: 15,
            fontWeight: '600',
            color: colors.text,
        },
        // Category accordion
        categoryItem: {
            marginHorizontal: 16,
            marginBottom: 8,
            borderRadius: 12,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            overflow: 'hidden',
        },
        categoryHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 14,
            gap: 12,
        },
        categoryIconContainer: {
            width: 36,
            height: 36,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
        },
        categoryInfo: {
            flex: 1,
        },
        categoryName: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
        },
        categoryCount: {
            fontSize: 12,
            color: colors.textLight,
            marginTop: 2,
        },
        categoryBadges: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        expiringBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 3,
            backgroundColor: '#FEF3C7',
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 8,
        },
        expiringBadgeText: {
            fontSize: 11,
            fontWeight: '600',
            color: '#D97706',
        },
        percentageBadge: {
            backgroundColor: colors.inputBackground,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 8,
        },
        percentageText: {
            fontSize: 11,
            fontWeight: '600',
            color: colors.textLight,
        },
        // Category content (expanded)
        categoryContent: {
            paddingHorizontal: 14,
            paddingBottom: 14,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        // Expiring alert inside category
        expiringAlert: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: '#FEF3C7',
            padding: 10,
            borderRadius: 8,
            marginTop: 10,
        },
        expiringAlertText: {
            fontSize: 12,
            color: '#92400E',
        },
        // Document type item
        docTypeItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 8,
        },
        docTypeName: {
            fontSize: 13,
            color: colors.textLight,
            flex: 1,
        },
        docTypeBar: {
            width: 60,
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.inputBackground,
            marginHorizontal: 10,
            overflow: 'hidden',
        },
        docTypeBarFill: {
            height: '100%',
            borderRadius: 2,
        },
        docTypeCount: {
            fontSize: 12,
            fontWeight: '600',
            color: colors.text,
            width: 24,
            textAlign: 'right',
        },
        // Stat rows for category-specific stats
        statSection: {
            marginTop: 10,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        statRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 4,
        },
        statLabel: {
            fontSize: 13,
            color: colors.textLight,
        },
        statValue: {
            fontSize: 13,
            fontWeight: '600',
            color: colors.text,
        },
        statusDots: {
            flexDirection: 'row',
            gap: 12,
            paddingVertical: 6,
        },
        statusDot: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        dot: {
            width: 6,
            height: 6,
            borderRadius: 3,
        },
        statusDotText: {
            fontSize: 12,
            color: colors.textLight,
        },
        statusDotValue: {
            fontSize: 12,
            fontWeight: '600',
            color: colors.text,
        },
        pillContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 6,
            marginTop: 4,
        },
        pill: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: colors.inputBackground,
            paddingHorizontal: 8,
            paddingVertical: 3,
            borderRadius: 10,
        },
        pillLabel: {
            fontSize: 11,
            color: colors.textLight,
        },
        pillValue: {
            fontSize: 11,
            fontWeight: '600',
            color: colors.text,
        },
        // Transaction type
        typeRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 10,
            paddingHorizontal: 16,
            backgroundColor: colors.card,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
        },
        typeLabel: {
            fontSize: 14,
            color: colors.text,
        },
        typeBadge: {
            backgroundColor: colors.inputBackground,
            paddingHorizontal: 10,
            paddingVertical: 3,
            borderRadius: 10,
        },
        typeBadgeText: {
            fontSize: 12,
            fontWeight: '600',
            color: colors.text,
        },
        emptyContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 60,
        },
        emptyText: {
            fontSize: 14,
            color: colors.textLight,
            marginTop: 12,
        },
        centerLoader: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
    }), [colors]);

    const renderCategoryStats = (category: string, catStats: Record<string, any> | undefined) => {
        if (!catStats) return null;

        switch (category) {
            case 'FINANCIAL':
                return (
                    <View style={styles.statSection}>
                        <View style={styles.financialRow}>
                            <View style={styles.financialLabel}>
                                <IconSymbol name="arrow.up.right" size={14} color="#22C55E" />
                                <ThemedText style={[styles.financialLabelText]}>{i18n.t('folderStats.income')}</ThemedText>
                            </View>
                            <ThemedText style={[styles.financialValue, { color: '#22C55E' }]}>
                                {formatCurrency(catStats.totalIncome)}
                            </ThemedText>
                        </View>
                        <View style={styles.financialRow}>
                            <View style={styles.financialLabel}>
                                <IconSymbol name="arrow.down.left" size={14} color="#EF4444" />
                                <ThemedText style={[styles.financialLabelText]}>{i18n.t('folderStats.expense')}</ThemedText>
                            </View>
                            <ThemedText style={[styles.financialValue, { color: '#EF4444' }]}>
                                {formatCurrency(catStats.totalExpense)}
                            </ThemedText>
                        </View>
                        <View style={styles.statRow}>
                            <ThemedText style={[styles.statLabel, { fontWeight: '600' }]}>{i18n.t('folderStats.netBalance')}</ThemedText>
                            <ThemedText style={[styles.statValue, { color: (catStats.netBalance || 0) >= 0 ? '#22C55E' : '#EF4444' }]}>
                                {formatCurrency(catStats.netBalance)}
                            </ThemedText>
                        </View>
                        {catStats.totalTax > 0 && (
                            <View style={styles.statRow}>
                                <ThemedText style={styles.statLabel}>{i18n.t('folderStats.tax')}</ThemedText>
                                <ThemedText style={styles.statValue}>{formatCurrency(catStats.totalTax)}</ThemedText>
                            </View>
                        )}
                        <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                            {catStats.vendorCount > 0 && (
                                <ThemedText style={{ fontSize: 12, color: colors.textLight }}>
                                    {catStats.vendorCount} {i18n.t('folderStats.vendors')}
                                </ThemedText>
                            )}
                            {catStats.currencyCount > 1 && (
                                <ThemedText style={{ fontSize: 12, color: colors.textLight }}>
                                    {catStats.currencyCount} {i18n.t('folderStats.currencies')}
                                </ThemedText>
                            )}
                        </View>
                    </View>
                );

            case 'INSURANCE':
                return (
                    <View style={styles.statSection}>
                        {catStats.totalPremium > 0 && (
                            <View style={styles.statRow}>
                                <ThemedText style={styles.statLabel}>{i18n.t('folderStats.totalPremium')}</ThemedText>
                                <ThemedText style={styles.statValue}>{formatCurrency(catStats.totalPremium)}</ThemedText>
                            </View>
                        )}
                        <View style={styles.statusDots}>
                            <View style={styles.statusDot}>
                                <View style={[styles.dot, { backgroundColor: '#22C55E' }]} />
                                <ThemedText style={styles.statusDotText}>{i18n.t('folderStats.active')}</ThemedText>
                                <ThemedText style={styles.statusDotValue}>{catStats.activeCount || 0}</ThemedText>
                            </View>
                            {(catStats.expiredCount || 0) > 0 && (
                                <View style={styles.statusDot}>
                                    <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
                                    <ThemedText style={styles.statusDotText}>{i18n.t('folderStats.expired')}</ThemedText>
                                    <ThemedText style={[styles.statusDotValue, { color: '#EF4444' }]}>{catStats.expiredCount}</ThemedText>
                                </View>
                            )}
                        </View>
                        {catStats.providerCount > 0 && (
                            <View style={styles.statRow}>
                                <ThemedText style={styles.statLabel}>{i18n.t('folderStats.providers')}</ThemedText>
                                <ThemedText style={styles.statValue}>{catStats.providerCount}</ThemedText>
                            </View>
                        )}
                    </View>
                );

            case 'CONTRACT':
                return (
                    <View style={styles.statSection}>
                        {catStats.totalValue > 0 && (
                            <View style={styles.statRow}>
                                <ThemedText style={styles.statLabel}>{i18n.t('folderStats.totalValue')}</ThemedText>
                                <ThemedText style={styles.statValue}>{formatCurrency(catStats.totalValue)}</ThemedText>
                            </View>
                        )}
                        <View style={styles.statusDots}>
                            <View style={styles.statusDot}>
                                <View style={[styles.dot, { backgroundColor: '#22C55E' }]} />
                                <ThemedText style={styles.statusDotText}>{i18n.t('folderStats.active')}</ThemedText>
                                <ThemedText style={styles.statusDotValue}>{catStats.activeCount || 0}</ThemedText>
                            </View>
                            {(catStats.expiredCount || 0) > 0 && (
                                <View style={styles.statusDot}>
                                    <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
                                    <ThemedText style={styles.statusDotText}>{i18n.t('folderStats.expired')}</ThemedText>
                                    <ThemedText style={[styles.statusDotValue, { color: '#EF4444' }]}>{catStats.expiredCount}</ThemedText>
                                </View>
                            )}
                        </View>
                        {catStats.partyCount > 0 && (
                            <View style={styles.statRow}>
                                <ThemedText style={styles.statLabel}>{i18n.t('folderStats.parties')}</ThemedText>
                                <ThemedText style={styles.statValue}>{catStats.partyCount}</ThemedText>
                            </View>
                        )}
                        {catStats.renewalTypes && Object.keys(catStats.renewalTypes).length > 0 && (
                            <View style={{ marginTop: 4 }}>
                                <ThemedText style={styles.statLabel}>{i18n.t('folderStats.renewalTypes')}</ThemedText>
                                <View style={styles.pillContainer}>
                                    {Object.entries(catStats.renewalTypes as Record<string, number>).map(([key, count]) => (
                                        <View key={key} style={styles.pill}>
                                            <ThemedText style={styles.pillLabel}>{i18n.t(`folderStats.renewal_${key}`, { defaultValue: key })}</ThemedText>
                                            <ThemedText style={styles.pillValue}>{count}</ThemedText>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                );

            case 'IDENTITY':
                return (
                    <View style={styles.statSection}>
                        <View style={styles.statusDots}>
                            <View style={styles.statusDot}>
                                <View style={[styles.dot, { backgroundColor: '#22C55E' }]} />
                                <ThemedText style={styles.statusDotText}>{i18n.t('folderStats.active')}</ThemedText>
                                <ThemedText style={styles.statusDotValue}>{catStats.activeCount || 0}</ThemedText>
                            </View>
                            {(catStats.expiredCount || 0) > 0 && (
                                <View style={styles.statusDot}>
                                    <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
                                    <ThemedText style={styles.statusDotText}>{i18n.t('folderStats.expired')}</ThemedText>
                                    <ThemedText style={[styles.statusDotValue, { color: '#EF4444' }]}>{catStats.expiredCount}</ThemedText>
                                </View>
                            )}
                        </View>
                        {catStats.nationalityCount > 0 && (
                            <View style={styles.statRow}>
                                <ThemedText style={styles.statLabel}>{i18n.t('folderStats.nationalities')}</ThemedText>
                                <ThemedText style={styles.statValue}>{catStats.nationalityCount}</ThemedText>
                            </View>
                        )}
                    </View>
                );

            case 'MEDICAL':
                return (
                    <View style={styles.statSection}>
                        {catStats.hospitalCount > 0 && (
                            <View style={styles.statRow}>
                                <ThemedText style={styles.statLabel}>{i18n.t('folderStats.hospitals')}</ThemedText>
                                <ThemedText style={styles.statValue}>{catStats.hospitalCount}</ThemedText>
                            </View>
                        )}
                        {catStats.doctorCount > 0 && (
                            <View style={styles.statRow}>
                                <ThemedText style={styles.statLabel}>{i18n.t('folderStats.doctors')}</ThemedText>
                                <ThemedText style={styles.statValue}>{catStats.doctorCount}</ThemedText>
                            </View>
                        )}
                        {catStats.reportTypes && Object.keys(catStats.reportTypes).length > 0 && (
                            <View style={{ marginTop: 4 }}>
                                <ThemedText style={styles.statLabel}>{i18n.t('folderStats.reportTypes')}</ThemedText>
                                <View style={styles.pillContainer}>
                                    {Object.entries(catStats.reportTypes as Record<string, number>).map(([key, count]) => (
                                        <View key={key} style={styles.pill}>
                                            <ThemedText style={styles.pillLabel}>{i18n.t(`folderStats.report_${key}`, { defaultValue: key })}</ThemedText>
                                            <ThemedText style={styles.pillValue}>{count}</ThemedText>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                );

            case 'VEHICLE':
                return (
                    <View style={styles.statSection}>
                        {catStats.vehicleCount > 0 && (
                            <View style={styles.statRow}>
                                <ThemedText style={styles.statLabel}>{i18n.t('folderStats.vehicles')}</ThemedText>
                                <ThemedText style={styles.statValue}>{catStats.vehicleCount}</ThemedText>
                            </View>
                        )}
                        {catStats.brandCount > 0 && (
                            <View style={styles.statRow}>
                                <ThemedText style={styles.statLabel}>{i18n.t('folderStats.brands')}</ThemedText>
                                <ThemedText style={styles.statValue}>{catStats.brandCount}</ThemedText>
                            </View>
                        )}
                        {(catStats.expiredCount || 0) > 0 && (
                            <View style={styles.statusDots}>
                                <View style={styles.statusDot}>
                                    <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
                                    <ThemedText style={styles.statusDotText}>{i18n.t('folderStats.expired')}</ThemedText>
                                    <ThemedText style={[styles.statusDotValue, { color: '#EF4444' }]}>{catStats.expiredCount}</ThemedText>
                                </View>
                            </View>
                        )}
                    </View>
                );

            case 'EDUCATION':
                return (
                    <View style={styles.statSection}>
                        {catStats.schoolCount > 0 && (
                            <View style={styles.statRow}>
                                <ThemedText style={styles.statLabel}>{i18n.t('folderStats.schools')}</ThemedText>
                                <ThemedText style={styles.statValue}>{catStats.schoolCount}</ThemedText>
                            </View>
                        )}
                        {catStats.degrees && Object.keys(catStats.degrees).length > 0 && (
                            <View style={{ marginTop: 4 }}>
                                <ThemedText style={styles.statLabel}>{i18n.t('folderStats.degrees')}</ThemedText>
                                <View style={styles.pillContainer}>
                                    {Object.entries(catStats.degrees as Record<string, number>).map(([key, count]) => (
                                        <View key={key} style={styles.pill}>
                                            <ThemedText style={styles.pillLabel}>{i18n.t(`folderStats.degree_${key}`, { defaultValue: key })}</ThemedText>
                                            <ThemedText style={styles.pillValue}>{count}</ThemedText>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                );

            case 'PERSONNEL':
                return (
                    <View style={styles.statSection}>
                        {catStats.employeeCount > 0 && (
                            <View style={styles.statRow}>
                                <ThemedText style={styles.statLabel}>{i18n.t('folderStats.employees')}</ThemedText>
                                <ThemedText style={styles.statValue}>{catStats.employeeCount}</ThemedText>
                            </View>
                        )}
                        {catStats.departmentCount > 0 && (
                            <View style={styles.statRow}>
                                <ThemedText style={styles.statLabel}>{i18n.t('folderStats.departments')}</ThemedText>
                                <ThemedText style={styles.statValue}>{catStats.departmentCount}</ThemedText>
                            </View>
                        )}
                        {catStats.documentTypes && Object.keys(catStats.documentTypes).length > 0 && (
                            <View style={{ marginTop: 4 }}>
                                <ThemedText style={styles.statLabel}>{i18n.t('folderStats.docTypes')}</ThemedText>
                                <View style={styles.pillContainer}>
                                    {Object.entries(catStats.documentTypes as Record<string, number>).map(([key, count]) => (
                                        <View key={key} style={styles.pill}>
                                            <ThemedText style={styles.pillLabel}>{i18n.t(`folderStats.personnelDoc_${key}`, { defaultValue: key })}</ThemedText>
                                            <ThemedText style={styles.pillValue}>{count}</ThemedText>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <IconSymbol name="chevron.left" size={24} color={colors.primary} />
                </TouchableOpacity>
                <ThemedText type="defaultSemiBold" style={styles.headerTitle} numberOfLines={1}>
                    {i18n.t('folderStats.title', { name: folderName })}
                </ThemedText>
            </View>

            {/* Year chips */}
            <View style={styles.periodContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yearScroll}>
                    {years.map(y => (
                        <TouchableOpacity
                            key={y}
                            style={[styles.yearChip, selectedYear === y && styles.yearChipActive]}
                            onPress={() => setSelectedYear(y)}
                        >
                            <ThemedText style={[styles.yearChipText, selectedYear === y && styles.yearChipTextActive]}>
                                {y}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <View style={styles.centerLoader}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : !stats ? (
                <View style={styles.emptyContainer}>
                    <IconSymbol name="chart.bar.fill" size={48} color={colors.border} />
                    <ThemedText style={styles.emptyText}>{i18n.t('common.error')}</ThemedText>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={loadStats} />}
                >
                    {/* Month chips */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthScroll}>
                        <TouchableOpacity
                            style={[styles.monthChip, !selectedMonth && styles.monthChipActive]}
                            onPress={() => setSelectedMonth(null)}
                        >
                            <ThemedText style={[styles.monthChipText, !selectedMonth && styles.monthChipTextActive]}>
                                {i18n.t('folderStats.allMonths')}
                            </ThemedText>
                        </TouchableOpacity>
                        {MONTH_KEYS.map((key, i) => (
                            <TouchableOpacity
                                key={key}
                                style={[styles.monthChip, selectedMonth === String(i + 1) && styles.monthChipActive]}
                                onPress={() => setSelectedMonth(String(i + 1))}
                            >
                                <ThemedText style={[styles.monthChipText, selectedMonth === String(i + 1) && styles.monthChipTextActive]}>
                                    {i18n.t(`common.months.${key}`)}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Summary cards */}
                    <View style={styles.summaryRow}>
                        <View style={styles.summaryCard}>
                            <ThemedText style={styles.summaryValue}>{totalDocs}</ThemedText>
                            <ThemedText style={styles.summaryLabel}>{i18n.t('folderStats.documents')}</ThemedText>
                        </View>
                        <View style={styles.summaryCard}>
                            <ThemedText style={styles.summaryValue}>{sortedCategories.length}</ThemedText>
                            <ThemedText style={styles.summaryLabel}>{i18n.t('folderStats.categories')}</ThemedText>
                        </View>
                        <View style={styles.summaryCard}>
                            <ThemedText style={[
                                styles.summaryValue,
                                (stats.expiringCount || 0) > 0 && { color: '#D97706' }
                            ]}>
                                {stats.expiringCount || 0}
                            </ThemedText>
                            <ThemedText style={styles.summaryLabel}>{i18n.t('folderStats.expiring')}</ThemedText>
                        </View>
                    </View>

                    {/* Financial overview */}
                    {stats.isFinancial && financial && (
                        <View style={styles.financialCard}>
                            <View style={styles.financialHeader}>
                                <IconSymbol name="chart.bar.fill" size={16} color={colors.primary} />
                                <ThemedText style={styles.financialTitle}>{i18n.t('folderStats.financialSummary')}</ThemedText>
                            </View>
                            <View style={styles.financialRow}>
                                <View style={styles.financialLabel}>
                                    <IconSymbol name="arrow.up.right" size={14} color="#22C55E" />
                                    <ThemedText style={styles.financialLabelText}>{i18n.t('folderStats.income')}</ThemedText>
                                </View>
                                <ThemedText style={[styles.financialValue, { color: '#22C55E' }]}>
                                    {formatCurrency(financial.totalIncome, currency)}
                                </ThemedText>
                            </View>
                            <View style={styles.financialDivider} />
                            <View style={styles.financialRow}>
                                <View style={styles.financialLabel}>
                                    <IconSymbol name="arrow.down.left" size={14} color="#EF4444" />
                                    <ThemedText style={styles.financialLabelText}>{i18n.t('folderStats.expense')}</ThemedText>
                                </View>
                                <ThemedText style={[styles.financialValue, { color: '#EF4444' }]}>
                                    {formatCurrency(financial.totalExpense, currency)}
                                </ThemedText>
                            </View>
                            <View style={styles.netBalanceRow}>
                                <ThemedText style={styles.netBalanceLabel}>{i18n.t('folderStats.netBalance')}</ThemedText>
                                <ThemedText style={[
                                    styles.netBalanceValue,
                                    { color: (financial.netBalance || 0) >= 0 ? '#22C55E' : '#EF4444' }
                                ]}>
                                    {formatCurrency(financial.netBalance, currency)}
                                </ThemedText>
                            </View>
                        </View>
                    )}

                    {/* Transaction types */}
                    {stats.byType && Object.keys(stats.byType).length > 0 && (
                        <>
                            <View style={styles.sectionHeader}>
                                <ThemedText style={styles.sectionTitle}>{i18n.t('folderStats.byType')}</ThemedText>
                            </View>
                            <View style={{ marginHorizontal: 16, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.cardBorder }}>
                                {Object.entries(stats.byType).map(([type, count]) => (
                                    <View key={type} style={styles.typeRow}>
                                        <ThemedText style={styles.typeLabel}>{i18n.t(`transaction_types.${type}`, { defaultValue: type })}</ThemedText>
                                        <View style={styles.typeBadge}>
                                            <ThemedText style={styles.typeBadgeText}>{count}</ThemedText>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </>
                    )}

                    {/* Document categories */}
                    {sortedCategories.length > 0 && (
                        <>
                            <View style={styles.sectionHeader}>
                                <IconSymbol name="folder.fill" size={16} color={colors.primary} />
                                <ThemedText style={styles.sectionTitle}>{i18n.t('folderStats.documentCategories')}</ThemedText>
                            </View>
                            {sortedCategories.map(([category, data]) => {
                                const percentage = totalDocs > 0 ? Math.round((data.count / totalDocs) * 100) : 0;
                                const catColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.OTHER;
                                const catIcon = CATEGORY_ICONS[category] || CATEGORY_ICONS.OTHER;
                                const isExpanded = expandedCategories.has(category);
                                const catExpiring = data.expiringCount || 0;

                                return (
                                    <TouchableOpacity
                                        key={category}
                                        style={styles.categoryItem}
                                        onPress={() => toggleCategory(category)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.categoryHeader}>
                                            <View style={[styles.categoryIconContainer, { backgroundColor: catColor + '20' }]}>
                                                <IconSymbol name={catIcon as any} size={18} color={catColor} />
                                            </View>
                                            <View style={styles.categoryInfo}>
                                                <ThemedText style={styles.categoryName}>
                                                    {i18n.t(`document_categories.${category}`, { defaultValue: category })}
                                                </ThemedText>
                                                <ThemedText style={styles.categoryCount}>
                                                    {data.count} {i18n.t('folderStats.documents').toLowerCase()}
                                                </ThemedText>
                                            </View>
                                            <View style={styles.categoryBadges}>
                                                {catExpiring > 0 && (
                                                    <View style={styles.expiringBadge}>
                                                        <IconSymbol name="exclamationmark.triangle" size={10} color="#D97706" />
                                                        <ThemedText style={styles.expiringBadgeText}>{catExpiring}</ThemedText>
                                                    </View>
                                                )}
                                                <View style={styles.percentageBadge}>
                                                    <ThemedText style={styles.percentageText}>{percentage}%</ThemedText>
                                                </View>
                                                <IconSymbol
                                                    name={isExpanded ? 'chevron.up' : 'chevron.down'}
                                                    size={16}
                                                    color={colors.textLight}
                                                />
                                            </View>
                                        </View>

                                        {isExpanded && (
                                            <View style={styles.categoryContent}>
                                                {/* Expiring alert */}
                                                {catExpiring > 0 && (
                                                    <View style={styles.expiringAlert}>
                                                        <IconSymbol name="exclamationmark.triangle" size={14} color="#D97706" />
                                                        <ThemedText style={styles.expiringAlertText}>
                                                            {catExpiring} {i18n.t('folderStats.expiringInCategory')}
                                                        </ThemedText>
                                                    </View>
                                                )}

                                                {/* Document types */}
                                                <View style={{ marginTop: 10 }}>
                                                    {data.types.map(docType => {
                                                        const typePercentage = data.count > 0 ? Math.round((docType.count / data.count) * 100) : 0;
                                                        return (
                                                            <View key={docType.name} style={styles.docTypeItem}>
                                                                <ThemedText style={styles.docTypeName}>
                                                                    {i18n.t(`attachmentTypes.${docType.name}`, { defaultValue: docType.label })}
                                                                </ThemedText>
                                                                <View style={styles.docTypeBar}>
                                                                    <View style={[styles.docTypeBarFill, {
                                                                        width: `${typePercentage}%`,
                                                                        backgroundColor: catColor + '80',
                                                                    }]} />
                                                                </View>
                                                                <ThemedText style={styles.docTypeCount}>{docType.count}</ThemedText>
                                                            </View>
                                                        );
                                                    })}
                                                </View>

                                                {/* Category-specific stats */}
                                                {renderCategoryStats(category, data.stats)}
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </>
                    )}

                    {totalDocs === 0 && (
                        <View style={styles.emptyContainer}>
                            <IconSymbol name="doc.fill" size={48} color={colors.border} />
                            <ThemedText style={styles.emptyText}>{i18n.t('folderStats.noDocuments')}</ThemedText>
                        </View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
