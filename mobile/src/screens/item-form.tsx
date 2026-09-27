import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

import { ApiError } from '@/api/client';
import type { ItemDto } from '@/api/types';
import { Button } from '@/components/button';
import { CollectionPicker } from '@/components/collection-picker';
import { DateField } from '@/components/date-field';
import { ErrorState } from '@/components/error-state';
import { Screen } from '@/components/screen';
import { TextField } from '@/components/text-field';
import { useCreateItemMutation, useDeleteItemMutation, useItemsQuery, useUpdateItemMutation } from '@/hooks/use-items';
import { spacing } from '@/theme';
import { parseDateOnly, toDateOnlyString } from '@/utils/format';

type ItemFormProps = {
  itemId?: number;
  initialCollectionId?: number | null;
};

const SERVER_ERROR_FIELD_MAP: Record<string, string> = {
  Name: 'name',
  Description: 'description',
  PurchasePrice: 'purchasePrice',
  CollectionId: 'collectionId',
};

export function ItemForm({ itemId, initialCollectionId = null }: ItemFormProps) {
  const itemsQuery = useItemsQuery();

  if (itemId !== undefined && itemsQuery.data === undefined) {
    if (itemsQuery.error) {
      return (
        <Screen edges={['bottom']}>
          <ErrorState message={itemsQuery.error.message} onRetry={() => itemsQuery.refetch()} />
        </Screen>
      );
    }
    return <Screen edges={['bottom']} />;
  }

  const existing = itemId !== undefined ? itemsQuery.data?.find((item) => item.id === itemId) : undefined;

  if (itemId !== undefined && !existing) {
    return (
      <Screen edges={['bottom']}>
        <ErrorState message="This item no longer exists." />
      </Screen>
    );
  }

  return <ItemFormBody key={itemId ?? 'new'} existing={existing} initialCollectionId={initialCollectionId} />;
}

function ItemFormBody({ existing, initialCollectionId }: { existing: ItemDto | undefined; initialCollectionId: number | null }) {
  const router = useRouter();
  const createItem = useCreateItemMutation();
  const updateItem = useUpdateItemMutation();
  const deleteItem = useDeleteItemMutation();

  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [purchasePrice, setPurchasePrice] = useState(existing ? String(existing.purchasePrice) : '');
  const [purchaseDate, setPurchaseDate] = useState(existing ? parseDateOnly(existing.purchaseDate) : new Date());
  const [collectionId, setCollectionId] = useState<number | null>(existing?.collectionId ?? initialCollectionId);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isSaving = createItem.isPending || updateItem.isPending;

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    const trimmedName = name.trim();
    if (!trimmedName) {
      nextErrors.name = 'Name is required.';
    } else if (trimmedName.length > 200) {
      nextErrors.name = 'Name must be 200 characters or fewer.';
    }
    if (description.length > 1000) {
      nextErrors.description = 'Description must be 1000 characters or fewer.';
    }
    const parsedPrice = Number(purchasePrice);
    if (purchasePrice.trim() === '' || !Number.isFinite(parsedPrice) || parsedPrice < 0) {
      nextErrors.purchasePrice = 'Enter a valid price of 0 or more.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSave() {
    if (!validate()) {
      return;
    }

    const command = {
      name: name.trim(),
      description: description.trim() ? description.trim() : null,
      purchasePrice: Number(purchasePrice),
      purchaseDate: toDateOnlyString(purchaseDate),
      collectionId,
    };

    const onError = (error: unknown) => {
      if (error instanceof ApiError && error.problem?.errors) {
        const mapped: Record<string, string> = {};
        for (const [key, messages] of Object.entries(error.problem.errors)) {
          const field = SERVER_ERROR_FIELD_MAP[key];
          if (field) {
            mapped[field] = messages[0];
          }
        }
        setErrors(mapped);
      } else {
        Alert.alert('Could not save', error instanceof Error ? error.message : 'Something went wrong.');
      }
    };

    if (existing) {
      updateItem.mutate({ id: existing.id, command }, { onSuccess: () => router.back(), onError });
    } else {
      createItem.mutate(command, { onSuccess: () => router.back(), onError });
    }
  }

  function handleDelete() {
    if (!existing) {
      return;
    }
    Alert.alert('Delete item?', `"${existing.name}" will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteItem.mutate(existing.id, { onSuccess: () => router.back() }),
      },
    ]);
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
              setErrors((prev) => ({ ...prev, name: '' }));
            }}
            error={errors.name}
            placeholder="e.g. 1998 Barolo Riserva"
            autoFocus={!existing}
          />
          <TextField
            label="Description"
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              setErrors((prev) => ({ ...prev, description: '' }));
            }}
            error={errors.description}
            placeholder="Optional notes"
            multiline
            numberOfLines={3}
          />
          <TextField
            label="Purchase price"
            value={purchasePrice}
            onChangeText={(text) => {
              setPurchasePrice(text);
              setErrors((prev) => ({ ...prev, purchasePrice: '' }));
            }}
            error={errors.purchasePrice}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
          <DateField label="Purchase date" value={purchaseDate} onChange={setPurchaseDate} />
          <CollectionPicker collectionId={collectionId} onChange={setCollectionId} />
          <Button title={existing ? 'Save changes' : 'Add item'} onPress={handleSave} loading={isSaving} />
          {existing && (
            <Button variant="ghost" title="Delete item" onPress={handleDelete} loading={deleteItem.isPending} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
