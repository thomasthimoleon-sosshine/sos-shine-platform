// ═══════════════════════════════════════════════════════════════
// SOS SHINE - Instance Stripe singleton
// ═══════════════════════════════════════════════════════════════

import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe | null {
  if (stripeInstance) return stripeInstance
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    console.error('[Stripe] STRIPE_SECRET_KEY manquant')
    return null
  }
  try {
    stripeInstance = new Stripe(key)
    return stripeInstance
  } catch (err) {
    console.error('[Stripe] Erreur initialisation:', err)
    return null
  }
}
