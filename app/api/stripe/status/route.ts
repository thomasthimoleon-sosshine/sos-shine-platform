// ═══════════════════════════════════════════════════════════════
// GET /api/stripe/status?user_id=xxx
// Vérifie le statut d'abonnement d'un utilisateur
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'user_id requis' }, { status: 400 })
    }

    // Verify the caller is the same user or an admin
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ active: true })
    }

    if (supabaseAnonKey) {
      try {
        const cookieStore = await cookies()
        const authClient = createServerClient(supabaseUrl, supabaseAnonKey, {
          cookies: { getAll() { return cookieStore.getAll() }, setAll() {} },
        })
        const { data: { user } } = await authClient.auth.getUser()
        if (!user) {
          return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }
        if (user.id !== userId) {
          const { data: profile } = await authClient.from('profiles').select('role').eq('id', user.id).single()
          const isAdmin = profile && ['founder', 'admin_content', 'admin_support'].includes(profile.role)
          if (!isAdmin) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
          }
        }
      } catch {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
      }
    }

    const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

    // Vérifier le profil
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active, plan')
      .eq('id', userId)
      .single()

    if (!profile) {
      return NextResponse.json({ active: false, reason: 'no_profile' })
    }

    // Admins/founders = toujours actifs
    if (['founder', 'admin_content', 'admin_support'].includes(profile.role)) {
      return NextResponse.json({ active: true, role: profile.role })
    }

    // Vérifier l'abonnement
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status, plan, current_period_end, cancel_at_period_end, waitlist_discount, trial_end')
      .eq('user_id', userId)
      .single()

    if (!sub) {
      return NextResponse.json({
        active: profile.is_active !== false,
        has_subscription: false,
        plan: profile.plan,
      })
    }

    // Vérifier si l'essai n'est pas expiré
    const isTrialExpired = sub.status === 'trialing' && sub.trial_end && new Date(sub.trial_end) < new Date()
    const isActive = (sub.status === 'active' || sub.status === 'trialing') && !isTrialExpired

    return NextResponse.json({
      active: isActive,
      has_subscription: true,
      status: sub.status,
      plan: sub.plan,
      current_period_end: sub.current_period_end,
      cancel_at_period_end: sub.cancel_at_period_end,
      waitlist_discount: sub.waitlist_discount,
    })
  } catch (err) {
    console.error('[Status] Erreur:', err)
    return NextResponse.json({ active: true }) // Accès en cas d'erreur
  }
}
