import { Button } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Folder } from '@/src/features/folders/domain/Folder';
import { useFolders } from '@/src/features/folders/presentation/useFolders';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { OpenAPI } from '@/src/infrastructure/api/generated/core/OpenAPI';
import { EFaturaService } from '@/src/infrastructure/api/generated/services/EFaturaService';
import i18n from '@/src/infrastructure/localization/i18n';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';


interface ImportEInvoiceModalProps {
    visible: boolean;
    onClose: () => void;

    onSuccess?: () => void;
    initialFolderId?: string;
}

interface ImportFormat {
    code?: string;
    name?: string;
    description?: string;
    extensions?: string[];
    country?: string;
}

export function ImportEInvoiceModal({ visible, onClose, onSuccess, initialFolderId }: ImportEInvoiceModalProps) {
    const { colors } = useSettings();
    const { folders, loading: foldersLoading } = useFolders(undefined, { fetchMode: 'rootOnly' });

    const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
    const [showFolderList, setShowFolderList] = useState(false);
    const [useAutoDetect, setUseAutoDetect] = useState(true);
    const [selectedFormat, setSelectedFormat] = useState<string>('');
    const [formats, setFormats] = useState<ImportFormat[]>([]);
    const [loadingFormats, setLoadingFormats] = useState(false);
    const [file, setFile] = useState<{ uri: string; name: string; size: number } | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    // Load import formats
    useEffect(() => {
        if (visible) {
            loadFormats();
        }
    }, [visible]);

    const loadFormats = async () => {
        setLoadingFormats(true);
        try {
            const response = await EFaturaService.getEInvoicesImportFormats();
            if (response.success && response.data) {
                setFormats(response.data as ImportFormat[]);
            }
        } catch (error) {
            console.error('Failed to load import formats:', error);
        } finally {
            setLoadingFormats(false);
        }
    };

    const handlePickFile = useCallback(async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/xml', 'text/xml', 'application/pdf'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];
                setFile({
                    uri: asset.uri,
                    name: asset.name || 'document',
                    size: asset.size || 0,
                });
            }
        } catch (error) {
            console.error('Document picker error:', error);
        }
    }, []);

    const handleImport = useCallback(async () => {
        if (!file || !selectedFolder) {
            Alert.alert(i18n.t('common.error'), i18n.t('eInvoice.import.selectFolderAndFile'));
            return;
        }

        setIsImporting(true);
        try {
            const format = useAutoDetect ? undefined : selectedFormat;

            // Create FormData with React Native compatible file object
            const formData = new FormData();

            if (Platform.OS === 'web') {
                // On web, we need to fetch the blob from the uri and append it
                const res = await fetch(file.uri);
                const blob = await res.blob();
                formData.append('file', blob, file.name);
            } else {
                formData.append('file', {
                    uri: file.uri,
                    name: file.name,
                    type: file.name.endsWith('.pdf') ? 'application/pdf' : 'application/xml',
                } as any);
            }

            // Build URL with optional format query param
            let url = `${OpenAPI.BASE}/e-invoices/import/${selectedFolder.id}`;
            if (format) {
                url += `?format=${format}`;
            }

            // Get auth token
            const token = typeof OpenAPI.TOKEN === 'function' ? await OpenAPI.TOKEN({} as any) : OpenAPI.TOKEN;

            // Make direct axios request for React Native FormData compatibility
            const response = await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': token ? `Bearer ${token}` : '',
                },
            });

            if (response.data?.success) {
                Alert.alert(
                    i18n.t('common.success'),
                    i18n.t('eInvoice.import.success')
                );
                resetForm();
                onClose();
                onSuccess?.();
            } else {
                throw new Error(response.data?.message || 'Import failed');
            }
        } catch (error: any) {
            console.error('Import error:', error);
            Alert.alert(
                i18n.t('common.error'),
                error?.response?.data?.message || error?.body?.message || error?.message || i18n.t('eInvoice.import.error')
            );
        } finally {
            setIsImporting(false);
        }
    }, [file, selectedFolder, useAutoDetect, selectedFormat, onClose, onSuccess]);



    const resetForm = () => {
        setFile(null);
        setSelectedFormat('');
        setUseAutoDetect(true);
        if (!initialFolderId) {
            setSelectedFolder(null);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSelectFolder = (folder: Folder) => {
        setSelectedFolder(folder);
        setShowFolderList(false);
    };

    const canSubmit = file && selectedFolder && (useAutoDetect || selectedFormat);

    const styles = useMemo(() => StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
        },
        modal: {
            backgroundColor: colors.card,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '90%',
        },
        handle: {
            width: 40,
            height: 4,
            backgroundColor: colors.border,
            borderRadius: 2,
            alignSelf: 'center',
            marginTop: 12,
            marginBottom: 8,
        },
        header: {
            padding: 20,
            paddingTop: 8,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        title: {
            fontSize: 20,
            fontWeight: '600',
            color: colors.text,
        },
        description: {
            fontSize: 14,
            color: colors.subtext,
            marginTop: 4,
        },
        content: {
            padding: 20,
        },
        section: {
            marginBottom: 24,
        },
        sectionLabel: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 12,
        },
        folderPicker: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            backgroundColor: colors.background,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
        },
        folderIcon: {
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: colors.primary + '20',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
        },
        folderInfo: {
            flex: 1,
        },
        folderLabel: {
            fontSize: 12,
            color: colors.subtext,
        },
        folderName: {
            fontSize: 16,
            color: colors.text,
            fontWeight: '500',
        },
        folderList: {
            maxHeight: 200,
            marginTop: 8,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
        },
        folderItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 14,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        folderItemSelected: {
            backgroundColor: colors.primary + '15',
        },
        folderItemName: {
            flex: 1,
            fontSize: 15,
            color: colors.text,
            marginLeft: 12,
        },
        autoDetectRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            backgroundColor: colors.background,
            borderRadius: 12,
            marginBottom: 12,
        },
        autoDetectLabel: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        formatPicker: {
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
        },
        formatOption: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 14,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        formatOptionSelected: {
            backgroundColor: colors.primary + '10',
        },
        formatOptionLast: {
            borderBottomWidth: 0,
        },
        formatName: {
            flex: 1,
            fontSize: 15,
            color: colors.text,
        },
        formatCountry: {
            fontSize: 12,
            color: colors.subtext,
            marginLeft: 8,
        },
        fileDropZone: {
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: colors.border,
            borderRadius: 12,
            padding: 32,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.background,
        },
        fileSelected: {
            borderColor: colors.primary,
            backgroundColor: colors.primary + '08',
        },
        fileIcon: {
            width: 56,
            height: 56,
            borderRadius: 14,
            backgroundColor: colors.card,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
        },
        fileIconSelected: {
            backgroundColor: colors.primary + '20',
        },
        fileName: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 4,
        },
        fileSize: {
            fontSize: 13,
            color: colors.subtext,
        },
        fileHint: {
            fontSize: 14,
            color: colors.subtext,
            textAlign: 'center',
            marginTop: 4,
        },
        footer: {
            flexDirection: 'row',
            padding: 20,
            gap: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        cancelButton: {
            flex: 1,
        },
        submitButton: {
            flex: 1,
        },
    }), [colors]);

    const renderFolderItem = ({ item, index }: { item: Folder; index: number }) => (
        <TouchableOpacity
            style={[
                styles.folderItem,
                selectedFolder?.id === item.id && styles.folderItemSelected,
                index === folders.length - 1 && { borderBottomWidth: 0 }
            ]}
            onPress={() => handleSelectFolder(item)}
        >
            <IconSymbol
                name="folder.fill"
                size={20}
                color={selectedFolder?.id === item.id ? colors.primary : colors.subtext}
            />
            <ThemedText style={styles.folderItemName}>{item.name}</ThemedText>
            {selectedFolder?.id === item.id && (
                <IconSymbol name="checkmark" size={18} color={colors.primary} />
            )}
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <Pressable style={styles.overlay} onPress={handleClose}>
                <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.handle} />

                    <View style={styles.header}>
                        <ThemedText style={styles.title}>{i18n.t('eInvoice.import.title')}</ThemedText>
                        <ThemedText style={styles.description}>{i18n.t('eInvoice.import.description')}</ThemedText>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Folder Selection */}
                        <View style={styles.section}>
                            <ThemedText style={styles.sectionLabel}>{i18n.t('eInvoice.import.folder')}</ThemedText>
                            <TouchableOpacity
                                style={styles.folderPicker}
                                onPress={() => setShowFolderList(!showFolderList)}
                            >
                                <View style={styles.folderIcon}>
                                    <IconSymbol name="folder.fill" size={22} color={colors.primary} />
                                </View>
                                <View style={styles.folderInfo}>
                                    <ThemedText style={styles.folderLabel}>{i18n.t('folders.picker.placeholder')}</ThemedText>
                                    <ThemedText style={styles.folderName}>
                                        {selectedFolder?.name || i18n.t('eInvoice.import.selectFolder')}
                                    </ThemedText>
                                </View>
                                <IconSymbol
                                    name={showFolderList ? "chevron.up" : "chevron.down"}
                                    size={16}
                                    color={colors.subtext}
                                />
                            </TouchableOpacity>

                            {showFolderList && (
                                <View style={styles.folderList}>
                                    {foldersLoading ? (
                                        <View style={{ padding: 20, alignItems: 'center' }}>
                                            <ActivityIndicator color={colors.primary} />
                                        </View>
                                    ) : (
                                        <FlatList
                                            data={folders}
                                            keyExtractor={(item) => item.id}
                                            renderItem={renderFolderItem}
                                            scrollEnabled={false}
                                        />
                                    )}
                                </View>
                            )}
                        </View>

                        {/* Auto Detect */}
                        <View style={styles.section}>
                            <View style={styles.autoDetectRow}>
                                <View style={styles.autoDetectLabel}>
                                    <IconSymbol name="sparkles" size={18} color={colors.primary} />
                                    <ThemedText style={{ fontSize: 15, color: colors.text }}>
                                        {i18n.t('eInvoice.import.autoDetect')}
                                    </ThemedText>
                                </View>
                                <Switch
                                    value={useAutoDetect}
                                    onValueChange={setUseAutoDetect}
                                    trackColor={{ false: colors.border, true: colors.primary }}
                                />
                            </View>

                            {!useAutoDetect && (
                                <View>
                                    <ThemedText style={styles.sectionLabel}>{i18n.t('eInvoice.import.selectFormat')}</ThemedText>
                                    {loadingFormats ? (
                                        <ActivityIndicator color={colors.primary} />
                                    ) : (
                                        <View style={styles.formatPicker}>
                                            {formats.map((format, index) => (
                                                <TouchableOpacity
                                                    key={format.code}
                                                    style={[
                                                        styles.formatOption,
                                                        selectedFormat === format.code && styles.formatOptionSelected,
                                                        index === formats.length - 1 && styles.formatOptionLast,
                                                    ]}
                                                    onPress={() => setSelectedFormat(format.code || '')}
                                                >
                                                    <IconSymbol
                                                        name={selectedFormat === format.code ? "checkmark.circle.fill" : "circle"}
                                                        size={20}
                                                        color={selectedFormat === format.code ? colors.primary : colors.border}
                                                        style={{ marginRight: 12 }}
                                                    />
                                                    <ThemedText style={styles.formatName}>{format.name}</ThemedText>
                                                    <ThemedText style={styles.formatCountry}>({format.country})</ThemedText>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>

                        {/* File Upload */}
                        <View style={styles.section}>
                            <ThemedText style={styles.sectionLabel}>{i18n.t('eInvoice.import.file')}</ThemedText>
                            <TouchableOpacity
                                style={[styles.fileDropZone, file && styles.fileSelected]}
                                onPress={handlePickFile}
                            >
                                <View style={[styles.fileIcon, file && styles.fileIconSelected]}>
                                    <IconSymbol
                                        name={file ? "doc.fill" : "doc.badge.plus"}
                                        size={28}
                                        color={file ? colors.primary : colors.subtext}
                                    />
                                </View>
                                {file ? (
                                    <>
                                        <ThemedText style={styles.fileName}>{file.name}</ThemedText>
                                        <ThemedText style={styles.fileSize}>
                                            {(file.size / 1024).toFixed(1)} KB
                                        </ThemedText>
                                    </>
                                ) : (
                                    <>
                                        <ThemedText style={styles.fileName}>{i18n.t('eInvoice.import.dropFile')}</ThemedText>
                                        <ThemedText style={styles.fileHint}>XML, PDF</ThemedText>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <View style={styles.cancelButton}>
                            <Button
                                title={i18n.t('common.actions.cancel')}
                                onPress={handleClose}
                                variant="outline"
                                disabled={isImporting}
                            />
                        </View>
                        <View style={styles.submitButton}>
                            <Button
                                title={i18n.t('eInvoice.import.action')}
                                onPress={handleImport}
                                loading={isImporting}
                                disabled={!canSubmit}
                            />
                        </View>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
