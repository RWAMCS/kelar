'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';

export default function Providers({ children, user }: { children: React.ReactNode, user: any }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } } }));
  const { setUser } = useAppStore();

  useEffect(() => {
    if (user) {
      setUser({
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || "Pengguna",
        email: user.email,
        avatarUrl: user.user_metadata?.avatar_url
      });
    } else {
      setUser(null);
    }
  }, [user, setUser]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
