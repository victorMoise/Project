import { Stack, useLocalSearchParams } from 'expo-router';

import { ItemForm } from '@/screens/item-form';

export default function NewItemScreen() {
  const { collectionId } = useLocalSearchParams<{ collectionId?: string }>();

  return (
    <>
      <Stack.Screen options={{ title: 'New Item', presentation: 'modal' }} />
      <ItemForm initialCollectionId={collectionId !== undefined ? Number(collectionId) : null} />
    </>
  );
}
