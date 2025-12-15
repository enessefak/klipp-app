import { useSettings } from '@/src/features/settings/presentation/SettingsContext';
import i18n from '@/src/infrastructure/localization/i18n';
import { Stack } from 'expo-router';

export default function SharedLayout() {
    const { colors } = useSettings();

    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: colors.headerBackground },
                headerTintColor: colors.text,
                contentStyle: { backgroundColor: colors.background },
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                    title: i18n.t('folders.sharing.shared_with_you')
                }}
            />
            <Stack.Screen
                name="[id]"
                options={{
                    title: '',
                    headerBackTitle: i18n.t('common.actions.back'),
                    headerStyle: { backgroundColor: colors.headerBackground },
                    headerTintColor: colors.text,
                }}
            />
        </Stack>
    );
}
