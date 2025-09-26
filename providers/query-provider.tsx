import { QueryClient, QueryClientProvider, onlineManager, focusManager } from '@tanstack/react-query';
import * as React from 'react';
import NetInfo from '@react-native-community/netinfo';
import { AppState, AppStateStatus } from 'react-native';

interface QueryProviderProps {
  children: React.ReactNode;
}

// Configure onlineManager to use React Native NetInfo
onlineManager.setEventListener(setOnline => {
  const unsubscribe = NetInfo.addEventListener(state => {
    setOnline(!!state.isConnected);
  });
  return unsubscribe;
});

// Configure focusManager to refetch on app foreground
function onAppStateChange(status: AppStateStatus) {
  focusManager.setFocused(status === 'active');
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = React.useState(() =>
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: 1,
          staleTime: 1000 * 10,
          gcTime: 1000 * 60 * 5,
          refetchOnReconnect: true,
          refetchOnWindowFocus: true,
        },
        mutations: {
          retry: 0,
        },
      },
    })
  );

  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}


