import { ThemedText } from '@/components/themed-text';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import React from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

// Map SF Symbols to emojis for cross-platform support
const sfSymbolToEmoji: Record<string, string> = {
    'person.fill': '👤',
    'briefcase': '💼',
    'briefcase.fill': '💼',
    'house': '🏠',
    'house.fill': '🏠',
    'car': '🚗',
    'car.fill': '🚗',
    'heart': '❤️',
    'heart.fill': '❤️',
    'star': '⭐',
    'star.fill': '⭐',
    'folder': '📁',
    'folder.fill': '📁',
    'doc': '📄',
    'doc.fill': '📄',
    'creditcard': '💳',
    'creditcard.fill': '💳',
    'bag': '🛍️',
    'bag.fill': '🛍️',
    'cart': '🛒',
    'cart.fill': '🛒',
    'gift': '🎁',
    'gift.fill': '🎁',
    'airplane': '✈️',
    'building': '🏢',
    'building.2': '🏢',
};

const getIconDisplay = (icon?: string): string => {
    if (!icon) return '';
    // If it's already an emoji (starts with emoji-like character), return as-is
    if (/^[\u{1F300}-\u{1F9FF}]|^[\u{2600}-\u{26FF}]|^[\u{2700}-\u{27BF}]/u.test(icon)) {
        return icon;
    }
    // Convert SF Symbol to emoji
    return sfSymbolToEmoji[icon] || icon;
};

export interface SelectOption<T = string> {
    label: string;
    value: T;
    icon?: string;
    color?: string;
    description?: string;
}

interface SelectProps<T = string> {
    label: string;
    value: T;
    options: SelectOption<T>[];
    onChange: (value: T) => void;
    placeholder?: string;
    disabled?: boolean;
    hideLabel?: boolean;
    compact?: boolean;
}

export function Select<T = string>({
    label,
    value,
    options,
    onChange,
    placeholder = 'Seçiniz',
    disabled = false,
    hideLabel = false,
    compact = false
}: SelectProps<T>) {
    const { colors } = useSettings();
    const [isOpen, setIsOpen] = React.useState(false);

    const selectedOption = options.find(opt => opt.value === value);

    const styles = React.useMemo(() => StyleSheet.create({
        container: {
            marginBottom: 16,
        },
        compactContainer: {
            marginBottom: 0,
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 8,
            color: colors.text,
        },
        selectButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.inputBackground,
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
        },
        compactSelectButton: {
            padding: 16,
            paddingHorizontal: 12,
        },
        disabled: {
            opacity: 0.5,
        },
        selectContent: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        icon: {
            fontSize: 24,
            marginRight: 12,
            color: colors.text,
        },
        compactIcon: {
            fontSize: 18,
            marginRight: 6,
        },
        selectText: {
            fontSize: 16,
            color: colors.text,
            flex: 1,
        },
        compactSelectText: {
            fontSize: 14,
        },
        placeholder: {
            color: colors.textLight,
        },
        arrow: {
            fontSize: 12,
            color: colors.textLight,
            marginLeft: 8,
        },
        compactArrow: {
            fontSize: 10,
            marginLeft: 4,
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        modalContent: {
            backgroundColor: colors.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '80%',
            paddingBottom: 34,
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.text,
        },
        closeButton: {
            fontSize: 24,
            color: colors.text,
            padding: 4,
        },
        optionsList: {
            padding: 8,
        },
        option: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            borderRadius: 12,
            marginVertical: 4,
            backgroundColor: colors.card,
        },
        selectedOption: {
            backgroundColor: colors.primary + '20',
        },
        optionContent: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        optionIconContainer: {
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
        },
        optionIcon: {
            fontSize: 24,
            color: colors.text,
        },
        optionTextContainer: {
            flex: 1,
        },
        optionLabel: {
            fontSize: 16,
            fontWeight: '500',
            color: colors.text,
            marginBottom: 2,
        },
        optionDescription: {
            fontSize: 12,
            color: colors.textLight,
        },
        checkmark: {
            fontSize: 20,
            color: colors.primary,
            fontWeight: 'bold',
            marginLeft: 8,
        },
    }), [colors]);

    return (
        <View style={[styles.container, compact && styles.compactContainer]}>
            {!hideLabel && <ThemedText style={styles.label}>{label}</ThemedText>}

            <TouchableOpacity
                style={[
                    styles.selectButton,
                    compact && styles.compactSelectButton,
                    disabled && styles.disabled
                ]}
                onPress={() => !disabled && setIsOpen(true)}
                disabled={disabled}
            >
                <View style={styles.selectContent}>
                    {selectedOption?.icon && (
                        <ThemedText style={[styles.icon, compact && styles.compactIcon]}>
                            {getIconDisplay(selectedOption.icon)}
                        </ThemedText>
                    )}
                    <ThemedText
                        style={[
                            styles.selectText,
                            compact && styles.compactSelectText,
                            !selectedOption && styles.placeholder,
                            selectedOption?.color && { color: selectedOption.color }
                        ]}
                        numberOfLines={1}
                    >
                        {selectedOption?.label || placeholder}
                    </ThemedText>
                </View>
                <ThemedText style={[styles.arrow, compact && styles.compactArrow]}>▼</ThemedText>
            </TouchableOpacity>

            <Modal
                visible={isOpen}
                transparent
                animationType="slide"
                onRequestClose={() => setIsOpen(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsOpen(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <ThemedText type="subtitle" style={styles.modalTitle}>
                                {label}
                            </ThemedText>
                            <TouchableOpacity onPress={() => setIsOpen(false)}>
                                <ThemedText style={styles.closeButton}>✕</ThemedText>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.optionsList}>
                            {options.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.option,
                                        option.value === value && styles.selectedOption
                                    ]}
                                    onPress={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                >
                                    <View style={styles.optionContent}>
                                        {option.icon && (
                                            <View style={styles.optionIconContainer}>
                                                <ThemedText style={styles.optionIcon}>
                                                    {getIconDisplay(option.icon)}
                                                </ThemedText>
                                            </View>
                                        )}
                                        <View style={styles.optionTextContainer}>
                                            <ThemedText
                                                style={[
                                                    styles.optionLabel,
                                                    option.color && { color: option.color }
                                                ]}
                                            >
                                                {option.label}
                                            </ThemedText>
                                            {option.description && (
                                                <ThemedText style={styles.optionDescription}>
                                                    {option.description}
                                                </ThemedText>
                                            )}
                                        </View>
                                    </View>
                                    {option.value === value && (
                                        <ThemedText style={styles.checkmark}>✓</ThemedText>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}
