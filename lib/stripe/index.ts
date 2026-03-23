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

// ─── Stripe Payment Links (direct buy links) ───
export const PAYMENT_LINKS: Partial<Record<string, string>> = {
  // Essentielle — mensuel uniquement
  essential_monthly: 'https://buy.stripe.com/3cIcMXducdRx3wResW5ZC0e',

  // Sérénité
  serenite_monthly:    'https://buy.stripe.com/3cI5kvai06p51oJbgK5ZC0f',
  serenite_quarterly:  'https://buy.stripe.com/eVq8wH2PyeVBc3ngB45ZC0h',
  serenite_semiannual: 'https://buy.stripe.com/6oU5kv61K9Bh6J3doS5ZC0i',
  serenite_annual:     'https://buy.stripe.com/aFafZ93TC00H6J3esW5ZC0j',

  // Premium
  premium_monthly:    'https://buy.stripe.com/28EbIT75O8xd8Rb3Oi5ZC0g',
  premium_quarterly:  'https://buy.stripe.com/bJecMXcq84gXgjDesW5ZC0k',
  premium_semiannual: 'https://buy.stripe.com/6oU14fcq828P3wRbgK5ZC0l',
  premium_annual:     'https://buy.stripe.com/dRm3cnbm414LaZj5Wq5ZC0m',
}

// ─── Stripe Product IDs (pour détection dans le webhook) ───
export const PRODUCT_IDS: Record<string, { plan: PlanId; duration: DurationId }> = {
  // Essentielle
  'prod_U9FSvQJEnIdqJh': { plan: 'essential', duration: 'monthly' },

  // Sérénité
  'prod_U9FVosDaeyGzYG': { plan: 'serenite', duration: 'monthly' },
  'prod_U9FvGe0nE2YL1M': { plan: 'serenite', duration: 'quarterly' },
  'prod_U9Fxv3OO6aCI9G': { plan: 'serenite', duration: 'semiannual' },
  'prod_U9FztZbsXCxagW': { plan: 'serenite', duration: 'annual' },

  // Premium
  'prod_U9FXlrYKS7xI3A': { plan: 'premium', duration: 'monthly' },
  'prod_U9G1fXDICPm6KU': { plan: 'premium', duration: 'quarterly' },
  'prod_U9G320t81v6XsG': { plan: 'premium', duration: 'semiannual' },
  'prod_U9G4LI1LUcEoYx': { plan: 'premium', duration: 'annual' },
}

// Stripe Price IDs — set these in env (fallback pour Checkout API)
export const STRIPE_PRICES: Record<string, string> = {
  essential_monthly: process.env.STRIPE_PRICE_ESSENTIAL_MONTHLY || process.env.STRIPE_PRICE_ESSENTIAL || process.env.STRIPE_PRICE_ID || '',
  essential_quarterly: process.env.STRIPE_PRICE_ESSENTIAL_QUARTERLY || '',
  essential_semiannual: process.env.STRIPE_PRICE_ESSENTIAL_SEMIANNUAL || '',
  essential_annual: process.env.STRIPE_PRICE_ESSENTIAL_ANNUAL || '',
  serenite_monthly: process.env.STRIPE_PRICE_SERENITE_MONTHLY || '',
  serenite_quarterly: process.env.STRIPE_PRICE_SERENITE_QUARTERLY || '',
  serenite_semiannual: process.env.STRIPE_PRICE_SERENITE_SEMIANNUAL || '',
  serenite_annual: process.env.STRIPE_PRICE_SERENITE_ANNUAL || '',
  premium_monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || process.env.STRIPE_PRICE_PREMIUM || '',
  premium_quarterly: process.env.STRIPE_PRICE_PREMIUM_QUARTERLY || '',
  premium_semiannual: process.env.STRIPE_PRICE_PREMIUM_SEMIANNUAL || '',
  premium_annual: process.env.STRIPE_PRICE_PREMIUM_ANNUAL || '',
}

// Pricing structure — per-month price (in euro cents)
export const PRICES = {
  essential: {
    monthly: 990,           // 9,90€/mois
    quarterly: 990,         // pas de bundle Essential
    semiannual: 990,
    annual: 990,
  },
  serenite: {
    monthly: 4990,          // 49,90€/mois
    quarterly: 4491,        // 44,91€/mois (total 134,73€ / 3 mois) — -10%
    semiannual: 3992,       // 39,92€/mois (total 239,52€ / 6 mois) — -20%
    annual: 3493,           // 34,93€/mois (total 419,16€ / 12 mois) — -30%
  },
  premium: {
    monthly: 9990,          // 99,90€/mois
    quarterly: 9657,        // 96,57€/mois (total 289,70€ / 3 mois) — -10%
    semiannual: 9657,       // 96,57€/mois (total 579,40€ / 6 mois) — -20%
    annual: 6993,           // 69,93€/mois (total 839,16€ / 12 mois) — -30%
  },
} as const

// Total prices for lump-sum billing (in euro cents)
export const TOTAL_PRICES = {
  essential: {
    monthly: 990,
    quarterly: 2970,        // 29,70€ (pas de réduction)
    semiannual: 5940,       // 59,40€
    annual: 11880,          // 118,80€
  },
  serenite: {
    monthly: 4990,
    quarterly: 13473,       // 134,73€
    semiannual: 23952,      // 239,52€
    annual: 41916,          // 419,16€
  },
  premium: {
    monthly: 9990,
    quarterly: 28970,       // 289,70€
    semiannual: 57940,      // 579,40€
    annual: 83916,          // 839,16€
  },
} as const

// Original monthly prices for "au lieu de" display (in euro cents)
export const ORIGINAL_PRICES = {
  serenite: {
    quarterly: 14970,       // 149,70€ (49,90 × 3)
    semiannual: 29940,      // 299,40€ (49,90 × 6)
    annual: 59880,          // 598,80€ (49,90 × 12)
  },
  premium: {
    quarterly: 29970,       // 299,70€ (99,90 × 3)
    semiannual: 59940,      // 599,40€ (99,90 × 6)
    annual: 119880,         // 1198,80€ (99,90 × 12)
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

// Get Stripe Payment Link for a given plan and duration
export function getPaymentLink(plan: PlanId, duration: DurationId): string {
  // Essential n'a que le mensuel
  if (plan === 'essential' && duration !== 'monthly') {
    return PAYMENT_LINKS['essential_monthly'] || ''
  }
  return PAYMENT_LINKS[`${plan}_${duration}`] || ''
}

// Detect plan & duration from Stripe Product ID
export function detectPlanFromProductId(productId: string): { plan: PlanId; duration: DurationId } | null {
  return PRODUCT_IDS[productId] || null
}

// Check if a plan has multi-month bundles
export function hasBundles(plan: PlanId): boolean {
  return plan !== 'essential'
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
