import React, { useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';

interface CreateGroupModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (name: string) => Promise<void>;
}

export function CreateGroupModal({ visible, onClose, onSubmit }: CreateGroupModalProps) {
    const { colors } = useSettings();
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) return;

        try {
            setLoading(true);
            await onSubmit(name.trim());
            setName('');
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const styles = StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
        },
        container: {
            width: '100%',
            maxWidth: 400,
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
        },
        closeButton: {
            padding: 4,
        },
        inputContainer: {
            marginBottom: 24,
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.text,
            marginBottom: 8,
        },
        input: {
            backgroundColor: colors.background,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: 12,
            fontSize: 16,
            color: colors.text,
        },
        footer: {
            flexDirection: 'row',
            justifyContent: 'flex-end',
            gap: 12,
        },
        button: {
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 8,
            minWidth: 80,
            alignItems: 'center',
        },
        cancelButton: {
            backgroundColor: 'transparent',
        },
        submitButton: {
            backgroundColor: colors.primary,
        },
        cancelText: {
            color: colors.text,
            fontWeight: '600',
        },
        submitText: {
            color: '#fff',
            fontWeight: '600',
        },
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <ThemedText type="subtitle">
                            {/* Fallback to hardcoded if translation missing */}
                            {i18n.t('groups.createTitle') || 'Yeni Grup'}
                        </ThemedText>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <IconSymbol name="xmark" size={20} color={colors.textLight} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{i18n.t('groups.namePlaceholder') || 'Grup Adı'}</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder={i18n.t('groups.createPlaceholder') || 'Örn. Muhasebe Ekibi'}
                            placeholderTextColor={colors.textLight}
                            autoFocus
                        />
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={styles.cancelText}>{i18n.t('common.actions.cancel')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.submitButton, { opacity: loading || !name.trim() ? 0.7 : 1 }]}
                            onPress={handleSubmit}
                            disabled={loading || !name.trim()}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.submitText}>{i18n.t('common.actions.create') || 'Oluştur'}</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
