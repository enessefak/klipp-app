import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../useAuth';

interface GoogleSignInButtonProps {
    onPress?: () => void;
}

export function GoogleSignInButton({ onPress }: GoogleSignInButtonProps) {
    const { loginWithGoogle } = useAuth();
    const { colors } = useSettings();

    useEffect(() => {
        GoogleSignin.configure({
            webClientId: '1053510280344-e5i78j4o4ucaj64uesvf6dic1voa7shq.apps.googleusercontent.com', // TODO: Get Web Client ID from user/console
            iosClientId: '1053510280344-7gffs2e4gnrufp6nd34mug04ui5s741u.apps.googleusercontent.com',
            offlineAccess: true,
            forceCodeForRefreshToken: true,
            scopes: ['profile', 'email'],
        });
    }, []);

    const signIn = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();

            if (userInfo.data?.idToken) {
                await loginWithGoogle(userInfo.data.idToken);
                onPress?.();
            } else {
                console.error('No ID token present in Google Sign-In response');
            }
        } catch (error: any) {
            console.error('Google Sign-In Error', error);
        }
    };

    return (
        <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={signIn}
            activeOpacity={0.7}
        >
            <IconSymbol name="g.circle.fill" size={24} color={colors.text} />
            <ThemedText style={[styles.text, { color: colors.text }]}>Google ile Devam Et</ThemedText>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        borderRadius: 12,
        borderWidth: 1,
        width: '100%',
        gap: 12,
        marginTop: 12,
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
    },
});
