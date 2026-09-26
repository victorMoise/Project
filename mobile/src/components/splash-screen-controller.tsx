import { SplashScreen } from 'expo-router';

import { useAuth } from '@/context/auth-context';

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const { isLoading } = useAuth();

  if (!isLoading) {
    SplashScreen.hide();
  }

  return null;
}
