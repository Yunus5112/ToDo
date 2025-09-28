import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import type { List } from '@/types';
import * as listsApi from './lists';

const queryKeys = {
  all: ['lists'] as const,
  byId: (id: number) => ['lists', 'id', id] as const,
};

export function useLists() {
  const queryClient = useQueryClient();

  const listsQuery = useQuery<List[]>({
    queryKey: queryKeys.all,
    queryFn: listsApi.getAllLists,
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => listsApi.createList(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.all }),
    onError: () => Alert.alert('List could not be created'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => listsApi.updateList(id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.all }),
    onError: () => Alert.alert('List could not be updated'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => listsApi.deleteList(id),
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.all });
      const previous = queryClient.getQueryData<List[]>(queryKeys.all);
      if (previous) {
        queryClient.setQueryData<List[]>(queryKeys.all, previous.filter(l => l.id !== id));
      }
      return { previous } as { previous?: List[] };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.all, ctx.previous);
      Alert.alert('List could not be deleted');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.all }),
  });

  return { ...listsQuery, createList: createMutation.mutate, updateList: updateMutation.mutate, deleteList: deleteMutation.mutate };
}

export function useList(id: number) {
  return useQuery({
    queryKey: queryKeys.byId(id),
    queryFn: () => listsApi.getListById(id),
    enabled: Number.isFinite(id),
  });
}


