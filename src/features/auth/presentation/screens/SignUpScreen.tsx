import { GoogleSignInButton } from '@/src/features/auth/presentation/components/GoogleSignInButton';
import { zodResolver } from '@hookform/resolvers/zod';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Image, Platform, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';
import { z } from 'zod';

import { Button, FormContainer, FormField, TextInput } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/src/features/auth/presentation/useAuth';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';

// Logo import
const logo = require('@/assets/images/logo.png');

const signUpSchema = z.object({
    name: z.string().min(2, i18n.t('validation.nameMin')),
    email: z.string().email(i18n.t('validation.invalidEmail')),
    password: z.string().min(6, i18n.t('validation.passwordMin')),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export function SignUpScreen() {
    const { colors } = useSettings();
    const colorScheme = useColorScheme();
    const { register, loginWithApple } = useAuth();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAppleLoading, setIsAppleLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { control, handleSubmit, formState: { errors } } = useForm<SignUpFormData>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: SignUpFormData) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await register(data.name, data.email, data.password);
        } catch (err: any) {
            console.error(err);
            setError(i18n.t('auth.signup.errorGeneric'));
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
                setError(i18n.t('auth.signup.errorGeneric'));
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
    }), [colors]);

    return (
        <FormContainer
            scrollable={true}
            backgroundColor={colors.background}
            contentStyle={styles.content}
        >
            <View style={styles.header}>
                <Image source={logo} style={styles.logo} resizeMode="contain" />
                <View style={styles.headerText}>
                    <ThemedText style={styles.title}>
                        {i18n.t('auth.signup.title')}
                    </ThemedText>
                    <ThemedText style={styles.subtitle}>
                        {i18n.t('auth.signup.subtitle')}
                    </ThemedText>
                </View>
            </View>

            <View style={styles.form}>
                {/* Social Login - Moved to top for visibility */}
                <GoogleSignInButton />

                {Platform.OS === 'ios' && (
                    <AppleAuthentication.AppleAuthenticationButton
                        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
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
                    <ThemedText style={styles.dividerText}>{i18n.t('auth.signup.orDivider')}</ThemedText>
                    <View style={styles.divider} />
                </View>

                <Controller
                    control={control}
                    name="name"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <FormField
                            label={i18n.t('auth.signup.nameLabel')}
                            error={errors.name?.message}
                        >
                            <TextInput
                                placeholder={i18n.t('auth.signup.namePlaceholder')}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                autoCapitalize="words"
                                hasError={!!errors.name}
                            />
                        </FormField>
                    )}
                />

                <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <FormField
                            label={i18n.t('auth.signup.emailLabel')}
                            error={errors.email?.message}
                        >
                            <TextInput
                                placeholder={i18n.t('auth.signup.emailPlaceholder')}
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
                            label={i18n.t('auth.signup.passwordLabel')}
                            error={errors.password?.message}
                        >
                            <TextInput
                                placeholder={i18n.t('auth.signup.passwordPlaceholder')}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                secureTextEntry
                                hasError={!!errors.password}
                            />
                        </FormField>
                    )}
                />

                {error && <ThemedText style={styles.globalError}>{error}</ThemedText>}

                <Button
                    title={i18n.t('auth.signup.submitButton')}
                    onPress={handleSubmit(onSubmit)}
                    loading={isSubmitting}
                    size="large"
                    style={styles.submitButton}
                />

                <View style={styles.footer}>
                    <ThemedText style={styles.footerText}>
                        {i18n.t('auth.signup.footerText')}{' '}
                    </ThemedText>
                    <TouchableOpacity onPress={() => router.back()}>
                        <ThemedText style={styles.footerLink}>
                            {i18n.t('auth.signup.footerLink')}
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </View>
        </FormContainer>
    );
}
