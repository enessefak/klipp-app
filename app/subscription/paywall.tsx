import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';

export default function PaywallRoute() {
    const router = useRouter();
    const { theme } = useSettings();

    return (
        <>
            <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
            <View style={styles.container} key={theme}>
                <RevenueCatUI.Paywall 
                    options={{ displayCloseButton: true }}
                    onPurchaseCompleted={(customerInfo) => {
                        console.log("Purchase completed", customerInfo);
                        router.back();
                    }}
                    onRestoreCompleted={(customerInfo) => {
                        console.log("Restore completed", customerInfo);
                    }}
                    onDismiss={() => {
                        router.back();
                    }}
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
