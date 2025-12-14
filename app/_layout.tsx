import { AuthProvider, useAuth } from '@/src/features/auth/presentation/useAuth';
import { usePushNotifications } from '@/src/features/notifications';
import { SettingsProvider } from '@/src/features/settings/presentation/SettingsContext';
import '@/src/infrastructure/api/apiConfig';
import { PickerProvider } from '@/src/infrastructure/picker/PickerContext';
import { Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold, useFonts } from '@expo-google-fonts/outfit';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

// Splash screen'i font yüklenene kadar göster
SplashScreen.preventAutoHideAsync();

import { useSettings } from '@/src/features/settings/presentation/SettingsContext';

function RootLayoutContent() {
  const { isAuthenticated } = useAuth();
  const { language, colors } = useSettings();

  // Push notification listener - registers token with backend when authenticated
  usePushNotifications(isAuthenticated);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} key={language}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="scan"
        options={{
          presentation: 'fullScreenModal',
          headerShown: false,
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="attachment/[id]"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="picker"
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen
        name="notifications"
        options={{
          headerShown: false,
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen
        name="shared"
        options={{
          headerShown: false,
          animation: 'slide_from_right'
        }}
      />
      <Stack.Screen
        name="folder/[id]"
        options={{
          headerStyle: { backgroundColor: colors.headerBackground },
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text, fontFamily: 'Outfit_700Bold' },
          headerShadowVisible: false,
          title: 'Folders',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <SettingsProvider>
        <PickerProvider>
          <RootLayoutContent />
        </PickerProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
