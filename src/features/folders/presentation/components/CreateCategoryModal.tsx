
import { Button, FormField, TextInput } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import React, { useMemo, useState } from 'react';
import { Keyboard, Modal, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

interface CreateCategoryDTO {
    name: string;
    accountCode?: string;
}

interface CreateCategoryModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (dto: CreateCategoryDTO) => void;
}

export function CreateCategoryModal({ visible, onClose, onSubmit }: CreateCategoryModalProps) {
    const { colors } = useSettings();
    const [name, setName] = useState('');
    const [accountCode, setAccountCode] = useState('');

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
        actions: {
            flexDirection: 'row',
            gap: 12,
            marginTop: 16
        }
    }), [colors]);

    const handleSubmit = () => {
        if (!name.trim()) return;
        onSubmit({
            name: name.trim(),
            accountCode: accountCode.trim() || undefined
        });
        setName('');
        setAccountCode('');
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
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.container}>
                            <ThemedText style={styles.title}>Yeni Kategori</ThemedText>

                            <FormField label="Kategori Adı">
                                <TextInput
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Örn: Ofis Giderleri"
                                    autoFocus
                                />
                            </FormField>

                            <FormField label="Hesap Kodu (Opsiyonel)">
                                <TextInput
                                    value={accountCode}
                                    onChangeText={setAccountCode}
                                    placeholder="Örn: 770.01.001"
                                    keyboardType="numeric"
                                />
                            </FormField>

                            <View style={styles.actions}>
                                <Button
                                    title={i18n.t('common.actions.cancel')}
                                    variant="secondary"
                                    onPress={onClose}
                                    style={{ flex: 1 }}
                                />
                                <Button
                                    title={i18n.t('common.actions.save')}
                                    onPress={handleSubmit}
                                    style={{ flex: 1 }}
                                    disabled={!name.trim()}
                                />
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}
