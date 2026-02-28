import { GoogleSignInButton } from '@/src/features/auth/presentation/components/GoogleSignInButton';
import { zodResolver } from '@hookform/resolvers/zod';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Image, Keyboard, KeyboardAvoidingView, Modal, Platform, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View, useColorScheme } from 'react-native';
import { z } from 'zod';

import { Button, FormContainer, FormField, TextInput } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/src/features/auth/presentation/useAuth';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { ApiError } from '@/src/infrastructure/api/generated/core/ApiError';
import { UserService } from '@/src/infrastructure/api/generated/services/UserService';
import i18n from '@/src/infrastructure/localization/i18n';

// Logo import
const logo = require('@/assets/images/logo.png');

const loginSchema = z.object({
    email: z.string().email(i18n.t('validation.invalidEmail')),
    password: z.string().min(6, i18n.t('validation.passwordMin')),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginScreen() {
    const { colors } = useSettings();
    const colorScheme = useColorScheme();
    const { login, loginWithApple } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAppleLoading, setIsAppleLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { control, handleSubmit, formState: { errors }, watch } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });
    const [isForgotVisible, setIsForgotVisible] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [isSendingReset, setIsSendingReset] = useState(false);
    const emailValue = watch('email');

    const onSubmit = async (data: LoginFormData) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await login(data.email, data.password);
        } catch (err: any) {
            console.error(err);
            setError(i18n.t('auth.login.errorGeneric'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAppleSignIn = async () => {
        setIsAppleLoading(true);
        setError(null);
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            if (credential.identityToken) {
                await loginWithApple(credential.identityToken, {
                    email: credential.email ?? undefined,
                    name: credential.fullName ? {
                        firstName: credential.fullName.givenName ?? undefined,
                        lastName: credential.fullName.familyName ?? undefined,
                    } : undefined,
                });
            } else {
                throw new Error('No identity token received');
            }
        } catch (err: any) {
            console.error('Apple Sign-In error:', err);
            if (err.code !== 'ERR_REQUEST_CANCELED') {
                setError(i18n.t('auth.login.errorGeneric'));
            }
        } finally {
            setIsAppleLoading(false);
        }
    };

    const styles = useMemo(() => StyleSheet.create({
        content: {
            paddingTop: Platform.OS === 'android' ? 60 : 20,
            paddingBottom: 40,
            paddingHorizontal: 24,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 15,
            gap: 16,
            // justifyContent: 'center', // Removed to align left
        },
        logo: {
            width: 48,
            height: 48,
            borderRadius: 12,
        },
        headerText: {
            justifyContent: 'center',
        },
        title: {
            fontSize: 28,
            fontWeight: '800',
            color: colors.text,
            textAlign: 'left',
            letterSpacing: -0.5,
            lineHeight: 32,
        },
        subtitle: {
            fontSize: 15,
            color: colors.textLight,
            textAlign: 'left',
            lineHeight: 20,
        },
        form: {
            gap: 0,
        },
        globalError: {
            color: colors.error,
            textAlign: 'center',
            marginBottom: 8,
            backgroundColor: colors.error + '15',
            padding: 12,
            borderRadius: 8,
            overflow: 'hidden',
        },
        submitButton: {
            marginTop: 8,
            minHeight: 56,
            borderRadius: 16,
        },
        dividerContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 10,
        },
        divider: {
            flex: 1,
            height: 1,
            backgroundColor: colors.border,
        },
        dividerText: {
            marginHorizontal: 16,
            color: colors.textLight,
            fontSize: 14,
            fontWeight: '500',
        },
        appleButton: {
            height: 52,
            width: '100%',
            marginTop: 10,
        },
        footer: {
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 16,
            marginBottom: 8,
        },
        footerText: {
            color: colors.textLight,
            fontSize: 14,
        },
        footerLink: {
            color: colors.primary,
            fontWeight: '700',
            fontSize: 14,
        },
        actionsRow: {
            alignItems: 'flex-end',
            marginTop: 4,
        },
        forgotButton: {
            paddingVertical: 8,
        },
        forgotText: {
            color: colors.primary,
            fontSize: 13,
            fontWeight: '600',
        },
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.45)',
            justifyContent: 'flex-end',
        },
        modalCard: {
            backgroundColor: colors.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 32,
            borderTopWidth: 1,
            borderColor: colors.cardBorder,
            gap: 16,
        },
        modalHandle: {
            width: 48,
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.border,
            alignSelf: 'center',
            marginBottom: 12,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: colors.text,
        },
        modalDescription: {
            color: colors.textLight,
            fontSize: 14,
        },
        modalActions: {
            flexDirection: 'row',
            gap: 12,
        },
        modalButton: {
            flex: 1,
        },
    }), [colors]);

    const openForgotPassword = () => {
        setForgotEmail(emailValue || '');
        setIsForgotVisible(true);
    };

    const closeForgotPassword = () => {
        if (isSendingReset) return;
        setIsForgotVisible(false);
    };

    const handleForgotPassword = async () => {
        const email = forgotEmail.trim();
        if (!email) {
            Alert.alert(i18n.t('auth.login.forgotPasswordTitle'), i18n.t('auth.login.forgotPasswordMissingEmail'));
            return;
        }

        setIsSendingReset(true);
        try {
            await UserService.postUsersForgotPassword({ email });
            Alert.alert(i18n.t('auth.login.forgotPasswordTitle'), i18n.t('auth.login.forgotPasswordSuccess'));
            setIsForgotVisible(false);
        } catch (error) {
            console.error('Forgot password error', error);
            const fallbackMessage = i18n.t('auth.login.forgotPasswordError');
            if (error instanceof ApiError) {
                const serverMessage = error.body?.message || fallbackMessage;
                Alert.alert(i18n.t('auth.login.forgotPasswordTitle'), serverMessage);
            } else {
                Alert.alert(i18n.t('auth.login.forgotPasswordTitle'), fallbackMessage);
            }
        } finally {
            setIsSendingReset(false);
        }
    };

    return (
        <>
        <FormContainer
            scrollable={true}
            backgroundColor={colors.background}
            contentStyle={styles.content}
        >
            <View style={styles.header}>
                <Image source={logo} style={styles.logo} resizeMode="contain" />
                <View style={styles.headerText}>
                    <ThemedText style={styles.title}>
                        {i18n.t('auth.login.title')}
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>
                        {i18n.t('auth.login.subtitle')}
                    </ThemedText>
                </View>
            </View>

            <View style={styles.form}>
                {/* Social Login - Moved to top for visibility */}
                <GoogleSignInButton />

                {Platform.OS === 'ios' && (
                    <AppleAuthentication.AppleAuthenticationButton
                        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                        buttonStyle={
                            colorScheme === 'dark'
                                ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
                                : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                        }
                        cornerRadius={12}
                        style={styles.appleButton}
                        onPress={handleAppleSignIn}
                    />
                )}

                <View style={styles.dividerContainer}>
                    <View style={styles.divider} />
                    <ThemedText style={styles.dividerText}>{i18n.t('auth.login.orDivider')}</ThemedText>
                    <View style={styles.divider} />
                </View>

                <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <FormField
                            label={i18n.t('auth.login.emailLabel')}
                            error={errors.email?.message}
                        >
                            <TextInput
                                placeholder={i18n.t('auth.login.emailPlaceholder')}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                hasError={!!errors.email}
                            />
                        </FormField>
                    )}
                />

                <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <FormField
                            label={i18n.t('auth.login.passwordLabel')}
                            error={errors.password?.message}
                        >
                            <TextInput
                                placeholder={i18n.t('auth.login.passwordPlaceholder')}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                secureTextEntry
                                hasError={!!errors.password}
                            />
                        </FormField>
                    )}
                />

                <View style={styles.actionsRow}>
                    <TouchableOpacity onPress={openForgotPassword} style={styles.forgotButton}>
                        <ThemedText style={styles.forgotText}>{i18n.t('auth.login.forgotPasswordLink')}</ThemedText>
                    </TouchableOpacity>
                </View>

                {error && <ThemedText style={styles.globalError}>{error}</ThemedText>}

                <Button
                    title={i18n.t('auth.login.submitButton')}
                    onPress={handleSubmit(onSubmit)}
                    loading={isSubmitting}
                    size="large"
                    style={styles.submitButton}
                />

                <View style={styles.footer}>
                    <ThemedText style={styles.footerText}>
                        {i18n.t('auth.login.footerText')}{' '}
                    </ThemedText>
                    <TouchableOpacity onPress={() => require('expo-router').router.push('/(auth)/signup')}>
                        <ThemedText style={styles.footerLink}>
                            {i18n.t('auth.login.footerLink')}
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        </FormContainer>

        <Modal
            visible={isForgotVisible}
            animationType="slide"
            transparent
            onRequestClose={closeForgotPassword}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                        <View style={styles.modalCard}>
                            <View style={styles.modalHandle} />
                            <ThemedText style={styles.modalTitle}>{i18n.t('auth.login.forgotPasswordTitle')}</ThemedText>
                            <ThemedText style={styles.modalDescription}>{i18n.t('auth.login.forgotPasswordDescription')}</ThemedText>
                            <TextInput
                                placeholder={i18n.t('auth.login.forgotPasswordEmailPlaceholder')}
                                value={forgotEmail}
                                onChangeText={setForgotEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                            <View style={styles.modalActions}>
                                <Button
                                    title={i18n.t('auth.login.forgotPasswordCancel')}
                                    variant="ghost"
                                    onPress={closeForgotPassword}
                                    disabled={isSendingReset}
                                    style={styles.modalButton}
                                />
                                <Button
                                    title={i18n.t('auth.login.forgotPasswordSubmit')}
                                    onPress={handleForgotPassword}
                                    loading={isSendingReset}
                                    style={styles.modalButton}
                                />
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
        </>
    );
}
