import { Link, Stack } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TextInput, View, TouchableOpacity } from 'react-native';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { useLists } from '@/queries/lists.hooks';
import { listCreateSchema } from '@/validation/schemas';

export default function Home() {
  const { data, isLoading, isError, refetch, createList, deleteList, isFetching } = useLists();
  const [newListName, setNewListName] = useState('');

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
                  <Button title="Delete" onPress={() => deleteList(item.id)} />
                </View>
              )}
            />
          )}
        </View>
      </Container>
    </>
  );
}
