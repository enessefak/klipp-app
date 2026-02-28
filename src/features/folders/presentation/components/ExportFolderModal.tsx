import { Button } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { ExportService } from '@/src/infrastructure/api/generated/services/ExportService';
import i18n from '@/src/infrastructure/localization/i18n';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface ExportFolderModalProps {
    visible: boolean;
    onClose: () => void;
    onExport: (templateId?: string) => void;
}

interface ExportTemplate {
    id: string;
    name: string;
}

export function ExportFolderModal({ visible, onClose, onExport }: ExportFolderModalProps) {
    const { colors } = useSettings();
    const [templates, setTemplates] = useState<ExportTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (visible) {
            loadTemplates();
        }
    }, [visible]);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const response = await ExportService.getExportFormats();
            const data = (response as any).data || response;

            if (Array.isArray(data)) {
                setTemplates(data.map((item: any) => ({
                    id: item.code,
                    name: item.name
                })));
            } else {
                // Fallback hardcoded
                setTemplates([
                    { id: 'TR_EXCEL', name: 'Excel (TR)' },
                    { id: 'DE_DATEV', name: 'DATEV (DE)' },
                    { id: 'JSON', name: 'JSON' },
                    { id: 'CSV', name: 'CSV' },
                    { id: 'XML', name: 'XML' },
                    { id: 'EXCEL', name: 'Standard Excel' }
                ]);
            }
        } catch (error) {
            console.error('Failed to load templates', error);
            // Fallback
            setTemplates([
                { id: 'TR_EXCEL', name: 'Excel (TR)' },
                { id: 'DE_DATEV', name: 'DATEV (DE)' },
                { id: 'JSON', name: 'JSON' },
                { id: 'CSV', name: 'CSV' },
                { id: 'XML', name: 'XML' },
                { id: 'EXCEL', name: 'Standard Excel' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const styles = useMemo(() => StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            padding: 20
        },
        container: {
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 24,
            gap: 16,
            borderWidth: 1,
            borderColor: colors.cardBorder,
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 8
        },
        templateList: {
            gap: 8
        },
        templateItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.background,
            gap: 12
        },
        selectedItem: {
            borderColor: colors.primary,
            backgroundColor: colors.primary + '10'
        },
        templateName: {
            fontSize: 16,
            color: colors.text,
            flex: 1
        },
        actions: {
            flexDirection: 'row',
            gap: 12,
            marginTop: 16
        }
    }), [colors]);

    const handleExport = () => {
        onExport(selectedTemplateId);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.container}>
                            <ThemedText style={styles.title}>{i18n.t('folders.export_modal.title')}</ThemedText>
                            <ThemedText style={{ color: colors.subtext, marginBottom: 8 }}>
                                {i18n.t('folders.export_modal.description')}
                            </ThemedText>

                            {loading ? (
                                <ActivityIndicator color={colors.primary} />
                            ) : (
                                <View style={styles.templateList}>
                                    {templates.map((template) => (
                                        <TouchableOpacity
                                            key={template.id}
                                            style={[
                                                styles.templateItem,
                                                selectedTemplateId === template.id && styles.selectedItem
                                            ]}
                                            onPress={() => setSelectedTemplateId(template.id)}
                                        >
                                            <IconSymbol
                                                name={selectedTemplateId === template.id ? "checkmark.circle.fill" : "circle"}
                                                size={20}
                                                color={selectedTemplateId === template.id ? colors.primary : colors.subtext}
                                            />
                                            <ThemedText style={styles.templateName}>{template.name}</ThemedText>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            <View style={styles.actions}>
                                <Button
                                    title={i18n.t('common.actions.cancel')}
                                    variant="secondary"
                                    onPress={onClose}
                                    style={{ flex: 1 }}
                                />
                                <Button
                                    title={i18n.t('folders.export_modal.download')}
                                    onPress={handleExport}
                                    style={{ flex: 1 }}
                                    disabled={!selectedTemplateId}
                                />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}
