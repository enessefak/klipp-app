import { Button, FormContainer, FormField, TextInput } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { ApiError } from '@/src/infrastructure/api/generated/core/ApiError';
import { UserService } from '@/src/infrastructure/api/generated/services/UserService';
import i18n from '@/src/infrastructure/localization/i18n';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Platform, StyleSheet, View } from 'react-native';
import { z } from 'zod';

const resetPasswordSchema = z.object({
    password: z.string().min(6, i18n.t('validation.passwordMin')),
    confirmPassword: z.string().min(6, i18n.t('validation.passwordMin')),
}).refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: i18n.t('auth.resetPassword.passwordMismatch'),
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordScreen() {
    const { colors } = useSettings();
    const params = useLocalSearchParams<{ token?: string | string[] }>();
    const rawToken = params.token;
    const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;
    const hasToken = Boolean(token);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const { control, handleSubmit, formState: { errors }, reset } = useForm<ResetPasswordForm>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    const styles = useMemo(() => StyleSheet.create({
        content: {
            paddingTop: Platform.OS === 'android' ? 60 : 40,
            paddingBottom: 40,
            paddingHorizontal: 24,
            gap: 24,
        },
        header: {
            gap: 8,
        },
        title: {
            fontSize: 28,
            fontWeight: '800',
            color: colors.text,
            letterSpacing: -0.5,
        },
        subtitle: {
            color: colors.textLight,
            fontSize: 15,
            lineHeight: 20,
        },
        banner: {
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            gap: 6,
        },
        bannerTitle: {
            fontSize: 16,
            fontWeight: '700',
            color: colors.text,
        },
        bannerText: {
            color: colors.textLight,
            fontSize: 14,
        },
        form: {
            gap: 16,
        },
        submitButton: {
            marginTop: 8,
        },
        secondaryButton: {
            marginTop: 4,
        },
        errorText: {
            color: colors.error,
            backgroundColor: colors.error + '12',
            borderRadius: 12,
            padding: 12,
            fontSize: 14,
        },
        statusCard: {
            alignItems: 'center',
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 24,
            gap: 12,
            borderWidth: 1,
            borderColor: colors.cardBorder,
            marginTop: 16,
        },
        iconCircle: {
            width: 72,
            height: 72,
            borderRadius: 36,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primary + '22',
            marginBottom: 4,
        },
        statusTitle: {
            fontSize: 22,
            fontWeight: '700',
            color: colors.text,
            textAlign: 'center',
        },
        statusText: {
            color: colors.textLight,
            fontSize: 15,
            textAlign: 'center',
            lineHeight: 22,
        },
    }), [colors]);

    const handleResetPassword = async (formValues: ResetPasswordForm) => {
        if (!token) {
            setServerError(i18n.t('auth.resetPassword.tokenMissing'));
            return;
        }

        setIsSubmitting(true);
        setServerError(null);
        try {
            await UserService.postUsersResetPassword({
                token,
                newPassword: formValues.password,
            });
            reset();
            setIsSuccess(true);
        } catch (error) {
            console.error('Reset password error', error);
            const fallbackMessage = i18n.t('auth.resetPassword.errorGeneric');
            if (error instanceof ApiError) {
                const serverMessage = error.body?.message || fallbackMessage;
                setServerError(serverMessage);
            } else {
                setServerError(fallbackMessage);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const navigateToLogin = () => {
        router.replace('/(auth)/login');
    };

    return (
        <FormContainer
            scrollable
            backgroundColor={colors.background}
            contentStyle={styles.content}
        >
            <View style={styles.header}>
                <ThemedText style={styles.title}>{i18n.t('auth.resetPassword.title')}</ThemedText>
                <ThemedText style={styles.subtitle}>{i18n.t('auth.resetPassword.subtitle')}</ThemedText>
            </View>

            {!isSuccess && !hasToken && (
                <View style={styles.banner}>
                    <ThemedText style={styles.bannerTitle}>{i18n.t('auth.resetPassword.invalidLinkTitle')}</ThemedText>
                    <ThemedText style={styles.bannerText}>{i18n.t('auth.resetPassword.invalidLinkDescription')}</ThemedText>
                </View>
            )}

            {serverError && !isSuccess && (
                <ThemedText style={styles.errorText}>{serverError}</ThemedText>
            )}

            {isSuccess ? (
                <View style={styles.statusCard}>
                    <View style={styles.iconCircle}>
                        <IconSymbol name="checkmark.seal.fill" size={32} color={colors.primary} />
                    </View>
                    <ThemedText style={styles.statusTitle}>{i18n.t('auth.resetPassword.successTitle')}</ThemedText>
                    <ThemedText style={styles.statusText}>{i18n.t('auth.resetPassword.successDescription')}</ThemedText>
                    <Button
                        title={i18n.t('auth.resetPassword.backToLogin')}
                        onPress={navigateToLogin}
                        style={styles.submitButton}
                    />
                </View>
            ) : (
                <View style={styles.form}>
                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <FormField
                                label={i18n.t('auth.resetPassword.passwordLabel')}
                                error={errors.password?.message}
                            >
                                <TextInput
                                    placeholder={i18n.t('auth.resetPassword.passwordPlaceholder')}
                                    secureTextEntry
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    editable={hasToken}
                                    textContentType="newPassword"
                                />
                            </FormField>
                        )}
                    />

                    <Controller
                        control={control}
                        name="confirmPassword"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <FormField
                                label={i18n.t('auth.resetPassword.confirmPasswordLabel')}
                                error={errors.confirmPassword?.message}
                            >
                                <TextInput
                                    placeholder={i18n.t('auth.resetPassword.confirmPasswordPlaceholder')}
                                    secureTextEntry
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    editable={hasToken}
                                    textContentType="newPassword"
                                />
                            </FormField>
                        )}
                    />

                    <Button
                        title={i18n.t('auth.resetPassword.submitButton')}
                        onPress={handleSubmit(handleResetPassword)}
                        loading={isSubmitting}
                        disabled={!hasToken || isSubmitting}
                        style={styles.submitButton}
                    />

                    <Button
                        title={i18n.t('auth.resetPassword.backToLogin')}
                        variant="ghost"
                        onPress={navigateToLogin}
                        style={styles.secondaryButton}
                    />
                </View>
            )}
        </FormContainer>
    );
}
