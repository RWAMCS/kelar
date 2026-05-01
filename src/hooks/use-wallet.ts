'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

export function useWallets() {
  const supabase = createClient()
  const qc = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel(`wallets-realtime-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wallets' },
        () => {
          qc.invalidateQueries({ queryKey: ['wallets'] })
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, qc])

  return useQuery({
    queryKey: ['wallets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .order('created_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
    staleTime: 1000 * 30
  })
}

export function useTotalBalance() {
  const { data: wallets } = useWallets()
  return wallets?.reduce((sum, w) => sum + (w.balance ?? 0), 0) ?? 0
}

export function useAddWallet() {
  const supabase = createClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (w: {
      name: string
      type: string
      balance: number
      color: string
      icon: string
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('wallets')
        .insert({ ...w, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wallets'] })
  })
}

export function useDeductFromWallet() {
  const supabase = createClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ walletId, amount }: { walletId: string; amount: number }) => {
      // Get current balance first
      const { data: wallet, error: fetchErr } = await supabase
        .from('wallets')
        .select('balance')
        .eq('id', walletId)
        .single()
      if (fetchErr) throw fetchErr
      const newBalance = (wallet.balance ?? 0) - amount
      if (newBalance < 0) throw new Error('Saldo tidak cukup untuk menabung sebesar ini.')
      const { error } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', walletId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallets'] })
      qc.invalidateQueries({ queryKey: ['balance'] })
    }
  })
}
