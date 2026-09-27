import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

import { ApiError } from '@/api/client';
import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { useCreateCollectionMutation } from '@/modules/collections/hooks/use-collections';
import { spacing } from '@/theme';

export function CollectionForm() {
  const router = useRouter();
  const createCollection = useCreateCollectionMutation();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | undefined>();

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Name is required.');
      return;
    }
    if (trimmed.length > 200) {
      setError('Name must be 200 characters or fewer.');
      return;
    }

    createCollection.mutate(
      { name: trimmed },
      {
        onSuccess: () => router.back(),
        onError: (err) => {
          const fieldError = err instanceof ApiError ? err.problem?.errors?.Name?.[0] : undefined;
          setError(fieldError ?? (err instanceof Error ? err.message : 'Something went wrong.'));
        },
      }
    );
  }

  return (
    <Screen edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md }} keyboardShouldPersistTaps="handled">
          <TextField
            label="Name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setError(undefined);
            }}
            error={error}
            placeholder="e.g. Vintage wines"
            autoFocus
          />
          <Button title="Create collection" onPress={handleSave} loading={createCollection.isPending} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
