import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { useCallback } from 'react';
import { ActionSheetIOS, Platform, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
    value: string;
    onSelect: (currency: string) => void;
}

const AVAILABLE_CURRENCIES = ['TRY', 'USD', 'EUR', 'GBP'];

export function CurrencySelect({ value, onSelect }: Props) {
    const { colors } = useSettings();

    const handlePress = useCallback(() => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: [...AVAILABLE_CURRENCIES, 'Cancel'],
                    cancelButtonIndex: AVAILABLE_CURRENCIES.length,
                    title: 'Select Currency',
                },
                (buttonIndex) => {
                    if (buttonIndex < AVAILABLE_CURRENCIES.length) {
                        onSelect(AVAILABLE_CURRENCIES[buttonIndex]);
                    }
                }
            );
        } else {
            // Simple fallback logic or distinct android picker could go here
            // For now, simple toggle loop for MVP
            const currentIndex = AVAILABLE_CURRENCIES.indexOf(value);
            const nextIndex = (currentIndex + 1) % AVAILABLE_CURRENCIES.length;
            onSelect(AVAILABLE_CURRENCIES[nextIndex]);
        }
    }, [value, onSelect]);

    return (
        <TouchableOpacity onPress={handlePress} style={[styles.container, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
            <ThemedText style={{ color: colors.text }}>{value}</ThemedText>
            <IconSymbol name="chevron.down" size={16} color={colors.textLight} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    }
});
