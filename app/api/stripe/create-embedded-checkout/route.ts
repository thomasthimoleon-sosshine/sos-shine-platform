// ═══════════════════════════════════════════════════════════════
// POST /api/stripe/create-embedded-checkout
// Creates an embedded Stripe Checkout session (returns client_secret)
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'
import {
  type PlanId,
  type DurationId,
  isValidPlan,
  isValidDuration,
  getStripePriceId,
  PLAN_NAMES,
  STRIPE_WAITLIST_COUPON,
} from '@/lib/stripe/config'

function getOrigin(request: Request): string {
  // 1. Origin header (most reliable for same-origin POST requests)
  const origin = request.headers.get('origin')
  if (origin && origin !== 'null') return origin

  // 2. Extract origin from Referer
  const referer = request.headers.get('referer')
  if (referer) {
    try {
      const url = new URL(referer)
      return url.origin
    } catch {}
  }

  // 3. Vercel deployment URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`

  // 4. Configured site URL
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://sosshine.com'
}

export async function POST(request: Request) {
  try {
    const { plan, duration = 'monthly', email, prenom, userId } = await request.json()

    if (!plan || !isValidPlan(plan)) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }
    if (!isValidDuration(duration)) {
      return NextResponse.json({ error: 'Durée invalide' }, { status: 400 })
    }
    if (!userId) {
      return NextResponse.json({ error: 'Vous devez être connecté pour vous abonner' }, { status: 401 })
    }

    // Vérifier que le userId correspond à l'utilisateur authentifié
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
      return NextResponse.json({ error: 'Utilisateur non autorisé' }, { status: 403 })
    }
    const trimmedEmail = email?.trim()?.toLowerCase()
    if (!trimmedEmail) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe non configuré. Vérifiez STRIPE_SECRET_KEY dans les variables d\'environnement.' }, { status: 500 })
    }

    const effectiveDuration: DurationId = (plan === 'essential' && duration !== 'monthly') ? 'monthly' : duration
    const priceId = getStripePriceId(plan as PlanId, effectiveDuration)

    if (!priceId) {
      return NextResponse.json({
        error: `Prix Stripe non configuré pour ${PLAN_NAMES[plan as PlanId]} (${effectiveDuration}). Lancez POST /api/stripe/setup-prices pour créer les prix, puis ajoutez les variables d'environnement STRIPE_PRICE_* dans Vercel.`
      }, { status: 400 })
    }

    const siteOrigin = getOrigin(request)
    const firstName = prenom?.trim() || 'Membre'

    // Vérifier si le plan a un essai gratuit
    const hasTrial = (plan === 'serenite' || plan === 'premium')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionParams: any = {
      mode: 'subscription',
      ui_mode: 'embedded',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: trimmedEmail,
      return_url: `${siteOrigin}/dashboard/tarifs?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        plan,
        duration: effectiveDuration,
        email: trimmedEmail,
        prenom: firstName,
        user_id: userId || '',
      },
      client_reference_id: userId || firstName,
      allow_promotion_codes: true,
      ...(hasTrial ? {
        subscription_data: {
          trial_period_days: 7,
        },
      } : {}),
    }

    if (STRIPE_WAITLIST_COUPON) {
      sessionParams.discounts = [{ coupon: STRIPE_WAITLIST_COUPON }]
      sessionParams.allow_promotion_codes = false
      sessionParams.metadata.waitlist_discount = 'true'
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ clientSecret: session.client_secret })
  } catch (err: unknown) {
    const e = err as { type?: string; message?: string; raw?: { message?: string } }
    console.error('[EmbeddedCheckout] Erreur:', e.type, e.message, e.raw?.message)

    if (e.type === 'StripeInvalidRequestError') {
      return NextResponse.json({ error: `Erreur Stripe: ${e.message}` }, { status: 400 })
    }
    if (e.type === 'StripeAuthenticationError') {
      return NextResponse.json({ error: 'Clé API Stripe invalide. Vérifiez STRIPE_SECRET_KEY.' }, { status: 500 })
    }
    return NextResponse.json({ error: `Erreur: ${e.message || 'inconnue'}` }, { status: 500 })
  }
}
