import { useEffect, useState } from 'react';
import { Alert, BackHandler, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInLeft, SlideInRight, SlideOutLeft, SlideOutRight, useReducedMotion } from 'react-native-reanimated';
import { useNavigation } from 'expo-router';
import { usePreventRemove } from 'expo-router/react-navigation';
import type { FieldErrors, FieldValues } from 'react-hook-form';
import type { z } from 'zod';

import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { motion, spacing } from '@/theme';
import { haptics } from '@/utils/haptics';
import { FieldSlot } from './field-renderer';
import type { FormConfig } from './form-config';
import { FormFooter } from './form-footer';
import { applyServerErrors } from './server-errors';
import { StepIndicator } from './step-indicator';
import { useConfiguredForm } from './use-configured-form';

type FormWizardProps<TSchema extends z.ZodType<FieldValues, FieldValues>> = {
  config: FormConfig<TSchema>;
  defaultValues: z.input<TSchema>;
  onSubmit: (values: z.output<TSchema>) => Promise<unknown>;
  onSuccess: () => void;
};

function isEmptyFieldValue(value: unknown): boolean {
  return value === '' || value === null || value === undefined;
}

export function FormWizard<TSchema extends z.ZodType<FieldValues, FieldValues>>({ config, defaultValues, onSubmit, onSuccess }: FormWizardProps<TSchema>) {
  const { form, fieldNamesOfStep, stepIndexOfField } = useConfiguredForm(config, defaultValues);
  const navigation = useNavigation();
  const reducedMotion = useReducedMotion();

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [generalError, setGeneralError] = useState<string | undefined>();
  // Bumped per field name to trigger that field's shake -- see use-shake.ts.
  const [shakeTokens, setShakeTokens] = useState<Record<string, number>>({});
  const [pendingFocusField, setPendingFocusField] = useState<string | null>(null);
  const [hasSucceeded, setHasSucceeded] = useState(false);

  const step = config.steps[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === config.steps.length - 1;

  const stepFieldNames = fieldNamesOfStep(stepIndex);
  const stepValues = form.watch(stepFieldNames);
  const isStepEmpty = !!step.optional && (stepValues as unknown[]).every(isEmptyFieldValue);
  const primaryLabel = isLastStep ? config.submitLabel : isStepEmpty ? 'Skip' : 'Next';

  usePreventRemove(form.formState.isDirty && !hasSucceeded, ({ data }) => {
    Alert.alert('Discard changes?', 'Your changes will be lost.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => navigation.dispatch(data.action) },
    ]);
  });

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stepIndex === 0) {
        return false;
      }
      setDirection('back');
      setStepIndex((index) => index - 1);
      return true;
    });
    return () => subscription.remove();
  }, [stepIndex]);

  useEffect(() => {
    const firstFocusableField = config.steps[stepIndex].fields.find(
      (field) => field.kind === 'text' || field.kind === 'multiline' || field.kind === 'decimal'
    );
    if (!firstFocusableField) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      try {
        form.setFocus(firstFocusableField.name as never);
      } catch {
        // Best effort -- not every native input supports imperative focus.
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [config, form, stepIndex]);

  useEffect(() => {
    if (!pendingFocusField) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      try {
        form.setFocus(pendingFocusField as never);
      } catch {
        // Custom fields (e.g. a picker) may not be focusable; the shake and red border are enough.
      }
      setPendingFocusField(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [form, pendingFocusField, stepIndex]);

  function shakeAndFocus(fieldNames: string[]) {
    if (fieldNames.length === 0) {
      return;
    }
    setShakeTokens((previous) => {
      const next = { ...previous };
      for (const name of fieldNames) {
        next[name] = (next[name] ?? 0) + 1;
      }
      return next;
    });
    setPendingFocusField(fieldNames[0]);
  }

  async function handleNext() {
    const isStepValid = stepFieldNames.length === 0 || (await form.trigger(stepFieldNames));
    if (!isStepValid) {
      const invalidFieldNames = stepFieldNames.filter((name) => !!form.formState.errors[name as keyof typeof form.formState.errors]);
      haptics.invalid();
      shakeAndFocus(invalidFieldNames);
      return;
    }
    haptics.stepForward();
    setDirection('forward');
    setStepIndex((index) => index + 1);
  }

  function handleBack() {
    setDirection('back');
    setStepIndex((index) => index - 1);
  }

  function handleSkip() {
    haptics.stepForward();
    setDirection('forward');
    setStepIndex((index) => index + 1);
  }

  async function onValidSubmit(values: z.output<TSchema>) {
    setGeneralError(undefined);
    try {
      await onSubmit(values);
      setHasSucceeded(true);
      haptics.success();
      onSuccess();
    } catch (error) {
      const allFieldNames = config.steps.flatMap((s) => s.fields.map((field) => field.name));
      const result = applyServerErrors(error, form.setError, allFieldNames);
      haptics.invalid();
      if (result.fieldNames.length > 0) {
        setDirection('back');
        setStepIndex(Math.min(...result.fieldNames.map(stepIndexOfField)));
        shakeAndFocus(result.fieldNames);
      } else {
        setGeneralError(result.generalMessage);
      }
    }
  }

  function onInvalidSubmit(errors: FieldErrors<z.input<TSchema>>) {
    const invalidFieldNames = Object.keys(errors);
    if (invalidFieldNames.length === 0) {
      return;
    }
    haptics.invalid();
    setDirection('back');
    setStepIndex(Math.min(...invalidFieldNames.map(stepIndexOfField)));
    shakeAndFocus(invalidFieldNames);
  }

  function handlePrimaryPress() {
    if (isLastStep) {
      // Calling handleSubmit() here, at the moment of the press, rather than
      // precomputing it at the top of the component -- both are valid RHF
      // usage, but this shape keeps the callbacks unambiguously "runs on
      // press", not "passed into a hook call during render".
      void form.handleSubmit(onValidSubmit, onInvalidSubmit)();
      return;
    }
    if (isStepEmpty) {
      handleSkip();
      return;
    }
    void handleNext();
  }

  const enteringAnimation = reducedMotion
    ? FadeIn.duration(motion.base)
    : (direction === 'forward' ? SlideInRight : SlideInLeft).duration(motion.base);
  const exitingAnimation = reducedMotion
    ? FadeOut.duration(motion.base)
    : (direction === 'forward' ? SlideOutLeft : SlideOutRight).duration(motion.base);

  return (
    <Screen edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <StepIndicator currentStepIndex={stepIndex} totalSteps={config.steps.length} isCurrentStepOptional={!!step.optional} />
        <View style={{ flex: 1, overflow: 'hidden' }}>
          <Animated.View key={step.id} entering={enteringAnimation} exiting={exitingAnimation} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md }} keyboardShouldPersistTaps="handled">
              <ThemedText variant="title">{step.title}</ThemedText>
              {step.description && (
                <ThemedText variant="body" color="textSecondary">
                  {step.description}
                </ThemedText>
              )}
              {step.fields.map((field) => (
                <FieldSlot key={String(field.name)} field={field} control={form.control} shakeToken={shakeTokens[field.name] ?? 0} />
              ))}
            </ScrollView>
          </Animated.View>
        </View>
        <FormFooter
          primaryLabel={primaryLabel}
          onPrimaryPress={handlePrimaryPress}
          primaryLoading={isLastStep && form.formState.isSubmitting}
          onBack={!isFirstStep ? handleBack : undefined}
          errorMessage={generalError}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}
