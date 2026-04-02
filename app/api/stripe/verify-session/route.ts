// ═══════════════════════════════════════════════════════════════
// POST /api/stripe/verify-session
// Filet de sécurité : si le webhook n'a pas fonctionné,
// cette route déclenche le même flux complet.
// Appelée par la page /success après le paiement.
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import {
  detectPlanFromSession,
  isPaymentAlreadyProcessed,
  processSuccessfulPayment,
} from '@/lib/stripe/subscription-service'

export async function POST(request: Request) {
  try {
    const { session_id } = await request.json()

    if (!session_id) {
      return NextResponse.json({ error: 'session_id requis' }, { status: 400 })
    }

    const stripe = getStripe()
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe non configuré' }, { status: 500 })
    }

    // Récupérer la session Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription'],
    })

    // Vérifier que le paiement est valide
    // 'unpaid' = essai gratuit (trial) → la session est complète mais pas encore de paiement
    const isValid = session.status === 'complete'
      || session.payment_status === 'paid'
      || session.payment_status === 'no_payment_required'
      || session.payment_status === 'unpaid' // Essais gratuits (trial 7 jours)

    if (!isValid) {
      return NextResponse.json({
        verified: false,
        status: session.status,
        payment_status: session.payment_status,
      })
    }

    // Récupérer l'ID de subscription
    const subscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      : (session.subscription as any)?.id

    // Vérifier si le webhook a déjà traité ce paiement
    if (subscriptionId) {
      const check = await isPaymentAlreadyProcessed(subscriptionId)
      if (check.processed) {
        return NextResponse.json({
          verified: true,
          email_sent: check.emailSent || false,
          webhook_processed: true,
        })
      }
    }

    // Le webhook n'a pas traité → on fait le flux complet
    // L'utilisateur est connecté : userId vient des metadata
    const userId = session.metadata?.user_id
    const email = session.customer_email || session.metadata?.email

    if (!userId) {
      return NextResponse.json({ verified: true, email_sent: false, reason: 'no_user_id' })
    }
    if (!email) {
      return NextResponse.json({ verified: true, email_sent: false, reason: 'no_email' })
    }

    const customerId = session.customer as string

    // Récupérer l'abonnement Stripe pour les détails
    let stripeStatus = 'active'
    let currentPeriodEnd: number | undefined
    let cancelAtPeriodEnd = false
    let trialEnd: number | null = null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let subForDetection: any = null

    if (subscriptionId) {
      try {
        const sub = await stripe.subscriptions.retrieve(subscriptionId) as unknown as {
          status: string
          current_period_end: number
          cancel_at_period_end: boolean
          trial_end: number | null
          items: { data: Array<{ price: { unit_amount: number | null; product: string; recurring: { interval: string; interval_count: number } | null } }> }
        }
        stripeStatus = sub.status
        currentPeriodEnd = sub.current_period_end
        cancelAtPeriodEnd = sub.cancel_at_period_end
        trialEnd = sub.trial_end
        subForDetection = sub
      } catch {
        // Ignore — on continue avec les valeurs par défaut
      }
    }

    // Détecter le plan
    const { plan, duration } = detectPlanFromSession(session, subForDetection)

    // Activer l'abonnement pour l'utilisateur connecté
    const result = await processSuccessfulPayment({
      userId,
      email,
      prenom: session.metadata?.prenom || null,
      plan,
      duration,
      stripeCustomerId: customerId || null,
      stripeSubscriptionId: subscriptionId || null,
      stripeStatus,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      trialEnd,
      waitlistDiscount: session.metadata?.waitlist_discount === 'true',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      amountTotal: (session as any).amount_total,
      source: 'verify-session',
    })

    return NextResponse.json({
      verified: true,
      email_sent: result.emailSent,
      webhook_processed: false,
    })
  } catch (err) {
    console.error('[verify-session] Erreur:', err)
    return NextResponse.json({ error: 'Erreur de vérification' }, { status: 500 })
  }
}
