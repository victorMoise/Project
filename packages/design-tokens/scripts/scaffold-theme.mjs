// Derives a full theme (17 color roles) from just two brand colors — a dark
// background and a bright accent — and writes tokens.json + meta.json.
//
// Usage:
//   node scripts/scaffold-theme.mjs <id> "<Display Name>" <backgroundHex> <accentHex>
//
// Every derived role is solved for its required WCAG contrast (see
// README.md's role table) at generation time, so the theme this writes
// should always pass `npm run tokens:build` unless the two input colors are
// pathological (e.g. background lighter than white). Only handles dark
// themes (bright accent on a dark base) — today's actual use case; a
// light-background variant would need the mix directions flipped.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  mix,
  withAlpha,
  contrastRatio,
  relativeLuminance,
  solveMixForContrast,
  solveMixForContrastPreservingHue,
  darkenWhileReadable,
  lightenWhileReadable,
} from "./color-math.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, "..");

const WHITE = "#FFFFFF";
const BLACK = "#000000";
const DANGER_SEED = "#E5484D";
const SUCCESS_SEED = "#30A46C";

function deriveDarkTheme({ background, accent }) {
  if (relativeLuminance(background) > relativeLuminance(WHITE) * 0.5) {
    throw new Error(`background ${background} looks too light for a dark theme — is this really the base color?`);
  }

  // Raised surfaces lighten toward white, but not so far that the accent
  // (also used as link/text color, not just a button fill) loses contrast
  // against them — a bright accent on an already-bright background leaves
  // less headroom for elevation than a deep/dark one.
  const surface = lightenWhileReadable(background, [[accent, 4.5]], 0.06);
  const surfaceRaised = lightenWhileReadable(background, [[accent, 4.5]], 0.12);
  const border = mix(background, WHITE, 0.24);

  const { hex: inputBorder } = solveMixForContrast(background, WHITE, [
    [surface, 3.0],
    [background, 3.0],
  ]);

  // textPrimary is fixed near-white (as bright as the palette allows) so it's
  // always visibly more prominent than textSecondary, which only targets the
  // 4.5:1 AA minimum. A background bright enough to eat most of that
  // headroom (e.g. a vivid electric blue) will narrow the gap between the
  // two, which is an honest consequence of that background choice, not a bug
  // -- the assertions below still guarantee both clear AA.
  const textPrimary = mix(background, WHITE, 0.94);
  for (const [other, label] of [[surface, "surface"], [background, "background"]]) {
    const ratio = contrastRatio(textPrimary, other);
    if (ratio < 4.5) {
      throw new Error(`textPrimary ${textPrimary} vs ${label} ${other} = ${ratio.toFixed(2)}:1, needs >= 4.5:1`);
    }
  }
  const { hex: textSecondary } = solveMixForContrast(background, WHITE, [
    [surface, 4.5],
    [background, 4.5],
  ]);

  // All the accents this script is meant for (neon/pastel) are bright, so the
  // label on top of them is dark. If a future accent is dark instead, this
  // falls back to a light label. Targets 7:1, not just the 4.5:1 minimum, on
  // purpose: a label barely clearing 4.5 leaves accentPressed (below) no room
  // to darken without immediately failing again.
  const accentIsBright = relativeLuminance(accent) > 0.4;
  const textOnAccent = accentIsBright
    ? solveMixForContrast(accent, BLACK, [[accent, 7.0]]).hex
    : solveMixForContrast(accent, WHITE, [[accent, 7.0]]).hex;

  const accentPressed = darkenWhileReadable(accent, textOnAccent, 4.5);

  // Alert surfaces are derived from the semantic seed itself (darkened), not
  // from the theme's own (often very saturated) background -- blending a red
  // seed into e.g. a vivid purple background lets the purple dominate and the
  // "alert box" stops reading as red at all. This also keeps danger/success
  // surfaces visually consistent across every theme.
  const dangerSurface = mix(DANGER_SEED, BLACK, 0.72);
  const successSurface = mix(SUCCESS_SEED, BLACK, 0.72);

  // Mixing a semantic seed color only toward white "solves" contrast against
  // a background that's brighter than the seed by washing it out to near
  // white, destroying its red/green-ness. Try both directions and keep
  // whichever stays closer to the seed. Against a very dark, saturated page
  // background this can still end up fairly pale -- that's a real
  // consequence of AA contrast math against a low-luminance surface, not a
  // derivation bug (the same starting seed against dangerSurface, which is
  // much lower-luminance, stays comfortably closer to a "true" red/green).
  const { hex: danger } = solveMixForContrastPreservingHue(DANGER_SEED, [
    [surface, 4.5],
    [background, 4.5],
    [dangerSurface, 4.5],
  ]);

  const { hex: success } = solveMixForContrastPreservingHue(SUCCESS_SEED, [
    [surface, 4.5],
    [background, 4.5],
    [successSurface, 4.5],
  ]);

  return {
    background,
    surface,
    surfaceRaised,
    border,
    inputBorder,
    textPrimary,
    textSecondary,
    accent,
    accentPressed,
    textOnAccent,
    focusRing: accent,
    danger,
    dangerSurface,
    success,
    successSurface,
    shadow: withAlpha(BLACK, 0x66),
    overlay: withAlpha(BLACK, 0x80),
  };
}

async function main() {
  const [, , id, name, backgroundHex, accentHex] = process.argv;
  if (!id || !name || !backgroundHex || !accentHex) {
    console.error('Usage: node scripts/scaffold-theme.mjs <id> "<Display Name>" <backgroundHex> <accentHex>');
    process.exit(1);
  }
  if (!/^[a-z][a-z0-9-]*$/.test(id)) {
    throw new Error(`theme id "${id}" must be kebab-case (lowercase letters, digits, hyphens)`);
  }

  const colors = deriveDarkTheme({ background: backgroundHex.toUpperCase(), accent: accentHex.toUpperCase() });

  const themeDir = path.join(packageRoot, "tokens/themes", id);
  await fs.mkdir(themeDir, { recursive: true });

  const meta = { id, name, colorScheme: "dark" };
  await fs.writeFile(path.join(themeDir, "meta.json"), `${JSON.stringify(meta, null, 2)}\n`);

  const tokens = {
    color: Object.fromEntries(Object.entries(colors).map(([role, value]) => [role, { $type: "color", $value: value }])),
  };
  await fs.writeFile(path.join(themeDir, "tokens.json"), `${JSON.stringify(tokens, null, 2)}\n`);

  console.log(`Wrote tokens/themes/${id}/ — background ${colors.background}, accent ${colors.accent}`);
  console.log(`  textOnAccent/accent contrast: ${contrastRatio(colors.textOnAccent, colors.accent).toFixed(2)}:1`);
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exit(1);
});
