import * as Haptics from 'expo-haptics';

// expo-haptics is a no-op on web, but we guard explicitly rather than relying
// on that, and we never let a haptic failure interrupt the calling code.
function fire(trigger: () => Promise<void>) {
  if (process.env.EXPO_OS === 'web') {
    return;
  }
  void trigger().catch(() => {});
}

export const haptics = {
  stepForward() {
    fire(() => Haptics.selectionAsync());
  },
  invalid() {
    fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
  },
  success() {
    fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
  },
};
