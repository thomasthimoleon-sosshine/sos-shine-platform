import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe | null {
  if (stripeInstance) return stripeInstance
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  stripeInstance = new Stripe(key, { apiVersion: '2026-01-28.clover' as Stripe.LatestApiVersion })
  return stripeInstance
}

// Stripe Price IDs — set these in env or use defaults
export const STRIPE_PRICES = {
  essential: process.env.STRIPE_PRICE_ESSENTIAL || process.env.STRIPE_PRICE_ID || '',
  premium: process.env.STRIPE_PRICE_PREMIUM || '',
  essential_discount: process.env.STRIPE_PRICE_ESSENTIAL_DISCOUNT || '',
  premium_discount: process.env.STRIPE_PRICE_PREMIUM_DISCOUNT || '',
}

// Standard prices (in euros)
export const PRICES = {
  essential: 2990,        // 29.90€
  premium: 9990,          // 99.90€
  essential_discount: 1990, // 19.90€ (waitlist -10€)
  premium_discount: 8990,   // 89.90€ (waitlist -10€)
}

// Coupon ID for waitlist discount (10€/month forever)
export const STRIPE_WAITLIST_COUPON = process.env.STRIPE_WAITLIST_COUPON_ID || ''

// Pre-launch date
export const PRELAUNCH_END_DATE = new Date('2026-03-22T00:00:00+02:00')

export function isPrelaunchPeriod(): boolean {
  return new Date() < PRELAUNCH_END_DATE
}
