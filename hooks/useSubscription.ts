'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSubscription(): { isActive: boolean; loading: boolean } {
  const [isActive, setIsActive] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { setLoading(false); return }
      supabase
        .from('profiles')
        .select('plan')
        .eq('id', data.user.id)
        .maybeSingle()
        .then(({ data: profile }) => {
          setIsActive(profile?.plan != null)
          setLoading(false)
        })
    })
  }, [])

  return { isActive, loading }
}
