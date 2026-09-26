import { Stack } from 'expo-router';

import { ThemePicker } from '@/screens/theme-picker';

export default function ThemeScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Theme' }} />
      <ThemePicker />
    </>
  );
}
