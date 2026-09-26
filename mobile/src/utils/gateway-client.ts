import { gatewayUrl } from '@/utils/keycloak-config';

export async function fetchFromGateway(path: string, accessToken: string): Promise<Response> {
  return fetch(`${gatewayUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
