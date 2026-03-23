import { NextResponse } from 'next/server'
import { getStripe, getStripePriceId, getPaymentLink, STRIPE_WAITLIST_COUPON, PLAN_INFO } from '@/lib/stripe'
import type { PlanId, DurationId } from '@/lib/stripe'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import pg from 'pg'

const VALID_PLANS: PlanId[] = ['essential', 'serenite', 'premium']
const VALID_DURATIONS: DurationId[] = ['monthly', 'quarterly', 'semiannual', 'annual']

let pool: pg.Pool | null = null
function getPool() {
  if (pool) return pool
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) return null
  pool = new pg.Pool({ connectionString, max: 5, idleTimeoutMillis: 30000 })
  return pool
}

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

    // If Stripe SDK is not available, return the direct Payment Link as fallback
    if (!stripe) {
      console.error('[Checkout] Stripe SDK not initialized — check STRIPE_SECRET_KEY env var')
      const fallbackLink = getPaymentLink(plan as PlanId, effectiveDuration)
      if (fallbackLink) {
        const separator = fallbackLink.includes('?') ? '&' : '?'
        return NextResponse.json({
          url: `${fallbackLink}${separator}prefilled_email=${encodeURIComponent(email.trim())}`,
          fallback: true,
          hasWaitlistDiscount: false,
        })
      }
      return NextResponse.json({ error: 'Paiement temporairement indisponible. Veuillez réessayer plus tard.' }, { status: 500 })
    }

    // Check if the user is on the waitlist (eligible for discount)
    let hasWaitlistDiscount = false
    const dbPool = getPool()
    if (dbPool) {
      try {
        const result = await dbPool.query(
          'SELECT id FROM waitlist WHERE LOWER(email) = LOWER($1) LIMIT 1',
          [email.trim()]
        )
        hasWaitlistDiscount = (result.rows?.length || 0) > 0
      } catch {
        // If waitlist table doesn't exist or error, check via Supabase
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
        } catch {}
      }
    }

    // Determine price ID
    const priceId = getStripePriceId(plan as PlanId, effectiveDuration)

    if (!priceId) {
      console.error(`[Checkout] No price ID for ${plan}_${effectiveDuration} — check STRIPE_PRICE_* env vars`)
      // Fallback to Payment Link if no price ID configured
      const fallbackLink = getPaymentLink(plan as PlanId, effectiveDuration)
      if (fallbackLink) {
        const separator = fallbackLink.includes('?') ? '&' : '?'
        return NextResponse.json({
          url: `${fallbackLink}${separator}prefilled_email=${encodeURIComponent(email.trim())}`,
          fallback: true,
          hasWaitlistDiscount: false,
        })
      }
      return NextResponse.json({ error: `L'offre ${plan} en ${effectiveDuration} n'est pas encore disponible.` }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
      || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'http://localhost:5000')

    // Determine if this plan has a free trial
    const planInfo = PLAN_INFO[plan as PlanId]
    const hasTrial = planInfo.hasTrial

    // Build checkout session params
    const params: Record<string, unknown> = {
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/inscription-confirmee?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/rejoindre?checkout=cancel`,
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
  } catch (err) {
    console.error('[Checkout] Session creation error:', err)
    // Try to extract plan info from the request for fallback
    try {
      const body = await request.clone().json().catch(() => ({}))
      const { plan, duration = 'monthly', email } = body as { plan?: string; duration?: string; email?: string }
      if (plan && email && VALID_PLANS.includes(plan as PlanId)) {
        const effectiveDuration: DurationId = (plan === 'essential' && duration !== 'monthly') ? 'monthly' : (duration as DurationId)
        const fallbackLink = getPaymentLink(plan as PlanId, effectiveDuration)
        if (fallbackLink) {
          const separator = fallbackLink.includes('?') ? '&' : '?'
          return NextResponse.json({
            url: `${fallbackLink}${separator}prefilled_email=${encodeURIComponent(email.trim())}`,
            fallback: true,
            hasWaitlistDiscount: false,
          })
        }
      }
    } catch {}
    return NextResponse.json({ error: 'Erreur lors de la création de la session. Veuillez réessayer.' }, { status: 500 })
  }
}
