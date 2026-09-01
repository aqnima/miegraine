'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30 detik data dianggap fresh
            gcTime: 10 * 60 * 1000, // 10 menit Garbage Collection cache di memori
            refetchOnWindowFocus: false, // Menghindari fetch ulang berulang saat kasir ganti tab
            refetchOnReconnect: 'always', // Fetch ulang otomatis saat internet toko tersambung kembali
            networkMode: 'offlineFirst', // Utamakan cache jika offline (Sangat penting untuk POS)
            retry: (failureCount, error: unknown) => {
              // Jangan retry jika error client/auth (401, 403, 404)
              if (failureCount >= 2) return false;
              if (error && typeof error === 'object' && 'status' in error) {
                const status = (error as { status: number }).status;
                if (status === 401 || status === 403 || status === 404) return false;
              }
              return true;
            },
          },
          mutations: {
            networkMode: 'offlineFirst',
            retry: 0, // Mutasi data (bayar/simpan) tidak boleh retry otomatis agar tidak dobel submit
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
