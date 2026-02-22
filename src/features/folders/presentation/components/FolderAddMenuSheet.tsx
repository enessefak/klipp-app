import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

interface FolderAddMenuSheetProps {
    visible: boolean;
    onClose: () => void;
    onCreateFolder: () => void;
    onCreatePersonnelFile: () => void;
    onImportPress?: () => void;
    folderId?: string;
}

interface MenuOption {
    key: string;
    icon: string;
    label: string;
    description?: string;
    onPress: () => void;
    section?: 'folder' | 'document';
}

export function FolderAddMenuSheet({
    visible,
    onClose,
    onCreateFolder,
    onCreatePersonnelFile,
    onImportPress,
    folderId,
}: FolderAddMenuSheetProps) {
    const { colors } = useSettings();
    const router = useRouter();

    const menuOptions: MenuOption[] = useMemo(() => [
        // Folder options
        {
            key: 'folder',
            icon: 'folder.badge.plus',
            label: i18n.t('folders.createFolder'),
            section: 'folder',
            onPress: () => {
                onClose();
                onCreateFolder();
            },
        },
        {
            key: 'personnel',
            icon: 'person.crop.rectangle.stack',
            label: i18n.t('folders.createPersonnelFile'),
            section: 'folder',
            onPress: () => {
                onClose();
                onCreatePersonnelFile();
            },
        },
        // Document options
        {
            key: 'scan',
            icon: 'doc.viewfinder',
            label: i18n.t('addMenu.scanUpload'),
            description: i18n.t('addMenu.scanUploadDesc'),
            section: 'document',
            onPress: () => {
                onClose();
                if (folderId) {
                    router.push({ pathname: '/scan', params: { folderId } });
                } else {
                    router.push('/scan');
                }
            },
        },
        {
            key: 'manual',
            icon: 'doc.badge.plus',
            label: i18n.t('addMenu.manualRecord'),
            description: i18n.t('addMenu.manualRecordDesc'),
            section: 'document',
            onPress: () => {
                onClose();
                if (folderId) {
                    router.push({ pathname: '/attachment/create' as any, params: { folderId } });
                } else {
                    router.push('/attachment/create' as any);
                }
            },
        },
        {
            key: 'import',
            icon: 'square.and.arrow.down',
            label: i18n.t('addMenu.import'),
            description: i18n.t('addMenu.importDesc'),
            section: 'document',
            onPress: () => {
                onClose();
                onImportPress?.();
            },
        },
    ], [onClose, onCreateFolder, onCreatePersonnelFile, onImportPress, folderId, router]);

    const styles = useMemo(() => StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
        },
        sheet: {
            backgroundColor: colors.card,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 12,
            paddingBottom: 40,
            paddingHorizontal: 16,
            maxHeight: '80%',
        },
        handle: {
            width: 40,
            height: 4,
            backgroundColor: colors.border,
            borderRadius: 2,
            alignSelf: 'center',
            marginBottom: 16,
        },
        title: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 16,
            paddingHorizontal: 4,
        },
        optionsContainer: {
            gap: 8,
        },
        sectionTitle: {
            fontSize: 12,
            fontWeight: '600',
            color: colors.subtext,
            textTransform: 'uppercase',
            marginTop: 12,
            marginBottom: 8,
            paddingHorizontal: 4,
        },
        option: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            backgroundColor: colors.background,
            borderRadius: 12,
            gap: 16,
        },
        iconContainer: {
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: colors.primary + '15',
            alignItems: 'center',
            justifyContent: 'center',
        },
        optionContent: {
            flex: 1,
        },
        optionLabel: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
        },
        optionDesc: {
            fontSize: 13,
            color: colors.subtext,
            marginTop: 2,
        },
        chevron: {
            marginLeft: 8,
        },
    }), [colors]);

    const folderOptions = menuOptions.filter(o => o.section === 'folder');
    const documentOptions = menuOptions.filter(o => o.section === 'document');

    const renderOption = (option: MenuOption) => (
        <TouchableOpacity
            key={option.key}
            style={styles.option}
            onPress={option.onPress}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                <IconSymbol name={option.icon as any} size={24} color={colors.primary} />
            </View>
            <View style={styles.optionContent}>
                <ThemedText style={styles.optionLabel}>{option.label}</ThemedText>
                {option.description && (
                    <ThemedText style={styles.optionDesc}>{option.description}</ThemedText>
                )}
            </View>
            <IconSymbol name="chevron.right" size={16} color={colors.subtext} style={styles.chevron} />
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.handle} />
                    <ThemedText style={styles.title}>{i18n.t('folders.add')}</ThemedText>

                    <View style={styles.optionsContainer}>
                        <ThemedText style={styles.sectionTitle}>{i18n.t('folders.title')}</ThemedText>
                        {folderOptions.map(renderOption)}

                        {/* Document options */}
                        <ThemedText style={styles.sectionTitle}>{i18n.t('receipts.home.title')}</ThemedText>
                        {documentOptions.map(renderOption)}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
