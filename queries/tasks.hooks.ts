import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import type { Task } from '@/types';
import * as tasksApi from './tasks';

const queryKeys = {
  byList: (listId: number) => ['tasks', 'list', listId] as const,
};

export function useTasks(listId: number) {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery<Task[]>({
    queryKey: queryKeys.byList(listId),
    queryFn: () => tasksApi.getTasksByListId(listId),
    enabled: Number.isFinite(listId),
  });

  const createMutation = useMutation({
    mutationFn: (input: Omit<Task, 'id' | 'created_at' | 'updated_at'>) =>
      tasksApi.createTask(input as any),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.byList(listId) }),
    onError: () => Alert.alert('Task could not be created'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: number; isCompleted: boolean }) =>
      tasksApi.toggleTaskCompletion(id, isCompleted),
    onMutate: async ({ id, isCompleted }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.byList(listId) });
      const previous = queryClient.getQueryData<Task[]>(queryKeys.byList(listId));
      if (previous) {
        queryClient.setQueryData<Task[]>(
          queryKeys.byList(listId),
          previous.map(t => (t.id === id ? { ...t, is_completed: isCompleted } : t))
        );
      }
      return { previous } as { previous?: Task[] };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.byList(listId), ctx.previous);
      Alert.alert('Task could not be updated');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.byList(listId) }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => tasksApi.deleteTask(id),
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.byList(listId) });
      const previous = queryClient.getQueryData<Task[]>(queryKeys.byList(listId));
      if (previous) {
        queryClient.setQueryData<Task[]>(queryKeys.byList(listId), previous.filter(t => t.id !== id));
      }
      return { previous } as { previous?: Task[] };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.byList(listId), ctx.previous);
      Alert.alert('Task could not be deleted');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.byList(listId) }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Task> }) => tasksApi.updateTask(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.byList(listId) });
      const previous = queryClient.getQueryData<Task[]>(queryKeys.byList(listId));
      if (previous) {
        queryClient.setQueryData<Task[]>(
          queryKeys.byList(listId),
          previous.map(t => (t.id === id ? { ...t, ...data } : t))
        );
      }
      return { previous } as { previous?: Task[] };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.byList(listId), ctx.previous);
      Alert.alert('Task could not be updated');
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.byList(listId) }),
  });

  return {
    ...tasksQuery,
    createTask: createMutation.mutate,
    toggleTask: toggleMutation.mutate,
    deleteTask: deleteMutation.mutate,
    updateTask: updateMutation.mutate,
  };
}


