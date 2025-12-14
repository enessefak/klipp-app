
import { Button, FormField, TextInput } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import React, { useMemo, useState } from 'react';
import { Keyboard, Modal, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { CreateFolderDTO } from '../../domain/Folder';

// Predefined Options
const ICONS = ['folder.fill', 'briefcase.fill', 'house.fill', 'star.fill', 'heart.fill', 'tag.fill'];
const COLORS = [
    '#4DABF7', // Cyan
    '#1C2A4E', // Navy
    '#FF9500', // Orange
    '#FF3B30', // Red
    '#34C759', // Green
    '#AF52DE', // Purple
];

interface CreateFolderModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (dto: CreateFolderDTO) => void;
    parentId: string | null;
}

export function CreateFolderModal({ visible, onClose, onSubmit, parentId }: CreateFolderModalProps) {
    const { colors } = useSettings();
    const [name, setName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);

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
        label: {
            fontSize: 14,
            color: colors.textLight,
            marginTop: 8,
            marginBottom: 8
        },
        grid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12
        },
        iconOption: {
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: colors.background,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border
        },
        selectedOption: {
            backgroundColor: colors.primary,
            borderColor: colors.primary
        },
        colorOption: {
            width: 44,
            height: 44,
            borderRadius: 22,
        },
        selectedColorOption: {
            borderWidth: 3,
            borderColor: colors.white,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
        actions: {
            flexDirection: 'row',
            gap: 12,
            marginTop: 16
        },
        actionButton: {
            flex: 1
        },
    }), [colors]);

    const handleSubmit = () => {
        if (!name.trim()) return;

        onSubmit({
            name,
            icon: selectedIcon,
            color: selectedColor,
            parentId: parentId
        });

        // Reset and close
        setName('');
        setSelectedIcon(ICONS[0]);
        setSelectedColor(COLORS[0]);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.overlay}>
                    <View style={styles.container}>
                        <ThemedText type="subtitle" style={styles.title}>Yeni Klasör Oluştur</ThemedText>

                        <FormField label="Klasör Adı" required>
                            <TextInput
                                placeholder="Klasör adı girin"
                                value={name}
                                onChangeText={setName}
                            // We might need to handle TextInput coloring if it's default
                            />
                        </FormField>

                        <ThemedText style={styles.label}>İkon Seç</ThemedText>
                        <View style={styles.grid}>
                            {ICONS.map(icon => (
                                <TouchableOpacity
                                    key={icon}
                                    onPress={() => setSelectedIcon(icon)}
                                    style={[
                                        styles.iconOption,
                                        selectedIcon === icon && styles.selectedOption
                                    ]}
                                >
                                    <IconSymbol name={icon as any} size={24} color={selectedIcon === icon ? colors.white : colors.text} />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <ThemedText style={styles.label}>Renk Seç</ThemedText>
                        <View style={styles.grid}>
                            {COLORS.map(color => (
                                <TouchableOpacity
                                    key={color}
                                    onPress={() => setSelectedColor(color)}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: color },
                                        selectedColor === color && styles.selectedColorOption
                                    ]}
                                />
                            ))}
                        </View>

                        <View style={styles.actions}>
                            <Button
                                title="İptal"
                                variant="outline"
                                onPress={onClose}
                                style={styles.actionButton}
                            />
                            <Button
                                title="Oluştur"
                                onPress={handleSubmit}
                                style={styles.actionButton}
                                disabled={!name.trim()}
                            />
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}
