import { PaywallScreen } from '@/src/features/subscription/presentation/screens/PaywallScreen';
import { Stack } from 'expo-router';
import React from 'react';

export default function PaywallRoute() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false, presentation: 'modal' }} />
            <PaywallScreen />
        </>
    );
}
