import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import type { List } from '@/types';
import * as listsApi from './lists';

const queryKeys = {
  all: ['lists'] as const,
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

  return { ...listsQuery, createList: createMutation.mutate, deleteList: deleteMutation.mutate };
}


