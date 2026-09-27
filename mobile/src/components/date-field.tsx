import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { radius, spacing, useTheme } from '@/theme';
import { ThemedText } from './themed-text';

type DateFieldProps = {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  error?: string;
};

export function DateField({ label, value, onChange, error }: DateFieldProps) {
  const theme = useTheme();
  const [isPickerVisible, setIsPickerVisible] = useState(Platform.OS === 'ios');
  const hasError = !!error;

  return (
    <View style={{ gap: spacing.xs }}>
      <ThemedText variant="label" color="textSecondary">
        {label}
      </ThemedText>
      {Platform.OS === 'android' && (
        <Pressable
          accessibilityRole="button"
          onPress={() => setIsPickerVisible(true)}
          style={{
            backgroundColor: theme.colors.surface,
            borderWidth: hasError ? 2 : 1,
            borderColor: hasError ? theme.colors.danger : theme.colors.inputBorder,
            borderRadius: radius.md,
            borderCurve: 'continuous' as const,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          }}>
          <ThemedText variant="body">{value.toLocaleDateString()}</ThemedText>
        </Pressable>
      )}
      {isPickerVisible && (
        <DateTimePicker
          value={value}
          mode="date"
          display={Platform.OS === 'ios' ? 'compact' : 'default'}
          maximumDate={new Date()}
          onValueChange={(_event, date) => {
            if (Platform.OS === 'android') {
              setIsPickerVisible(false);
            }
            onChange(date);
          }}
          onDismiss={() => {
            if (Platform.OS === 'android') {
              setIsPickerVisible(false);
            }
          }}
        />
      )}
      {hasError && (
        <ThemedText variant="caption" color="danger" selectable>
          {error}
        </ThemedText>
      )}
    </View>
  );
}
