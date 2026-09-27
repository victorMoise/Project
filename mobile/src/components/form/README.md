# `src/components/form`

A reusable multi-step form: describe the fields once as a config, then render
that config as a step-by-step wizard (`FormWizard`, for creating something)
or as a single page with all fields grouped into sections (`FormPage`, for
editing something). Both read the same config, so a form only needs to be
described once.

## Minimal example

```ts
import { z } from 'zod';
import { defineForm, FormWizard } from '@/components/form';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(200),
});

const config = defineForm({
  schema,
  submitLabel: 'Create thing',
  steps: [
    {
      id: 'name',
      title: 'How should this be called?', // shown in the wizard
      sectionTitle: 'Name', // shown as a section heading in FormPage
      fields: [{ name: 'name', kind: 'text', label: 'Name', placeholder: 'e.g. My thing' }],
    },
  ],
});

export function ThingForm() {
  return (
    <FormWizard
      config={config}
      defaultValues={{ name: '' }}
      onSubmit={(values) => createThing.mutateAsync(values)}
      onSuccess={() => router.back()}
    />
  );
}
```

## Notes

- **Validation lives entirely in the zod schema**, not in the field config.
  The schema is also where an input type (what a text field hands you, e.g.
  a price as a `string`) gets transformed into an output type (what
  `onSubmit` receives, e.g. a `number`). Mirror the backend's FluentValidation
  rules here (same max lengths, same numeric bounds) so a client-side error
  never surprises the server, and vice versa.
- `kind: 'custom'` is the escape hatch for anything that isn't a plain text/
  date field -- e.g. a picker that calls another module's API. It keeps this
  folder generic: nothing here should ever import from `src/modules/*`.
- A step marked `optional: true` shows a "Skip" button in the wizard as long
  as all of its fields are still empty; as soon as one has a value, "Skip"
  becomes "Next" and normal validation applies (an optional field can still
  be invalid, e.g. too long).
- Editing reuses the exact same config with `FormPage` instead of
  `FormWizard`. `FormPage` takes an optional `children` slot for extra
  footer actions (e.g. a destructive "Delete" button).
