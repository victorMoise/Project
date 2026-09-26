import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';

import { radius, spacing, useTheme } from '@/theme';
import { ThemedText } from './themed-text';

type Variant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = {
  variant?: Variant;
  title: string;
  loading?: boolean;
  disabled?: boolean;
} & Omit<PressableProps, 'disabled' | 'children'>;

export function Button({ variant = 'primary', title, loading, disabled, style, ...props }: ButtonProps) {
  const theme = useTheme();
  const isDisabled = !!disabled || !!loading;

  const backgroundColor = variant === 'primary' ? theme.colors.accent : variant === 'secondary' ? theme.colors.surfaceRaised : undefined;
  const textColor = variant === 'primary' ? theme.colors.textOnAccent : theme.colors.textPrimary;
  const hasBorder = variant !== 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: !!loading }}
      disabled={isDisabled}
      style={(state) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.xs,
          minHeight: 48,
          paddingHorizontal: spacing.md,
          borderRadius: radius.md,
          borderCurve: 'continuous' as const,
          backgroundColor,
          borderWidth: hasBorder ? 1 : 0,
          borderColor: theme.colors.border,
          opacity: isDisabled ? 0.6 : state.pressed ? 0.85 : 1,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}>
      {loading && <ActivityIndicator color={textColor} />}
      <ThemedText variant="label" color={variant === 'primary' ? 'textOnAccent' : 'textPrimary'}>
        {title}
      </ThemedText>
    </Pressable>
  );
}
