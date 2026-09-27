import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { CaretDownIcon, CaretUpIcon, CheckIcon } from 'phosphor-react-native';

import { useCollectionsQuery } from '@/hooks/use-collections';
import { radius, spacing, useTheme } from '@/theme';
import { ThemedText } from './themed-text';

type CollectionPickerProps = {
  collectionId: number | null;
  onChange: (id: number | null) => void;
};

export function CollectionPicker({ collectionId, onChange }: CollectionPickerProps) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const collectionsQuery = useCollectionsQuery();

  const options = [{ id: null as number | null, name: 'Uncategorized' }, ...(collectionsQuery.data ?? [])];
  const selected = options.find((option) => option.id === collectionId);

  return (
    <View style={{ gap: spacing.xs }}>
      <ThemedText variant="label" color="textSecondary">
        Collection
      </ThemedText>
      <Pressable
        accessibilityRole="button"
        onPress={() => setIsOpen((prev) => !prev)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.inputBorder,
          borderRadius: radius.md,
          borderCurve: 'continuous' as const,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        }}>
        <ThemedText variant="body">{selected?.name ?? 'Uncategorized'}</ThemedText>
        {isOpen ? (
          <CaretUpIcon size={16} color={theme.colors.textSecondary} />
        ) : (
          <CaretDownIcon size={16} color={theme.colors.textSecondary} />
        )}
      </Pressable>
      {isOpen && (
        <View
          style={{
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: radius.md,
            borderCurve: 'continuous' as const,
            overflow: 'hidden',
          }}>
          {options.map((option, index) => (
            <Pressable
              key={option.id ?? 'uncategorized'}
              accessibilityRole="menuitem"
              onPress={() => {
                onChange(option.id);
                setIsOpen(false);
              }}
              style={(state) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                backgroundColor: state.pressed ? theme.colors.surfaceRaised : theme.colors.surface,
                borderTopWidth: index === 0 ? 0 : 1,
                borderTopColor: theme.colors.border,
              })}>
              <ThemedText variant="body">{option.name}</ThemedText>
              {option.id === collectionId && <CheckIcon size={16} weight="bold" color={theme.colors.accent} />}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
