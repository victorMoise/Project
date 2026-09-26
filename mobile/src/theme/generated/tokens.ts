// GENERATED FILE — do not edit by hand.
// Source: packages/design-tokens/tokens/**
// Regenerate with: cd packages/design-tokens && npm run tokens:build

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  none: 0,
  sm: 8,
  md: 10,
  lg: 16,
  full: 9999,
} as const;

export const motion = {
  fast: 150,
  base: 250,
} as const;

export interface TextStyleTokens {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
}

export const typography = {
  display: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 28,
    lineHeight: 1.25,
  },
  title: {
    fontFamily: "Geist_600SemiBold",
    fontSize: 20,
    lineHeight: 1.3,
  },
  body: {
    fontFamily: "Geist_400Regular",
    fontSize: 16,
    lineHeight: 1.5,
  },
  label: {
    fontFamily: "Geist_500Medium",
    fontSize: 14,
    lineHeight: 1.4,
  },
  caption: {
    fontFamily: "Geist_400Regular",
    fontSize: 13,
    lineHeight: 1.4,
  },
} as const satisfies Record<string, TextStyleTokens>;
