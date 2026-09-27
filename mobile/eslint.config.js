// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");
const reactNative = require("eslint-plugin-react-native");

// CSS Color Module Level 4 keyword colors -- every hardcoded color value must
// come from a token in `src/theme` instead. `transparent`, `currentColor` and
// `inherit` are allowed exceptions (see docs/plans/themeable-login-plan.md
// §1) and deliberately excluded from this list. Kept in sync by hand with
// scripts/check-color-literals.sh.
const CSS_NAMED_COLORS = [
  "aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque", "black",
  "blanchedalmond", "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse",
  "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue", "darkcyan",
  "darkgoldenrod", "darkgray", "darkgreen", "darkgrey", "darkkhaki", "darkmagenta",
  "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen",
  "darkslateblue", "darkslategray", "darkslategrey", "darkturquoise", "darkviolet", "deeppink",
  "deepskyblue", "dimgray", "dimgrey", "dodgerblue", "firebrick", "floralwhite", "forestgreen",
  "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod", "gray", "grey", "green",
  "greenyellow", "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki", "lavender",
  "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan",
  "lightgoldenrodyellow", "lightgray", "lightgreen", "lightgrey", "lightpink", "lightsalmon",
  "lightseagreen", "lightskyblue", "lightslategray", "lightslategrey", "lightsteelblue",
  "lightyellow", "lime", "limegreen", "linen", "magenta", "maroon", "mediumaquamarine",
  "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue",
  "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream",
  "mistyrose", "moccasin", "navajowhite", "navy", "oldlace", "olive", "olivedrab", "orange",
  "orangered", "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred",
  "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue", "purple", "rebeccapurple",
  "red", "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell",
  "sienna", "silver", "skyblue", "slateblue", "slategray", "slategrey", "snow", "springgreen",
  "steelblue", "tan", "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white",
  "whitesmoke", "yellow", "yellowgreen",
];

const COLOR_LITERAL_REGEX = `^(?:#(?:[0-9a-fA-F]{3,4}){1,2}|(?:rgb|rgba|hsl|hsla)\\([^)]*\\)|${CSS_NAMED_COLORS.join("|")})$`;

module.exports = defineConfig([
  expoConfig,
  {
    plugins: { "react-native": reactNative },
    rules: {
      "react-native/no-color-literals": "error",
    },
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: ["src/theme/generated/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: `Literal[value=/${COLOR_LITERAL_REGEX}/i]`,
          message: "Hardcoded color literal — use a token from '@/theme' instead.",
        },
        {
          selector: `TemplateElement[value.raw=/${COLOR_LITERAL_REGEX}/i]`,
          message: "Hardcoded color literal — use a token from '@/theme' instead.",
        },
      ],
    },
  },
  {
    ignores: ["dist/*"],
  },
]);
