import { Pressable } from 'react-native';
import { Link, Stack } from 'expo-router';
import { PlusIcon } from 'phosphor-react-native';

import { ItemsByCollection } from '@/screens/items-by-collection';
import { useTheme } from '@/theme';

export default function UncategorizedItemsScreen() {
  const theme = useTheme();

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Link href="/items/new" asChild>
              <Pressable accessibilityRole="button" accessibilityLabel="New item" hitSlop={8}>
                <PlusIcon size={22} color={theme.colors.textPrimary} />
              </Pressable>
            </Link>
          ),
        }}
      />
      <ItemsByCollection collectionId={null} />
    </>
  );
}
