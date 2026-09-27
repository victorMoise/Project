import { Alert, Pressable } from 'react-native';
import { Link } from 'expo-router';

import { ListDivider, ListRow } from '@/components/list-row';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/auth-context';
import { spacing, useTheme } from '@/theme';

export function Settings() {
  const theme = useTheme();
  const { signOut } = useAuth();

  function confirmSignOut() {
    Alert.alert('Sign out?', "You'll need to sign in again to use the app.", [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <Screen edges={['bottom']}>
      <Link href="/settings/theme" asChild>
        <ListRow title="Theme" onPress={() => {}} />
      </Link>
      <ListDivider />
      <Pressable
        accessibilityRole="button"
        onPress={confirmSignOut}
        style={(state) => ({
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.md,
          backgroundColor: state.pressed ? theme.colors.surfaceRaised : undefined,
        })}>
        <ThemedText variant="body" color="danger">
          Sign out
        </ThemedText>
      </Pressable>
    </Screen>
  );
}
