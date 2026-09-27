import { apiRequest, type ListQuery } from '@/api/client';
import type { CollectionDto, CreateCollectionCommand, UpdateCollectionCommand } from './types';

const BASE = '/collections-service/api/collections';

export function listCollections(accessToken: string, query: ListQuery = {}) {
  return apiRequest<CollectionDto[]>(BASE, accessToken, { query });
}

export function getCollection(accessToken: string, id: number) {
  return apiRequest<CollectionDto>(`${BASE}/${id}`, accessToken);
}

export function createCollection(accessToken: string, command: CreateCollectionCommand) {
  return apiRequest<number>(BASE, accessToken, { method: 'POST', body: command });
}

export function updateCollection(accessToken: string, id: number, command: UpdateCollectionCommand) {
  return apiRequest<void>(`${BASE}/${id}`, accessToken, { method: 'PUT', body: command });
}

export function deleteCollection(accessToken: string, id: number) {
  return apiRequest<void>(`${BASE}/${id}`, accessToken, { method: 'DELETE' });
}
