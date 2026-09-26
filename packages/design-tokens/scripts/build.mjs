import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import StyleDictionary from "style-dictionary";
import { checkTheme } from "./check-contrast.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(packageRoot, "../..");
const tmpDir = path.join(packageRoot, ".tmp");

const GENERATED_HEADER = [
  "// GENERATED FILE — do not edit by hand.",
  "// Source: packages/design-tokens/tokens/**",
  "// Regenerate with: cd packages/design-tokens && npm run tokens:build",
  "",
].join("\n");

// A minimal format that dumps every resolved token as a plain nested object
// (token.path -> token.value), so the rest of this script deals with plain
// JS objects instead of Style Dictionary's internal token/platform shapes.
StyleDictionary.registerFormat({
  name: "tree/nested-value",
  format: ({ dictionary }) => {
    const tree = {};
    for (const token of dictionary.allTokens) {
      let node = tree;
      for (const key of token.path.slice(0, -1)) {
        node[key] ??= {};
        node = node[key];
      }
      node[token.path.at(-1)] = token.$value ?? token.value;
    }
    return JSON.stringify(tree, null, 2);
  },
});

// Resolves a set of DTCG token source files into a plain nested object of
// { ...path: value } via a custom Style Dictionary format, so the rest of
// this script works with plain JS objects instead of Style Dictionary's
// internal token shape.
async function resolveTokenTree(sourceGlobs, formatName) {
  const sd = new StyleDictionary({
    source: sourceGlobs,
    usesDtcg: true,
    // Style Dictionary's built-in collision detector assumes formats collapse
    // tokens to a flat leaf name (as css/variables or similar do); our
    // tree/nested-value format keys by the full token.path instead, so a
    // "collision" like radius.sm vs spacing.sm is expected and harmless here.
    log: { warnings: "disabled" },
    platforms: {
      raw: {
        transforms: [],
        buildPath: `${tmpDir}/`,
        files: [{ destination: `${formatName}.json`, format: "tree/nested-value" }],
      },
    },
  });
  await sd.hasInitialized;
  await sd.buildPlatform("raw");
  const raw = await fs.readFile(path.join(tmpDir, `${formatName}.json`), "utf8");
  return JSON.parse(raw);
}

async function readThemes() {
  const themesDir = path.join(packageRoot, "tokens/themes");
  const entries = await fs.readdir(themesDir, { withFileTypes: true });
  const themeDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();

  const themes = [];
  for (const id of themeDirs) {
    const meta = JSON.parse(await fs.readFile(path.join(themesDir, id, "meta.json"), "utf8"));
    if (meta.id !== id) {
      throw new Error(`tokens/themes/${id}/meta.json has id "${meta.id}", expected "${id}"`);
    }
    const tree = await resolveTokenTree([path.join(themesDir, id, "tokens.json")], `theme-${id}`);
    themes.push({ ...meta, colors: tree.color });
  }
  return themes;
}

function assertContrast(themes) {
  const failures = themes.flatMap((theme) => checkTheme(theme.id, theme.colors));
  if (failures.length > 0) {
    console.error("Token build failed — contrast requirements not met:\n");
    for (const failure of failures) console.error(`  - ${failure}`);
    console.error("\nFix the offending color(s) in packages/design-tokens/tokens/themes/<id>/tokens.json and rerun.");
    process.exit(1);
  }
}

function assertExactlyOneDefault(themes, key, label) {
  const matches = themes.filter((t) => t[key]);
  if (matches.length !== 1) {
    throw new Error(
      `Expected exactly one theme with "${key}: true" (${label}), found ${matches.length}: ${matches
        .map((t) => t.id)
        .join(", ") || "none"}`
    );
  }
  return matches[0].id;
}

function colorRoleNames(themes) {
  // Union of every color role across all themes, in first-seen order, so a
  // future theme that's missing a role fails loudly instead of silently.
  const roles = [];
  for (const theme of themes) {
    for (const role of Object.keys(theme.colors)) {
      if (!roles.includes(role)) roles.push(role);
    }
  }
  return roles;
}

function toTsObjectLiteral(value, indent = "  ") {
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return JSON.stringify(value);
  const entries = Object.entries(value)
    .map(([k, v]) => `${indent}  ${/^[a-zA-Z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}: ${toTsObjectLiteral(v, indent + "  ")},`)
    .join("\n");
  return `{\n${entries}\n${indent}}`;
}

