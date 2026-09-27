import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useNavigation } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import type { FieldErrors, FieldValues } from 'react-hook-form';
import type { z } from 'zod';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { spacing } from '@/theme';
import { haptics } from '@/utils/haptics';
import { FieldSlot, type FieldRegistry } from './field-renderer';
import type { FormConfig } from './form-config';
import { FormFooter } from './form-footer';
import { applyServerErrors } from './server-errors';
import { useConfiguredForm } from './use-configured-form';

type FormPageProps<TSchema extends z.ZodType<FieldValues, FieldValues>> = {
  config: FormConfig<TSchema>;
  defaultValues: z.input<TSchema>;
  onSubmit: (values: z.output<TSchema>) => Promise<unknown>;
  onSuccess: () => void;
  children?: ReactNode;
};

export function FormPage<TSchema extends z.ZodType<FieldValues, FieldValues>>({ config, defaultValues, onSubmit, onSuccess, children }: FormPageProps<TSchema>) {
  const { form, stepIndexOfField } = useConfiguredForm(config, defaultValues);
  // A plain, stable value read during render (to pass to FieldSlot) --
  // useState, not useRef, so reading it isn't a "read a ref during render".
  const [registry] = useState<FieldRegistry>(() => new Map());
  const scrollViewRef = useRef<ScrollView>(null);
  const navigation = useNavigation();
  const [hasSucceeded, setHasSucceeded] = useState(false);
  // Bumped per field name to trigger that field's shake -- see use-shake.ts.
  const [shakeTokens, setShakeTokens] = useState<Record<string, number>>({});

  function focusAndScrollTo(fieldName: string) {
    setShakeTokens((previous) => ({ ...previous, [fieldName]: (previous[fieldName] ?? 0) + 1 }));
    try {
      form.setFocus(fieldName as never);
    } catch {
      // Custom fields (e.g. a picker) may not be focusable; the shake and red border are enough.
    }
    const innerViewNode = scrollViewRef.current?.getInnerViewNode();
    if (innerViewNode) {
      registry.get(fieldName)?.wrapperRef.current?.measureLayout(
        innerViewNode,
        (_x, y) => scrollViewRef.current?.scrollTo({ y: Math.max(y - spacing.md, 0), animated: true }),
        () => {}
      );
    }
  }

  usePreventRemove(form.formState.isDirty && !hasSucceeded, ({ data }) => {
    Alert.alert('Discard changes?', 'Your changes will be lost.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => navigation.dispatch(data.action) },
    ]);
  });

  const generalError = form.formState.errors.root?.message;

  async function onValidSubmit(values: z.output<TSchema>) {
    form.clearErrors('root');
    try {
      await onSubmit(values);
      setHasSucceeded(true);
      haptics.success();
      onSuccess();
    } catch (error) {
      const allFieldNames = config.steps.flatMap((step) => step.fields.map((field) => field.name));
      const result = applyServerErrors(error, form.setError, allFieldNames);
      haptics.invalid();
      if (result.fieldNames.length > 0) {
        focusAndScrollTo(result.fieldNames[0]);
      } else if (result.generalMessage) {
        form.setError('root', { type: 'server', message: result.generalMessage });
      }
    }
  }

  function onInvalidSubmit(errors: FieldErrors<z.input<TSchema>>) {
    const invalidFieldNames = Object.keys(errors);
    if (invalidFieldNames.length === 0) {
      return;
    }
    haptics.invalid();
    const firstInvalidFieldName = invalidFieldNames.sort((a, b) => stepIndexOfField(a) - stepIndexOfField(b))[0];
    focusAndScrollTo(firstInvalidFieldName);
  }

  function handlePrimaryPress() {
    // Calling handleSubmit() here, at the moment of the press, rather than
    // precomputing it at the top of the component -- both are valid RHF
    // usage, but this shape keeps the callbacks unambiguously "runs on
    // press", not "passed into a hook call during render".
    void form.handleSubmit(onValidSubmit, onInvalidSubmit)();
  }

  return (
    <Screen edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView ref={scrollViewRef} contentContainerStyle={{ padding: spacing.md, gap: spacing.lg }} keyboardShouldPersistTaps="handled">
          {config.steps.map((step) => (
            <View key={step.id} style={{ gap: spacing.md }}>
              <ThemedText variant="label" color="textSecondary">
                {step.sectionTitle}
              </ThemedText>
              {step.fields.map((field) => (
                <FieldSlot
                  key={String(field.name)}
                  field={field}
                  control={form.control}
                  shakeToken={shakeTokens[field.name] ?? 0}
                  registry={registry}
                />
              ))}
            </View>
          ))}
        </ScrollView>
        <FormFooter
          primaryLabel={config.submitLabel}
          onPrimaryPress={handlePrimaryPress}
          primaryLoading={form.formState.isSubmitting}
          errorMessage={generalError}>
          {children}
        </FormFooter>
      </KeyboardAvoidingView>
    </Screen>
  );
}
