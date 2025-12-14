import { Tabs, useRouter } from 'expo-router';
import React from 'react';

import { CurvedTabBar } from '@/components/CurvedTabBar';
import { HomeIcon } from '@/components/ui/home-icon';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import i18n from '@/src/infrastructure/localization/i18n';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <Tabs
      tabBar={(props) => <CurvedTabBar {...props} onScanPress={() => router.push('/scan')} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // We render labels in custom bar
        tabBarStyle: {
          backgroundColor: 'transparent',
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
        }
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: i18n.t('tabs.home'),
          tabBarIcon: ({ color }) => <HomeIcon size={28} color={color} />,
          headerTitle: i18n.t('receipts.home.title'),
        }}
      />

      <Tabs.Screen
        name="folders"
        options={{
          title: 'Folders',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="folder.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
