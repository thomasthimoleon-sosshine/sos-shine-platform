// ═══════════════════════════════════════════════════════════════
// POST /api/stripe/portal
// Crée un lien vers le portail de facturation Stripe
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { getSiteUrl } from '@/lib/stripe/config'

export async function POST(request: Request) {
  try {
    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe non configuré' }, { status: 500 })
    }

    const { user_id } = await request.json()
    if (!user_id) {
      return NextResponse.json({ error: 'Utilisateur requis' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Configuration manquante' }, { status: 500 })
    }

    const supabase = createSupabaseClient(supabaseUrl, supabaseKey)
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user_id)
      .single()

    if (!sub?.stripe_customer_id) {
      return NextResponse.json({ error: 'Aucun abonnement trouvé' }, { status: 404 })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${getSiteUrl()}/dashboard/profil`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[Portal] Erreur:', err)
    return NextResponse.json({ error: 'Erreur lors de la création du portail' }, { status: 500 })
  }
}
