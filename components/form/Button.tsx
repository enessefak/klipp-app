import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, TextStyle, TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
    /** Button text */
    title: string;
    /** Button variant */
    variant?: ButtonVariant;
    /** Button size */
    size?: ButtonSize;
    /** Loading state */
    loading?: boolean;
    /** Icon to show before title */
    icon?: React.ReactNode;
    /** Additional button style */
    style?: ViewStyle;
    /** Additional text style */
    textStyle?: TextStyle;
}

/**
 * Button - Reusable button component with variants
 */
export function Button({
    title,
    variant = 'primary',
    size = 'medium',
    loading,
    disabled,
    icon,
    style,
    textStyle,
    ...props
}: ButtonProps) {
    const { colors } = useSettings();
    const isDisabled = disabled || loading;

    const styles = useMemo(() => StyleSheet.create({
        button: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            gap: 8,
        },
        // Variants
        primary: {
            backgroundColor: colors.primary,
        },
        secondary: {
            backgroundColor: colors.accent,
        },
        outline: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: colors.cardBorder, // Use cardBorder (lighter in dark mode) or keep primary? Let's use border for separation
        },
        ghost: {
            backgroundColor: 'transparent',
        },
        // Sizes
        small: {
            paddingVertical: 8,
            paddingHorizontal: 16,
        },
        medium: {
            paddingVertical: 14,
            paddingHorizontal: 20,
        },
        large: {
            paddingVertical: 18,
            paddingHorizontal: 24,
        },
        // Disabled
        disabled: {
            opacity: 0.6,
        },
        // Text styles
        text: {
            fontWeight: '600',
        },
        primaryText: {
            color: '#FFFFFF', // Always white for primary button
        },
        secondaryText: {
            color: '#FFFFFF',
        },
        outlineText: {
            color: colors.textLight, // Use textLight for better visibility in dark mode than dark blue
        },
        ghostText: {
            color: colors.primary,
        },
        // Text sizes
        smallText: {
            fontSize: 14,
        },
        mediumText: {
            fontSize: 16,
        },
        largeText: {
            fontSize: 18,
        },
    }), [colors]);

    return (
        <TouchableOpacity
            style={[
                styles.button,
                styles[variant],
                styles[size],
                isDisabled && styles.disabled,
                style,
            ]}
            disabled={isDisabled}
            {...props}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' ? '#FFFFFF' : colors.primary}
                    size="small"
                />
            ) : (
                <>
                    {icon}
                    <ThemedText
                        style={[
                            styles.text,
                            styles[`${variant}Text` as keyof typeof styles],
                            styles[`${size}Text` as keyof typeof styles],
                            textStyle,
                        ]}
                    >
                        {title}
                    </ThemedText>
                </>
            )}
        </TouchableOpacity>
    );
}
