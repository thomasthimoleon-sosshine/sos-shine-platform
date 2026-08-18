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
}

// ── Stripe Product IDs → Plan mapping (pour détection Payment Links dans webhook) ──

export const PRODUCT_TO_PLAN: Record<string, { plan: PlanId; duration: DurationId }> = {
  'prod_U9FSvQJEnIdqJh': { plan: 'essential', duration: 'monthly' },
  'prod_U9FVosDaeyGzYG': { plan: 'serenite', duration: 'monthly' },
  'prod_U9FvGe0nE2YL1M': { plan: 'serenite', duration: 'quarterly' },
  'prod_UCedniSB1YzvJe': { plan: 'serenite', duration: 'quarterly' },
  'prod_U9Fxv3OO6aCI9G': { plan: 'serenite', duration: 'semiannual' },
  'prod_U9FztZbsXCxagW': { plan: 'serenite', duration: 'annual' },
}

// ── Payment Links ──

export const PAYMENT_LINKS: Record<string, string> = {
  essential_monthly:    'https://buy.stripe.com/3cIcMXducdRx3wResW5ZC0e',
  serenite_monthly:     'https://buy.stripe.com/4gM6oz4XGdRx4AV3Oi5ZC0r',
  serenite_quarterly:   'https://buy.stripe.com/eVq8wH2PyeVBc3ngB45ZC0h',
  serenite_semiannual:  'https://buy.stripe.com/6oU5kv61K9Bh6J3doS5ZC0i',
  serenite_annual:      'https://buy.stripe.com/aFafZ93TC00H6J3esW5ZC0j',
}

// ── Accès unique : débloquer UN protocole entier (paiement one-time) ──
export const SINGLE_PROTOCOL_LINK = 'https://buy.stripe.com/9B600b2PycNtd7r98C5ZC0q'
export const SINGLE_PROTOCOL_PRICE_EUR = 33

// Encode l'utilisateur + le protocole acheté dans le client_reference_id Stripe
// (caractères autorisés : alphanumériques, tirets, underscores).
// Format : p_<userId>_<slug>. Le userId est un UUID de 36 caractères.
export function buildProtocolRef(userId: string, slug: string): string {
  return `p_${userId}_${slug}`
}

export function parseProtocolRef(ref: string): { userId: string; slug: string } | null {
  if (!ref.startsWith('p_')) return null
  const rest = ref.slice(2)
  const userId = rest.slice(0, 36)
  const slug = rest.slice(37) // saute l'underscore séparateur
  if (!userId || !slug) return null
  return { userId, slug }
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
    quarterly: 9990,
    semiannual: 9990,
    annual: 9990,
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
    quarterly: 29970,
    semiannual: 59940,
    annual: 119880,
  },
}

// ── Prix originaux pour barré (en centimes) ──

export const ORIGINAL_PRICES: Record<string, Record<string, number>> = {
  serenite: {
    quarterly: 14970,
    semiannual: 29940,
    annual: 59880,
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
    name: 'Essentielle (archivé)',
    tagline: "Plan archivé - non disponible à la vente",
    hasTrial: false,
  },
  serenite: {
    name: 'SOS Shine',
    tagline: 'Accès complet à toute la plateforme',
    hasTrial: false,
  },
  premium: {
    name: 'Premium (archivé)',
    tagline: "Plan archivé - non disponible à la vente",
    hasTrial: false,
  },
}

export const PLAN_NAMES: Record<PlanId, string> = {
  essential: 'Essentielle',
  serenite: 'Sérénité',
  premium: 'Premium (archivé)',
}

export const PLAN_COLORS: Record<PlanId, string> = {
  essential: '#C9A961',
  serenite: '#C9A961',
  premium: '#C9A961',
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

// Plans disponibles à l'achat (Essentielle et Premium archivés)
export const PURCHASABLE_PLANS: PlanId[] = ['serenite']

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
  return PAYMENT_LINKS[`${plan}_${duration}`] || ''
}

export function detectPlanFromProductId(productId: string): { plan: PlanId; duration: DurationId } | null {
  return PRODUCT_TO_PLAN[productId] || null
}

export function detectPlanFromAmount(amountCents: number | null): PlanId {
  if (!amountCents) return 'serenite'
  if (amountCents >= 2000) return 'serenite'
  return 'serenite'
}

export function hasBundles(plan: PlanId): boolean {
  return plan === 'serenite'
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
