import type { Ref } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { radius, spacing, useTheme } from '@/theme';
import { ThemedText } from './themed-text';

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  optional?: boolean;
  ref?: Ref<TextInput>;
};

export function TextField({ label, error, optional, style, ref, ...props }: TextFieldProps) {
  const theme = useTheme();
  const hasError = !!error;

  return (
    <View style={{ gap: spacing.xs }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs }}>
        <ThemedText variant="label" color="textSecondary">
          {label}
        </ThemedText>
        {optional && (
          <ThemedText variant="caption" color="textSecondary">
            Optional
          </ThemedText>
        )}
      </View>
      <TextInput
        ref={ref}
        style={[
          {
            color: theme.colors.textPrimary,
            fontSize: 16,
            backgroundColor: theme.colors.surface,
            borderWidth: hasError ? 2 : 1,
            borderColor: hasError ? theme.colors.danger : theme.colors.inputBorder,
            borderRadius: radius.md,
            borderCurve: 'continuous' as const,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          },
          style,
        ]}
        placeholderTextColor={theme.colors.textSecondary}
        accessibilityLabel={optional ? `${label} (optional)` : label}
        {...props}
      />
      {hasError && (
        <ThemedText variant="caption" color="danger" selectable>
          {error}
        </ThemedText>
      )}
    </View>
  );
}
