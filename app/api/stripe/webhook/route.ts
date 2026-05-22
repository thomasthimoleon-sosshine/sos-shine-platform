// ═══════════════════════════════════════════════════════════════
// POST /api/stripe/webhook
// Webhook Stripe - SEULE source de vérité pour le traitement des paiements
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import type Stripe from 'stripe'
import {
  detectPlanFromSession,
  processSuccessfulPayment,
  handleSubscriptionUpdate,
  handleSubscriptionDeleted,
  handlePaymentFailed,
  handlePaymentSucceeded,
  handleChargeRefunded,
} from '@/lib/stripe/subscription-service'

export async function POST(request: Request) {
  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe non configuré' }, { status: 500 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret non configuré' }, { status: 500 })
  }

  // Vérifier la signature
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[Webhook] Signature invalide:', err)
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  console.log(`[Webhook] Événement reçu: ${event.type} (${event.id})`)

  try {
    switch (event.type) {
      // ── Paiement réussi via Checkout ──
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Acompte cérémonie (paiement one-time via Payment Link)
        if (session.mode === 'payment' && session.client_reference_id) {
          const { createClient: createSupa } = await import('@supabase/supabase-js')
          const supabase = createSupa(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
          )
          await supabase
            .from('ceremonie_reservations')
            .update({ status: 'paid', stripe_session_id: session.id, paid_at: new Date().toISOString() })
            .eq('id', session.client_reference_id)
          console.log(`[Webhook] Acompte cérémonie validé - réservation ${session.client_reference_id}`)
          break
        }

        if (session.mode !== 'subscription') break

        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        // L'utilisateur est connecté : userId vient des metadata
        const userId = session.metadata?.user_id
        const email = session.customer_email || session.metadata?.email

        if (!userId) {
          console.error('[Webhook] Pas de user_id dans les metadata de la session:', session.id)
          break
        }

        if (!email) {
          console.error('[Webhook] Pas d\'email trouvé pour la session:', session.id)
          break
        }

        // Récupérer les détails de l'abonnement Stripe
        const sub = await stripe.subscriptions.retrieve(subscriptionId) as unknown as {
          status: string
          current_period_end: number
          cancel_at_period_end: boolean
          trial_end: number | null
          items: { data: Array<{ price: { unit_amount: number | null; product: string; recurring: { interval: string; interval_count: number } | null } }> }
        }

        // Détecter le plan
        const { plan, duration } = detectPlanFromSession(session, sub)

        // Activer l'abonnement pour l'utilisateur connecté
        const result = await processSuccessfulPayment({
          userId,
          email,
          prenom: session.metadata?.prenom || null,
          plan,
          duration,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          stripeStatus: sub.status,
          currentPeriodEnd: sub.current_period_end,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
          trialEnd: sub.trial_end,
          waitlistDiscount: session.metadata?.waitlist_discount === 'true',
          amountTotal: (session as unknown as { amount_total?: number }).amount_total,
          source: 'webhook',
        })

        if (!result.success) {
          console.error('[Webhook] checkout.session.completed failed')
        }
        break
      }

      // ── Mise à jour d'abonnement ──
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break
      }

      // ── Résiliation ──
      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      }

      // ── Échec de paiement ──
      case 'invoice.payment_failed': {
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break
      }

      // ── Paiement réussi (renouvellement) ──
      case 'invoice.payment_succeeded': {
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      }

      // ── Remboursement ──
      case 'charge.refunded': {
        await handleChargeRefunded(event.data.object as Stripe.Charge)
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error(`[Webhook] Erreur traitement ${event.type}:`, err)
    return NextResponse.json({ error: 'Erreur de traitement' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
