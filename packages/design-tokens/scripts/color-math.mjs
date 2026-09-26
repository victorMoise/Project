// Small, dependency-free color helpers shared by check-contrast.mjs and
// scaffold-theme.mjs. Mixing is done in plain sRGB space (linear
// interpolation per channel) — not perceptually uniform, but simple,
// predictable, and good enough for deriving UI surface/text roles from a
// couple of brand colors.

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const bytes = clean.match(/.{2}/g).map((h) => parseInt(h, 16));
  return { r: bytes[0], g: bytes[1], b: bytes[2], a: bytes.length > 3 ? bytes[3] : 255 };
}

export function rgbToHex({ r, g, b, a = 255 }) {
  const toHex = (n) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, "0");
  const base = `${toHex(r)}${toHex(g)}${toHex(b)}`;
  return `#${a === 255 ? base : `${base}${toHex(a)}`}`.toUpperCase();
}

export function mix(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex({
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  });
}

export function withAlpha(hex, alphaByte) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex({ r, g, b, a: alphaByte });
}

export function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const [R, G, B] = [r, g, b]
    .map((v) => v / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function contrastRatio(hexA, hexB) {
  const [lighter, darker] = [relativeLuminance(hexA), relativeLuminance(hexB)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Finds the smallest t in [0, 1] mixing `from` toward `toward` such that the
 * resulting color satisfies every (otherHex, minRatio) contrast constraint.
 * Relies on mixing toward `toward` moving luminance monotonically in one
 * direction (true whenever `toward` is lighter/darker than `from` and every
 * constraint color, e.g. mixing a dark background toward white for text).
 */
export function solveMixForContrast(from, toward, constraints, { step = 0.005 } = {}) {
  for (let t = 0; t <= 1; t += step) {
    const candidate = mix(from, toward, t);
    if (constraints.every(([other, minRatio]) => contrastRatio(candidate, other) >= minRatio)) {
      return { hex: candidate, t };
    }
  }
  throw new Error(
    `Could not satisfy contrast constraints mixing ${from} toward ${toward} (constraints: ${JSON.stringify(constraints)})`
  );
}

/**
 * Picks the largest darkening (mixing `accent` toward black, up to
 * `maxDarken`) that still keeps `onAccent` readable on the result — used for
 * a button's pressed state, which should darken as much as looks good
 * without breaking the label's contrast. Contrast against a fixed dark
 * `onAccent` is NOT monotonic as the accent darkens toward black (it dips
 * once the two luminances cross, then rises again), so this scans downward
 * from the ceiling instead of using solveMixForContrast.
 */
export function darkenWhileReadable(accent, onAccent, minRatio, maxDarken = 0.2, step = 0.01) {
  for (let t = maxDarken; t >= 0; t -= step) {
    const candidate = mix(accent, "#000000", t);
    if (contrastRatio(onAccent, candidate) >= minRatio) return candidate;
  }
  return accent;
}

/**
 * Like solveMixForContrast, but tries mixing `from` toward BOTH white and
 * black and keeps whichever solution stays closer to `from` (smaller t).
 * Needed for a semantic color (e.g. a red "danger" seed) placed against a
 * background that could be either lighter or darker than the seed itself --
 * mixing in only one direction can "solve" the contrast by washing the seed
 * out to near-white/near-black, destroying its hue instead of preserving it.
 */
export function solveMixForContrastPreservingHue(from, constraints, options) {
  const candidates = [];
  for (const toward of ["#FFFFFF", "#000000"]) {
    try {
      candidates.push(solveMixForContrast(from, toward, constraints, options));
    } catch {
      // that direction doesn't satisfy the constraints within [0, 1]; skip it
    }
  }
  if (candidates.length === 0) {
    throw new Error(`Could not satisfy contrast constraints mixing ${from} toward white or black (constraints: ${JSON.stringify(constraints)})`);
  }
  return candidates.sort((a, b) => a.t - b.t)[0];
}

/**
 * Picks the largest lightening (mixing `base` toward white, up to
 * `maxLighten`) that still satisfies every (otherHex, minRatio) contrast
 * constraint — used for "raised" surfaces, which should sit visibly above
 * the background but not so far that a bright accent/text color loses
 * contrast against them. Scans downward from the ceiling for the same
 * non-monotonic reason as `darkenWhileReadable`.
 */
export function lightenWhileReadable(base, constraints, maxLighten = 0.06, step = 0.005) {
  for (let t = maxLighten; t >= 0; t -= step) {
    const candidate = mix(base, "#FFFFFF", t);
    if (constraints.every(([other, minRatio]) => contrastRatio(candidate, other) >= minRatio)) {
      return candidate;
    }
  }
  return base;
}
