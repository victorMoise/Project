function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const keycloakConfig = {
  issuer: requireEnv('EXPO_PUBLIC_KEYCLOAK_ISSUER', process.env.EXPO_PUBLIC_KEYCLOAK_ISSUER),
  clientId: requireEnv('EXPO_PUBLIC_KEYCLOAK_CLIENT_ID', process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID),
};

export const gatewayUrl = requireEnv('EXPO_PUBLIC_GATEWAY_URL', process.env.EXPO_PUBLIC_GATEWAY_URL);
