import { NextResponse } from 'next/server'
import { getStripe, getStripePriceId } from '@/lib/stripe'
import type { PlanId, DurationId } from '@/lib/stripe'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const VALID_PLANS: PlanId[] = ['essential', 'serenite', 'premium']
const PLAN_ORDER: Record<PlanId, number> = { essential: 1, serenite: 2, premium: 3 }

export async function POST(request: Request) {
  try {
    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe non configuré' }, { status: 500 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Config missing' }, { status: 500 })
    }

    const supabase = createSupabaseClient(supabaseUrl, supabaseKey)

    const { user_id, new_plan, duration = 'monthly' } = await request.json()

    if (!user_id || !new_plan) {
      return NextResponse.json({ error: 'user_id et new_plan requis' }, { status: 400 })
    }

    if (!VALID_PLANS.includes(new_plan)) {
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

    // Récupérer l'abonnement Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(sub.stripe_subscription_id)

    if (stripeSubscription.status === 'canceled') {
      return NextResponse.json({ error: 'Abonnement annulé, veuillez vous réabonner' }, { status: 400 })
    }

    const newPriceId = getStripePriceId(new_plan as PlanId, duration as DurationId)
    if (!newPriceId) {
      return NextResponse.json({ error: 'Prix Stripe non configuré pour ce plan' }, { status: 500 })
    }

    // Modifier l'abonnement Stripe
    // Upgrade = immédiat avec prorata, Downgrade = à la fin de la période
    const updatedSubscription = await stripe.subscriptions.update(sub.stripe_subscription_id, {
      items: [{
        id: stripeSubscription.items.data[0].id,
        price: newPriceId,
      }],
      proration_behavior: isUpgrade ? 'create_prorations' : 'none',
      // Pour un downgrade, on applique à la fin de la période
      ...(isUpgrade ? {} : {
        cancel_at_period_end: false,
        metadata: {
          ...stripeSubscription.metadata,
          plan: new_plan,
          pending_downgrade: 'false',
        },
      }),
      metadata: {
        ...stripeSubscription.metadata,
        plan: new_plan,
        duration,
        previous_plan: sub.plan,
      },
    })

    // Mettre à jour dans Supabase
    await supabase.from('subscriptions').update({
      plan: new_plan,
      duration,
      previous_plan: sub.plan,
      plan_changed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('user_id', user_id)

    // Mettre à jour le profil
    await supabase.from('profiles').update({
      plan: new_plan,
      updated_at: new Date().toISOString(),
    }).eq('id', user_id)

    // Logger le changement
    await supabase.from('subscription_payment_logs').insert({
      user_id,
      event_type: isUpgrade ? 'plan_upgraded' : 'plan_downgraded',
      plan: new_plan,
      previous_plan: sub.plan,
      metadata: {
        stripe_subscription_id: updatedSubscription.id,
        proration: isUpgrade,
        duration,
      },
    })

    return NextResponse.json({
      success: true,
      is_upgrade: isUpgrade,
      new_plan,
      previous_plan: sub.plan,
      message: isUpgrade
        ? `Upgrade vers ${new_plan} effectué avec succès`
        : `Changement vers ${new_plan} effectué`,
    })
  } catch (err) {
    console.error('Upgrade error:', err)
    return NextResponse.json({ error: 'Erreur lors du changement de plan' }, { status: 500 })
  }
}
