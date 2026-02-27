import { NextResponse } from 'next/server'
import { getStripe, STRIPE_PRICES, STRIPE_WAITLIST_COUPON } from '@/lib/stripe'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import pg from 'pg'

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
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe non configuré' }, { status: 500 })
    }

    const { plan, email, user_id } = await request.json()

    if (!plan || !['essential', 'premium'].includes(plan)) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    // Check if the user is on the waitlist (eligible for 10€ discount)
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
    const priceId = plan === 'premium'
      ? (hasWaitlistDiscount && STRIPE_PRICES.premium_discount ? STRIPE_PRICES.premium_discount : STRIPE_PRICES.premium)
      : (hasWaitlistDiscount && STRIPE_PRICES.essential_discount ? STRIPE_PRICES.essential_discount : STRIPE_PRICES.essential)

    if (!priceId) {
      return NextResponse.json({ error: 'Prix Stripe non configuré' }, { status: 500 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
      || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'http://localhost:5000')

    // Build checkout session params
    const params: Record<string, unknown> = {
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/dashboard?checkout=success`,
      cancel_url: `${siteUrl}/rejoindre?checkout=cancel`,
      metadata: {
        plan,
        email,
        user_id: user_id || '',
        waitlist_discount: hasWaitlistDiscount ? 'true' : 'false',
      },
      subscription_data: {
        metadata: {
          plan,
          email,
          user_id: user_id || '',
          waitlist_discount: hasWaitlistDiscount ? 'true' : 'false',
        },
      },
      allow_promotion_codes: true,
    }

    // Apply waitlist coupon if using standard prices (not discount-specific prices)
    if (hasWaitlistDiscount && STRIPE_WAITLIST_COUPON && !STRIPE_PRICES.essential_discount) {
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
