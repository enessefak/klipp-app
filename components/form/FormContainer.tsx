import { ReactNode, useMemo } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleProp,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
    ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSettings } from '@/src/features/settings/presentation/SettingsContext';

interface FormContainerProps {
    children: ReactNode;
    /** Use SafeAreaView wrapper (default: true) */
    safeArea?: boolean;
    /** Use ScrollView for long forms (default: true) */
    scrollable?: boolean;
    /** Additional content container style */
    contentStyle?: StyleProp<ViewStyle>;
    /** Keyboard vertical offset for iOS */
    keyboardOffset?: number;
    /** Background color */
    backgroundColor?: string;
}

/**
 * FormContainer - Wraps form content with keyboard avoiding behavior
 * Provides consistent keyboard handling across all forms
 */
export function FormContainer({
    children,
    safeArea = true,
    scrollable = true,
    contentStyle,
    keyboardOffset = 0,
    backgroundColor,
}: FormContainerProps) {
    const { colors } = useSettings();
    const containerBackgroundColor = backgroundColor || colors.background;

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
        },
        keyboardAvoidingView: {
            flex: 1,
        },
        scrollContent: {
            flexGrow: 1,
            padding: 20,
            paddingBottom: 40,
        },
        nonScrollContent: {
            flex: 1,
            padding: 20,
        },
        innerContent: {
            flex: 1,
        },
    }), [colors]);

    const content = (
        <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={keyboardOffset}
        >
            {scrollable ? (
                <ScrollView
                    contentContainerStyle={[styles.scrollContent, contentStyle]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.innerContent}>{children}</View>
                    </TouchableWithoutFeedback>
                </ScrollView>
            ) : (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={[styles.nonScrollContent, contentStyle]}>{children}</View>
                </TouchableWithoutFeedback>
            )}
        </KeyboardAvoidingView>
    );

    if (safeArea) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
                {content}
            </SafeAreaView>
        );
    }

    return <View style={[styles.container, { backgroundColor: containerBackgroundColor }]}>{content}</View>;
}
