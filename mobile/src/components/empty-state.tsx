import { View } from 'react-native';
import type { Icon } from 'phosphor-react-native';

import { spacing, useTheme } from '@/theme';
import { ThemedText } from './themed-text';
import { Button } from './button';

type EmptyStateProps = {
  icon: Icon;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon: IconComponent, title, message, actionLabel, onAction }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.xl }}>
      <IconComponent size={40} color={theme.colors.textSecondary} />
      <ThemedText variant="title" style={{ textAlign: 'center' }}>
        {title}
      </ThemedText>
      <ThemedText variant="body" color="textSecondary" style={{ textAlign: 'center' }}>
        {message}
      </ThemedText>
      {actionLabel && onAction && <Button title={actionLabel} onPress={onAction} style={{ marginTop: spacing.sm }} />}
    </View>
  );
}
