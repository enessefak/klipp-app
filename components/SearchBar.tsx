import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from './themed-text';

interface SearchBarProps {
    value?: string;
    onChangeText?: (text: string) => void;
    onSearch?: (text: string) => void;
    onFilterPress?: () => void;
    onClear?: () => void;
    debounceMs?: number;
    filterCount?: number;
    placeholder?: string;
}

export function SearchBar({
    value,
    onChangeText,
    onSearch,
    onFilterPress,
    onClear,
    debounceMs = 500,
    filterCount = 0,
    placeholder,
}: SearchBarProps) {
    const { colors } = useSettings();
    const [localValue, setLocalValue] = useState(value || '');

    useEffect(() => {
        if (value !== undefined) {
            setLocalValue(value);
        }
    }, [value]);

    // Debounced search
    useEffect(() => {
        if (!onSearch) return;

        const timer = setTimeout(() => {
            onSearch(localValue);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [localValue, onSearch, debounceMs]);

    const handleChangeText = useCallback((text: string) => {
        setLocalValue(text);
        onChangeText?.(text);
    }, [onChangeText]);

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.inputBackground,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
            borderWidth: 1,
            borderColor: colors.border
        },
        searchIcon: {
            marginRight: 8,
        },
        input: {
            flex: 1,
            fontSize: 16,
            color: colors.text,
        },
        clearButton: {
            padding: 4,
            marginRight: 4,
        },
        filterButton: {
            padding: 4,
            position: 'relative',
        },
        filterBadge: {
            position: 'absolute',
            top: -5,
            right: -5,
            backgroundColor: colors.primary,
            borderRadius: 9,
            minWidth: 18,
            height: 18,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 4,
            borderWidth: 2,
            borderColor: colors.inputBackground, // Add border to separate from icon/bg
        },
        filterBadgeText: {
            color: colors.white,
            fontSize: 10,
            fontWeight: 'bold',
            textAlign: 'center',
            lineHeight: 12,
        },
    }), [colors]);

    return (
        <View style={styles.container}>
            <View style={styles.searchIcon}>
                <IconSymbol name="magnifyingglass" size={20} color={colors.gray} />
            </View>
            <TextInput
                style={styles.input}
                placeholder={placeholder || i18n.t('receipts.home.searchPlaceholder')}
                placeholderTextColor={colors.gray}
                value={localValue}
                onChangeText={handleChangeText}
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
            />
            {localValue.length > 0 && (
                <TouchableOpacity
                    onPress={() => {
                        handleChangeText('');
                        onClear?.();
                    }}
                    style={styles.clearButton}
                >
                    <IconSymbol name="xmark.circle.fill" size={18} color={colors.gray} />
                </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onFilterPress} style={styles.filterButton}>
                <IconSymbol
                    name="slider.horizontal.3"
                    size={22}
                    color={filterCount > 0 ? colors.primary : colors.subtext}
                />
                {filterCount > 0 && (
                    <View style={styles.filterBadge}>
                        <ThemedText style={styles.filterBadgeText}>{filterCount}</ThemedText>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
}
