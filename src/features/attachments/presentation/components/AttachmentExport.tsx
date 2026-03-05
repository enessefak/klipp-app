import { FileDownloadService } from '@/src/features/attachments/application/FileDownloadService';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { OpenAPI } from '@/src/infrastructure/api/generated/core/OpenAPI';
import { ExportService } from '@/src/infrastructure/api/generated/services/ExportService';
import i18n from '@/src/infrastructure/localization/i18n';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { MissingCompanyInfoModal } from './MissingCompanyInfoModal';

interface AttachmentExportProps {
    attachmentId: string;
}

interface ExportFormat {
    code: string;
    name: string;
}

// Extension map — single source of truth, matches API format codes
const FORMAT_EXT: Record<string, string> = {
    UBL: 'xml', PEPPOL_BIS: 'xml', TR_UBL: 'xml',
    DE_XRECHNUNG: 'xml', IT_FATTURAPA: 'xml', EU_UBL: 'xml', EU_CII: 'xml',
    DE_ZUGFERD: 'pdf', FR_FACTURX: 'pdf',
    PDF: 'pdf',
    TR_EXCEL: 'xlsx', EXCEL: 'xlsx', DE_DATEV: 'csv',
    JSON: 'json', XML: 'xml', CSV: 'csv',
};

const FORMAT_GROUPS = [
    {
        key: 'einvoice',
        label: () => i18n.t('export.group.einvoice', { defaultValue: 'E-Invoice' }),
        codes: ['UBL', 'PEPPOL_BIS', 'TR_UBL', 'DE_ZUGFERD', 'DE_XRECHNUNG', 'FR_FACTURX', 'IT_FATTURAPA', 'EU_UBL', 'EU_CII'],
    },
    {
        key: 'accounting',
        label: () => i18n.t('export.group.accounting', { defaultValue: 'Accounting' }),
        codes: ['TR_EXCEL', 'DE_DATEV'],
    },
    {
        key: 'generic',
        label: () => i18n.t('export.group.generic', { defaultValue: 'General Formats' }),
        codes: ['PDF', 'JSON', 'XML', 'CSV', 'EXCEL'],
    },
];

const getFormatIcon = (code: string): string => {
    if (code === 'PDF' || code === 'DE_ZUGFERD' || code === 'FR_FACTURX') return 'document-outline';
    if (code === 'JSON') return 'code-slash-outline';
    if (code === 'XML' || code.endsWith('UBL') || code.endsWith('CII') || code.endsWith('XRECHNUNG') || code.endsWith('FATTURAPA')) return 'code-outline';
    if (code === 'CSV' || code === 'DE_DATEV') return 'list-outline';
    if (code === 'EXCEL' || code === 'TR_EXCEL') return 'grid-outline';
    return 'document-text-outline';
};

const groupFormats = (formats: ExportFormat[]) => {
    const result: { key: string; label: string; formats: ExportFormat[] }[] = [];
    const usedCodes = new Set<string>();

    for (const group of FORMAT_GROUPS) {
        const grouped = formats.filter(f => group.codes.includes(f.code));
        if (grouped.length > 0) {
            result.push({ key: group.key, label: group.label(), formats: grouped });
            grouped.forEach(f => usedCodes.add(f.code));
        }
    }

    const others = formats.filter(f => !usedCodes.has(f.code));
    if (others.length > 0) {
        result.push({ key: 'other', label: i18n.t('export.group.other', { defaultValue: 'Other' }), formats: others });
    }

    return result;
};

