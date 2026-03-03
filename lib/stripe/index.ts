import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe | null {
  if (stripeInstance) return stripeInstance
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  stripeInstance = new Stripe(key, { apiVersion: '2026-01-28.clover' as Stripe.LatestApiVersion })
  return stripeInstance
}

// Plan types
export type PlanId = 'essential' | 'serenite' | 'premium'
export type DurationId = 'monthly' | 'quarterly' | 'semiannual' | 'annual'

// Stripe Price IDs — set these in env
export const STRIPE_PRICES: Record<string, string> = {
  // Essential (Essentielle) — 9,90€/mois
  essential_monthly: process.env.STRIPE_PRICE_ESSENTIAL_MONTHLY || process.env.STRIPE_PRICE_ESSENTIAL || process.env.STRIPE_PRICE_ID || '',
  essential_quarterly: process.env.STRIPE_PRICE_ESSENTIAL_QUARTERLY || '',
  essential_semiannual: process.env.STRIPE_PRICE_ESSENTIAL_SEMIANNUAL || '',
  essential_annual: process.env.STRIPE_PRICE_ESSENTIAL_ANNUAL || '',

  // Sérénité — 49,90€/mois
  serenite_monthly: process.env.STRIPE_PRICE_SERENITE_MONTHLY || '',
  serenite_quarterly: process.env.STRIPE_PRICE_SERENITE_QUARTERLY || '',
  serenite_semiannual: process.env.STRIPE_PRICE_SERENITE_SEMIANNUAL || '',
  serenite_annual: process.env.STRIPE_PRICE_SERENITE_ANNUAL || '',

  // Premium — 99,90€/mois
  premium_monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || process.env.STRIPE_PRICE_PREMIUM || '',
  premium_quarterly: process.env.STRIPE_PRICE_PREMIUM_QUARTERLY || '',
  premium_semiannual: process.env.STRIPE_PRICE_PREMIUM_SEMIANNUAL || '',
  premium_annual: process.env.STRIPE_PRICE_PREMIUM_ANNUAL || '',
}

// Pricing structure (in euro cents)
// Discounts: ~10% for 3 months, ~20% for 6 months, ~30% for annual
export const PRICES = {
  essential: {
    monthly: 990,           // 9,90€/mois
    quarterly: 890,         // 8,90€/mois (total 26,70€ / 3 mois) — ~10%
    semiannual: 790,        // 7,90€/mois (total 47,40€ / 6 mois) — ~20%
    annual: 690,            // 6,90€/mois (total 82,80€ / an) — ~30%
  },
  serenite: {
    monthly: 4990,          // 49,90€/mois
    quarterly: 4490,        // 44,90€/mois (total 134,70€ / 3 mois) — ~10%
    semiannual: 3990,       // 39,90€/mois (total 239,40€ / 6 mois) — ~20%
    annual: 3390,           // 33,90€/mois (total 406,80€ / an) — ~32%
  },
  premium: {
    monthly: 9990,          // 99,90€/mois
    quarterly: 8990,        // 89,90€/mois (total 269,70€ / 3 mois) — ~10%
    semiannual: 7990,       // 79,90€/mois (total 479,40€ / 6 mois) — ~20%
    annual: 6690,           // 66,90€/mois (total 802,80€ / an) — ~33%
  },
} as const

// Total prices for lump-sum billing (in euro cents)
export const TOTAL_PRICES = {
  essential: {
    monthly: 990,
    quarterly: 2670,        // 26,70€
    semiannual: 4740,       // 47,40€
    annual: 8280,           // 82,80€
  },
  serenite: {
    monthly: 4990,
    quarterly: 13470,       // 134,70€
    semiannual: 23940,      // 239,40€
    annual: 40680,          // 406,80€
  },
  premium: {
    monthly: 9990,
    quarterly: 26970,       // 269,70€
    semiannual: 47940,      // 479,40€
    annual: 80280,          // 802,80€
  },
} as const

// Duration labels and months
export const DURATIONS: { id: DurationId; label: string; months: number; discount: string }[] = [
  { id: 'monthly', label: 'Mensuel', months: 1, discount: '' },
  { id: 'quarterly', label: '3 mois', months: 3, discount: '-10%' },
  { id: 'semiannual', label: '6 mois', months: 6, discount: '-20%' },
  { id: 'annual', label: '1 an', months: 12, discount: '-30%' },
]

// Plan display info
export const PLAN_INFO = {
  essential: {
    name: 'Essentielle',
    tagline: 'L\'autonomie et l\'accès à la base de connaissances',
    hasTrial: false,
  },
  serenite: {
    name: 'Sérénité',
    tagline: 'Un accompagnement énergétique régulier',
    hasTrial: true,
  },
  premium: {
    name: 'Premium',
    tagline: 'L\'immersion totale et l\'accès privilégié',
    hasTrial: true,
  },
} as const

// Get Stripe price ID for a given plan and duration
export function getStripePriceId(plan: PlanId, duration: DurationId): string {
  return STRIPE_PRICES[`${plan}_${duration}`] || ''
}

// Coupon ID for waitlist discount (10€/month forever)
export const STRIPE_WAITLIST_COUPON = process.env.STRIPE_WAITLIST_COUPON_ID || ''

// Pre-launch date
export const PRELAUNCH_END_DATE = new Date('2026-03-22T00:00:00+02:00')

export function isPrelaunchPeriod(): boolean {
  return new Date() < PRELAUNCH_END_DATE
}

// Format price in euros
export function formatPrice(cents: number): string {
  const euros = cents / 100
  return euros.toFixed(2).replace('.', ',') + '€'
}

// Savings percentage for a given duration
export function getSavingsPercent(plan: PlanId, duration: DurationId): number {
  if (duration === 'monthly') return 0
  const monthly = PRICES[plan].monthly
  const discounted = PRICES[plan][duration]
  return Math.round(((monthly - discounted) / monthly) * 100)
}
