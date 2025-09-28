import { Link, Stack } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TextInput, View, TouchableOpacity, Modal, Alert } from 'react-native';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { useLists } from '@/queries/lists.hooks';
import { listCreateSchema } from '@/validation/schemas';

export default function Home() {
  const { data, isLoading, isError, refetch, createList, updateList, deleteList, isFetching } = useLists();
  const [newListName, setNewListName] = useState('');
  const [editingList, setEditingList] = useState<{ id: number; name: string } | null>(null);
  const [editName, setEditName] = useState('');

  return (
    <>
      <Stack.Screen options={{ title: 'Lists' }} />
      <Container>
        <View className="gap-3">
          <View className="flex-row gap-2 items-center">
            <TextInput
              className="flex-1 border border-gray-300 rounded-md p-3"
              placeholder="New list name"
              value={newListName}
              onChangeText={setNewListName}
              autoCapitalize="sentences"
              autoCorrect
            />
            <Button
              title="Add"
              disabled={!newListName.trim()}
              onPress={() => {
                const parsed = listCreateSchema.safeParse({ name: newListName });
                if (!parsed.success) {
                  return;
                }
                createList(parsed.data.name);
                setNewListName('');
              }}
            />
          </View>

          {isLoading ? (
            <ActivityIndicator />
          ) : isError ? (
            <Text className="text-red-500">Failed to load lists</Text>
          ) : (
            <FlatList
              data={data ?? []}
              keyExtractor={(item) => String(item.id)}
              refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
              ItemSeparatorComponent={() => <View className="h-[1px] bg-gray-200" />}
              renderItem={({ item }) => (
                <View className="flex-row items-center justify-between py-3">
                  <Link href={{ pathname: '/list/[id]', params: { id: String(item.id) } }} asChild>
                    <TouchableOpacity accessibilityRole="button" className="flex-1" activeOpacity={0.7}>
                      <Text className="text-lg font-semibold">{item.name}</Text>
                      <Text className="text-xs text-gray-500">Tap to view tasks</Text>
                    </TouchableOpacity>
                  </Link>
                  <View className="flex-row gap-2">
                    <Button 
                      title="Edit" 
                      onPress={() => {
                        setEditingList({ id: item.id, name: item.name });
                        setEditName(item.name);
                      }}
                      className="rounded-[12px] px-4 py-3 bg-blue-500"
                    />
                    <Button 
                      title="Delete" 
                      onPress={() => deleteList(item.id)}
                      className="rounded-[12px] px-4 py-3 bg-red-500"
                    />
                  </View>
                </View>
              )}
            />
          )}
        </View>

        {/* Edit Modal */}
        <Modal visible={!!editingList} transparent animationType="fade">
          <View className="flex-1 bg-black/50 items-center justify-center p-4">
            <View className="bg-white rounded-[16px] p-6 w-full max-w-sm">
              <Text className="text-xl font-bold mb-4">Edit List</Text>
              <TextInput
                className="border border-gray-300 rounded-md p-3 mb-4"
                placeholder="List name"
                value={editName}
                onChangeText={setEditName}
                autoCapitalize="sentences"
                autoCorrect
              />
              <View className="flex-row gap-3">
                <Button
                  title="Cancel"
                  onPress={() => {
                    setEditingList(null);
                    setEditName('');
                  }}
                  className="flex-1 rounded-[12px] px-4 py-3 bg-gray-500"
                />
                <Button
                  title="Save"
                  onPress={() => {
                    const parsed = listCreateSchema.safeParse({ name: editName });
                    if (!parsed.success) return;
                    updateList({ id: editingList!.id, name: parsed.data.name });
                    setEditingList(null);
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
