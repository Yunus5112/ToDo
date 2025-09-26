import '../global.css';

import { Stack } from 'expo-router';

import DatabaseProvider from '@/providers/database-provider';
import QueryProvider from '@/providers/query-provider';

export default function Layout() {
  return (
    <QueryProvider>
      <DatabaseProvider>
        <Stack />
      </DatabaseProvider>
    </QueryProvider>
  );
}
