import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { spacing, useTheme } from '@/theme';

type FormFooterProps = {
  primaryLabel: string;
  onPrimaryPress: () => void;
  primaryLoading?: boolean;
  primaryDisabled?: boolean;
  onBack?: () => void;
  errorMessage?: string;
  children?: ReactNode;
};

export function FormFooter({ primaryLabel, onPrimaryPress, primaryLoading, primaryDisabled, onBack, errorMessage, children }: FormFooterProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        padding: spacing.md,
        gap: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        backgroundColor: theme.colors.background,
      }}>
      {errorMessage && (
        <ThemedText variant="caption" color="danger" selectable>
          {errorMessage}
        </ThemedText>
      )}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {onBack && <Button variant="secondary" title="Back" onPress={onBack} style={{ flex: 1 }} />}
        <Button title={primaryLabel} onPress={onPrimaryPress} loading={primaryLoading} disabled={primaryDisabled} style={{ flex: 1 }} />
      </View>
      {children}
    </View>
  );
}