export const AttachmentExport: React.FC<AttachmentExportProps> = ({ attachmentId }) => {
    const [formats, setFormats] = useState<ExportFormat[]>([]);
    const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
    const [showMissingModal, setShowMissingModal] = useState(false);
    const [missingFields, setMissingFields] = useState<string[]>([]);
    const [missingInfoMessage, setMissingInfoMessage] = useState<string | undefined>(undefined);
    const [loadingFormats, setLoadingFormats] = useState(true);
    const [exporting, setExporting] = useState(false);

    const { colors } = useSettings();

    useEffect(() => {
        loadFormats();
    }, []);

    const loadFormats = async () => {
        try {
            const response = await ExportService.getExportFormats();
            if (response.success && response.data && response.data.length > 0) {
                // Exclude bulk-only ZIP format from single attachment export
                setFormats(response.data
                    .filter(f => f.code !== 'ZIP')
                    .map(f => ({ code: f.code, name: f.name }))
                );
            } else {
                throw new Error('No formats from API');
            }
        } catch (error) {
            setFormats([
                { code: 'UBL', name: 'Global - UBL 2.1 (OASIS)' },
                { code: 'PEPPOL_BIS', name: 'Global - Peppol BIS Billing 3.0' },
                { code: 'TR_UBL', name: 'Turkey - E-Invoice (UBL-TR)' },
                { code: 'DE_ZUGFERD', name: 'Germany - E-Rechnung (ZUGFeRD)' },
                { code: 'DE_XRECHNUNG', name: 'Germany - XRechnung' },
                { code: 'FR_FACTURX', name: 'France - Factur-X' },
                { code: 'IT_FATTURAPA', name: 'Italy - FatturaPA' },
                { code: 'EU_UBL', name: 'Europe - UBL (EN16931)' },
                { code: 'EU_CII', name: 'Europe - CII (EN16931)' },
                { code: 'TR_EXCEL', name: 'Turkey - Accounting (Excel)' },
                { code: 'DE_DATEV', name: 'Germany - Accounting (DATEV CSV)' },
                { code: 'JSON', name: 'JSON Export' },
                { code: 'PDF', name: 'PDF' },
                { code: 'XML', name: 'XML' },
                { code: 'CSV', name: 'CSV' },
                { code: 'EXCEL', name: 'Excel' },
            ]);
        } finally {
            setLoadingFormats(false);
        }
    };

    const handleExport = async (format: string) => {
        setExporting(true);
        try {
            const ext = FORMAT_EXT[format] || format.toLowerCase();
            const downloadUrl = `${OpenAPI.BASE}/export/attachment/${attachmentId}?format=${format}`;

            await FileDownloadService.downloadAndShare(
                downloadUrl,
                `export_${attachmentId}.${ext}`
            );
        } catch (error: any) {
            const errBody = error.body || error;
            if (errBody?.code === 'export_missing_company_info' || errBody?.error === 'export_missing_company_info') {
                setMissingFields(errBody.meta?.missingFields || errBody.missingFields || []);
                setMissingInfoMessage(errBody.message);
                setShowMissingModal(true);
            } else {
                Alert.alert(i18n.t('common.error') || 'Error', error.message || 'Export failed. Please try again.');
            }
        } finally {
            setExporting(false);
        }
    };

    if (loadingFormats) {
        return <ActivityIndicator style={{ padding: 20 }} color={colors.primary} />;
    }

    const grouped = groupFormats(formats);

    return (
        <View style={{ flex: 1 }}>
            <MissingCompanyInfoModal
                visible={showMissingModal}
                onClose={() => setShowMissingModal(false)}
                missingFields={missingFields}
                description={missingInfoMessage}
                onSuccess={() => {}}
            />

            <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: selectedFormat ? 96 : 24 }]}>
                <Text style={[styles.title, { color: colors.text }]}>
                    {i18n.t('selectFormat') || 'Select Format'}
                </Text>

                {grouped.map(group => (
                    <View key={group.key} style={styles.section}>
                        <Text style={[styles.sectionLabel, { color: colors.text }]}>
                            {group.label}
                        </Text>
                        <View style={styles.grid}>
                            {group.formats.map(fmt => {
                                const isSelected = selectedFormat === fmt.code;
                                return (
                                    <TouchableOpacity
                                        key={fmt.code}
                                        style={[
                                            styles.formatCard,
                                            { backgroundColor: colors.card, borderColor: colors.border },
                                            isSelected && { borderColor: colors.primary, borderWidth: 2 },
                                        ]}
                                        onPress={() => setSelectedFormat(fmt.code)}
                                        disabled={exporting}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons
                                            name={getFormatIcon(fmt.code) as any}
                                            size={22}
                                            color={isSelected ? colors.primary : '#888'}
                                            style={{ marginBottom: 8 }}
                                        />
                                        <Text style={[styles.formatText, { color: isSelected ? colors.primary : colors.text }]}>
                                            {fmt.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                ))}
            </ScrollView>

            {selectedFormat && (
                <View style={[styles.exportButtonContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                    <TouchableOpacity
                        style={[styles.exportButton, { backgroundColor: colors.primary }]}
                        onPress={() => handleExport(selectedFormat)}
                        disabled={exporting}
                        activeOpacity={0.85}
                    >
                        {exporting ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <>
                                <Ionicons name="download-outline" size={18} color="white" style={{ marginRight: 8 }} />
                                <Text style={styles.exportButtonText}>
                                    {i18n.t('common.actions.export') || 'Export'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        opacity: 0.5,
        marginBottom: 10,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    formatCard: {
        width: '48%',
        minHeight: 90,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
    },
    formatText: {
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 16,
    },
    exportButtonContainer: {
        padding: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    exportButton: {
        height: 50,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    exportButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
