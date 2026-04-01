// ═══════════════════════════════════════════════════════════════
// SOS SHINE - Configuration centralisée Stripe
// Source unique de vérité pour tous les plans, prix et IDs Stripe
// ═══════════════════════════════════════════════════════════════

// ── Types ──

export type PlanId = 'essential' | 'serenite' | 'premium'
export type DurationId = 'monthly' | 'quarterly' | 'semiannual' | 'annual'

// ── Stripe Price IDs ──

export const STRIPE_PRICES: Record<string, string> = {
  essential_monthly:    process.env.STRIPE_PRICE_ESSENTIAL_MONTHLY || '',
  serenite_monthly:     process.env.STRIPE_PRICE_SERENITE_MONTHLY || '',
  serenite_quarterly:   process.env.STRIPE_PRICE_SERENITE_QUARTERLY || '',
  serenite_semiannual:  process.env.STRIPE_PRICE_SERENITE_SEMIANNUAL || '',
  serenite_annual:      process.env.STRIPE_PRICE_SERENITE_ANNUAL || '',
  premium_monthly:      process.env.STRIPE_PRICE_PREMIUM_MONTHLY || '',
  premium_quarterly:    process.env.STRIPE_PRICE_PREMIUM_QUARTERLY || '',
  premium_semiannual:   process.env.STRIPE_PRICE_PREMIUM_SEMIANNUAL || '',
  premium_annual:       process.env.STRIPE_PRICE_PREMIUM_ANNUAL || '',
}

// ── Stripe Product IDs → Plan mapping (pour détection Payment Links dans webhook) ──

export const PRODUCT_TO_PLAN: Record<string, { plan: PlanId; duration: DurationId }> = {
  'prod_U9FSvQJEnIdqJh': { plan: 'essential', duration: 'monthly' },
  'prod_U9FVosDaeyGzYG': { plan: 'serenite', duration: 'monthly' },
  'prod_U9FvGe0nE2YL1M': { plan: 'serenite', duration: 'quarterly' },
  'prod_UCedniSB1YzvJe': { plan: 'serenite', duration: 'quarterly' },
  'prod_U9Fxv3OO6aCI9G': { plan: 'serenite', duration: 'semiannual' },
  'prod_U9FztZbsXCxagW': { plan: 'serenite', duration: 'annual' },
  'prod_U9FXlrYKS7xI3A': { plan: 'premium', duration: 'monthly' },
  'prod_U9G1fXDICPm6KU': { plan: 'premium', duration: 'quarterly' },
  'prod_U9G320t81v6XsG': { plan: 'premium', duration: 'semiannual' },
  'prod_U9G4LI1LUcEoYx': { plan: 'premium', duration: 'annual' },
}

// ── Payment Links ──

export const PAYMENT_LINKS: Record<string, string> = {
  essential_monthly:    'https://buy.stripe.com/3cIcMXducdRx3wResW5ZC0e',
  serenite_monthly:     'https://buy.stripe.com/3cI5kvai06p51oJbgK5ZC0f',
  serenite_quarterly:   'https://buy.stripe.com/eVq8wH2PyeVBc3ngB45ZC0h',
  serenite_semiannual:  'https://buy.stripe.com/6oU5kv61K9Bh6J3doS5ZC0i',
  serenite_annual:      'https://buy.stripe.com/aFafZ93TC00H6J3esW5ZC0j',
  premium_monthly:      'https://buy.stripe.com/28EbIT75O8xd8Rb3Oi5ZC0g',
  premium_quarterly:    'https://buy.stripe.com/bJecMXcq84gXgjDesW5ZC0k',
  premium_semiannual:   'https://buy.stripe.com/6oU14fcq828P3wRbgK5ZC0l',
  premium_annual:       'https://buy.stripe.com/dRm3cnbm414LaZj5Wq5ZC0m',
}

// ── Prix mensuels (en centimes d'euro) ──

export const PRICES: Record<PlanId, Record<DurationId, number>> = {
  essential: {
    monthly: 990,
    quarterly: 990,
    semiannual: 990,
    annual: 990,
  },
  serenite: {
    monthly: 4990,
    quarterly: 4491,     // -10%
    semiannual: 3992,    // -20%
    annual: 3493,        // -30%
  },
  premium: {
    monthly: 9990,
    quarterly: 9657,     // -10%
    semiannual: 9657,    // -20%
    annual: 6993,        // -30%
  },
}

// ── Prix totaux (paiement unique en centimes) ──

