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
    icon?: string;
}

export const AttachmentExport: React.FC<AttachmentExportProps> = ({ attachmentId, fieldConfig = [] }) => {
    const router = useRouter(); // Keeping router if needed else remove
    const [formats, setFormats] = useState<ExportFormat[]>([]);
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

    const loadFormats = async () => {
        try {
            // Try fetching from API first
            const response = await ExportService.getExportFormats();
            if (response.success && response.data && response.data.length > 0) {
                // Map API response to our UI format if valid
                const mapped = response.data.map(f => ({
                    code: f.code,
                    name: f.name,
                    description: f.extension // using extension as description for now
                }));
                setFormats(mapped);
            } else {
                throw new Error("No formats from API");
            }
        } catch (error) {
            console.log('Using fallback formats', error);
            // Fallback to match Web UI exactly
            setFormats([
                { code: 'UBL', name: 'Global - UBL 2.1 (OASIS)', icon: 'document-text' },
                { code: 'PEPPOL_BIS', name: 'Global - Peppol BIS Billing 3.0', icon: 'document-text' },
                { code: 'TR_UBL', name: 'Turkey - E-Invoice (UBL-TR)', icon: 'document-text' },
                { code: 'DE_ZUGFERD', name: 'Germany - E-Rechnung (ZUGFeRD)', icon: 'document-text' },
                { code: 'DE_XRECHNUNG', name: 'Germany - XRechnung', icon: 'document-text' },
                { code: 'FR_FACTURX', name: 'France - Factur-X', icon: 'document-text' },
                { code: 'IT_FATTURAPA', name: 'Italy - FatturaPA', icon: 'document-text' },
                { code: 'EU_UBL', name: 'Europe - UBL (EN16931)', icon: 'code-slash' },
                { code: 'EU_CII', name: 'Europe - CII (EN16931)', icon: 'document-text' },
                { code: 'TR_EXCEL', name: 'Turkey - Accounting (Excel)', icon: 'grid' },
                { code: 'DE_DATEV', name: 'Germany - Accounting (DATEV CSV)', icon: 'grid' },
                { code: 'JSON', name: 'JSON Export', icon: 'code-slash' },
                { code: 'PDF', name: 'PDF', icon: 'document' },
                { code: 'XML', name: 'XML', icon: 'code' },
                { code: 'CSV', name: 'CSV', icon: 'grid' },
                { code: 'EXCEL', name: 'EXCEL', icon: 'grid' }
            ]);
        } finally {
            setLoadingFormats(false);
        }
    };

    // ... existing code ...

    // Check for company info before export
    // Check for company info before export
    const checkCompanyInfo = async (format: string): Promise<{ proceed: boolean; source?: 'folder' | 'profile' }> => {
        // Only check for formats that typically require tax info (e.g. UBL, TR_UBL, etc)
        const officialFormats = ['TR_UBL', 'UBL', 'PEPPOL_BIS', 'DE_ZUGFERD', 'TR_EXCEL'];
        if (!officialFormats.includes(format)) return { proceed: true, source: 'folder' };

        try {
            // 1. Get Attachment to find Folder ID
            const attachment = await AttachmentService.getAttachmentById(attachmentId);
            if (!attachment) return { proceed: true, source: 'folder' }; // Can't check, proceed
            const folderId = attachment.folderId;

            // 2. Check Folder E-Invoice Settings
            let folderSettings = null;
            try {
                if (folderId) {
                    folderSettings = await EInvoiceSettingsRepository.getSettings(folderId);
                }
            } catch (e) { }

            // Check if folder has valid info (Tax ID is the main indicator)
            const hasFolderInfo = !!(folderSettings?.taxNumber && folderSettings?.companyName);

            // 3. Check Profile
            const userRes = await UserService.getUsersMe();
            const profile = userRes.data;
            const hasProfileInfo = !!(profile?.taxNumber && profile?.name);

            return new Promise((resolve) => {
                if (hasFolderInfo && hasProfileInfo) {
                    // Scenario: Both exist - Ask User
                    Alert.alert(
                        i18n.t('common.export_company_info.multiple_sources_title') || 'Multiple Company Info Found',
                        i18n.t('common.export_company_info.multiple_sources_message') || 'Both Folder settings and your Profile contain company information. Which one would you like to use for this invoice?',
                        [
                            {
                                text: i18n.t('common.export_company_info.use_folder') || 'Use Folder Info',
                                style: 'default',
                                onPress: () => resolve({ proceed: true, source: 'folder' })
                            },
                            {
                                text: i18n.t('common.export_company_info.use_profile') || 'Use Profile Info',
                                style: 'default',
                                onPress: () => resolve({ proceed: true, source: 'profile' })
                            },
                            {
                                text: i18n.t('common.actions.cancel'),
                                style: 'cancel',
                                onPress: () => resolve({ proceed: false })
                            }
                        ]
                    );
                } else if (hasFolderInfo) {
                    // Only Folder info exists
                    resolve({ proceed: true, source: 'folder' });
                } else if (hasProfileInfo) {
                    // Only Profile info exists
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
                                        params: { initialTab: 'efatura' }
                                    } as Href);
                                    resolve({ proceed: false });
                                }
                            },
                            {
                                text: i18n.t('common.export_company_info.use_profile'),
                                style: 'default',
                                onPress: () => resolve({ proceed: true, source: 'profile' })
                            },
                            {
                                text: i18n.t('common.actions.cancel'),
                                style: 'cancel',
                                onPress: () => resolve({ proceed: false })
                            }
                        ]
                    );
                } else {
                    // Scenario: Both empty
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
                                        params: { initialTab: 'efatura' }
                                    } as Href);
                                    resolve({ proceed: false });
                                }
                            },
                            {
                                text: i18n.t('common.export_company_info.go_to_profile'),
                                onPress: () => {
                                    setShowMissingModal(true);
                                    resolve({ proceed: false });
                                }
                            },
                            {
                                text: i18n.t('common.actions.cancel'),
                                style: 'cancel',
                                onPress: () => resolve({ proceed: false })
                            }
                        ]
                    );
                }
            });

        } catch (error) {
            console.error('Check info failed', error);
            // Default safe fallback if check fails
            return { proceed: true, source: 'folder' };
        }
    };

    const handleExport = async (format: string) => {
        // Pre-check
        const checkResult = await checkCompanyInfo(format);
        if (!checkResult.proceed) return;

        const sourceParam = checkResult.source ? `&source=${checkResult.source}` : '';

        setExporting(true);
        try {
            // ... export logic ...
            const fieldsParam = Array.from(selectedFields).join(',');

            const token = typeof OpenAPI.TOKEN === 'function' ? await OpenAPI.TOKEN({} as any) : OpenAPI.TOKEN;
            const baseUrl = OpenAPI.BASE;

            // Construct download URL
            const downloadUrl = `${baseUrl}/export/attachment/${attachmentId}?format=${format}&selectedFields=${fieldsParam}${sourceParam}`;

            await FileDownloadService.downloadAndShare(downloadUrl, `export_${attachmentId}.${format.toLowerCase().includes('json') ? 'json' : format.toLowerCase().includes('xml') ? 'xml' : format.toLowerCase()}`);

        } catch (error: any) {
            console.error('Export failed', error);
            const errBody = error.body || error;

            // Handle missing company info
            // Backend returns: { error: 'export_missing_company_info', ... }
            if (errBody?.code === 'export_missing_company_info' || errBody?.error === 'export_missing_company_info') {
                setMissingFields(errBody.meta?.missingFields || errBody.missingFields || []);
                setMissingInfoMessage(errBody.message); // Set message from backend
                setShowMissingModal(true);
            } else {
                const message = error.message || i18n.t('exportFailed') || 'Export failed. Please try again.';
                Alert.alert(i18n.t('common.error') || 'Error', message);
            }
        } finally {
            setExporting(false);
        }
    };

    if (loadingFormats) {
        return <ActivityIndicator style={{ padding: 20 }} color={colors.primary} />;
    }

    return (
        <ScrollView style={styles.container}>
            <MissingCompanyInfoModal
                visible={showMissingModal}
                onClose={() => setShowMissingModal(false)}
                missingFields={missingFields}
                description={missingInfoMessage} // Pass message
                onSuccess={() => {
                    // Optional: automatically retry or just let user click again
                }}
            />
            <Text style={[styles.title, { color: colors.text }]}>{i18n.t('selectFormat') || 'Select Export Format'}</Text>

            <View style={styles.grid}>
                {formats.map(format => (
                    <TouchableOpacity
                        key={format.code}
                        style={[styles.formatCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => handleExport(format.code)}
                        disabled={exporting}
                    >
                        <Ionicons
                            name={(format.icon as any) || 'document-text'}
                            size={24}
                            color={colors.primary}
                            style={{ marginBottom: 8 }}
                        />
                        <Text style={[styles.formatText, { color: colors.text }]}>{format.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {exporting && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ marginTop: 10, color: colors.text }}>Exporting...</Text>
                </View>
            )}

            <TouchableOpacity
                style={styles.advancedHeader}
                onPress={() => setShowAdvanced(!showAdvanced)}
            >
                <Text style={[styles.advancedTitle, { color: colors.text }]}>{i18n.t('advancedOptions') || 'Advanced Options'}</Text>
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
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'space-between',
    },
    formatCard: {
        width: '31%', // 3 per row roughly, or stick to 2? With long names 2 is safer. Let's do 48% like before but adjust content.
        // Actually web screenshot shows 3 per row (some have 4). On mobile 2 per row is better for space.
        // Let's keep 48% but enable vertical layout for icon + text
        minHeight: 100, // Taller for vertical layout
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'column', // Vertical layout
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        marginBottom: 10,
    },
    formatText: {
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    advancedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 24,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
    },
    advancedTitle: {
        fontSize: 16,
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
    }
});
