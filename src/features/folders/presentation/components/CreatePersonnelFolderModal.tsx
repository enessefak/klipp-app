import { Button, FormField, TextInput } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { FolderService } from '@/src/infrastructure/api/generated/services/FolderService';
import i18n from '@/src/infrastructure/localization/i18n';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, View } from 'react-native';

interface CreatePersonnelFolderModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function CreatePersonnelFolderModal({ visible, onClose, onSuccess }: CreatePersonnelFolderModalProps) {
    const { colors } = useSettings();
    const [personName, setPersonName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = useCallback(async () => {
        if (!personName.trim()) {
            Alert.alert(i18n.t('common.error'), i18n.t('validation.required'));
            return;
        }

        setIsLoading(true);
        try {
            await FolderService.postFoldersTemplates({
                personName: personName.trim(),
                templateType: 'PERSONNEL_FILE'
            });

            Alert.alert(
                i18n.t('common.success'),
                i18n.t('folders.personnelFileCreated')
            );

            setPersonName('');
            onClose();
            onSuccess?.();
        } catch (error) {
            console.error('Failed to create personnel folder:', error);
            Alert.alert(i18n.t('common.error'), i18n.t('common.errorOccurred'));
        } finally {
            setIsLoading(false);
        }
    }, [personName, onClose, onSuccess]);

    const styles = useMemo(() => StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
        },
        modal: {
            backgroundColor: colors.card,
            borderRadius: 16,
            width: '100%',
            maxWidth: 400,
            overflow: 'hidden',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            gap: 12,
        },
        iconContainer: {
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: colors.primary + '20',
            alignItems: 'center',
            justifyContent: 'center',
        },
        title: {
            fontSize: 18,
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
        footer: {
            flexDirection: 'row',
            padding: 16,
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

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <IconSymbol name="person.fill" size={22} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <ThemedText style={styles.title}>{i18n.t('folders.createPersonnelFile')}</ThemedText>
                            <ThemedText style={styles.description}>{i18n.t('folders.createPersonnelFileDesc')}</ThemedText>
                        </View>
                    </View>

                    <View style={styles.content}>
                        <FormField label={i18n.t('common.fullName')}>
                            <TextInput
                                value={personName}
                                onChangeText={setPersonName}
                                placeholder="Ahmet Yılmaz"
                                autoCapitalize="words"
                            />
                        </FormField>
                    </View>

                    <View style={styles.footer}>
                        <View style={styles.cancelButton}>
                            <Button
                                title={i18n.t('common.actions.cancel')}
                                onPress={onClose}
                                variant="outline"
                            />
                        </View>
                        <View style={styles.submitButton}>
                            <Button
                                title={i18n.t('common.actions.create')}
                                onPress={handleSubmit}
                                loading={isLoading}
                                disabled={!personName.trim()}
                            />
                        </View>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
