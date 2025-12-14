import { forwardRef, useMemo } from 'react';
import { TextInput as RNTextInput, TextInputProps as RNTextInputProps, StyleSheet, ViewStyle } from 'react-native';

import { useSettings } from '@/src/features/settings/presentation/SettingsContext';

export interface TextInputProps extends RNTextInputProps {
    /** Whether the input has an error */
    hasError?: boolean;
    /** Additional container style */
    containerStyle?: ViewStyle;
}

/**
 * TextInput - Styled text input component
 * Consistent styling across all forms
 */
export const TextInput = forwardRef<RNTextInput, TextInputProps>(
    ({ hasError, style, containerStyle, ...props }, ref) => {
        const { colors } = useSettings();

        const styles = useMemo(() => StyleSheet.create({
            input: {
                backgroundColor: colors.inputBackground,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: colors.text,
                borderWidth: 1,
                borderColor: colors.border,
            },
            inputError: {
                borderColor: colors.error,
            },
        }), [colors]);

        return (
            <RNTextInput
                ref={ref}
                style={[styles.input, hasError && styles.inputError, style]}
                placeholderTextColor={colors.textLight}
                {...props}
            />
        );
    }
);

TextInput.displayName = 'TextInput';

