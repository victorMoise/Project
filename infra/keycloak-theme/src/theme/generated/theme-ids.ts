// GENERATED FILE — do not edit by hand.
// Source: packages/design-tokens/tokens/**
// Regenerate with: cd packages/design-tokens && npm run tokens:build

export const themeIds = ["cellar", "contrast", "vitrine"] as const;

export type ThemeId = (typeof themeIds)[number];

export const themeNames: Record<ThemeId, string> = {
  cellar: "Cellar",
  contrast: "High contrast",
  vitrine: "Vitrine",
};

export const colorSchemeByTheme: Record<ThemeId, "light" | "dark"> = {
  cellar: "dark",
  contrast: "light",
  vitrine: "light",
};

export const defaultLightThemeId: ThemeId = "vitrine";
export const defaultDarkThemeId: ThemeId = "cellar";

export function isThemeId(value: string): value is ThemeId {
  return (themeIds as readonly string[]).includes(value);
}
