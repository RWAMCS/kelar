"use client";

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export default function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  // We use useMemo or just standard call, but since it's a provider, createClient() inside component is fine.
  
  useEffect(() => {
    const supabase = createClient();
    const ch = supabase.channel(`app-changes-${Date.now()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        qc.invalidateQueries({ queryKey: ['transactions'] });
        qc.invalidateQueries({ queryKey: ['wallets'] });
        qc.invalidateQueries({ queryKey: ['balance'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallets' }, () => {
        qc.invalidateQueries({ queryKey: ['wallets'] });
        qc.invalidateQueries({ queryKey: ['balance'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, () => {
        qc.invalidateQueries({ queryKey: ['goals'] });
        qc.invalidateQueries({ queryKey: ['goals-count'] });
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);
  
  return <>{children}</>;
}
