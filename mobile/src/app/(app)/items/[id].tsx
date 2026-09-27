import { useLocalSearchParams } from 'expo-router';

import { ItemForm } from '@/screens/item-form';

export default function EditItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <ItemForm itemId={Number(id)} />;
}
