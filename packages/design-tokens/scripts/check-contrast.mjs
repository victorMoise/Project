// Pure WCAG 2.x contrast-ratio checks, run against every theme's resolved
// color tokens before any output file is written. See docs/plans/themeable-login-plan.md §4.2.

function relativeLuminance(hex) {
  const [r, g, b] = hex
    .slice(1, 7)
    .match(/../g)
    .map((h) => parseInt(h, 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hexA, hexB) {
  const [lighter, darker] = [relativeLuminance(hexA), relativeLuminance(hexB)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

// [roleA, roleB, minimumRatio, note]
// 4.5  = WCAG AA normal text (§1.4.3)
// 3.0  = WCAG AA non-text UI components / focus indicators (§1.4.11)
export const requiredPairs = [
  ["textPrimary", "surface", 4.5],
  ["textPrimary", "background", 4.5],
  ["textSecondary", "surface", 4.5],
  ["textSecondary", "background", 4.5],
  ["accent", "surface", 4.5, "used as link/text color, not only as a button fill"],
  ["textOnAccent", "accent", 4.5],
  ["textOnAccent", "accentPressed", 4.5, "button stays readable while pressed"],
  ["focusRing", "background", 3.0],
  ["inputBorder", "surface", 3.0],
  ["inputBorder", "background", 3.0],
  ["danger", "surface", 4.5],
  ["danger", "dangerSurface", 4.5],
  ["success", "surface", 4.5],
  ["success", "successSurface", 4.5],
];

export function checkTheme(themeId, colors) {
  const failures = [];
  for (const [roleA, roleB, min, note] of requiredPairs) {
    const hexA = colors[roleA];
    const hexB = colors[roleB];
    if (!hexA || !hexB) {
      failures.push(`${themeId}: missing color role "${!hexA ? roleA : roleB}" required for the ${roleA}/${roleB} pair`);
      continue;
    }
    const ratio = contrastRatio(hexA, hexB);
    if (ratio < min) {
      const suffix = note ? ` (${note})` : "";
      failures.push(
        `${themeId}: ${roleA} (${hexA}) vs ${roleB} (${hexB}) = ${ratio.toFixed(2)}:1, needs >= ${min}:1${suffix}`
      );
    }
  }
  return failures;
}
