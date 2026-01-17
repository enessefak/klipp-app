import { Tabs, useGlobalSearchParams, useRouter, useSegments } from 'expo-router';
import React from 'react';

import { CurvedTabBar } from '@/components/CurvedTabBar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import i18n from '@/src/infrastructure/localization/i18n';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const params = useGlobalSearchParams();

  const handleScanPress = () => {
    // Check if we are inside a folder path: (tabs)/folders/[id]
    // Segments: ['(tabs)', 'folders', '[id]'] or similar
    const inFoldersTab = segments.some(s => s === 'folders');
    const folderId = params.id;

    if (inFoldersTab && folderId && typeof folderId === 'string') {
      router.push({ pathname: '/scan', params: { folderId } });
    } else {
      router.push('/scan');
    }
  };

  return (
    <Tabs
      tabBar={(props) => <CurvedTabBar {...props} onScanPress={handleScanPress} />}
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

      {/* Hidden index route - redirects to folders */}
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Hide from tab bar
        }}
      />

      {/* Folders - First visible tab */}
      <Tabs.Screen
        name="folders"
        options={{
          title: i18n.t('tabs.folders'),
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="folder.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="categories"
        options={{
          title: i18n.t('tabs.categories'),
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="tag.fill" color={color} />,
        }}
      />

      {/* Documents - with filters like web */}
      <Tabs.Screen
        name="documents"
        options={{
          title: i18n.t('tabs.documents'),
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="doc.text.fill" color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: i18n.t('tabs.profile'),
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
