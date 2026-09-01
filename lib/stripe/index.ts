// ═══════════════════════════════════════════════════════════════
// SOS SHINE - Point d'entrée Stripe
// Réexporte depuis les modules config.ts et client.ts
// pour la rétro-compatibilité des imports existants
// ═══════════════════════════════════════════════════════════════

// Client Stripe
export { getStripe } from './client'

// Configuration complète
export {
  // Types
  type PlanId,
  type DurationId,
  // Stripe IDs
  STRIPE_PRICES,
  PRODUCT_TO_PLAN,
  PRODUCT_TO_PLAN as PRODUCT_IDS,
  PAYMENT_LINKS,
  // Prix
  PRICES,
  TOTAL_PRICES,
  ORIGINAL_PRICES,
  // Durées
  DURATIONS,
  // Infos plans
  PLAN_INFO,
  PLAN_NAMES,
  PLAN_COLORS,
  PLAN_PRICES_EUR as PLAN_PRICES,
  PLAN_ORDER,
  // Coupon
  STRIPE_WAITLIST_COUPON,
  // Validations
  VALID_PLANS,
  VALID_DURATIONS,
  isValidPlan,
  isValidDuration,
  // Helpers
  getStripePriceId,
  getPaymentLink,
  detectPlanFromProductId,
  detectPlanFromAmount,
  hasBundles,
  formatPrice,
  getSavingsPercent,
  mapStripeStatus,
  getSiteUrl,
} from './config'
