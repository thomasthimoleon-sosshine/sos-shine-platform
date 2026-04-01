// ═══════════════════════════════════════════════════════════════
// POST /api/stripe/checkout
// Crée une session Stripe Checkout pour un abonnement
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
  getSiteUrl,
} from '@/lib/stripe/config'

export async function POST(request: Request) {
  try {
    const { plan, duration = 'monthly', email, prenom, userId } = await request.json()

    // Validation — l'utilisateur doit être connecté
    if (!userId) {
      return NextResponse.json({ error: 'Vous devez être connecté pour vous abonner' }, { status: 401 })
    }

    // Vérifier que le userId correspond à l'utilisateur authentifié
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
      return NextResponse.json({ error: 'Utilisateur non autorisé' }, { status: 403 })
    }
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

    // Essential = mensuel uniquement
    const effectiveDuration: DurationId = (plan === 'essential' && duration !== 'monthly') ? 'monthly' : duration
    const priceId = getStripePriceId(plan as PlanId, effectiveDuration)

    if (!priceId) {
      return NextResponse.json({
        error: `L'offre ${PLAN_NAMES[plan as PlanId]} en ${effectiveDuration} n'est pas encore disponible.`
      }, { status: 400 })
    }

    const siteUrl = getSiteUrl()
    const firstName = prenom?.trim() || 'Membre'

    // Paramètres de la session Checkout
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionParams: any = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: trimmedEmail,
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/dashboard/tarifs`,
      metadata: {
        plan,
        duration: effectiveDuration,
        email: trimmedEmail,
        prenom: firstName,
        user_id: userId,
      },
      client_reference_id: userId,
      allow_promotion_codes: true,
    }

    // Coupon waitlist
    if (STRIPE_WAITLIST_COUPON) {
      sessionParams.discounts = [{ coupon: STRIPE_WAITLIST_COUPON }]
      sessionParams.allow_promotion_codes = false
      sessionParams.metadata.waitlist_discount = 'true'
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    if (!session.url) {
      return NextResponse.json({ error: 'Impossible de créer la session de paiement' }, { status: 500 })
    }

    console.log(`[Checkout] Session créée: ${session.id} — ${trimmedEmail}, ${plan} ${effectiveDuration}`)
    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    const e = err as { type?: string; message?: string }
    console.error('[Checkout] Erreur:', e.type, e.message)

    if (e.type === 'StripeInvalidRequestError') {
      return NextResponse.json({ error: `Erreur de configuration: ${e.message}` }, { status: 400 })
    }
    if (e.type === 'StripeAuthenticationError') {
      return NextResponse.json({ error: "Erreur d'authentification Stripe" }, { status: 500 })
    }
    if (e.type === 'StripeConnectionError') {
      return NextResponse.json({ error: 'Impossible de contacter Stripe. Réessayez.' }, { status: 502 })
    }

    return NextResponse.json({ error: `Erreur: ${e.message || 'inconnue'}` }, { status: 500 })
  }
}
