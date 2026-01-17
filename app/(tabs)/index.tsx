import { Redirect } from 'expo-router';

export default function TabsIndex() {
  // Redirect to folders tab as the default
  return <Redirect href="/(tabs)/folders" />;
}
