'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface FeatureAccess {
  plan: string | null
  isActive: boolean
  isAdmin: boolean
  features: Record<string, boolean>
  loading: boolean
  hasFeature: (key: string) => boolean
}

export function useFeatureAccess(): FeatureAccess {
  const [state, setState] = useState<{
    plan: string | null
    isActive: boolean
    isAdmin: boolean
    features: Record<string, boolean>
    loading: boolean
  }>({
    plan: null,
    isActive: false,
    isAdmin: false,
    features: {},
    loading: true,
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setState(prev => ({ ...prev, loading: false }))
        return
      }

      try {
        const res = await fetch(`/api/subscription/features?user_id=${user.id}`)
        const data = await res.json()

        setState({
          plan: data.plan || null,
          isActive: data.is_active ?? data.is_admin ?? false,
          isAdmin: data.is_admin ?? false,
          features: data.features || {},
          loading: false,
        })
      } catch {
        setState(prev => ({ ...prev, loading: false }))
      }
    }
    load()
  }, [])

  return {
    ...state,
    hasFeature: (key: string) => {
      if (state.isAdmin) return true
      return state.features[key] ?? false
    },
  }
}
