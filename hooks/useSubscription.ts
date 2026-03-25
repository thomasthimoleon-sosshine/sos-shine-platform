'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface SubscriptionState {
  loading: boolean
  isActive: boolean
  isAdmin: boolean
  plan: string | null
  status: string | null
  userId: string | null
}

export function useSubscription(): SubscriptionState {
  const [state, setState] = useState<SubscriptionState>({
    loading: true,
    isActive: false,
    isAdmin: false,
    plan: null,
    status: null,
    userId: null,
  })

  useEffect(() => {
    async function check() {
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
        })
        return
      }

      // Check subscription
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('status, plan')
        .eq('user_id', user.id)
        .maybeSingle()

      const hasActiveSub = sub && (sub.status === 'active' || sub.status === 'trialing')

      setState({
        loading: false,
        isActive: !!hasActiveSub,
        isAdmin: false,
        plan: sub?.plan || null,
        status: sub?.status || null,
        userId: user.id,
      })
    }
    check()
  }, [])

  return state
}
