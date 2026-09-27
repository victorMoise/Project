import { Stack } from 'expo-router';

// Static per-route options declared here apply before the screen ever
// mounts, avoiding the header/back-button flash you get from setting them
// via a <Stack.Screen> rendered inside the route component itself. Routes
// whose header needs live data or hooks (icons, a dynamic title) still
// declare that part locally -- see each route file.
export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Collections' }} />
      <Stack.Screen name="collections/[id]" options={{ title: 'Collection' }} />
      <Stack.Screen name="collections/uncategorized" options={{ title: 'Uncategorized' }} />
      <Stack.Screen name="collections/new" options={{ title: 'New Collection', presentation: 'modal' }} />
      <Stack.Screen name="items/[id]" options={{ title: 'Edit Item' }} />
      <Stack.Screen name="items/new" options={{ title: 'New Item', presentation: 'modal' }} />
      <Stack.Screen name="settings/index" options={{ title: 'Settings' }} />
      <Stack.Screen name="settings/theme" options={{ title: 'Theme' }} />
    </Stack>
  );
}