export const TOTAL_PRICES: Record<PlanId, Record<DurationId, number>> = {
  essential: {
    monthly: 990,
    quarterly: 2970,
    semiannual: 5940,
    annual: 11880,
  },
  serenite: {
    monthly: 4990,
    quarterly: 13473,
    semiannual: 23952,
    annual: 41916,
  },
  premium: {
    monthly: 9990,
    quarterly: 28970,
    semiannual: 57940,
    annual: 83916,
  },
}

// ── Prix originaux pour barré (en centimes) ──

export const ORIGINAL_PRICES: Record<string, Record<string, number>> = {
  serenite: {
    quarterly: 14970,
    semiannual: 29940,
    annual: 59880,
  },
  premium: {
    quarterly: 29970,
    semiannual: 59940,
    annual: 119880,
  },
}

// ── Durées ──

export const DURATIONS: { id: DurationId; label: string; months: number; discount: string }[] = [
  { id: 'monthly', label: 'Mensuel', months: 1, discount: '' },
  { id: 'quarterly', label: '3 mois', months: 3, discount: '-10%' },
  { id: 'semiannual', label: '6 mois', months: 6, discount: '-20%' },
  { id: 'annual', label: '1 an', months: 12, discount: '-30%' },
]

// ── Infos plans ──

export const PLAN_INFO: Record<PlanId, { name: string; tagline: string; hasTrial: boolean }> = {
  essential: {
    name: 'Essentielle',
    tagline: "L'autonomie et l'accès à la base de connaissances",
    hasTrial: false,
  },
  serenite: {
    name: 'Sérénité',
    tagline: 'Un accompagnement énergétique régulier',
    hasTrial: true,
  },
  premium: {
    name: 'Premium',
    tagline: "L'immersion totale et l'accès privilégié",
    hasTrial: true,
  },
}

export const PLAN_NAMES: Record<PlanId, string> = {
  essential: 'Essentielle',
  serenite: 'Sérénité',
  premium: 'Premium',
}

export const PLAN_COLORS: Record<PlanId, string> = {
  essential: '#74C0FC',
  serenite: '#55EFC4',
  premium: '#D4AF37',
}

export const PLAN_PRICES_EUR: Record<PlanId, number> = {
  essential: 9.90,
  serenite: 49.90,
  premium: 99.90,
}

export const PLAN_ORDER: Record<PlanId, number> = {
  essential: 1,
  serenite: 2,
  premium: 3,
}

// ── Coupon waitlist ──

export const STRIPE_WAITLIST_COUPON = process.env.STRIPE_WAITLIST_COUPON_ID || ''

// ── Validations ──

export const VALID_PLANS: PlanId[] = ['essential', 'serenite', 'premium']
export const VALID_DURATIONS: DurationId[] = ['monthly', 'quarterly', 'semiannual', 'annual']

export function isValidPlan(plan: string): plan is PlanId {
  return VALID_PLANS.includes(plan as PlanId)
}

export function isValidDuration(duration: string): duration is DurationId {
  return VALID_DURATIONS.includes(duration as DurationId)
}

// ── Helpers ──

export function getStripePriceId(plan: PlanId, duration: DurationId): string {
  const key = `${plan}_${duration}`
  return STRIPE_PRICES[key] || ''
}

export function getPaymentLink(plan: PlanId, duration: DurationId): string {
  if (plan === 'essential' && duration !== 'monthly') {
    return PAYMENT_LINKS['essential_monthly'] || ''
  }
  return PAYMENT_LINKS[`${plan}_${duration}`] || ''
}

export function detectPlanFromProductId(productId: string): { plan: PlanId; duration: DurationId } | null {
  return PRODUCT_TO_PLAN[productId] || null
}

export function detectPlanFromAmount(amountCents: number | null): PlanId {
  if (!amountCents) return 'essential'
  // Premium: 99.90€/mois = 9990 cents, annual can be higher
  if (amountCents >= 9000) return 'premium'
  // Sérénité: 49.90€/mois = 4990 cents
  if (amountCents >= 4000) return 'serenite'
  // Essential: 9.90€/mois = 990 cents
  return 'essential'
}

export function hasBundles(plan: PlanId): boolean {
  return plan !== 'essential'
}

export function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',') + '\u20AC'
}

export function getSavingsPercent(plan: PlanId, duration: DurationId): number {
  if (duration === 'monthly') return 0
  const monthly = PRICES[plan].monthly
  const discounted = PRICES[plan][duration]
  return Math.round(((monthly - discounted) / monthly) * 100)
}

export function mapStripeStatus(status: string): 'trialing' | 'active' | 'inactive' | 'canceled' | 'past_due' {
  switch (status) {
    case 'trialing': return 'trialing'
    case 'active': return 'active'
    case 'past_due': return 'past_due'
    case 'canceled':
    case 'unpaid': return 'canceled'
    default: return 'inactive'
  }
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://sosshine.com')
}
