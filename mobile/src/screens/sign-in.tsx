import { Button, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/auth-context';

export function SignIn() {
  const { signIn, isSigningIn } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Project</Text>
      <Button title="Sign in" disabled={isSigningIn} onPress={signIn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
});
