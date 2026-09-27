import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createItem, deleteItem, listItems, updateItem } from '@/modules/collections/api/items';
import type { CreateItemCommand, UpdateItemCommand } from '@/modules/collections/api/types';
import { useAuth } from '@/context/auth-context';
import { itemsKey } from './query-keys';

function useRequireAccessToken() {
  const { getAccessToken } = useAuth();
  return async () => {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Not signed in');
    }
    return token;
  };
}

export function useItemsQuery() {
  const requireAccessToken = useRequireAccessToken();
  return useQuery({
    queryKey: itemsKey,
    queryFn: async () => listItems(await requireAccessToken(), { limit: 100 }),
  });
}

export function useCreateItemMutation() {
  const requireAccessToken = useRequireAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (command: CreateItemCommand) => createItem(await requireAccessToken(), command),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: itemsKey }),
  });
}

export function useUpdateItemMutation() {
  const requireAccessToken = useRequireAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, command }: { id: number; command: UpdateItemCommand }) =>
      updateItem(await requireAccessToken(), id, command),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: itemsKey }),
  });
}

export function useDeleteItemMutation() {
  const requireAccessToken = useRequireAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => deleteItem(await requireAccessToken(), id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: itemsKey }),
  });
}
