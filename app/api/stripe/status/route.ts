// ═══════════════════════════════════════════════════════════════
// GET /api/stripe/status?user_id=xxx
// Vérifie le statut d'abonnement d'un utilisateur
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'user_id requis' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ active: true }) // Accès si pas configuré
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
      .select('status, plan, current_period_end, cancel_at_period_end, waitlist_discount')
      .eq('user_id', userId)
      .single()

    if (!sub) {
      return NextResponse.json({
        active: profile.is_active !== false,
        has_subscription: false,
        plan: profile.plan,
      })
    }

    const isActive = sub.status === 'active' || sub.status === 'trialing'

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
