import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { sendTemplateEmail, getPlanDisplayName, getPlanAmount, sendRawEmail } from '@/lib/email-templates/automated-emails'

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createSupabaseClient(url, key)
}

/**
 * POST /api/stripe/verify-session
 *
 * Safety net: called by the confirmation page to verify a checkout session
 * and trigger the welcome email if the webhook didn't fire.
 */
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

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription', 'customer'],
    })

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return NextResponse.json({
        verified: false,
        status: session.status,
        payment_status: session.payment_status,
      })
    }

    const email = session.customer_email || session.metadata?.email
    const plan = session.metadata?.plan || 'essential'
    const prenom = session.metadata?.prenom || ''

    if (!email) {
      return NextResponse.json({ verified: true, email_sent: false, reason: 'no_email' })
    }

    const supabase = getAdminSupabase()

    // Check if the webhook already processed this session (subscription exists)
    let webhookProcessed = false
    if (supabase) {
      const subscriptionId = typeof session.subscription === 'string'
        ? session.subscription
        : (session.subscription as any)?.id

      if (subscriptionId) {
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('id, user_id')
          .eq('stripe_subscription_id', subscriptionId)
          .maybeSingle()

        webhookProcessed = !!existingSub
      }
    }

    // If webhook already processed, check if email was sent
    if (webhookProcessed && supabase) {
      const { data: emailLog } = await supabase
        .from('crm_campaign_events')
        .select('id')
        .or(`event_type.eq.auto_email_subscription_welcome,event_type.eq.auto_email_account_created`)
        .filter('metadata->>recipient', 'eq', email)
        .limit(1)
        .maybeSingle()

      if (emailLog) {
        return NextResponse.json({ verified: true, email_sent: true, webhook_processed: true })
      }
    }

    // If webhook didn't process OR email wasn't sent, try to send a confirmation email
    if (!webhookProcessed) {
      // The webhook might still fire — don't duplicate the full account creation flow.
      // Just send a lightweight confirmation email as a safety net.
      const firstName = prenom || 'Membre'
      const planName = getPlanDisplayName(plan)
      const planAmountStr = getPlanAmount(plan)

      try {
        const result = await sendTemplateEmail('subscription_welcome', email, {
          firstName,
          email,
          planName,
          planAmount: planAmountStr,
        }, { recipientName: firstName })

        if (!result.success) {
          // Fallback: send a raw confirmation email
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
            || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://sosshine.com')

          await sendRawEmail(
            email,
            'Bienvenue sur SOS Shine — Paiement confirmé',
            `
            <h2 style="color:#D4AF37;font-family:Georgia,'Times New Roman',serif;font-weight:300;font-size:24px;margin:0 0 24px;">
              Bienvenue dans SOS Shine, ${firstName} !
            </h2>
            <p style="color:#E0E0E0;font-size:15px;line-height:1.7;margin:0 0 16px;">
              Votre paiement a bien été confirmé pour l'offre <strong style="color:#D4AF37;">${planName}</strong>.
            </p>
            <p style="color:#E0E0E0;font-size:15px;line-height:1.7;margin:0 0 16px;">
              Votre compte est en cours de création. Vous recevrez un email avec vos identifiants de connexion
              dans les prochaines minutes.
            </p>
            <p style="color:#999;font-size:13px;line-height:1.6;margin:24px 0 0;">
              Si vous ne recevez pas vos identifiants dans les 15 minutes, contactez-nous à
              <a href="mailto:hello@sosshine.com" style="color:#D4AF37;">hello@sosshine.com</a>
            </p>
            `,
            { recipientName: firstName }
          )
        }

        return NextResponse.json({ verified: true, email_sent: true, webhook_processed: false })
      } catch (err) {
        console.error('verify-session: failed to send email:', err)
        return NextResponse.json({ verified: true, email_sent: false, reason: 'send_failed' })
      }
    }

    return NextResponse.json({ verified: true, email_sent: false, webhook_processed: true })
  } catch (err) {
    console.error('verify-session error:', err)
    return NextResponse.json({ error: 'Erreur de vérification' }, { status: 500 })
  }
}
