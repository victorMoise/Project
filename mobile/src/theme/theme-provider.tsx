import { createContext, use, useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { useColorScheme, type ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SystemUI from 'expo-system-ui';

import { themes, themeIds, defaultLightThemeId, defaultDarkThemeId, type Theme, type ThemeId } from './generated/themes';

const STORAGE_KEY = 'theme-preference';

export type ThemePreference = ThemeId | 'system';

type ThemeActionsContextValue = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  isLoading: boolean;
};

const ThemeContext = createContext<Theme | null>(null);
const ThemeActionsContext = createContext<ThemeActionsContextValue | null>(null);

export function useTheme() {
  const value = use(ThemeContext);
  if (!value) {
    throw new Error('useTheme must be used within a <ThemeProvider />');
  }
  return value;
}

export function useThemeActions() {
  const value = use(ThemeActionsContext);
  if (!value) {
    throw new Error('useThemeActions must be used within a <ThemeProvider />');
  }
  return value;
}

function isThemePreference(value: string): value is ThemePreference {
  return value === 'system' || (themeIds as string[]).includes(value);
}

function resolveThemeId(preference: ThemePreference, systemColorScheme: ColorSchemeName): ThemeId {
  if (preference !== 'system') {
    return preference;
  }
  return systemColorScheme === 'dark' ? defaultDarkThemeId : defaultLightThemeId;
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemColorScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored && isThemePreference(stored)) {
          setPreferenceState(stored);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const themeId = resolveThemeId(preference, systemColorScheme);
  const theme = themes[themeId];

  // Keeps the OS-drawn areas (e.g. Android's gesture nav bar) from flashing
  // the previous theme's color during a transition.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.background).catch(() => {});
  }, [theme.colors.background]);

  const actions = useMemo<ThemeActionsContextValue>(() => ({ preference, setPreference, isLoading }), [preference, setPreference, isLoading]);

  return (
    <ThemeContext.Provider value={theme}>
      <ThemeActionsContext.Provider value={actions}>{children}</ThemeActionsContext.Provider>
    </ThemeContext.Provider>
  );
}
