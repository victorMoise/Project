import { Pressable } from 'react-native';
import { Link, Stack } from 'expo-router';
import { GearIcon, PlusIcon } from 'phosphor-react-native';

import { CollectionsList } from '@/modules/collections/screens/collections-list';
import { useTheme } from '@/theme';

export default function CollectionsScreen() {
  const theme = useTheme();

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <Link href="/settings" asChild>
              <Pressable accessibilityRole="button" accessibilityLabel="Settings" hitSlop={8}>
                <GearIcon size={22} color={theme.colors.textPrimary} />
              </Pressable>
            </Link>
          ),
          headerRight: () => (
            <Link href="/collections/new" asChild>
              <Pressable accessibilityRole="button" accessibilityLabel="New collection" hitSlop={8}>
                <PlusIcon size={22} color={theme.colors.textPrimary} />
              </Pressable>
            </Link>
          ),
        }}
      />
      <CollectionsList />
    </>
  );
}
