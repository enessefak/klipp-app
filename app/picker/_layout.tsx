import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import { Stack } from 'expo-router';

export default function PickerLayout() {
    const { colors } = useSettings();

    return (
        <Stack
            screenOptions={{
                presentation: 'card',
                headerShown: false,
                contentStyle: { backgroundColor: colors.white },
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="folder" />
            <Stack.Screen name="attachment-type" />
        </Stack>
    );
}
