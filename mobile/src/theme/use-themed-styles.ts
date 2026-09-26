import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import type { Theme } from './generated/themes';
import { useTheme } from './theme-provider';

// `factory` should be defined at module scope (a stable reference), so this
// only recomputes when the theme itself changes -- see mobile/src/theme/index.ts usage.
export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(factory: (theme: Theme) => T): T {
  const theme = useTheme();
  return useMemo(() => StyleSheet.create(factory(theme)), [theme, factory]);
}
