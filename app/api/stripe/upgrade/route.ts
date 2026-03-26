// ═══════════════════════════════════════════════════════════════
// POST /api/stripe/upgrade
// Change le plan d'un abonnement (upgrade ou downgrade)
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import {
  type PlanId,
  type DurationId,
  isValidPlan,
  getStripePriceId,
  PLAN_ORDER,
} from '@/lib/stripe/config'
import { logPaymentEvent } from '@/lib/stripe/subscription-service'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe non configuré' }, { status: 500 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Configuration manquante' }, { status: 500 })
    }

    const supabase = createSupabaseClient(supabaseUrl, supabaseKey)
    const { user_id, new_plan, duration = 'monthly' } = await request.json()

    if (!user_id || !new_plan) {
      return NextResponse.json({ error: 'user_id et new_plan requis' }, { status: 400 })
    }
    if (!isValidPlan(new_plan)) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    // Récupérer l'abonnement existant
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (!sub || !sub.stripe_subscription_id) {
      return NextResponse.json({ error: 'Aucun abonnement Stripe actif' }, { status: 400 })
    }
    if (sub.plan === new_plan) {
      return NextResponse.json({ error: 'Vous êtes déjà sur ce plan' }, { status: 400 })
    }

    const isUpgrade = PLAN_ORDER[new_plan as PlanId] > PLAN_ORDER[sub.plan as PlanId]

    // Vérifier l'abonnement Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(sub.stripe_subscription_id)
    if (stripeSubscription.status === 'canceled') {
      return NextResponse.json({ error: 'Abonnement annulé, veuillez vous réabonner' }, { status: 400 })
    }

    const newPriceId = getStripePriceId(new_plan as PlanId, duration as DurationId)
    if (!newPriceId) {
      return NextResponse.json({ error: 'Prix non configuré pour ce plan' }, { status: 500 })
    }

    // Modifier l'abonnement Stripe — changement immédiat avec prorata dans les deux sens
    const updatedSubscription = await stripe.subscriptions.update(sub.stripe_subscription_id, {
      items: [{
        id: stripeSubscription.items.data[0].id,
        price: newPriceId,
      }],
      proration_behavior: 'always_invoice',
      cancel_at_period_end: false,
      metadata: {
        ...stripeSubscription.metadata,
        plan: new_plan,
        duration,
        previous_plan: sub.plan,
      },
    })

    // Mettre à jour en base
    await supabase.from('subscriptions').update({
      plan: new_plan,
      duration,
      previous_plan: sub.plan,
      plan_changed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('user_id', user_id)

    await supabase.from('profiles').update({
      plan: new_plan,
      updated_at: new Date().toISOString(),
    }).eq('id', user_id)

    // Logger
    await logPaymentEvent(user_id, isUpgrade ? 'plan_upgraded' : 'plan_downgraded', new_plan, {
      stripe_subscription_id: updatedSubscription.id,
      previous_plan: sub.plan,
      proration: isUpgrade,
      duration,
    })

    return NextResponse.json({
      success: true,
      is_upgrade: isUpgrade,
      new_plan,
      previous_plan: sub.plan,
      message: isUpgrade
        ? `Upgrade vers ${new_plan} effectué`
        : `Changement vers ${new_plan} effectué`,
    })
  } catch (err) {
    console.error('[Upgrade] Erreur:', err)
    return NextResponse.json({ error: 'Erreur lors du changement de plan' }, { status: 500 })
  }
}
