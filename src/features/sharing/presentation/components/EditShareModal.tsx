import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import { FolderShare } from '../../domain/FolderShare';

interface EditShareModalProps {
    visible: boolean;
    onClose: () => void;
    share: FolderShare | null;
    onUpdate: (shareId: string, permission: FolderShare['permission']) => Promise<void>;
    onRemove: (shareId: string) => Promise<void>;
}

export function EditShareModal({ visible, onClose, share, onUpdate, onRemove }: EditShareModalProps) {
    const { colors } = useSettings();
    const [loading, setLoading] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState<FolderShare['permission']>('VIEW');

    // Reset state when share changes
    React.useEffect(() => {
        if (share) {
            setSelectedPermission(share.permission);
        }
    }, [share]);

    const handleSave = async () => {
        if (!share) return;
        try {
            setLoading(true);
            await onUpdate(share.id, selectedPermission);
            onClose();
        } catch (error) {
            Alert.alert(i18n.t('common.error'), i18n.t('folders.sharing.actions.update_error'));
        } finally {
            setLoading(false);
        }
    };


    const handleRemove = () => {
        if (!share) return;
        Alert.alert(
            i18n.t('folders.sharing.actions.remove_title'),
            i18n.t('folders.sharing.actions.remove_message', { name: share.sharedWith.name }),
            [
                { text: i18n.t('common.actions.cancel'), style: 'cancel' },
                {
                    text: i18n.t('common.actions.delete'),
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await onRemove(share.id);
                            onClose();
                        } catch (error) {
                            Alert.alert(i18n.t('common.error'), i18n.t('folders.sharing.actions.remove_error'));
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    if (!share) return null;

    const styles = StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
        },
        content: {
            backgroundColor: colors.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            paddingBottom: 40,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
        },
        title: {
            fontSize: 20,
            fontWeight: '600',
            color: colors.text,
        },
        closeButton: {
            padding: 4,
        },
        userInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 24,
            padding: 16,
            backgroundColor: colors.background,
            borderRadius: 12,
        },
        avatar: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16,
        },
        avatarText: {
            color: colors.white,
            fontSize: 20,
            fontWeight: '600',
        },
        userDetails: {
            flex: 1,
        },
        userName: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
        },
        userEmail: {
            fontSize: 14,
            color: colors.gray,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 12,
        },
        permissionOptions: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginBottom: 32,
            gap: 12,
        },
        option: {
            width: '48%', // Grid layout
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            minHeight: 100,
            justifyContent: 'center',
        },
        optionSelected: {
            borderColor: colors.primary,
            backgroundColor: colors.primary + '10',
        },
        optionTitle: {
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 4,
            color: colors.text,
        },
        optionDesc: {
            fontSize: 12,
            color: colors.gray,
            textAlign: 'center',
        },
        saveButton: {
            backgroundColor: colors.primary,
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 12,
        },
        saveButtonText: {
            color: colors.white,
            fontSize: 16,
            fontWeight: '600',
        },
        removeButton: {
            padding: 16,
            borderRadius: 12,
            alignItems: 'center',
            backgroundColor: colors.error + '10',
        },
        removeButtonText: {
            color: colors.error,
            fontSize: 16,
            fontWeight: '600',
        },
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <View style={styles.content} onStartShouldSetResponder={() => true}>
                    <View style={styles.header}>
                        <ThemedText style={styles.title}>{i18n.t('folders.sharing.edit_title')}</ThemedText>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <IconSymbol name="xmark" size={24} color={colors.gray} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.userInfo}>
                        <View style={styles.avatar}>
                            <ThemedText style={styles.avatarText}>
                                {share.sharedWith.name.charAt(0).toUpperCase()}
                            </ThemedText>
                        </View>
                        <View style={styles.userDetails}>
                            <ThemedText style={styles.userName}>{share.sharedWith.name}</ThemedText>
                            <ThemedText style={styles.userEmail}>{share.sharedWith.email}</ThemedText>
                        </View>
                    </View>

                    <ThemedText style={styles.sectionTitle}>{i18n.t('folders.sharing.permission_label')}</ThemedText>
                    <View style={styles.permissionOptions}>
                        <TouchableOpacity
                            style={[styles.option, selectedPermission === 'VIEW' && styles.optionSelected]}
                            onPress={() => setSelectedPermission('VIEW')}
                        >
                            <ThemedText style={[styles.optionTitle, selectedPermission === 'VIEW' && { color: colors.primary }]}>
                                {i18n.t('folders.sharing.roles.viewer')}
                            </ThemedText>
                            <ThemedText style={styles.optionDesc}>
                                {i18n.t('folders.sharing.roles.viewer_desc')}
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.option, selectedPermission === 'EDIT' && styles.optionSelected]}
                            onPress={() => setSelectedPermission('EDIT')}
                        >
                            <ThemedText style={[styles.optionTitle, selectedPermission === 'EDIT' && { color: colors.primary }]}>
                                {i18n.t('folders.sharing.roles.editor')}
                            </ThemedText>
                            <ThemedText style={styles.optionDesc}>
                                {i18n.t('folders.sharing.roles.editor_desc')}
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.option, selectedPermission === 'CREATE' && styles.optionSelected]}
                            onPress={() => setSelectedPermission('CREATE')}
                        >
                            <ThemedText style={[styles.optionTitle, selectedPermission === 'CREATE' && { color: colors.primary }]}>
                                {i18n.t('sharing.modal.roles.create')}
                            </ThemedText>
                            <ThemedText style={styles.optionDesc}>
                                {i18n.t('folders.sharing.roles.create_desc')}
                            </ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.option, selectedPermission === 'FULL' && styles.optionSelected]}
                            onPress={() => setSelectedPermission('FULL')}
                        >
                            <ThemedText style={[styles.optionTitle, selectedPermission === 'FULL' && { color: colors.primary }]}>
                                {i18n.t('sharing.modal.roles.full')}
                            </ThemedText>
                            <ThemedText style={styles.optionDesc}>
                                {i18n.t('folders.sharing.roles.full_desc')}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color={colors.primary} />
                    ) : (
                        <>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <ThemedText style={styles.saveButtonText}>{i18n.t('common.actions.save')}</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.removeButton} onPress={handleRemove}>
                                <ThemedText style={styles.removeButtonText}>{i18n.t('folders.sharing.actions.remove_access')}</ThemedText>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </TouchableOpacity>
        </Modal>
    );
}
