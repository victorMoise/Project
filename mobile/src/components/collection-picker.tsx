import { View } from 'react-native';
import { Host, Picker } from '@expo/ui';

import { useCollectionsQuery } from '@/hooks/use-collections';
import { spacing, useTheme } from '@/theme';
import { ThemedText } from './themed-text';

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
      <Host
        matchContents={{ vertical: true }}
        colorScheme={theme.colorScheme}
        seedColor={theme.colors.accent}
        style={{ width: '100%', alignItems: 'flex-start' }}>
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
  );
}
