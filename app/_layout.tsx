import { IconSymbol } from '@/components/ui/icon-symbol';
import { AuthProvider, useAuth } from '@/src/features/auth/presentation/useAuth';
import { usePushNotifications } from '@/src/features/notifications';
import { SettingsProvider, useSettings } from '@/src/features/settings/presentation/SettingsContext';
import '@/src/infrastructure/api/apiConfig';
import { PickerProvider } from '@/src/infrastructure/picker/PickerContext';
import { RevenueCatProvider } from '@/src/infrastructure/revenuecat/RevenueCatProvider';
import { Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold, useFonts } from '@expo-google-fonts/outfit';
import { Stack, usePathname, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import 'react-native-reanimated';

// Splash screen'i font yüklenene kadar göster
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { isAuthenticated } = useAuth();
  const { language, colors } = useSettings();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const hideChatBubble = pathname?.includes('/subscription/paywall');
  const canShowChatBubble = isAuthenticated && !hideChatBubble;
  const chatButtonBottom = 100 + Math.max(insets.bottom, 16);
  const chatButtonLeft = Math.max(insets.left, 20);

  // Push notification listener - registers token with backend when authenticated
  usePushNotifications(isAuthenticated);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
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
          name="chat"
          options={{
            presentation: 'modal',
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
      {canShowChatBubble && (
        <View style={{ position: 'absolute', bottom: chatButtonBottom, left: chatButtonLeft, zIndex: 999 }} pointerEvents="box-none">
          <TouchableOpacity
            onPress={() => router.push('/chat')}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.30,
              shadowRadius: 4.65,
              elevation: 8,
            }}
          >
            <IconSymbol name="message.fill" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
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
        <RevenueCatProviderWrapper>
          <PickerProvider>
            <RootLayoutContent />
          </PickerProvider>
        </RevenueCatProviderWrapper>
      </SettingsProvider>
    </AuthProvider>
  );
}

// Wrapper component to access auth context
function RevenueCatProviderWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <RevenueCatProvider userId={user?.id}>
      {children}
    </RevenueCatProvider>
  );
}