async function writeMobileThemes(themes, roles) {
  const outDir = path.join(repoRoot, "mobile/src/theme/generated");
  await fs.mkdir(outDir, { recursive: true });

  const colorFields = roles.map((r) => `  ${r}: string;`).join("\n");
  const themeEntries = themes
    .map(
      (t) => `  ${t.id}: {
    id: ${JSON.stringify(t.id)},
    name: ${JSON.stringify(t.name)},
    colorScheme: ${JSON.stringify(t.colorScheme)},
    colors: ${toTsObjectLiteral(t.colors, "    ")},
  },`
    )
    .join("\n");

  const defaultLight = assertExactlyOneDefault(themes, "isDefaultLight", "default light theme");
  const defaultDark = assertExactlyOneDefault(themes, "isDefaultDark", "default dark theme");

  const contents = `${GENERATED_HEADER}
export type ColorScheme = "light" | "dark";

export interface ThemeColors {
${colorFields}
}

export interface Theme {
  id: string;
  name: string;
  colorScheme: ColorScheme;
  colors: ThemeColors;
}

export const themes = {
${themeEntries}
} as const satisfies Record<string, Theme>;

export type ThemeId = keyof typeof themes;

export const themeIds = Object.keys(themes) as ThemeId[];

export const defaultLightThemeId: ThemeId = ${JSON.stringify(defaultLight)};
export const defaultDarkThemeId: ThemeId = ${JSON.stringify(defaultDark)};
`;

  await fs.writeFile(path.join(outDir, "themes.ts"), contents);

  const defaultThemeColors = themes.find((t) => t.id === defaultLight).colors;
  await fs.writeFile(path.join(outDir, "default-theme.json"), `${JSON.stringify(defaultThemeColors, null, 2)}\n`);
}

async function writeMobileTokens(base) {
  const outDir = path.join(repoRoot, "mobile/src/theme/generated");
  await fs.mkdir(outDir, { recursive: true });

  const contents = `${GENERATED_HEADER}
export const spacing = ${toTsObjectLiteral(base.spacing, "")} as const;

export const radius = ${toTsObjectLiteral(base.radius, "")} as const;

export const motion = ${toTsObjectLiteral(base.motion, "")} as const;

export interface TextStyleTokens {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
}

export const typography = ${toTsObjectLiteral(base.typography, "")} as const satisfies Record<string, TextStyleTokens>;
`;

  await fs.writeFile(path.join(outDir, "tokens.ts"), contents);
}

function cssVarName(...parts) {
  return `--${parts.join("-")}`.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

async function writeKeycloakTheme(themes, base, roles) {
  const outDir = path.join(repoRoot, "infra/keycloak-theme/src/theme/generated");
  await fs.mkdir(outDir, { recursive: true });

  const rootLines = [];
  for (const [key, value] of Object.entries(base.spacing)) rootLines.push(`  ${cssVarName("space", key)}: ${value}px;`);
  for (const [key, value] of Object.entries(base.radius)) rootLines.push(`  ${cssVarName("radius", key)}: ${value}px;`);
  for (const [key, value] of Object.entries(base.motion)) rootLines.push(`  ${cssVarName("motion", key)}: ${value}ms;`);
  for (const [role, style] of Object.entries(base.typography)) {
    rootLines.push(`  ${cssVarName("font", role, "family")}: ${JSON.stringify(style.fontFamily)};`);
    rootLines.push(`  ${cssVarName("font", role, "size")}: ${style.fontSize}px;`);
    rootLines.push(`  ${cssVarName("line-height", role)}: ${style.lineHeight};`);
  }

  const themeBlocks = themes
    .map((theme) => {
      const lines = roles.map((role) => `  ${cssVarName("color", role)}: ${theme.colors[role]};`).join("\n");
      return `:root[data-theme="${theme.id}"] {\n${lines}\n}`;
    })
    .join("\n\n");

  const contents = `/* GENERATED FILE — do not edit by hand.
   Source: packages/design-tokens/tokens/**
   Regenerate with: cd packages/design-tokens && npm run tokens:build */

:root {
${rootLines.join("\n")}
}

${themeBlocks}
`;

  await fs.writeFile(path.join(outDir, "themes.css"), contents);

  const defaultLight = assertExactlyOneDefault(themes, "isDefaultLight", "default light theme");
  const defaultDark = assertExactlyOneDefault(themes, "isDefaultDark", "default dark theme");

  const idsContents = `${GENERATED_HEADER}
export const themeIds = [${themes.map((t) => JSON.stringify(t.id)).join(", ")}] as const;

export type ThemeId = (typeof themeIds)[number];

export const themeNames: Record<ThemeId, string> = {
${themes.map((t) => `  ${t.id}: ${JSON.stringify(t.name)},`).join("\n")}
};

export const colorSchemeByTheme: Record<ThemeId, "light" | "dark"> = {
${themes.map((t) => `  ${t.id}: ${JSON.stringify(t.colorScheme)},`).join("\n")}
};

export const defaultLightThemeId: ThemeId = ${JSON.stringify(defaultLight)};
export const defaultDarkThemeId: ThemeId = ${JSON.stringify(defaultDark)};

export function isThemeId(value: string): value is ThemeId {
  return (themeIds as readonly string[]).includes(value);
}
`;

  await fs.writeFile(path.join(outDir, "theme-ids.ts"), idsContents);
}

async function main() {
  await fs.mkdir(tmpDir, { recursive: true });
  try {
    const base = await resolveTokenTree([path.join(packageRoot, "tokens/base/**/*.json")], "base");
    const themes = await readThemes();

    assertContrast(themes);
    const roles = colorRoleNames(themes);
    for (const theme of themes) {
      const missing = roles.filter((r) => !(r in theme.colors));
      if (missing.length > 0) {
        throw new Error(`Theme "${theme.id}" is missing color role(s): ${missing.join(", ")}`);
      }
    }

    await writeMobileThemes(themes, roles);
    await writeMobileTokens(base);
    await writeKeycloakTheme(themes, base, roles);

    console.log(`Built ${themes.length} theme(s): ${themes.map((t) => t.id).join(", ")}`);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
