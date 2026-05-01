'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export function useGoals() {
  const supabase = createClient();
  return useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data ?? [];
    }
  });
}

export function useUpdateGoalProgress() {
  const supabase = createClient();
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, amountToAdd }: { id: string, amountToAdd: number }) => {
      // First, get the current goal to see its amount
      const { data: goal, error: fetchError } = await supabase
        .from('goals')
        .select('current_amount')
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      const newAmount = (goal.current_amount || 0) + amountToAdd;
      
      const { data, error } = await supabase
        .from('goals')
        .update({ current_amount: newAmount })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] });
    }
  });
}
