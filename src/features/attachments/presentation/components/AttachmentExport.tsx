
import { FileDownloadService } from '@/src/features/attachments/application/FileDownloadService';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { OpenAPI } from '@/src/infrastructure/api/generated/core/OpenAPI';
import i18n from '@/src/infrastructure/localization/i18n';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import { FieldConfig } from '../../domain/AttachmentTypeFields';

interface AttachmentExportProps {
    attachmentId: string;
    fieldConfig?: FieldConfig[];
}

export const AttachmentExport: React.FC<AttachmentExportProps> = ({ attachmentId, fieldConfig = [] }) => {
    const [formats, setFormats] = useState<string[]>([]);
    const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set(['base', 'metadata']));
    const [loadingFormats, setLoadingFormats] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Advanced options state - simple field selection for now


    const { colors } = useSettings();

    useEffect(() => {
        loadFormats();
    }, []);

    const loadFormats = async () => {
        try {
            // Hardcoded formats if API doesn't return list, or fetch from API
            // const response = await ExportService.getExportFormats();
            // setFormats(response.data);
            setFormats(['PDF', 'JSON', 'XML', 'CSV', 'EXCEL']); // Fallback/Default
        } catch (error) {
            console.error('Failed to load formats', error);
            setFormats(['PDF', 'JSON']);
        } finally {
            setLoadingFormats(false);
        }
    };

    const handleExport = async (format: string) => {
        setExporting(true);
        try {
            // Construct mapping/fields based on selected options
            const fieldsParam = Array.from(selectedFields).join(',');

            // We need to handle file download properly. 
            // Since OpenAPI generated client might return blob or text, we might need a custom download handler
            // For now, I'll assume we can use the direct URL with token logic similar to main screen.

            const token = typeof OpenAPI.TOKEN === 'function' ? await OpenAPI.TOKEN({} as any) : OpenAPI.TOKEN;
            const baseUrl = OpenAPI.BASE;

            // Construct download URL
            const downloadUrl = `${baseUrl}/export/attachment/${attachmentId}?format=${format}&selectedFields=${fieldsParam}`;

            await FileDownloadService.downloadAndShare(downloadUrl, `export_${attachmentId}.${format.toLowerCase()}`);

        } catch (error) {
            console.error('Export failed', error);
            Alert.alert('Error', i18n.t('exportFailed') || 'Export failed. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    if (loadingFormats) {
        return <ActivityIndicator style={{ padding: 20 }} color={colors.primary} />;
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={[styles.title, { color: colors.text }]}>{i18n.t('selectFormat') || 'Select Export Format'}</Text>

            <View style={styles.grid}>
                {formats.map(format => (
                    <TouchableOpacity
                        key={format}
                        style={[styles.formatCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => handleExport(format)}
                        disabled={exporting}
                    >
                        <Ionicons
                            name={format === 'PDF' ? 'document-text' : 'code-slash' as any}
                            size={32}
                            color={colors.primary}
                        />
                        <Text style={[styles.formatText, { color: colors.text }]}>{format}</Text>
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
        width: '48%', // 2 per row
        height: 60,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row', // Horizontal layout
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
    },
    formatText: {
        fontSize: 14,
        fontWeight: '600',
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
