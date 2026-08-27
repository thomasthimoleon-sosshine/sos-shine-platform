// ═══════════════════════════════════════════════════════════════
// POST /api/stripe/webhook
// Webhook Stripe - SEULE source de vérité pour le traitement des paiements
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import type Stripe from 'stripe'
import { sendRawEmail } from '@/lib/email-templates/automated-emails'
import { parseProtocolRef } from '@/lib/stripe/config'
import { discoveryEndsAt } from '@/lib/discovery-access'
import { enrollInLifecycle } from '@/lib/crm/lifecycle-router'
import {
  detectPlanFromSession,
  processSuccessfulPayment,
  handleSubscriptionUpdate,
  handleSubscriptionDeleted,
  handlePaymentFailed,
  handlePaymentSucceeded,
  handleChargeRefunded,
} from '@/lib/stripe/subscription-service'

function buildCeremonieConfirmationEmail(prenom: string): string {
  return `
<div style="font-family: Georgia, serif; color: #1a1a1a; max-width: 560px; margin: 0 auto;">
  <p style="font-size: 16px; line-height: 1.7;">Bonjour ${prenom},</p>
  <p style="font-size: 16px; line-height: 1.7;">
    Ta réservation pour <strong>L'Éveil</strong> est bien confirmée.<br>
    On a vraiment hâte de te retrouver là-bas.
  </p>
  <div style="background: #f9f6f0; border-left: 3px solid #C9A961; padding: 20px 24px; margin: 28px 0; border-radius: 4px;">
    <p style="margin: 0 0 8px; font-size: 15px;">📅 <strong>Samedi 13 juin 2026</strong></p>
    <p style="margin: 0 0 8px; font-size: 15px;">🕕 <strong>18h00, 21h30</strong></p>
    <p style="margin: 0; font-size: 15px;">📍 <strong>Lac de Saint-Cassien</strong></p>
    <p style="margin: 8px 0 0; font-size: 14px; color: #666;">L'adresse exacte te sera communiquée 24h avant 🙂</p>
  </div>
  <p style="font-size: 15px; line-height: 1.7; margin-bottom: 8px;"><strong>Quelques petites choses à savoir :</strong></p>
  <ul style="font-size: 15px; line-height: 1.9; color: #333; padding-left: 20px;">
    <li>Le solde de <strong>90€</strong> se règle en espèces sur place le soir de l'événement</li>
    <li>Prévois une tenue dans laquelle tu te sens à l'aise pour bouger et t'asseoir dehors</li>
    <li>Le lieu est en plein air au bord du lac, une petite laine pour le soir peut être utile</li>
    <li>Pense à prendre tes précautions contre les moustiques 🌿</li>
  </ul>
  <p style="font-size: 15px; line-height: 1.7; margin-top: 28px;">
    Si tu as la moindre question d'ici là, réponds simplement à cet email.
  </p>
  <p style="font-size: 15px; line-height: 1.7; margin-top: 24px;">
    À très vite,<br>
    <strong>Julia, William et Thomas 🌿</strong>
  </p>
</div>`.trim()
}

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

        // Achat d'un protocole seul (accès unique 33€, paiement one-time)
        // client_reference_id au format p_<userId>_<slug>
        if (session.mode === 'payment' && session.client_reference_id?.startsWith('p_')) {
          const parsed = parseProtocolRef(session.client_reference_id)
          if (parsed) {
            const { createClient: createSupa } = await import('@supabase/supabase-js')
            const supabase = createSupa(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!,
              { auth: { autoRefreshToken: false, persistSession: false } }
            )
            // Débloquage idempotent (unique user_id + protocol_slug).
            // discovery_until ouvre toute la plateforme pendant 30 jours : c'est
            // le « goût » offert avec l'achat. Le protocole, lui, reste acquis.
            const { error: unlockErr } = await supabase
              .from('protocol_unlocks')
              .upsert({
                user_id: parsed.userId,
                protocol_slug: parsed.slug,
                stripe_session_id: session.id,
                discovery_until: discoveryEndsAt(),
              }, { onConflict: 'user_id,protocol_slug', ignoreDuplicates: true })

            if (unlockErr) {
              console.error('[Webhook] protocol_unlock upsert failed:', unlockErr, parsed)
            } else {
              console.log(`[Webhook] Protocole débloqué - user ${parsed.userId}, slug ${parsed.slug}`)
            }

            // File B (achat 33€) — SEULEMENT si la personne n'est pas déjà abonnée.
            // Un abonné qui achète un protocole en plus reste dans son parcours membre.
            try {
              const { data: sub } = await supabase
                .from('subscriptions')
                .select('status')
                .eq('user_id', parsed.userId)
                .maybeSingle()
              const isMember = sub && (sub.status === 'active' || sub.status === 'trialing')
              if (!isMember) {
                const buyerEmail = session.customer_details?.email || session.customer_email || ''
                let firstName: string | null = null
                const { data: prof } = await supabase
                  .from('profiles')
                  .select('prenom, email')
                  .eq('id', parsed.userId)
                  .maybeSingle()
                if (prof) firstName = (prof as { prenom?: string }).prenom || null
                const email = buyerEmail || (prof as { email?: string } | null)?.email || ''
                if (email) {
                  await enrollInLifecycle(supabase, { email, firstName, trigger: 'protocol_33' })
                }
              }
            } catch (e) {
              console.error('[Webhook] Enrôlement File B échoué:', e)
            }
          } else {
            console.error('[Webhook] client_reference_id protocole illisible:', session.client_reference_id)
          }
          break
        }

        // Acompte cérémonie (paiement one-time via Payment Link)
        if (session.mode === 'payment' && session.client_reference_id) {
          const { createClient: createSupa } = await import('@supabase/supabase-js')
          const supabase = createSupa(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
          )
          const { data: reservation } = await supabase
            .from('ceremonie_reservations')
            .update({ status: 'paid', stripe_session_id: session.id, paid_at: new Date().toISOString() })
            .eq('id', session.client_reference_id)
            .select('prenom, email')
            .single()
          console.log(`[Webhook] Acompte cérémonie validé - réservation ${session.client_reference_id}`)

          // Email de confirmation après paiement validé
          if (reservation?.email) {
            const prenom = (reservation as { prenom: string; email: string }).prenom
            const email = (reservation as { prenom: string; email: string }).email
            sendRawEmail(
              email,
              "Ta place est confirmée, L'Éveil · 13 juin au lac ✨",
              buildCeremonieConfirmationEmail(prenom),
              { recipientName: prenom, eventType: 'ceremonie_payment_confirmed' }
            ).catch(err => console.error('[Webhook] Ceremonie email error:', err))
          }
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
