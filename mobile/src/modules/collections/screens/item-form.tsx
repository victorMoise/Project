import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { z } from 'zod';

import { defineForm, FormPage, FormWizard, type StepConfig } from '@/components/form';
import { Button } from '@/components/button';
import { ErrorState } from '@/components/error-state';
import { Screen } from '@/components/screen';
import { CollectionPicker } from '@/modules/collections/components/collection-picker';
import type { ItemDto } from '@/modules/collections/api/types';
import { useCreateItemMutation, useDeleteItemMutation, useItemsQuery, useUpdateItemMutation } from '@/modules/collections/hooks/use-items';
import { parseDateOnly, toDateOnlyString } from '@/utils/format';

const priceLikeSchema = (invalidMessage: string) =>
  z
    .string()
    .trim()
    .min(1, invalidMessage)
    .refine((value) => Number.isFinite(Number(value)), invalidMessage)
    .transform((value) => Number(value))
    .refine((value) => value >= 0, invalidMessage);

const optionalPriceLikeSchema = (invalidMessage: string) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || Number.isFinite(Number(value)), invalidMessage)
    .transform((value) => (value === '' ? null : Number(value)))
    .refine((value) => value === null || value >= 0, invalidMessage);

const itemFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(200, 'Name must be 200 characters or fewer.'),
  purchasePrice: priceLikeSchema('Enter a valid price of 0 or more.'),
  purchaseDate: z.date(),
  collectionId: z.number().nullable(),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or fewer.')
    .transform((value) => (value.trim() ? value.trim() : null)),
  estimatedValue: optionalPriceLikeSchema('Enter a valid value of 0 or more.'),
});

type ItemFormValues = z.input<typeof itemFormSchema>;

const nameStep: StepConfig<ItemFormValues> = {
  id: 'name',
  title: 'What did you add?',
  sectionTitle: 'Name',
  fields: [{ name: 'name', kind: 'text', label: 'Name', placeholder: 'e.g. 1998 Barolo Riserva' }],
};

const purchaseStep: StepConfig<ItemFormValues> = {
  id: 'purchase',
  title: 'What did you pay for it?',
  sectionTitle: 'Purchase',
  fields: [
    { name: 'purchasePrice', kind: 'decimal', label: 'Purchase price', placeholder: '0.00' },
    { name: 'purchaseDate', kind: 'date', label: 'Purchase date' },
  ],
};

// Only relevant when editing: moving an item to a different collection.
// Adding an item always starts from a screen that already knows the
// collection (a collection's own screen, or "Uncategorized") -- see
// ItemCreateForm's initialCollectionId, so the wizard never asks for it.
const collectionStep: StepConfig<ItemFormValues> = {
  id: 'collection',
  title: 'Where does it belong?',
  sectionTitle: 'Collection',
  fields: [
    {
      name: 'collectionId',
      kind: 'custom',
      render: ({ value, onChange }) => (
        <CollectionPicker collectionId={value as number | null} onChange={onChange as (id: number | null) => void} />
      ),
    },
  ],
};

const detailsStep: StepConfig<ItemFormValues> = {
  id: 'details',
  title: 'Anything else worth noting?',
  sectionTitle: 'Details',
  optional: true,
  fields: [
    { name: 'description', kind: 'multiline', label: 'Description', optional: true, placeholder: 'Optional notes' },
    { name: 'estimatedValue', kind: 'decimal', label: 'Estimated value', optional: true, placeholder: '0.00' },
  ],
};

const itemCreateFormConfig = defineForm({
  schema: itemFormSchema,
  submitLabel: 'Add item',
  steps: [nameStep, purchaseStep, detailsStep],
});

const itemEditFormConfig = defineForm({
  schema: itemFormSchema,
  submitLabel: 'Save changes',
  steps: [nameStep, purchaseStep, collectionStep, detailsStep],
});

type ItemFormProps = {
  itemId?: number;
  initialCollectionId?: number | null;
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

  return existing ? (
    <ItemEditForm key={existing.id} existing={existing} />
  ) : (
    <ItemCreateForm key="new" initialCollectionId={initialCollectionId} />
  );
}

function toDefaultValues(existing: ItemDto | undefined, initialCollectionId: number | null) {
  return {
    name: existing?.name ?? '',
    purchasePrice: existing ? String(existing.purchasePrice) : '',
    purchaseDate: existing ? parseDateOnly(existing.purchaseDate) : new Date(),
    collectionId: existing?.collectionId ?? initialCollectionId,
    description: existing?.description ?? '',
    estimatedValue: existing?.estimatedValue !== undefined && existing?.estimatedValue !== null ? String(existing.estimatedValue) : '',
  };
}

function toCommand(values: z.output<typeof itemFormSchema>) {
  return {
    name: values.name,
    description: values.description,
    purchasePrice: values.purchasePrice,
    estimatedValue: values.estimatedValue,
    purchaseDate: toDateOnlyString(values.purchaseDate),
    collectionId: values.collectionId,
  };
}

function ItemCreateForm({ initialCollectionId }: { initialCollectionId: number | null }) {
  const router = useRouter();
  const createItem = useCreateItemMutation();

  return (
    <FormWizard
      config={itemCreateFormConfig}
      defaultValues={toDefaultValues(undefined, initialCollectionId)}
      onSubmit={(values) => createItem.mutateAsync(toCommand(values))}
      onSuccess={() => router.back()}
    />
  );
}

function ItemEditForm({ existing }: { existing: ItemDto }) {
  const router = useRouter();
  const updateItem = useUpdateItemMutation();
  const deleteItem = useDeleteItemMutation();

  function handleDelete() {
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
    <FormPage
      config={itemEditFormConfig}
      defaultValues={toDefaultValues(existing, null)}
      onSubmit={(values) => updateItem.mutateAsync({ id: existing.id, command: toCommand(values) })}
      onSuccess={() => router.back()}>
      <Button variant="ghost" title="Delete item" onPress={handleDelete} loading={deleteItem.isPending} />
    </FormPage>
  );
}
