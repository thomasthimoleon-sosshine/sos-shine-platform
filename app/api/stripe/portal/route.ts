// ═══════════════════════════════════════════════════════════════
// POST /api/stripe/portal
// Crée un lien vers le portail de facturation Stripe
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getSiteUrl } from '@/lib/stripe/config'

export async function POST() {
  try {
    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe non configuré' }, { status: 500 })
    }

    // L'identité vient de la session, jamais du corps de la requête.
    // Auparavant la route acceptait n'importe quel user_id et ouvrait le
    // portail de facturation correspondant : factures, moyen de paiement et
    // résiliation d'un autre membre, sans aucune authentification.
    const session_supabase = await createServerClient()
    const { data: { user } } = await session_supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
    }
    const user_id = user.id

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
