import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';

export default function CustomerCenterRoute() {
    const router = useRouter();
    return (
        <>
            <Stack.Screen options={{ title: 'Subscription', presentation: 'modal' }} />
            <View style={styles.container}>
                <RevenueCatUI.CustomerCenterView 
                    onDismiss={() => router.back()}
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
