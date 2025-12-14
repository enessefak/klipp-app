
import i18n from '@/src/infrastructure/localization/i18n';
import { Stack } from 'expo-router';

export default function FoldersLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false, title: i18n.t('folders.title') }} />
            <Stack.Screen name="[id]" options={{ title: '', headerBackTitle: i18n.t('folders.title') }} />
        </Stack>
    );
}
