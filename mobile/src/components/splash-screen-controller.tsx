import { SplashScreen } from 'expo-router';

import { useAuth } from '@/context/auth-context';
import { useThemeActions } from '@/theme';

SplashScreen.preventAutoHideAsync();

export function SplashScreenController({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { isLoading: isAuthLoading } = useAuth();
  const { isLoading: isThemeLoading } = useThemeActions();

  if (!isAuthLoading && !isThemeLoading && fontsLoaded) {
    SplashScreen.hide();
  }

  return null;
}
