import { NextResponse } from 'next/server'
import { getStripe, getStripePriceId } from '@/lib/stripe'
import type { PlanId } from '@/lib/stripe'

/**
 * GET /api/stripe/debug
 * Diagnostic endpoint to test Stripe connectivity and configuration.
 * Returns the status of each component without creating any sessions.
 * PROTECTED: Requires BOT_SECRET or CRON_SECRET authorization.
 */
export async function GET(request: Request) {
  // Protect debug endpoint - only accessible with authorization
  const authHeader = request.headers.get('authorization')
  const secret = process.env.CRON_SECRET || process.env.BOT_SECRET
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? `${process.env.STRIPE_SECRET_KEY.substring(0, 12)}...` : 'MISSING',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET',
    },
    prices: {} as Record<string, string>,
  }

  // Check price IDs
  const plans: PlanId[] = ['essential', 'serenite', 'premium']
  const durations = ['monthly', 'quarterly', 'semiannual', 'annual'] as const
  for (const plan of plans) {
    for (const dur of durations) {
      const priceId = getStripePriceId(plan, dur)
      if (priceId) {
        (results.prices as Record<string, string>)[`${plan}_${dur}`] = priceId
      }
    }
  }

  // Test Stripe connection
  const stripe = getStripe()
  if (!stripe) {
    results.stripe_connection = 'FAILED - getStripe() returned null'
    return NextResponse.json(results)
  }

  try {
    // Simple API call to test connectivity
    const balance = await stripe.balance.retrieve()
    results.stripe_connection = 'OK'
    results.stripe_balance = balance.available?.map(b => `${b.amount} ${b.currency}`)
  } catch (err: unknown) {
    const e = err as { type?: string; code?: string; message?: string }
    results.stripe_connection = 'FAILED'
    results.stripe_error = {
      type: e.type,
      code: e.code,
      message: e.message,
    }
  }

  // Test price retrieval
  const testPriceId = getStripePriceId('essential', 'monthly')
  if (testPriceId && stripe) {
    try {
      const price = await stripe.prices.retrieve(testPriceId)
      results.price_test = {
        status: 'OK',
        id: price.id,
        amount: price.unit_amount,
        currency: price.currency,
        recurring: price.recurring?.interval,
      }
    } catch (err: unknown) {
      const e = err as { type?: string; message?: string }
      results.price_test = {
        status: 'FAILED',
        price_id: testPriceId,
        error: e.message,
      }
    }
  }

  return NextResponse.json(results)
}
