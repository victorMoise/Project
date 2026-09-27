import { View } from 'react-native';
import { Host, Picker } from '@expo/ui';

import { ThemedText } from '@/components/themed-text';
import { useCollectionsQuery } from '@/modules/collections/hooks/use-collections';
import { radius, spacing, useTheme } from '@/theme';

const UNCATEGORIZED_VALUE = 'uncategorized';

type CollectionPickerProps = {
  collectionId: number | null;
  onChange: (id: number | null) => void;
};

export function CollectionPicker({ collectionId, onChange }: CollectionPickerProps) {
  const theme = useTheme();
  const collectionsQuery = useCollectionsQuery();
  const selectedValue = collectionId === null ? UNCATEGORIZED_VALUE : String(collectionId);

  return (
    <View style={{ gap: spacing.xs }}>
      <ThemedText variant="label" color="textSecondary">
        Collection
      </ThemedText>
      <View
        style={{
          alignItems: 'flex-start',
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.inputBorder,
          borderRadius: radius.md,
          borderCurve: 'continuous' as const,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm,
        }}>
        {/* matchContents on both axes -- otherwise Host stretches to the
            row's full width and SwiftUI centers the compact menu button in
            the leftover space, instead of it sitting at the start like the
            value in every other field. */}
        <Host matchContents colorScheme={theme.colorScheme} seedColor={theme.colors.accent}>
          <Picker
            appearance="menu"
            selectedValue={selectedValue}
            onValueChange={(value) => onChange(value === UNCATEGORIZED_VALUE ? null : Number(value))}>
            <Picker.Item label="Uncategorized" value={UNCATEGORIZED_VALUE} />
            {(collectionsQuery.data ?? []).map((collection) => (
              <Picker.Item key={collection.id} label={collection.name} value={String(collection.id)} />
            ))}
          </Picker>
        </Host>
      </View>
    </View>
  );
}
