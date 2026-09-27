import { View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

type ScreenEdge = 'top' | 'bottom';

type ScreenProps = ViewProps & {
  // A visible Stack header already accounts for the top inset -- pass
  // edges={['bottom']} on screens that have one, to avoid double spacing.
  edges?: ScreenEdge[];
};

export function Screen({ style, children, edges = ['top', 'bottom'], ...props }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: theme.colors.background,
          paddingTop: edges.includes('top') ? insets.top : 0,
          paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
        },
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
}
