import { FlatList, Pressable, View } from 'react-native';
import { CheckIcon } from 'phosphor-react-native';

import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/screen';
import { themes, themeIds, radius, spacing, useTheme, useThemeActions, type ThemePreference } from '@/theme';

type Row = { preference: ThemePreference; label: string; swatchBackground: string; swatchAccent: string };

export function ThemePicker() {
  const theme = useTheme();
  const { preference, setPreference } = useThemeActions();

  const rows: Row[] = [
    { preference: 'system', label: 'System', swatchBackground: theme.colors.surfaceRaised, swatchAccent: theme.colors.accent },
    ...themeIds.map((id) => ({
      preference: id,
      label: themes[id].name,
      swatchBackground: themes[id].colors.background,
      swatchAccent: themes[id].colors.accent,
    })),
  ];

  return (
    <Screen edges={['bottom']}>
      <FlatList
        data={rows}
        keyExtractor={(row) => row.preference}
        contentContainerStyle={{ padding: spacing.md, gap: spacing.xs }}
        renderItem={({ item }) => {
          const isSelected = item.preference === preference;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              onPress={() => setPreference(item.preference)}
              style={(state) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.sm,
                padding: spacing.sm,
                borderRadius: radius.md,
                borderCurve: 'continuous' as const,
                backgroundColor: state.pressed ? theme.colors.surfaceRaised : theme.colors.surface,
                borderWidth: 1,
                borderColor: isSelected ? theme.colors.accent : theme.colors.border,
              })}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: radius.full,
                  backgroundColor: item.swatchBackground,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <View style={{ width: 12, height: 12, borderRadius: radius.full, backgroundColor: item.swatchAccent }} />
              </View>
              <ThemedText variant="label" style={{ flex: 1 }}>
                {item.label}
              </ThemedText>
              {isSelected && <CheckIcon size={20} weight="bold" color={theme.colors.accent} />}
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}
