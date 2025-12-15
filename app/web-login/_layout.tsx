
import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { Stack } from 'expo-router';

export default function WebLoginLayout() {
    const { colors } = useSettings();

    return (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
            <Stack.Screen name="scan" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
            <Stack.Screen name="sessions" options={{ animation: 'slide_from_right' }} />
        </Stack>
    );
}
