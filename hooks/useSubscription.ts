'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DISCOVERY_PLAN } from '@/lib/discovery-access'

export interface SubscriptionState {
  loading: boolean
  isActive: boolean
  isAdmin: boolean
  plan: string | null
  status: string | null
  userId: string | null
  /** D'où vient l'accès : abonnement, accès découverte (achat 33€), ou aucun */
  accessSource: 'subscription' | 'discovery' | null
  /** Fin de l'accès découverte, si c'est lui qui ouvre la plateforme */
  discoveryUntil: string | null
  /** Recharger l'état de l'abonnement (ex: après paiement) */
  refresh: () => void
}

export function useSubscription(): SubscriptionState {
  const [state, setState] = useState<Omit<SubscriptionState, 'refresh'>>({
    loading: true,
    isActive: false,
    isAdmin: false,
    plan: null,
    status: null,
    userId: null,
    accessSource: null,
    discoveryUntil: null,
  })
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => {
    setState(prev => ({ ...prev, loading: true }))
    setRefreshKey(k => k + 1)
  }, [])

  useEffect(() => {
    async function check() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setState(prev => ({ ...prev, loading: false }))
          return
        }

        // Check profile role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, plan')
          .eq('id', user.id)
          .single()

        const isAdmin = profile && ['founder', 'admin_content', 'admin_support'].includes(profile.role)

        if (isAdmin) {
          setState({
            loading: false,
            isActive: true,
            isAdmin: true,
            plan: profile.plan || 'premium',
            status: 'active',
            userId: user.id,
            accessSource: 'subscription',
            discoveryUntil: null,
          })
          return
        }

        // Check subscription
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: sub } = await (supabase as any)
          .from('subscriptions')
          .select('status, plan, grace_period_end')
          .eq('user_id', user.id)
          .maybeSingle() as { data: { status: string; plan: string | null; grace_period_end: string | null } | null }

        const isActiveStatus = sub?.status === 'active' || sub?.status === 'trialing'
        const isPastDueInGrace = sub?.status === 'past_due' &&
          sub?.grace_period_end != null &&
          new Date(sub.grace_period_end) > new Date()
        const hasActiveSub = isActiveStatus || isPastDueInGrace

        // Accès découverte : l'achat d'un protocole seul (33€) ouvre toute la
        // plateforme pendant 30 jours. Ensuite, seul le protocole acheté reste.
        let discoveryUntil: string | null = null
        if (!hasActiveSub) {
          try {
            const { data: unlock } = await supabase
              .from('protocol_unlocks')
              .select('discovery_until')
              .eq('user_id', user.id)
              .gt('discovery_until', new Date().toISOString())
              .order('discovery_until', { ascending: false })
              .limit(1)
              .maybeSingle() as { data: { discovery_until: string | null } | null }
            discoveryUntil = unlock?.discovery_until ?? null
          } catch { /* colonne/table absente : pas d'accès découverte */ }
        }

        setState({
          loading: false,
          isActive: !!hasActiveSub || !!discoveryUntil,
          isAdmin: false,
          plan: hasActiveSub ? (sub?.plan || null) : (discoveryUntil ? DISCOVERY_PLAN : null),
          status: sub?.status || null,
          userId: user.id,
          accessSource: hasActiveSub ? 'subscription' : (discoveryUntil ? 'discovery' : null),
          discoveryUntil,
        })
      } catch {
        setState(prev => ({ ...prev, loading: false }))
      }
    }
    check()
  }, [refreshKey])

  return { ...state, refresh }
}
