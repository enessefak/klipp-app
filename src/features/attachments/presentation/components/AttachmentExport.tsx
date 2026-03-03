import { FileDownloadService } from '@/src/features/attachments/application/FileDownloadService';
import { AttachmentService } from '@/src/features/attachments/data/AttachmentService';
import { EInvoiceSettingsRepository } from '@/src/features/e-invoices/data/EInvoiceSettingsRepository';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { OpenAPI } from '@/src/infrastructure/api/generated/core/OpenAPI';
import { ExportService } from '@/src/infrastructure/api/generated/services/ExportService';
import { UserService } from '@/src/infrastructure/api/generated/services/UserService';
import i18n from '@/src/infrastructure/localization/i18n';
import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import { FieldConfig } from '../../domain/AttachmentTypeFields';
import { MissingCompanyInfoModal } from './MissingCompanyInfoModal';

interface AttachmentExportProps {
    attachmentId: string;
    fieldConfig?: FieldConfig[];
}

interface ExportFormat {
    code: string;
    name: string;
    description?: string;
}

const GENERIC_FORMATS = ['JSON', 'CSV', 'XML', 'EXCEL', 'TR_EXCEL'];

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
    if (code === 'PDF') return 'document-outline';
    if (code === 'JSON' || code === 'EU_UBL') return 'code-slash-outline';
    if (code === 'XML') return 'code-outline';
    if (code === 'CSV') return 'list-outline';
    if (code === 'EXCEL' || code === 'TR_EXCEL' || code === 'DE_DATEV') return 'grid-outline';
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

