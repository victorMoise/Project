import { Text, type TextProps } from 'react-native';

import { typography, useTheme, type Theme } from '@/theme';

type Variant = keyof typeof typography;
type Color = keyof Theme['colors'];

export function ThemedText({
  variant = 'body',
  color = 'textPrimary',
  style,
  ...props
}: TextProps & { variant?: Variant; color?: Color }) {
  const theme = useTheme();
  const typeStyle = typography[variant];

  return (
    <Text
      style={[
        {
          fontFamily: typeStyle.fontFamily,
          fontSize: typeStyle.fontSize,
          lineHeight: Math.round(typeStyle.fontSize * typeStyle.lineHeight),
          color: theme.colors[color],
        },
        style,
      ]}
      {...props}
    />
  );
}
