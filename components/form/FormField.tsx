import { ReactNode } from 'react';
import { StyleSheet, TextStyle, View, ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/src/infrastructure/theme/Colors';

interface FormFieldProps {
    /** Field label */
    label?: string;
    /** Whether the field is required (shows asterisk) */
    required?: boolean;
    /** Error message to display */
    error?: string;
    /** Helper text below the field */
    helperText?: string;
    /** The form input element */
    children: ReactNode;
    /** Additional container style */
    style?: ViewStyle;
    /** Additional label style */
    labelStyle?: TextStyle;
}

/**
 * FormField - Wrapper component for form inputs
 * Provides consistent styling for label, error message, and helper text
 */
export function FormField({
    label,
    required,
    error,
    helperText,
    children,
    style,
    labelStyle,
}: FormFieldProps) {
    return (
        <View style={[styles.container, style]}>
            {label && (
                <ThemedText style={[styles.label, labelStyle]}>
                    {label} {required && <ThemedText style={styles.required}>*</ThemedText>}
                </ThemedText>
            )}
            {children}
            {error && <ThemedText style={styles.error}>{error}</ThemedText>}
            {helperText && !error && <ThemedText style={styles.helperText}>{helperText}</ThemedText>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 8,
    },
    required: {
        color: Colors.error,
    },
    error: {
        fontSize: 12,
        color: Colors.error,
        marginTop: 4,
    },
    helperText: {
        fontSize: 12,
        color: Colors.textLight,
        marginTop: 4,
    },
});
