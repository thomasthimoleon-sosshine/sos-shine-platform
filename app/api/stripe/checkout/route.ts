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

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
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
    const priceId = getStripePriceId(plan as PlanId, duration as DurationId)

    // If Stripe SDK is not available or price IDs are not configured,
    // fall back to pre-configured Stripe Payment Links
    if (!stripe || !priceId) {
      console.warn(`[Checkout] Falling back to Payment Links — stripe=${!!stripe}, priceId=${priceId || '(empty)'}. Configure STRIPE_PRICE_* env vars for full checkout experience.`)
      const paymentLink = getPaymentLink(plan as PlanId, duration as DurationId)
      if (paymentLink) {
        // Append prefilled email to the payment link
        const url = new URL(paymentLink)
        url.searchParams.set('prefilled_email', email.trim())
        return NextResponse.json({ url: url.toString(), fallback: true, hasWaitlistDiscount })
      }
      return NextResponse.json({ error: 'Paiement temporairement indisponible. Veuillez réessayer plus tard.' }, { status: 500 })
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
        duration,
        email,
        prenom: prenom || '',
        user_id: user_id || '',
        waitlist_discount: hasWaitlistDiscount ? 'true' : 'false',
      },
      subscription_data: {
        metadata: {
          plan,
          duration,
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
    console.error('Checkout session error:', err)
    return NextResponse.json({ error: 'Erreur lors de la création de la session' }, { status: 500 })
  }
}
