import { NextResponse } from 'next/server'
import { getStripe, getStripePriceId, PLAN_NAMES, STRIPE_WAITLIST_COUPON } from '@/lib/stripe'
import type { PlanId, DurationId } from '@/lib/stripe'

const VALID_PLANS: PlanId[] = ['essential', 'serenite', 'premium']
const VALID_DURATIONS: DurationId[] = ['monthly', 'quarterly', 'semiannual', 'annual']

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://sosshine.com')
}

export async function POST(request: Request) {
  try {
    const { plan, duration = 'monthly', email, prenom } = await request.json()

    if (!plan || !VALID_PLANS.includes(plan)) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    if (!VALID_DURATIONS.includes(duration)) {
      return NextResponse.json({ error: 'Durée invalide' }, { status: 400 })
    }

    const effectiveDuration: DurationId = (plan === 'essential' && duration !== 'monthly') ? 'monthly' : duration
    const trimmedEmail = email?.trim()?.toLowerCase()

    if (!trimmedEmail) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe non configuré' }, { status: 500 })
    }

    // Get Stripe Price ID
    const priceId = getStripePriceId(plan as PlanId, effectiveDuration)
    if (!priceId) {
      return NextResponse.json({ error: `L'offre ${plan} en ${effectiveDuration} n'est pas encore disponible.` }, { status: 400 })
    }

    const siteUrl = getSiteUrl()
    const firstName = prenom?.trim() || 'Membre'
    const planName = PLAN_NAMES[plan as PlanId] || plan

    // Build Stripe Checkout Session params
    const sessionParams: Record<string, unknown> = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: trimmedEmail,
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/rejoindre`,
      metadata: {
        plan,
        duration: effectiveDuration,
        email: trimmedEmail,
        prenom: firstName,
      },
      client_reference_id: firstName,
      allow_promotion_codes: true,
    }

    // Apply waitlist coupon if available
    if (STRIPE_WAITLIST_COUPON) {
      sessionParams.discounts = [{ coupon: STRIPE_WAITLIST_COUPON }]
      sessionParams.allow_promotion_codes = false // Can't combine with promotion codes
      sessionParams.metadata = {
        ...(sessionParams.metadata as Record<string, string>),
        waitlist_discount: 'true',
      }
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create(sessionParams as Parameters<typeof stripe.checkout.sessions.create>[0])

    if (!session.url) {
      return NextResponse.json({ error: 'Impossible de créer la session de paiement' }, { status: 500 })
    }

    console.log(`[Checkout] Session created for ${trimmedEmail} — plan: ${planName} (${effectiveDuration}), session: ${session.id}`)

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    console.error('[Checkout] Error:', err)
    return NextResponse.json({ error: 'Une erreur est survenue. Veuillez réessayer.' }, { status: 500 })
  }
}
