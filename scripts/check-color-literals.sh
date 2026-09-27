#!/usr/bin/env bash
#
# Repo-wide safety net for the "zero hardcoded color literals" rule (see
# CLAUDE.md). Every color must come from packages/design-tokens -- never a
# raw hex/rgb/hsl value or a CSS color keyword typed directly into source.
#
# This is a blunt, regex-based net, not a parser: it exists to catch anything
# that slips past the language-specific tools (ESLint in mobile/, Stylelint in
# infra/keycloak-theme/), including file types those tools don't cover (e.g.
# .cs). Scope is deliberately limited to source/style file extensions --
# prose docs (*.md) legitimately discuss color values as examples, and
# lockfiles/generated files aren't hand-authored, so neither belongs here.
#
# Usage: ./scripts/check-color-literals.sh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# CSS Color Module Level 4 keyword colors -- kept in sync by hand with
# mobile/eslint.config.js. `transparent`, `currentColor` and `inherit` are
# allowed exceptions (see docs/plans/themeable-login-plan.md §1) and
# deliberately excluded from this list.
NAMED_COLORS='aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|grey|green|greenyellow|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen'

COLOR_PATTERN="#([0-9a-fA-F]{6}([0-9a-fA-F]{2})?|[0-9a-fA-F]{3}[0-9a-fA-F]?)\\b|\\b(rgb|rgba|hsl|hsla)\\(|\\b(${NAMED_COLORS})\\b"

# Extensions where a color literal is a real, hand-authored finding.
SCAN_EXTENSIONS='cs|ts|tsx|js|jsx|mjs|css|scss|html'

# packages/design-tokens/ (whole package, not just tokens/): its scripts are
# the code that *produces* the tokens from a handful of hex seed colors, so
# they're exempt for the same reason tokens/** is -- they're the source of
# truth, not consumers of it.
# mobile/eslint.config.js: contains the CSS named-color list as literal
# strings *by necessity* (it's the data this check enforces against).
EXCLUDE_PATTERN='^packages/design-tokens/|/generated/|package-lock\.json$|\.lock$|^mobile/eslint\.config\.js$'

matches=""
while IFS= read -r file; do
  [[ "$file" =~ $EXCLUDE_PATTERN ]] && continue
  hit="$(grep -nE "$COLOR_PATTERN" "$file" 2>/dev/null || true)"
  if [[ -n "$hit" ]]; then
    matches+=$'\n'"$(echo "$hit" | sed "s|^|${file}:|")"
  fi
done < <(git ls-files | grep -E "\.(${SCAN_EXTENSIONS})\$")

if [[ -n "$matches" ]]; then
  echo "Hardcoded color literal(s) found -- use a token from packages/design-tokens instead:" >&2
  echo "$matches" | sed '/^$/d' >&2
  exit 1
fi

echo "check-color-literals: clean."
