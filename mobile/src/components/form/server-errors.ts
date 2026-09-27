import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';

import { ApiError } from '@/api/client';

export type ServerErrorResult<TValues extends FieldValues> = {
  fieldNames: FieldPath<TValues>[];
  generalMessage?: string;
};

function toCamelCase(pascalCase: string): string {
  return pascalCase.length === 0 ? pascalCase : pascalCase[0].toLowerCase() + pascalCase.slice(1);
}

export function applyServerErrors<TValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TValues>,
  knownFieldNames: FieldPath<TValues>[]
): ServerErrorResult<TValues> {
  if (!(error instanceof ApiError) || !error.problem?.errors) {
    return { fieldNames: [], generalMessage: error instanceof Error ? error.message : 'Something went wrong.' };
  }

  const knownFieldNameSet = new Set<string>(knownFieldNames);
  const fieldNames: FieldPath<TValues>[] = [];
  const unmatchedMessages: string[] = [];

  for (const [serverField, messages] of Object.entries(error.problem.errors)) {
    const fieldName = toCamelCase(serverField);
    if (knownFieldNameSet.has(fieldName)) {
      setError(fieldName as FieldPath<TValues>, { type: 'server', message: messages[0] });
      fieldNames.push(fieldName as FieldPath<TValues>);
    } else {
      unmatchedMessages.push(...messages);
    }
  }

  return { fieldNames, generalMessage: unmatchedMessages[0] };
}
