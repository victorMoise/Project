import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { radius, spacing, useTheme } from '@/theme';
import { ThemedText } from './themed-text';

type DateFieldProps = {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
};

export function DateField({ label, value, onChange }: DateFieldProps) {
  const theme = useTheme();
  const [isPickerVisible, setIsPickerVisible] = useState(Platform.OS === 'ios');

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
            borderWidth: 1,
            borderColor: theme.colors.inputBorder,
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
          onChange={(_event, date) => {
            if (Platform.OS === 'android') {
              setIsPickerVisible(false);
            }
            if (date) {
              onChange(date);
            }
          }}
        />
      )}
    </View>
  );
}
