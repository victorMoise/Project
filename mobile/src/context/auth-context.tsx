import { createContext, use, useCallback, useEffect, useMemo, type PropsWithChildren } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { useStorageState } from '@/hooks/use-storage-state';
import { keycloakConfig } from '@/utils/keycloak-config';

WebBrowser.maybeCompleteAuthSession();

const SESSION_STORAGE_KEY = 'auth-session';
const TOKEN_EXPIRY_LEEWAY_SECONDS = 30;

type Session = {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt: number;
};

type AuthContextValue = {
  signIn: () => Promise<void>;
  signOut: () => void;
  getAccessToken: () => Promise<string | null>;
  session: Session | null;
  isLoading: boolean;
  isSigningIn: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within an <AuthProvider />');
  }
  return value;
}

function toSession(tokens: AuthSession.TokenResponse): Session {
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    idToken: tokens.idToken,
    expiresAt: tokens.issuedAt + (tokens.expiresIn ?? 0),
  };
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [[isLoadingStorage, storedSession], setStoredSession] = useStorageState(SESSION_STORAGE_KEY);

  const discovery = AuthSession.useAutoDiscovery(keycloakConfig.issuer);
  const redirectUri = useMemo(() => AuthSession.makeRedirectUri({ path: 'redirect' }), []);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: keycloakConfig.clientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
    },
    discovery
  );

  const session = useMemo<Session | null>(() => {
    if (!storedSession) {
      return null;
    }
    try {
      return JSON.parse(storedSession) as Session;
    } catch {
      return null;
    }
  }, [storedSession]);

  const persistTokens = useCallback(
    (tokens: AuthSession.TokenResponse) => {
      setStoredSession(JSON.stringify(toSession(tokens)));
    },
    [setStoredSession]
  );

  useEffect(() => {
    if (response?.type === 'success' && discovery) {
      AuthSession.exchangeCodeAsync(
        {
          clientId: keycloakConfig.clientId,
          code: response.params.code,
          redirectUri,
          extraParams: request?.codeVerifier ? { code_verifier: request.codeVerifier } : undefined,
        },
        discovery
      ).then(persistTokens);
    }
  }, [response, discovery, request, redirectUri, persistTokens]);

  const signIn = useCallback(async () => {
    await promptAsync();
  }, [promptAsync]);

  const signOut = useCallback(() => {
    setStoredSession(null);
  }, [setStoredSession]);

  const getAccessToken = useCallback(async () => {
    if (!session) {
      return null;
    }

    const isExpired = Date.now() / 1000 >= session.expiresAt - TOKEN_EXPIRY_LEEWAY_SECONDS;
    if (!isExpired) {
      return session.accessToken;
    }

    if (!session.refreshToken || !discovery) {
      setStoredSession(null);
      return null;
    }

    try {
      const refreshed = await AuthSession.refreshAsync(
        { clientId: keycloakConfig.clientId, refreshToken: session.refreshToken },
        discovery
      );
      persistTokens(refreshed);
      return refreshed.accessToken;
    } catch {
      setStoredSession(null);
      return null;
    }
  }, [session, discovery, persistTokens, setStoredSession]);

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        getAccessToken,
        session,
        isLoading: isLoadingStorage,
        isSigningIn: !request,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
