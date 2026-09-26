import { useFonts, Geist_400Regular, Geist_500Medium, Geist_600SemiBold } from '@expo-google-fonts/geist';

// Keys match the `fontFamily` values in theme/generated/tokens.ts verbatim --
// only the 3 weights the type ramp actually uses.
export function useAppFonts() {
  return useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
  });
}
