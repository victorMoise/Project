import { useCallback, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/auth-context';
import { fetchFromGateway } from '@/utils/gateway-client';

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
    <View style={styles.container}>
      <Text style={styles.title}>Signed in</Text>

      <Button title="Call collections-service through Gateway" onPress={callGateway} />

      {callState.status === 'loading' && <Text>Calling gateway…</Text>}
      {callState.status === 'success' && <Text>Got {callState.itemCount} item(s) back.</Text>}
      {callState.status === 'error' && <Text style={styles.error}>{callState.message}</Text>}

      <Button title="Sign out" onPress={signOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  error: {
    color: 'red',
  },
});
