'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useDebts() {
  const supabase = createClient()
  return useQuery({
    queryKey: ['debts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    }
  })
}

export function useAddDebt() {
  const supabase = createClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (debt: {
      person: string
      direction: 'owe' | 'owed'
      amount: number
      note?: string
      due_date?: string
    }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('debts')
        .insert({ ...debt, user_id: user.id })
        .select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['debts'] })
  })
}

export function useSettleDebt() {
  const supabase = createClient()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const { error } = await supabase
        .from('debts')
        .update({ paid_amount: amount })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['debts'] })
  })
}
