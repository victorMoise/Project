import { TextInput, View, type TextInputProps } from 'react-native';

import { radius, spacing, useTheme } from '@/theme';
import { ThemedText } from './themed-text';

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function TextField({ label, error, style, ...props }: TextFieldProps) {
  const theme = useTheme();
  const hasError = !!error;

  return (
    <View style={{ gap: spacing.xs }}>
      <ThemedText variant="label" color="textSecondary">
        {label}
      </ThemedText>
      <TextInput
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
