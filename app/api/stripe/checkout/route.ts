import { NextResponse } from 'next/server'
import { getStripe, getStripePriceId, getPaymentLink, STRIPE_WAITLIST_COUPON, PLAN_INFO } from '@/lib/stripe'
import type { PlanId, DurationId } from '@/lib/stripe'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const VALID_PLANS: PlanId[] = ['essential', 'serenite', 'premium']
const VALID_DURATIONS: DurationId[] = ['monthly', 'quarterly', 'semiannual', 'annual']

export async function POST(request: Request) {
  try {
    const stripe = getStripe()

    const { plan, duration = 'monthly', email, user_id, prenom } = await request.json()

    if (!plan || !VALID_PLANS.includes(plan)) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    if (!VALID_DURATIONS.includes(duration)) {
      return NextResponse.json({ error: 'Durée invalide' }, { status: 400 })
    }

    // Essential plan only supports monthly — force it server-side
    const effectiveDuration: DurationId = (plan === 'essential' && duration !== 'monthly') ? 'monthly' : duration

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    // If Stripe SDK not available, fallback to Payment Links
    if (!stripe) {
      console.error('[Checkout] Stripe SDK not initialized — falling back to Payment Link')
      return fallbackToPaymentLink(plan as PlanId, effectiveDuration, email, prenom)
    }

    // Check if the user is on the waitlist (eligible for discount)
    let hasWaitlistDiscount = false
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (supabaseUrl && supabaseKey) {
        const sb = createSupabaseClient(supabaseUrl, supabaseKey)
        const { data } = await sb.from('crm_contacts')
          .select('id')
          .eq('email', email.toLowerCase().trim())
          .eq('source', 'waitlist')
          .limit(1)
        hasWaitlistDiscount = (data?.length || 0) > 0
      }
    } catch {
      // Ignore waitlist check errors
    }

    // Determine price ID
    const priceId = getStripePriceId(plan as PlanId, effectiveDuration)

    if (!priceId) {
      console.error(`[Checkout] No price ID for ${plan}_${effectiveDuration} — falling back to Payment Link`)
      return fallbackToPaymentLink(plan as PlanId, effectiveDuration, email, prenom)
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
      || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://sosshine.com')

    // Determine if this plan has a free trial
    const planInfo = PLAN_INFO[plan as PlanId]
    const hasTrial = planInfo.hasTrial

    // Build checkout session params
    const params: Record<string, unknown> = {
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/cancel`,
      metadata: {
        plan,
        duration: effectiveDuration,
        email,
        prenom: prenom || '',
        user_id: user_id || '',
        waitlist_discount: hasWaitlistDiscount ? 'true' : 'false',
      },
      subscription_data: {
        metadata: {
          plan,
          duration: effectiveDuration,
          email,
          prenom: prenom || '',
          user_id: user_id || '',
          waitlist_discount: hasWaitlistDiscount ? 'true' : 'false',
        },
        ...(hasTrial ? { trial_period_days: 7 } : {}),
      },
      allow_promotion_codes: true,
    }

    // Apply waitlist coupon if eligible
    if (hasWaitlistDiscount && STRIPE_WAITLIST_COUPON) {
      (params as Record<string, unknown>).discounts = [{ coupon: STRIPE_WAITLIST_COUPON }]
      // Remove allow_promotion_codes when discounts are applied
      delete (params as Record<string, unknown>).allow_promotion_codes
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const session = await stripe.checkout.sessions.create(params as any)

    return NextResponse.json({
      url: session.url,
      hasWaitlistDiscount,
    })
  } catch (err: unknown) {
    console.error('[Checkout] Session creation error:', err)
    const stripeMsg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Checkout] Error details:', stripeMsg)

    // Fallback to Payment Link on Stripe API errors (e.g. invalid price ID)
    try {
      const body = await request.clone().json().catch(() => ({}))
      const plan = body.plan as PlanId
      const duration = (body.duration || 'monthly') as DurationId
      const effectiveDuration: DurationId = (plan === 'essential' && duration !== 'monthly') ? 'monthly' : duration

      return fallbackToPaymentLink(plan, effectiveDuration, body.email, body.prenom)
    } catch {
      return NextResponse.json({ error: `Erreur lors de la création de la session: ${stripeMsg}` }, { status: 500 })
    }
  }
}

function fallbackToPaymentLink(plan: PlanId, duration: DurationId, email?: string, prenom?: string) {
  const paymentLink = getPaymentLink(plan, duration)
  if (!paymentLink) {
    return NextResponse.json({ error: `L'offre ${plan} en ${duration} n'est pas encore disponible.` }, { status: 400 })
  }

  // Append prefilled email to payment link URL
  const url = new URL(paymentLink)
  if (email) url.searchParams.set('prefilled_email', email)
  if (prenom) url.searchParams.set('client_reference_id', prenom)

  console.log(`[Checkout] Fallback to Payment Link: ${url.toString()}`)

  return NextResponse.json({
    url: url.toString(),
    hasWaitlistDiscount: false,
    fallback: true,
  })
}
