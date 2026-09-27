import { useRouter } from 'expo-router';
import { z } from 'zod';

import { defineForm, FormWizard } from '@/components/form';
import { useCreateCollectionMutation } from '@/modules/collections/hooks/use-collections';

const collectionFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(200, 'Name must be 200 characters or fewer.'),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or fewer.')
    .transform((value) => (value.trim() ? value.trim() : null)),
});

const collectionFormConfig = defineForm({
  schema: collectionFormSchema,
  submitLabel: 'Create collection',
  steps: [
    {
      id: 'name',
      title: 'How should this collection be called?',
      sectionTitle: 'Name',
      fields: [{ name: 'name', kind: 'text', label: 'Name', placeholder: 'e.g. Vintage wines' }],
    },
    {
      id: 'details',
      title: 'Anything worth noting about it?',
      sectionTitle: 'Details',
      optional: true,
      fields: [{ name: 'description', kind: 'multiline', label: 'Description', optional: true, placeholder: 'Optional notes' }],
    },
  ],
});

export function CollectionForm() {
  const router = useRouter();
  const createCollection = useCreateCollectionMutation();

  return (
    <FormWizard
      config={collectionFormConfig}
      defaultValues={{ name: '', description: '' }}
      onSubmit={(values) => createCollection.mutateAsync(values)}
      onSuccess={() => router.back()}
    />
  );
}
