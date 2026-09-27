import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createCollection, deleteCollection, listCollections, updateCollection } from '@/api/collections';
import type { CreateCollectionCommand, UpdateCollectionCommand } from '@/api/types';
import { useAuth } from '@/context/auth-context';
import { collectionsKey, itemsKey } from './query-keys';

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

export function useCollectionsQuery() {
  const requireAccessToken = useRequireAccessToken();
  return useQuery({
    queryKey: collectionsKey,
    queryFn: async () => listCollections(await requireAccessToken(), { limit: 100 }),
  });
}

export function useCreateCollectionMutation() {
  const requireAccessToken = useRequireAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (command: CreateCollectionCommand) => createCollection(await requireAccessToken(), command),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: collectionsKey }),
  });
}

export function useUpdateCollectionMutation() {
  const requireAccessToken = useRequireAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, command }: { id: number; command: UpdateCollectionCommand }) =>
      updateCollection(await requireAccessToken(), id, command),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: collectionsKey }),
  });
}

export function useDeleteCollectionMutation() {
  const requireAccessToken = useRequireAccessToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => deleteCollection(await requireAccessToken(), id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionsKey });
      // Deleting a collection un-categorizes its items server-side (FK SetNull).
      queryClient.invalidateQueries({ queryKey: itemsKey });
    },
  });
}
