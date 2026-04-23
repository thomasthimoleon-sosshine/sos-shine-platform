'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Features gratuites — accessibles à tous les membres inscrits sans abonnement payant
const FREE_FEATURES = new Set<string>([
  'communaute',
  'mur',
  'shine_audible',
  'gamification',
  'badges',
  'defis',
  'streaks',
  'xp',
])

// Features reserved for Sérénité (49.90€) — not available on Essentielle (9.90€)
const SERENITE_ONLY = new Set<string>([
  'shine_tv',
  'shine_shorts',
  'shine_librairie',
])

interface FeatureAccess {
  plan: string | null
  isActive: boolean
  isAdmin: boolean
  features: Record<string, boolean>
  loading: boolean
  hasFeature: (key: string) => boolean
  /** Recharger les features (ex: après paiement ou upgrade) */
  refresh: () => void
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
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => {
    setState(prev => ({ ...prev, loading: true }))
    setRefreshKey(k => k + 1)
  }, [])

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
          isActive: (data.is_active ?? false) || (data.is_admin ?? false),
          isAdmin: data.is_admin ?? false,
          features: data.features || {},
          loading: false,
        })
      } catch {
        setState(prev => ({ ...prev, loading: false }))
      }
    }
    load()
  }, [refreshKey])

  return {
    ...state,
    hasFeature: (key: string) => {
      if (state.isAdmin) return true
      if (FREE_FEATURES.has(key)) return true
      if (SERENITE_ONLY.has(key)) {
        return state.plan === 'serenite' || state.plan === 'premium'
      }
      return state.features[key] ?? false
    },
    refresh,
  }
}
