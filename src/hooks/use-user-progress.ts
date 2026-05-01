'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useUserProgress() {
  const supabase = createClient()
  return useQuery({
    queryKey: ['user-progress'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      
      const { data } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
        
      if (!data) {
        const { data: newRow } = await supabase
          .from('user_progress')
          .insert({ user_id: user.id })
          .select()
          .single()
        return newRow
      }
      return data
    }
  })
}
