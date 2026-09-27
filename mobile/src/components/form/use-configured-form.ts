import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type FieldPath, type FieldValues, type Resolver } from 'react-hook-form';
import type { z } from 'zod';

import type { FormConfig } from './form-config';

export function useConfiguredForm<TSchema extends z.ZodType<FieldValues, FieldValues>>(config: FormConfig<TSchema>, defaultValues: z.input<TSchema>) {
  type Input = z.input<TSchema>;
  type Output = z.output<TSchema>;

  // TS can't relate z.input<TSchema>/z.output<TSchema> back to TSchema's own
  // constraint inside a generic function body, even though they're the same
  // types by construction -- the casts below are exactly that tautology.
  const resolver = zodResolver(config.schema) as unknown as Resolver<Input, unknown, Output>;

  const form = useForm<Input, unknown, Output>({
    resolver,
    defaultValues: defaultValues as never,
    mode: 'onTouched',
  });

  function fieldNamesOfStep(stepIndex: number): FieldPath<Input>[] {
    return config.steps[stepIndex].fields.map((field) => field.name);
  }

  function stepIndexOfField(fieldName: string): number {
    return config.steps.findIndex((step) => step.fields.some((field) => field.name === fieldName));
  }

  return { form, fieldNamesOfStep, stepIndexOfField };
}
