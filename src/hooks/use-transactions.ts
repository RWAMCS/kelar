'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export function useTransactions(limit = 50, walletId?: string | null) {
  const supabase = createClient();
  return useQuery({
    queryKey: ['transactions', limit, walletId],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select(`*, wallet:wallets!wallet_id(name,color,icon)`);
        
      if (walletId) {
        query = query.eq('wallet_id', walletId);
      }

      const { data, error } = await query
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 30 // 30 seconds
  });
}

export function useAddTransaction() {
  const supabase = createClient();
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async (tx: {
      type: 'expense' | 'income' | 'transfer';
      amount: number;
      category: string;
      subcategory?: string;
      wallet_id: string;
      to_wallet_id?: string;
      merchant?: string;
      note?: string;
      date?: string;
      confidence?: number;
      metadata?: Record<string, any>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('transactions')
        .insert({ 
          ...tx, 
          user_id: user.id, 
          date: tx.date ?? new Date().toISOString().split('T')[0] 
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['wallets'] });
      qc.invalidateQueries({ queryKey: ['user-progress'] });
      qc.invalidateQueries({ queryKey: ['balance'] });
    }
  });
}
