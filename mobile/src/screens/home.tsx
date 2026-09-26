import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Link } from 'expo-router';

import { Button } from '@/components/button';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/auth-context';
import { fetchFromGateway } from '@/utils/gateway-client';
import { spacing } from '@/theme';

type CallState = { status: 'idle' } | { status: 'loading' } | { status: 'success'; itemCount: number } | { status: 'error'; message: string };

export function Home() {
  const { signOut, getAccessToken } = useAuth();
  const [callState, setCallState] = useState<CallState>({ status: 'idle' });

  const callGateway = useCallback(async () => {
    setCallState({ status: 'loading' });

    const accessToken = await getAccessToken();
    if (!accessToken) {
      setCallState({ status: 'error', message: 'No valid access token — please sign in again.' });
      signOut();
      return;
    }

    try {
      const response = await fetchFromGateway('/collections-service/api/items', accessToken);
      if (!response.ok) {
        setCallState({ status: 'error', message: `Gateway returned ${response.status}` });
        return;
      }

      const items = await response.json();
      setCallState({ status: 'success', itemCount: Array.isArray(items) ? items.length : 0 });
    } catch (error) {
      setCallState({ status: 'error', message: error instanceof Error ? error.message : 'Unknown error' });
    }
  }, [getAccessToken, signOut]);

  return (
    <Screen style={styles.container}>
      <ThemedText variant="title">Signed in</ThemedText>

      <Button title="Call collections-service through Gateway" loading={callState.status === 'loading'} onPress={callGateway} />

      {callState.status === 'success' && <ThemedText>Got {callState.itemCount} item(s) back.</ThemedText>}
      {callState.status === 'error' && <ThemedText color="danger">{callState.message}</ThemedText>}

      <Link href="/settings/theme" asChild>
        <Button variant="secondary" title="Theme" />
      </Link>

      <Button variant="ghost" title="Sign out" onPress={signOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});
