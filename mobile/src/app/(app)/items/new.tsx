import { useLocalSearchParams } from 'expo-router';

import { ItemForm } from '@/modules/collections/screens/item-form';

export default function NewItemScreen() {
  const { collectionId } = useLocalSearchParams<{ collectionId?: string }>();

  return <ItemForm initialCollectionId={collectionId !== undefined ? Number(collectionId) : null} />;
}
