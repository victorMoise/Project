import type { ExpoConfig } from 'expo/config';

import defaultTheme from './src/theme/generated/default-theme.json';

// Native config (app icon/splash colors) can't change at runtime, so it's
// pinned to the default light theme -- see docs/plans/themeable-login-plan.md §6.2.
const config: ExpoConfig = {
  name: 'mobile',
  slug: 'mobile',
  version: '1.0.0',
  scheme: 'mobile',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      backgroundColor: defaultTheme.background,
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: ['expo-router', 'expo-font'],
};

export default config;
