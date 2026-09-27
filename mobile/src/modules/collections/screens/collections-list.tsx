import { useMemo } from 'react';
import { Alert, FlatList } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { PackageIcon } from 'phosphor-react-native';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListDivider, ListRow } from '@/components/list-row';
import { Screen } from '@/components/screen';
import { useCollectionsQuery, useDeleteCollectionMutation } from '@/modules/collections/hooks/use-collections';
import { useItemsQuery } from '@/modules/collections/hooks/use-items';
import { formatPrice } from '@/utils/format';

export function CollectionsList() {
  const router = useRouter();
  const collectionsQuery = useCollectionsQuery();
  const itemsQuery = useItemsQuery();
  const deleteCollection = useDeleteCollectionMutation();

  const itemStats = useMemo(() => {
    const stats = new Map<number | null, { count: number; total: number }>();
    for (const item of itemsQuery.data ?? []) {
      const key = item.collectionId;
      const entry = stats.get(key) ?? { count: 0, total: 0 };
      entry.count += 1;
      entry.total += item.purchasePrice;
      stats.set(key, entry);
    }
    return stats;
  }, [itemsQuery.data]);

  const uncategorized = itemStats.get(null);

  function confirmDelete(id: number, name: string) {
    Alert.alert('Delete collection?', `"${name}" will be deleted. Its items will become uncategorized, not deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteCollection.mutate(id) },
    ]);
  }

  if (collectionsQuery.data === undefined) {
    if (collectionsQuery.error) {
      return (
        <Screen edges={['bottom']}>
          <ErrorState message={collectionsQuery.error.message} onRetry={() => collectionsQuery.refetch()} />
        </Screen>
      );
    }
    return <Screen edges={['bottom']} />;
  }

  return (
    <Screen edges={['bottom']}>
      <FlatList
        data={collectionsQuery.data}
        keyExtractor={(collection) => String(collection.id)}
        contentInsetAdjustmentBehavior="automatic"
        ItemSeparatorComponent={ListDivider}
        ListHeaderComponent={
          <>
            <Link href="/collections/uncategorized" asChild>
              <ListRow
                title="Uncategorized"
                subtitle={`${uncategorized?.count ?? 0} item(s)`}
                trailing={uncategorized ? formatPrice(uncategorized.total) : undefined}
                onPress={() => {}}
              />
            </Link>
            <ListDivider />
          </>
        }
        ListEmptyComponent={
          <EmptyState
            icon={PackageIcon}
            title="No collections yet"
            message="Create a collection to start tracking items in it."
            actionLabel="New collection"
            onAction={() => router.push('/collections/new')}
          />
        }
        renderItem={({ item: collection }) => (
          <Link href={{ pathname: '/collections/[id]', params: { id: String(collection.id) } }} asChild>
            <ListRow
              title={collection.name}
              subtitle={`${itemStats.get(collection.id)?.count ?? 0} item(s)`}
              trailing={itemStats.get(collection.id) ? formatPrice(itemStats.get(collection.id)!.total) : undefined}
              onPress={() => {}}
              onLongPress={() => confirmDelete(collection.id, collection.name)}
            />
          </Link>
        )}
      />
    </Screen>
  );
}
