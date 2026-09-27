import { Stack, useLocalSearchParams } from 'expo-router';

import { ItemForm } from '@/screens/item-form';

export default function EditItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ title: 'Edit Item' }} />
      <ItemForm itemId={Number(id)} />
    </>
  );
}
