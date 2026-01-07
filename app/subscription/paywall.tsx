import { PaywallScreen } from '@/src/features/subscription/presentation/screens/PaywallScreen';
import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function PaywallRoute() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
            <View style={styles.container}>
                <PaywallScreen />
            </View>
        </>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
