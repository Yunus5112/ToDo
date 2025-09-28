import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TextInput, View, Modal } from 'react-native';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { useTasks } from '@/queries/tasks.hooks';
import { useList } from '@/queries/lists.hooks';
import { taskCreateSchema } from '@/validation/schemas';

export default function ListTasksScreen() {
  const { id } = useLocalSearchParams();
  const listId = useMemo(() => Number(id), [id]);
  const { data, isLoading, isError, isFetching, refetch, createTask, updateTask, toggleTask, deleteTask } = useTasks(listId);
  const { data: list } = useList(listId);

  const [name, setName] = useState('');
  const [editingTask, setEditingTask] = useState<{ id: number; name: string } | null>(null);
  const [editName, setEditName] = useState('');

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
                createTask({ ...parsed.data, description: null, image: null, status: null, priority: null, is_completed: false, due_date: null });
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
                    <Button 
                      title={item.is_completed ? 'Undo' : 'Done'} 
                      onPress={() => toggleTask({ id: item.id, isCompleted: !item.is_completed })}
                      className={`rounded-[12px] px-4 py-3 ${item.is_completed ? 'bg-gray-500' : 'bg-green-500'}`}
                    />
                    <Button 
                      title="Edit" 
                      onPress={() => {
                        setEditingTask({ id: item.id, name: item.name });
                        setEditName(item.name);
                      }}
                      className="rounded-[12px] px-4 py-3 bg-blue-500"
                    />
                    <Button 
                      title="Delete" 
                      onPress={() => deleteTask(item.id)}
                      className="rounded-[12px] px-4 py-3 bg-red-500"
                    />
                  </View>
                </View>
              )}
            />
          )}
        </View>

        {/* Edit Task Modal */}
        <Modal visible={!!editingTask} transparent animationType="fade">
          <View className="flex-1 bg-black/50 items-center justify-center p-4">
            <View className="bg-white rounded-[16px] p-6 w-full max-w-sm">
              <Text className="text-xl font-bold mb-4">Edit Task</Text>
              <TextInput
                className="border border-gray-300 rounded-md p-3 mb-4"
                placeholder="Task name"
                value={editName}
                onChangeText={setEditName}
                autoCapitalize="sentences"
                autoCorrect
              />
              <View className="flex-row gap-3">
                <Button
                  title="Cancel"
                  onPress={() => {
                    setEditingTask(null);
                    setEditName('');
                  }}
                  className="flex-1 rounded-[12px] px-4 py-3 bg-gray-500"
                />
                <Button
                  title="Save"
                  onPress={() => {
                    const parsed = taskCreateSchema.safeParse({ name: editName, list_id: listId });
                    if (!parsed.success) return;
                    updateTask({ id: editingTask!.id, data: { name: parsed.data.name } });
                    setEditingTask(null);
                    setEditName('');
                  }}
                  className="flex-1 rounded-[12px] px-4 py-3 bg-green-500"
                />
              </View>
            </View>
          </View>
        </Modal>
      </Container>
    </>
  );
}


