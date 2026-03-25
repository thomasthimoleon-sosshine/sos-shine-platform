// ═══════════════════════════════════════════════════════════════
// POST /api/stripe/create-embedded-checkout
// Creates an embedded Stripe Checkout session (returns client_secret)
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import {
  type PlanId,
  type DurationId,
  isValidPlan,
  isValidDuration,
  getStripePriceId,
  PLAN_NAMES,
  STRIPE_WAITLIST_COUPON,
  getSiteUrl,
} from '@/lib/stripe/config'

export async function POST(request: Request) {
  try {
    const { plan, duration = 'monthly', email, prenom, userId } = await request.json()

    if (!plan || !isValidPlan(plan)) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }
    if (!isValidDuration(duration)) {
      return NextResponse.json({ error: 'Durée invalide' }, { status: 400 })
    }
    const trimmedEmail = email?.trim()?.toLowerCase()
    if (!trimmedEmail) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe non configuré' }, { status: 500 })
    }

    const effectiveDuration: DurationId = (plan === 'essential' && duration !== 'monthly') ? 'monthly' : duration
    const priceId = getStripePriceId(plan as PlanId, effectiveDuration)

    if (!priceId) {
      return NextResponse.json({
        error: `L'offre ${PLAN_NAMES[plan as PlanId]} en ${effectiveDuration} n'est pas encore disponible.`
      }, { status: 400 })
    }

    const siteUrl = getSiteUrl()
    const firstName = prenom?.trim() || 'Membre'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionParams: any = {
      mode: 'subscription',
      ui_mode: 'embedded',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: trimmedEmail,
      return_url: `${siteUrl}/dashboard/tarifs?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        plan,
        duration: effectiveDuration,
        email: trimmedEmail,
        prenom: firstName,
        user_id: userId || '',
      },
      client_reference_id: userId || firstName,
      allow_promotion_codes: true,
    }

    if (STRIPE_WAITLIST_COUPON) {
      sessionParams.discounts = [{ coupon: STRIPE_WAITLIST_COUPON }]
      sessionParams.allow_promotion_codes = false
      sessionParams.metadata.waitlist_discount = 'true'
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    console.log(`[EmbeddedCheckout] Session créée: ${session.id} — ${trimmedEmail}, ${plan} ${effectiveDuration}`)
    return NextResponse.json({ clientSecret: session.client_secret })
  } catch (err: unknown) {
    const e = err as { type?: string; message?: string }
    console.error('[EmbeddedCheckout] Erreur:', e.type, e.message)

    if (e.type === 'StripeInvalidRequestError') {
      return NextResponse.json({ error: `Erreur de configuration: ${e.message}` }, { status: 400 })
    }
    return NextResponse.json({ error: `Erreur: ${e.message || 'inconnue'}` }, { status: 500 })
  }
}
