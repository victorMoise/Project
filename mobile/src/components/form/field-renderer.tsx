import { useEffect, useRef, type ReactNode, type Ref, type RefObject } from 'react';
import { TextInput, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Controller, type Control, type ControllerRenderProps, type FieldValues } from 'react-hook-form';

import { DateField } from '@/components/date-field';
import { TextField } from '@/components/text-field';
import type { FieldConfig } from './form-config';
import { useShake } from './use-shake';

export type FieldRegistryEntry = {
  wrapperRef: RefObject<View | null>;
};

// Only FormPage registers into this, to scroll to a field it measures as
// the first invalid one. FormWizard has no use for it (it never scrolls
// imperatively to a field -- the whole step is already on screen).
export type FieldRegistry = Map<string, FieldRegistryEntry>;

function renderFieldInput<TValues extends FieldValues>(
  field: FieldConfig<TValues>,
  rhfField: ControllerRenderProps<TValues>,
  error: string | undefined
): ReactNode {
  switch (field.kind) {
    case 'text':
    case 'multiline':
    case 'decimal':
      return (
        <TextField
          ref={rhfField.ref as Ref<TextInput>}
          label={field.label}
          optional={field.optional}
          placeholder={field.placeholder}
          value={(rhfField.value as string | null | undefined) ?? ''}
          onChangeText={rhfField.onChange}
          onBlur={rhfField.onBlur}
          error={error}
          multiline={field.kind === 'multiline'}
          numberOfLines={field.kind === 'multiline' ? 3 : undefined}
          keyboardType={field.kind === 'decimal' ? 'decimal-pad' : undefined}
        />
      );
    case 'date':
      return <DateField label={field.label} value={rhfField.value as Date} onChange={rhfField.onChange} error={error} />;
    case 'custom':
      return field.render({ value: rhfField.value, onChange: rhfField.onChange, error });
  }
}

type FieldSlotProps<TValues extends FieldValues> = {
  field: FieldConfig<TValues>;
  // `any, any`: accepts a Control from useForm<Input, unknown, Output>, whatever Output is.
  control: Control<TValues, any, any>;
  // Bumped by the parent (FormWizard/FormPage) each time this field should
  // shake -- see use-shake.ts for why this is a token, not a callback.
  shakeToken: number;
  registry?: FieldRegistry;
};

export function FieldSlot<TValues extends FieldValues>({ field, control, shakeToken, registry }: FieldSlotProps<TValues>) {
  const animatedStyle = useShake(shakeToken);
  const wrapperRef = useRef<View>(null);

  useEffect(() => {
    if (!registry) {
      return;
    }
    registry.set(field.name, { wrapperRef });
    return () => {
      registry.delete(field.name);
    };
  }, [field.name, registry]);

  return (
    <Controller
      control={control}
      name={field.name}
      render={({ field: rhfField, fieldState }) => (
        // collapsable={false}: keeps this a real native view so FormPage can
        // measureLayout it to scroll to the first invalid field.
        <View ref={wrapperRef} collapsable={false}>
          <Animated.View style={animatedStyle}>{renderFieldInput(field, rhfField, fieldState.error?.message)}</Animated.View>
        </View>
      )}
    />
  );
}
