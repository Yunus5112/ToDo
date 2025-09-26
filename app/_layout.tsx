import '../global.css';

import { Stack } from 'expo-router';

import DatabaseProvider from '@/providers/database-provider';
import QueryProvider from '@/providers/query-provider';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Layout() {
  return (
    <QueryProvider>
      <DatabaseProvider>
        <ErrorBoundary>
          <Stack />
        </ErrorBoundary>
      </DatabaseProvider>
    </QueryProvider>
  );
}
