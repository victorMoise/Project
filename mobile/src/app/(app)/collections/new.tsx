import { Stack } from 'expo-router';

import { CollectionForm } from '@/screens/collection-form';

export default function NewCollectionScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'New Collection', presentation: 'modal' }} />
      <CollectionForm />
    </>
  );
}
