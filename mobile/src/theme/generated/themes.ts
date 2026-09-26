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
  blueberry: {
    id: "blueberry",
    name: "Blueberry",
    colorScheme: "dark",
    colors: {
      background: "#243B8F",
      surface: "#314796",
      surfaceRaised: "#3E539C",
      border: "#596AAA",
      inputBorder: "#8D99C5",
      textPrimary: "#F2F3F8",
      textSecondary: "#B5BCD9",
      accent: "#FFF0C9",
      accentPressed: "#CFC2A3",
      textOnAccent: "#555043",
      focusRing: "#FFF0C9",
      danger: "#F3AAAC",
      dangerSurface: "#401416",
      success: "#88CBAA",
      successSurface: "#0D2E1E",
      shadow: "#00000066",
      overlay: "#00000080",
    },
  },
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
  cyber-grape: {
    id: "cyber-grape",
    name: "Cyber Grape",
    colorScheme: "dark",
    colors: {
      background: "#6D28D9",
      surface: "#7635DB",
      surfaceRaised: "#7F42DE",
      border: "#905CE2",
      inputBorder: "#C2A5EF",
      textPrimary: "#F6F2FD",
      textSecondary: "#E1D3F7",
      accent: "#D7FF00",
      accentPressed: "#AECF00",
      textOnAccent: "#485500",
      focusRing: "#D7FF00",
      danger: "#F8D0D2",
      dangerSurface: "#401416",
      success: "#BDE2D0",
      successSurface: "#0D2E1E",
      shadow: "#00000066",
      overlay: "#00000080",
    },
  },
  cyber-teal: {
    id: "cyber-teal",
    name: "Cyber Teal",
    colorScheme: "dark",
    colors: {
      background: "#03313A",
      surface: "#123D46",
      surfaceRaised: "#214A52",
      border: "#3F6269",
      inputBorder: "#6C868C",
      textPrimary: "#F0F3F3",
      textSecondary: "#90A4A8",
      accent: "#9FFFE0",
      accentPressed: "#81CFB5",
      textOnAccent: "#34544A",
      focusRing: "#9FFFE0",
      danger: "#ED8184",
      dangerSurface: "#401416",
      success: "#4FB282",
      successSurface: "#0D2E1E",
      shadow: "#00000066",
      overlay: "#00000080",
    },
  },
  deep-graphite: {
    id: "deep-graphite",
    name: "Deep Graphite",
    colorScheme: "dark",
    colors: {
      background: "#1F2329",
      surface: "#2C3036",
      surfaceRaised: "#3A3D43",
      border: "#55585C",
      inputBorder: "#76797C",
      textPrimary: "#F2F2F2",
      textSecondary: "#959799",
      accent: "#B6FF2E",
      accentPressed: "#93CF25",
      textOnAccent: "#3C540F",
      focusRing: "#B6FF2E",
      danger: "#EB7175",
      dangerSurface: "#401416",
      success: "#3CA975",
      successSurface: "#0D2E1E",
      shadow: "#00000066",
      overlay: "#00000080",
    },
  },
  quantum-blue: {
    id: "quantum-blue",
    name: "Quantum Blue",
    colorScheme: "dark",
    colors: {
      background: "#2457FF",
      surface: "#2D5EFF",
      surfaceRaised: "#2D5EFF",
      border: "#597FFF",
      inputBorder: "#B5C6FF",
      textPrimary: "#F2F5FF",
      textSecondary: "#EDF2FF",
      accent: "#DFF7FF",
      accentPressed: "#B5C8CF",
      textOnAccent: "#4B5355",
      focusRing: "#DFF7FF",
      danger: "#FDEFEF",
      dangerSurface: "#401416",
      success: "#E8F5EF",
      successSurface: "#0D2E1E",
      shadow: "#00000066",
      overlay: "#00000080",
    },
  },
  raspberry: {
    id: "raspberry",
    name: "Raspberry",
    colorScheme: "dark",
    colors: {
      background: "#C2185B",
      surface: "#C62665",
      surfaceRaised: "#C82E6B",
      border: "#D14F82",
      inputBorder: "#EBB2C8",
      textPrimary: "#FBF1F5",
      textSecondary: "#F8E6ED",
      accent: "#E0F2FE",
      accentPressed: "#B5C4CE",
      textOnAccent: "#4B5155",
      focusRing: "#E0F2FE",
      danger: "#FBE5E6",
      dangerSurface: "#401416",
      success: "#DAEFE5",
      successSurface: "#0D2E1E",
      shadow: "#00000066",
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
