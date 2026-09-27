import { createContext, use, useCallback, useEffect, useMemo, useRef, type PropsWithChildren } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { useStorageState } from '@/hooks/use-storage-state';
import { keycloakConfig } from '@/utils/keycloak-config';
import { useTheme } from '@/theme';

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
  const theme = useTheme();

  const discovery = AuthSession.useAutoDiscovery(keycloakConfig.issuer);
  const redirectUri = useMemo(() => AuthSession.makeRedirectUri({ path: 'redirect' }), []);

  // Lets the Keycloak login page open in the same theme the app is
  // currently using -- see infra/keycloak-theme's ui_theme bootstrap script.
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: keycloakConfig.clientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      extraParams: { ui_theme: theme.id },
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

  // Captured at the moment sign-in is triggered, not read live from `request`:
  // `request` is regenerated (new PKCE challenge) whenever `theme.id` changes,
  // which must not re-run the exchange below with an already-consumed code.
  const codeVerifierRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (response?.type === 'success' && discovery) {
      AuthSession.exchangeCodeAsync(
        {
          clientId: keycloakConfig.clientId,
          code: response.params.code,
          redirectUri,
          extraParams: codeVerifierRef.current ? { code_verifier: codeVerifierRef.current } : undefined,
        },
        discovery
      ).then(persistTokens);
    }
  }, [response, discovery, redirectUri, persistTokens]);

  const signIn = useCallback(async () => {
    codeVerifierRef.current = request?.codeVerifier;
    // Ephemeral: this app manages its own session (SecureStore), so it
    // doesn't need Safari's shared cookie jar for SSO -- and requesting it
    // is what triggers the OS's "<app> Wants to Use <issuer> to Sign In"
    // consent prompt on every sign-in *and* every sign-out. Without shared
    // cookies, Keycloak's login form always renders fresh, which also
    // fixes the old bug where a leftover SSO cookie skipped straight past
    // the form on a second sign-in.
    await promptAsync({ preferEphemeralSession: true });
  }, [promptAsync, request]);

  const signOut = useCallback(() => {
    // Best-effort, silent server-side revocation -- fire-and-forget, no
    // browser UI. With ephemeral sign-in sessions there's no shared cookie
    // to clear, but the refresh token itself remains valid server-side
    // until it expires unless explicitly revoked.
    if (session?.refreshToken && discovery?.revocationEndpoint) {
      AuthSession.revokeAsync({ token: session.refreshToken, clientId: keycloakConfig.clientId }, discovery).catch(() => {});
    }
    setStoredSession(null);
  }, [discovery, session, setStoredSession]);

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
