import { Pressable, View } from 'react-native';
import { CaretRightIcon } from 'phosphor-react-native';

import { spacing, useTheme, type Theme } from '@/theme';
import { ThemedText } from './themed-text';

type ListRowProps = {
  title: string;
  subtitle?: string;
  trailing?: string;
  trailingColor?: keyof Theme['colors'];
  onPress?: () => void;
  onLongPress?: () => void;
};

export function ListRow({ title, subtitle, trailing, trailingColor = 'textPrimary', onPress, onLongPress }: ListRowProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      onLongPress={onLongPress}
      style={(state) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        backgroundColor: state.pressed ? theme.colors.surfaceRaised : undefined,
      })}>
      <View style={{ flex: 1 }}>
        <ThemedText variant="body" numberOfLines={1}>
          {title}
        </ThemedText>
        {subtitle && (
          <ThemedText variant="caption" color="textSecondary" numberOfLines={1}>
            {subtitle}
          </ThemedText>
        )}
      </View>
      {trailing && (
        <ThemedText variant="label" color={trailingColor} style={{ fontVariant: ['tabular-nums'] }} selectable>
          {trailing}
        </ThemedText>
      )}
      {onPress && <CaretRightIcon size={16} color={theme.colors.textSecondary} />}
    </Pressable>
  );
}

export function ListDivider() {
  const theme = useTheme();
  return <View style={{ height: 1, backgroundColor: theme.colors.border, marginLeft: spacing.md }} />;
}
