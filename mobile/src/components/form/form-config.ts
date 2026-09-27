import type { ReactNode } from 'react';
import type { FieldPath, FieldValues } from 'react-hook-form';
import type { z } from 'zod';

type BaseFieldConfig<TValues extends FieldValues> = {
  name: FieldPath<TValues>;
  label: string;
  optional?: boolean;
};

export type TextFieldConfig<TValues extends FieldValues> = BaseFieldConfig<TValues> & {
  kind: 'text' | 'multiline' | 'decimal';
  placeholder?: string;
};

export type DateFieldConfig<TValues extends FieldValues> = BaseFieldConfig<TValues> & {
  kind: 'date';
};

export type CustomFieldConfig<TValues extends FieldValues> = Omit<BaseFieldConfig<TValues>, 'label'> & {
  kind: 'custom';
  label?: string;
  render: (field: { value: unknown; onChange: (value: unknown) => void; error?: string }) => ReactNode;
};

export type FieldConfig<TValues extends FieldValues> =
  | TextFieldConfig<TValues>
  | DateFieldConfig<TValues>
  | CustomFieldConfig<TValues>;

export type StepConfig<TValues extends FieldValues> = {
  id: string;
  // Shown as the question/heading in the wizard.
  title: string;
  // Shown as the section heading when the same config is rendered as a
  // single page (FormPage, used for editing).
  sectionTitle: string;
  description?: string;
  optional?: boolean;
  fields: FieldConfig<TValues>[];
};

export type FormConfig<TSchema extends z.ZodType<FieldValues, FieldValues>> = {
  schema: TSchema;
  steps: StepConfig<z.input<TSchema>>[];
  submitLabel: string;
};

export function defineForm<TSchema extends z.ZodType<FieldValues, FieldValues>>(config: FormConfig<TSchema>): FormConfig<TSchema> {
  if (__DEV__) {
    const seenFieldNames = new Set<string>();
    for (const step of config.steps) {
      for (const field of step.fields) {
        if (seenFieldNames.has(field.name)) {
          console.warn(`[form] Field "${field.name}" appears in more than one step of the same form.`);
        }
        seenFieldNames.add(field.name);
      }
    }
  }
  return config;
}
