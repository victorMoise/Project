import { apiRequest, type ListQuery } from '@/api/client';
import type { CreateItemCommand, ItemDto, UpdateItemCommand } from './types';

const BASE = '/collections-service/api/items';

export function listItems(accessToken: string, query: ListQuery = {}) {
  return apiRequest<ItemDto[]>(BASE, accessToken, { query });
}

export function getItem(accessToken: string, id: number) {
  return apiRequest<ItemDto>(`${BASE}/${id}`, accessToken);
}

export function createItem(accessToken: string, command: CreateItemCommand) {
  return apiRequest<number>(BASE, accessToken, { method: 'POST', body: command });
}

export function updateItem(accessToken: string, id: number, command: UpdateItemCommand) {
  return apiRequest<void>(`${BASE}/${id}`, accessToken, { method: 'PUT', body: command });
}

export function deleteItem(accessToken: string, id: number) {
  return apiRequest<void>(`${BASE}/${id}`, accessToken, { method: 'DELETE' });
}
