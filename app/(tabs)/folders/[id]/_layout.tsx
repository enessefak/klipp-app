import { Stack } from 'expo-router';

export default function FolderIdLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="documents" />
            <Stack.Screen name="e-invoices" />
        </Stack>
    );
}
