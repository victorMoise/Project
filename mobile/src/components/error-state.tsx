import { View } from 'react-native';
import { WarningCircleIcon } from 'phosphor-react-native';

import { spacing, useTheme } from '@/theme';
import { ThemedText } from './themed-text';
import { Button } from './button';

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.xl }}>
      <WarningCircleIcon size={40} color={theme.colors.danger} />
      <ThemedText variant="body" color="textSecondary" style={{ textAlign: 'center' }} selectable>
        {message}
      </ThemedText>
      {onRetry && <Button variant="secondary" title="Try again" onPress={onRetry} />}
    </View>
  );
}
