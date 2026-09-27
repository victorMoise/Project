import { Pressable } from 'react-native';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { PlusIcon } from 'phosphor-react-native';

import { useCollectionsQuery } from '@/modules/collections/hooks/use-collections';
import { ItemsByCollection } from '@/modules/collections/screens/items-by-collection';
import { useTheme } from '@/theme';

export default function CollectionDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const collectionId = Number(id);
  const collectionsQuery = useCollectionsQuery();
  const collection = collectionsQuery.data?.find((item) => item.id === collectionId);

  return (
    <>
      <Stack.Screen
        options={{
          title: collection?.name ?? 'Collection',
          headerRight: () => (
            <Link href={{ pathname: '/items/new', params: { collectionId: id } }} asChild>
              <Pressable accessibilityRole="button" accessibilityLabel="New item" hitSlop={8}>
                <PlusIcon size={22} color={theme.colors.textPrimary} />
              </Pressable>
            </Link>
          ),
        }}
      />
      <ItemsByCollection collectionId={collectionId} />
    </>
  );
}
