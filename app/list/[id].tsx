import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { useTasks } from '@/queries/tasks.hooks';
import { useList } from '@/queries/lists.hooks';
import { taskCreateSchema } from '@/validation/schemas';

export default function ListTasksScreen() {
  const { id } = useLocalSearchParams();
  const listId = useMemo(() => Number(id), [id]);
  const { data, isLoading, isError, isFetching, refetch, createTask, toggleTask, deleteTask } = useTasks(listId);
  const { data: list } = useList(listId);

  const [name, setName] = useState('');

  return (
    <>
      <Stack.Screen options={{ title: list?.name ? `${list.name}` : `List #${listId}` }} />
      <Container>
        <View className="gap-3">
          <View className="flex-row gap-2 items-center">
            <TextInput
              className="flex-1 border border-gray-300 rounded-md p-3"
              placeholder="New task name"
              value={name}
              onChangeText={setName}
            />
            <Button
              title="Add"
              disabled={!name.trim()}
              onPress={() => {
                const parsed = taskCreateSchema.safeParse({ name, list_id: listId });
                if (!parsed.success) return;
                createTask(parsed.data);
                setName('');
              }}
            />
          </View>

          {isLoading ? (
            <ActivityIndicator />
          ) : isError ? (
            <Text className="text-red-500">Failed to load tasks</Text>
          ) : (
            <FlatList
              data={data ?? []}
              keyExtractor={(item) => String(item.id)}
              refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
              ItemSeparatorComponent={() => <View className="h-[1px] bg-gray-200" />}
              renderItem={({ item }) => (
                <View className="flex-row items-center justify-between py-3">
                  <View className="flex-1">
                    <Text className={`text-lg font-semibold ${item.is_completed ? 'line-through text-gray-400' : ''}`}>{item.name}</Text>
                    {item.due_date ? (
                      <Text className="text-xs text-gray-500">Due: {new Date(item.due_date).toLocaleString()}</Text>
                    ) : null}
                  </View>
                  <View className="flex-row gap-2">
                    <Button title={item.is_completed ? 'Undo' : 'Done'} onPress={() => toggleTask({ id: item.id, isCompleted: !item.is_completed })} />
                    <Button title="Delete" onPress={() => deleteTask(item.id)} />
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </Container>
    </>
  );
}


