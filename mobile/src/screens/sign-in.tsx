import { StyleSheet } from 'react-native';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/auth-context';
import { spacing } from '@/theme';

export function SignIn() {
  const { signIn, isSigningIn } = useAuth();

  return (
    <Screen style={styles.container}>
      <ThemedText variant="display">Project</ThemedText>
      <Button title="Sign in" loading={isSigningIn} onPress={signIn} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
});