export const AttachmentExport: React.FC<AttachmentExportProps> = ({ attachmentId, fieldConfig = [] }) => {
    const router = useRouter();
    const [formats, setFormats] = useState<ExportFormat[]>([]);
    const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
    const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set(['base', 'metadata']));
    const [showMissingModal, setShowMissingModal] = useState(false);
    const [missingFields, setMissingFields] = useState<string[]>([]);
    const [missingInfoMessage, setMissingInfoMessage] = useState<string | undefined>(undefined);
    const [loadingFormats, setLoadingFormats] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const { colors } = useSettings();

    useEffect(() => {
        loadFormats();
    }, []);

    useEffect(() => {
        if (selectedFormat && GENERIC_FORMATS.includes(selectedFormat)) {
            setShowAdvanced(true);
        } else {
            setShowAdvanced(false);
        }
    }, [selectedFormat]);

    const loadFormats = async () => {
        try {
            const response = await ExportService.getExportFormats();
            if (response.success && response.data && response.data.length > 0) {
                const mapped = response.data.map(f => ({
                    code: f.code,
                    name: f.name,
                    description: f.extension,
                }));
                setFormats(mapped);
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

    const checkCompanyInfo = async (format: string): Promise<{ proceed: boolean; source?: 'folder' | 'profile' }> => {
        const officialFormats = ['TR_UBL', 'UBL', 'PEPPOL_BIS', 'DE_ZUGFERD', 'TR_EXCEL'];
        if (!officialFormats.includes(format)) return { proceed: true, source: 'folder' };

        try {
            const attachment = await AttachmentService.getAttachmentById(attachmentId);
            if (!attachment) return { proceed: true, source: 'folder' };
            const folderId = attachment.folderId;

            let folderSettings = null;
            try {
                if (folderId) {
                    folderSettings = await EInvoiceSettingsRepository.getSettings(folderId);
                }
            } catch (e) {}

            const hasFolderInfo = !!(folderSettings?.taxNumber && folderSettings?.companyName);

            const userRes = await UserService.getUsersMe();
            const profile = userRes.data;
            const hasProfileInfo = !!(profile?.taxNumber && profile?.name);

            return new Promise((resolve) => {
                if (hasFolderInfo && hasProfileInfo) {
                    Alert.alert(
                        i18n.t('common.export_company_info.multiple_sources_title') || 'Multiple Company Info Found',
                        i18n.t('common.export_company_info.multiple_sources_message') || 'Both Folder settings and your Profile contain company information. Which one would you like to use for this invoice?',
                        [
                            {
                                text: i18n.t('common.export_company_info.use_folder') || 'Use Folder Info',
                                style: 'default',
                                onPress: () => resolve({ proceed: true, source: 'folder' }),
                            },
                            {
                                text: i18n.t('common.export_company_info.use_profile') || 'Use Profile Info',
                                style: 'default',
                                onPress: () => resolve({ proceed: true, source: 'profile' }),
                            },
                            {
                                text: i18n.t('common.actions.cancel'),
                                style: 'cancel',
                                onPress: () => resolve({ proceed: false }),
                            },
                        ]
                    );
                } else if (hasFolderInfo) {
                    resolve({ proceed: true, source: 'folder' });
                } else if (hasProfileInfo) {
                    Alert.alert(
                        i18n.t('common.export_company_info.use_profile_title'),
                        i18n.t('common.export_company_info.use_profile_message'),
                        [
                            {
                                text: i18n.t('common.export_company_info.add_to_folder'),
                                style: 'default',
                                onPress: () => {
                                    router.push({
                                        pathname: `/folders/edit/${folderId}`,
                                        params: { initialTab: 'efatura' },
                                    } as Href);
                                    resolve({ proceed: false });
                                },
                            },
                            {
                                text: i18n.t('common.export_company_info.use_profile'),
                                style: 'default',
                                onPress: () => resolve({ proceed: true, source: 'profile' }),
                            },
                            {
                                text: i18n.t('common.actions.cancel'),
                                style: 'cancel',
                                onPress: () => resolve({ proceed: false }),
                            },
                        ]
                    );
                } else {
                    Alert.alert(
                        i18n.t('common.export_company_info.missing_title'),
                        i18n.t('common.export_company_info.missing_message'),
                        [
                            {
                                text: i18n.t('common.export_company_info.add_to_folder'),
                                style: 'default',
                                onPress: () => {
                                    router.push({
                                        pathname: `/folders/edit/${folderId}`,
                                        params: { initialTab: 'efatura' },
                                    } as Href);
                                    resolve({ proceed: false });
                                },
                            },
                            {
                                text: i18n.t('common.export_company_info.go_to_profile'),
                                onPress: () => {
                                    setShowMissingModal(true);
                                    resolve({ proceed: false });
                                },
                            },
                            {
                                text: i18n.t('common.actions.cancel'),
                                style: 'cancel',
                                onPress: () => resolve({ proceed: false }),
                            },
                        ]
                    );
                }
            });
        } catch (error) {
            return { proceed: true, source: 'folder' };
        }
    };

    const handleExport = async (format: string) => {
        const checkResult = await checkCompanyInfo(format);
        if (!checkResult.proceed) return;

        const sourceParam = checkResult.source ? `&source=${checkResult.source}` : '';
        setExporting(true);
        try {
            const isGeneric = GENERIC_FORMATS.includes(format);
            const fieldsParam = isGeneric ? Array.from(selectedFields).join(',') : '';
            const baseUrl = OpenAPI.BASE;
            const selectedFieldsQuery = fieldsParam ? `&selectedFields=${fieldsParam}` : '';
            const downloadUrl = `${baseUrl}/export/attachment/${attachmentId}?format=${format}${selectedFieldsQuery}${sourceParam}`;

            await FileDownloadService.downloadAndShare(
                downloadUrl,
                `export_${attachmentId}.${format.toLowerCase().includes('json') ? 'json' : format.toLowerCase().includes('xml') ? 'xml' : format.toLowerCase()}`
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
    const isGenericSelected = selectedFormat ? GENERIC_FORMATS.includes(selectedFormat) : false;

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

                {isGenericSelected && (
                    <View style={styles.advancedSection}>
                        <TouchableOpacity
                            style={[styles.advancedHeader, { borderBottomColor: colors.border }]}
                            onPress={() => setShowAdvanced(!showAdvanced)}
                        >
                            <Text style={[styles.advancedTitle, { color: colors.text }]}>
                                {i18n.t('advancedOptions') || 'Advanced Options'}
                            </Text>
                            <Ionicons name={showAdvanced ? 'chevron-up' : 'chevron-down'} size={20} color={colors.text} />
                        </TouchableOpacity>

                        {showAdvanced && (
                            <View style={[styles.advancedContent, { backgroundColor: colors.card }]}>
                                <View style={styles.optionRow}>
                                    <Text style={{ color: colors.text }}>Base Info</Text>
                                    <Switch
                                        value={selectedFields.has('base')}
                                        onValueChange={(val) => {
                                            const newSet = new Set(selectedFields);
                                            val ? newSet.add('base') : newSet.delete('base');
                                            setSelectedFields(newSet);
                                        }}
                                        trackColor={{ false: '#767577', true: colors.primary }}
                                    />
                                </View>

                                {fieldConfig.map((field) => (
                                    <View key={field.key} style={styles.optionRow}>
                                        <Text style={{ color: colors.text }}>{field.label}</Text>
                                        <Switch
                                            value={selectedFields.has(field.key)}
                                            onValueChange={(val) => {
                                                const newSet = new Set(selectedFields);
                                                val ? newSet.add(field.key) : newSet.delete(field.key);
                                                setSelectedFields(newSet);
                                            }}
                                            trackColor={{ false: '#767577', true: colors.primary }}
                                        />
                                    </View>
                                ))}

                                <View style={styles.optionRow}>
                                    <Text style={{ color: colors.text }}>Include Audit Logs</Text>
                                    <Switch
                                        value={selectedFields.has('auditLogs')}
                                        onValueChange={(val) => {
                                            const newSet = new Set(selectedFields);
                                            val ? newSet.add('auditLogs') : newSet.delete('auditLogs');
                                            setSelectedFields(newSet);
                                        }}
                                        trackColor={{ false: '#767577', true: colors.primary }}
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                )}
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
    advancedSection: {
        marginBottom: 16,
    },
    advancedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    advancedTitle: {
        fontSize: 15,
        fontWeight: '600',
    },
    advancedContent: {
        padding: 16,
        marginTop: 8,
        borderRadius: 8,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
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
