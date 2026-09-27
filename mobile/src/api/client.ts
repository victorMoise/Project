import { gatewayUrl } from '@/utils/keycloak-config';

export type ListQuery = {
  limit?: number;
  offset?: number;
};

export type ValidationProblem = {
  status: number;
  title: string;
  errors?: Record<string, string[]>;
};

export class ApiError extends Error {
  status: number;
  problem?: ValidationProblem;

  constructor(message: string, status: number, problem?: ValidationProblem) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.problem = problem;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | undefined>;
};

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(`${gatewayUrl}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export async function apiRequest<T>(path: string, accessToken: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const problem = (await response.json().catch(() => undefined)) as ValidationProblem | undefined;
    throw new ApiError(problem?.title ?? `Request failed with status ${response.status}`, response.status, problem);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
