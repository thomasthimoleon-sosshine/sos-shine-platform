// ═══════════════════════════════════════════════════════════════
// POST /api/stripe/setup-prices
// Auto-creates all SOS Shine products and prices in Stripe
// Returns the price IDs to configure in Vercel env vars
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'

const PRODUCTS_TO_CREATE = [
  {
    key: 'essential_monthly',
    name: 'SOS Shine — Essentielle',
    description: "L'autonomie et l'accès à la base de connaissances",
    amount: 990,
    interval: 'month' as const,
    interval_count: 1,
  },
  {
    key: 'serenite_monthly',
    name: 'SOS Shine — Sérénité (Mensuel)',
    description: 'Un accompagnement énergétique régulier',
    amount: 4990,
    interval: 'month' as const,
    interval_count: 1,
  },
  {
    key: 'serenite_quarterly',
    name: 'SOS Shine — Sérénité (3 mois)',
    description: 'Un accompagnement énergétique régulier — forfait 3 mois',
    amount: 13473,
    interval: 'month' as const,
    interval_count: 3,
  },
  {
    key: 'serenite_semiannual',
    name: 'SOS Shine — Sérénité (6 mois)',
    description: 'Un accompagnement énergétique régulier — forfait 6 mois',
    amount: 23952,
    interval: 'month' as const,
    interval_count: 6,
  },
  {
    key: 'serenite_annual',
    name: 'SOS Shine — Sérénité (Annuel)',
    description: 'Un accompagnement énergétique régulier — forfait annuel',
    amount: 41916,
    interval: 'year' as const,
    interval_count: 1,
  },
  {
    key: 'premium_monthly',
    name: 'SOS Shine — Premium (Mensuel)',
    description: "L'immersion totale et l'accès privilégié",
    amount: 9990,
    interval: 'month' as const,
    interval_count: 1,
  },
  {
    key: 'premium_quarterly',
    name: 'SOS Shine — Premium (3 mois)',
    description: "L'immersion totale — forfait 3 mois",
    amount: 28970,
    interval: 'month' as const,
    interval_count: 3,
  },
  {
    key: 'premium_semiannual',
    name: 'SOS Shine — Premium (6 mois)',
    description: "L'immersion totale — forfait 6 mois",
    amount: 57940,
    interval: 'month' as const,
    interval_count: 6,
  },
  {
    key: 'premium_annual',
    name: 'SOS Shine — Premium (Annuel)',
    description: "L'immersion totale — forfait annuel",
    amount: 83916,
    interval: 'year' as const,
    interval_count: 1,
  },
]

export async function POST() {
  try {
    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe non configuré. Vérifiez STRIPE_SECRET_KEY.' },
        { status: 500 }
      )
    }

    const results: Record<string, { product_id: string; price_id: string; env_var: string }> = {}

    for (const item of PRODUCTS_TO_CREATE) {
      // Create the product
      const product = await stripe.products.create({
        name: item.name,
        description: item.description,
        metadata: { sos_shine_key: item.key },
      })

      // Create the recurring price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: item.amount,
        currency: 'eur',
        recurring: {
          interval: item.interval,
          interval_count: item.interval_count,
        },
        metadata: { sos_shine_key: item.key },
      })

      const envVar = `STRIPE_PRICE_${item.key.toUpperCase()}`
      results[item.key] = {
        product_id: product.id,
        price_id: price.id,
        env_var: envVar,
      }

      console.log(`[SetupPrices] Created ${item.key}: product=${product.id}, price=${price.id}`)
    }

    // Build env vars block for easy copy-paste
    const envBlock = Object.values(results)
      .map(r => `${r.env_var}=${r.price_id}`)
      .join('\n')

    // Build product-to-plan mapping
    const productMapping = Object.entries(results).map(([key, r]) => ({
      key,
      product_id: r.product_id,
      price_id: r.price_id,
    }))

    return NextResponse.json({
      success: true,
      message: 'Tous les produits et prix ont été créés dans Stripe !',
      instructions: 'Copiez les variables ci-dessous dans Vercel → Settings → Environment Variables',
      env_vars: envBlock,
      details: results,
      product_mapping: productMapping,
    })
  } catch (err: unknown) {
    const e = err as { message?: string }
    console.error('[SetupPrices] Erreur:', e.message)
    return NextResponse.json(
      { error: `Erreur lors de la création: ${e.message}` },
      { status: 500 }
    )
  }
}
