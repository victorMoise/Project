// GENERATED FILE — do not edit by hand.
// Source: packages/design-tokens/tokens/**
// Regenerate with: cd packages/design-tokens && npm run tokens:build

export const themeIds = ["blueberry", "cellar", "contrast", "cyber-grape", "cyber-teal", "deep-graphite", "quantum-blue", "raspberry", "vitrine"] as const;

export type ThemeId = (typeof themeIds)[number];

export const themeNames: Record<ThemeId, string> = {
  blueberry: "Blueberry",
  cellar: "Cellar",
  contrast: "High contrast",
  "cyber-grape": "Cyber Grape",
  "cyber-teal": "Cyber Teal",
  "deep-graphite": "Deep Graphite",
  "quantum-blue": "Quantum Blue",
  raspberry: "Raspberry",
  vitrine: "Vitrine",
};

export const colorSchemeByTheme: Record<ThemeId, "light" | "dark"> = {
  blueberry: "dark",
  cellar: "dark",
  contrast: "light",
  "cyber-grape": "dark",
  "cyber-teal": "dark",
  "deep-graphite": "dark",
  "quantum-blue": "dark",
  raspberry: "dark",
  vitrine: "light",
};

export const defaultLightThemeId: ThemeId = "vitrine";
export const defaultDarkThemeId: ThemeId = "cellar";

export function isThemeId(value: string): value is ThemeId {
  return (themeIds as readonly string[]).includes(value);
}
