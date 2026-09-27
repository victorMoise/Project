import { useMemo } from 'react';
import { Alert, FlatList } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { PackageIcon } from 'phosphor-react-native';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListDivider, ListRow } from '@/components/list-row';
import { Screen } from '@/components/screen';
import { useDeleteItemMutation, useItemsQuery } from '@/hooks/use-items';
import { formatDate, formatPrice } from '@/utils/format';

type ItemsByCollectionProps = {
  collectionId: number | null;
};

export function ItemsByCollection({ collectionId }: ItemsByCollectionProps) {
  const router = useRouter();
  const itemsQuery = useItemsQuery();
  const deleteItem = useDeleteItemMutation();

  const items = useMemo(
    () => (itemsQuery.data ?? []).filter((item) => item.collectionId === collectionId),
    [itemsQuery.data, collectionId]
  );

  function confirmDelete(id: number, name: string) {
    Alert.alert('Delete item?', `"${name}" will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteItem.mutate(id) },
    ]);
  }

  function goToNewItem() {
    router.push({
      pathname: '/items/new',
      params: collectionId !== null ? { collectionId: String(collectionId) } : {},
    });
  }

  if (itemsQuery.data === undefined) {
    if (itemsQuery.error) {
      return (
        <Screen edges={['bottom']}>
          <ErrorState message={itemsQuery.error.message} onRetry={() => itemsQuery.refetch()} />
        </Screen>
      );
    }
    return <Screen edges={['bottom']} />;
  }

  return (
    <Screen edges={['bottom']}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentInsetAdjustmentBehavior="automatic"
        ItemSeparatorComponent={ListDivider}
        ListEmptyComponent={
          <EmptyState
            icon={PackageIcon}
            title="No items yet"
            message="Add an item to start tracking it here."
            actionLabel="New item"
            onAction={goToNewItem}
          />
        }
        renderItem={({ item }) => (
          <Link href={{ pathname: '/items/[id]', params: { id: String(item.id) } }} asChild>
            <ListRow
              title={item.name}
              subtitle={formatDate(item.purchaseDate)}
              trailing={formatPrice(item.purchasePrice)}
              onPress={() => {}}
              onLongPress={() => confirmDelete(item.id, item.name)}
            />
          </Link>
        )}
      />
    </Screen>
  );
}
