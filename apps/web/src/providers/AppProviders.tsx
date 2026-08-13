import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { OrgSettingsProvider } from '../contexts/OrgSettingsContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OrgSettingsProvider>{children}</OrgSettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export { queryClient };
