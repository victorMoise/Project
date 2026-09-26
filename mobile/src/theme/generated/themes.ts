// GENERATED FILE — do not edit by hand.
// Source: packages/design-tokens/tokens/**
// Regenerate with: cd packages/design-tokens && npm run tokens:build

export type ColorScheme = "light" | "dark";

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  inputBorder: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentPressed: string;
  textOnAccent: string;
  focusRing: string;
  danger: string;
  dangerSurface: string;
  success: string;
  successSurface: string;
  shadow: string;
  overlay: string;
}

export interface Theme {
  id: string;
  name: string;
  colorScheme: ColorScheme;
  colors: ThemeColors;
}

export const themes = {
  cellar: {
    id: "cellar",
    name: "Cellar",
    colorScheme: "dark",
    colors: {
      background: "#111615",
      surface: "#1A201E",
      surfaceRaised: "#222927",
      border: "#34403B",
      inputBorder: "#6E7D77",
      textPrimary: "#E6ECE9",
      textSecondary: "#A2AFA9",
      accent: "#D8A23F",
      accentPressed: "#C08F2E",
      textOnAccent: "#1B1405",
      focusRing: "#D8A23F",
      danger: "#F0A8A2",
      dangerSurface: "#3A2220",
      success: "#7FC9A4",
      successSurface: "#1C2E27",
      shadow: "#00000066",
      overlay: "#00000080",
    },
  },
  contrast: {
    id: "contrast",
    name: "High contrast",
    colorScheme: "light",
    colors: {
      background: "#FAFAFA",
      surface: "#FFFFFF",
      surfaceRaised: "#F2F2F2",
      border: "#5A5A5A",
      inputBorder: "#5A5A5A",
      textPrimary: "#0A0A0A",
      textSecondary: "#2E2E2E",
      accent: "#0033A0",
      accentPressed: "#00257A",
      textOnAccent: "#FFFFFF",
      focusRing: "#0033A0",
      danger: "#A30000",
      dangerSurface: "#FCE8E8",
      success: "#006B21",
      successSurface: "#E3F5E7",
      shadow: "#0000004D",
      overlay: "#00000080",
    },
  },
  vitrine: {
    id: "vitrine",
    name: "Vitrine",
    colorScheme: "light",
    colors: {
      background: "#EEF2F0",
      surface: "#FAFCFB",
      surfaceRaised: "#FFFFFF",
      border: "#C9D3CE",
      inputBorder: "#758680",
      textPrimary: "#15201B",
      textSecondary: "#4D5C55",
      accent: "#1D6B50",
      accentPressed: "#154F3C",
      textOnAccent: "#F3FAF6",
      focusRing: "#1D6B50",
      danger: "#A8261C",
      dangerSurface: "#F7E4E2",
      success: "#1D6B50",
      successSurface: "#DCEEE6",
      shadow: "#15201B33",
      overlay: "#15201B66",
    },
  },
} as const satisfies Record<string, Theme>;

export type ThemeId = keyof typeof themes;

export const themeIds = Object.keys(themes) as ThemeId[];

export const defaultLightThemeId: ThemeId = "vitrine";
export const defaultDarkThemeId: ThemeId = "cellar";
