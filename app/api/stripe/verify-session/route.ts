import { NextResponse } from 'next/server'
import { getStripe, detectPlanFromProductId } from '@/lib/stripe'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { sendTemplateEmail, getPlanDisplayName, getPlanAmount, sendRawEmail, scheduleEmail } from '@/lib/email-templates/automated-emails'
import { enrollInSequence } from '@/lib/crm/enroll'
import crypto from 'crypto'

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createSupabaseClient(url, key)
}

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://sosshine.com')
}

/**
 * POST /api/stripe/verify-session
 *
 * Safety net: called by the confirmation page to verify a checkout session.
 * If the webhook didn't fire, this endpoint handles the FULL flow:
 * account creation + subscription record + welcome email.
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

    const supabase = getAdminSupabase()
    if (!supabase) {
      return NextResponse.json({ error: 'Database non configurée' }, { status: 500 })
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription'],
    })

    console.log(`[verify-session] session ${session_id}: status=${session.status}, payment_status=${session.payment_status}`)

    // For subscriptions with trial, payment_status can be 'no_payment_required'
    const isValid = session.status === 'complete'
      || session.payment_status === 'paid'
      || session.payment_status === 'no_payment_required'

    if (!isValid) {
      return NextResponse.json({
        verified: false,
        status: session.status,
        payment_status: session.payment_status,
      })
    }

    const email = session.customer_email || session.metadata?.email
    if (!email) {
      return NextResponse.json({ verified: true, email_sent: false, reason: 'no_email' })
    }

    const customerId = session.customer as string
    const subscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : (session.subscription as any)?.id

    // Check if webhook already processed this
    if (subscriptionId) {
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('id, user_id')
        .eq('stripe_subscription_id', subscriptionId)
        .maybeSingle()

      if (existingSub) {
        // Webhook already handled it — check if email was sent
        const { data: emailLog } = await supabase
          .from('crm_campaign_events')
          .select('id')
          .or('event_type.eq.auto_email_subscription_welcome,event_type.eq.auto_email_account_created')
          .filter('metadata->>recipient', 'eq', email)
          .limit(1)
          .maybeSingle()

        return NextResponse.json({
          verified: true,
          email_sent: !!emailLog,
          webhook_processed: true,
        })
      }
    }

    // ── Webhook didn't process this — do the FULL flow ──
    console.log(`[verify-session] Webhook not processed yet — handling full flow for ${email}`)

    // 1. Determine plan & duration
    let plan: string = session.metadata?.plan || 'essential'
    let duration: string = session.metadata?.duration || 'monthly'
    const prenom = session.metadata?.prenom || ''

    // If no metadata, detect from Stripe subscription
    if (!session.metadata?.plan && subscriptionId) {
      try {
        const sub = await stripe.subscriptions.retrieve(subscriptionId)
        const productId = (sub.items?.data?.[0]?.price as any)?.product as string | undefined
        const detected = productId ? detectPlanFromProductId(productId) : null
        if (detected) {
          plan = detected.plan
          duration = detected.duration
        }
      } catch {}
    }

    // 2. Find or create user
    let profileId: string | null = null
    let isNewUser = false
    let tempPassword: string | null = null

    // Check if user exists by email
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existingProfile) {
      profileId = existingProfile.id
    } else {
      // Auto-create user account
      tempPassword = crypto.randomBytes(6).toString('base64url')
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
      })

      if (authError || !authUser?.user) {
        console.error('[verify-session] Failed to create user:', authError)
      } else {
        profileId = authUser.user.id
        isNewUser = true

        await supabase.from('profiles').upsert({
          id: profileId,
          email,
          prenom: prenom || null,
          role: 'member',
          is_active: true,
          plan,
          created_at: new Date().toISOString(),
        }, { onConflict: 'id' })
      }
    }

    if (!profileId) {
      // Can't create account — still send a raw email
      await sendAccountEmail(email, prenom || 'Membre', plan, null, false)
      return NextResponse.json({ verified: true, email_sent: true, account_created: false })
    }

    // 3. Create subscription record
    const subData: Record<string, unknown> = {
      user_id: profileId,
      stripe_customer_id: customerId || null,
      stripe_subscription_id: subscriptionId || null,
      plan,
      duration,
      status: 'active',
      waitlist_discount: session.metadata?.waitlist_discount === 'true',
      updated_at: new Date().toISOString(),
    }

    // Get period end from Stripe subscription
    if (subscriptionId) {
      try {
        const sub = await stripe.subscriptions.retrieve(subscriptionId) as unknown as {
          status: string; current_period_end: number; cancel_at_period_end: boolean
        }
        subData.status = sub.status === 'trialing' ? 'trialing' : 'active'
        subData.current_period_end = new Date(sub.current_period_end * 1000).toISOString()
        subData.cancel_at_period_end = sub.cancel_at_period_end
      } catch {}
    }

    await supabase.from('subscriptions').upsert(subData, { onConflict: 'user_id' })

    // Update profile
    await supabase.from('profiles').update({
      plan,
      is_active: true,
    }).eq('id', profileId)

    // 4. Send email
    await sendAccountEmail(
      email,
      prenom || 'Membre',
      plan,
      isNewUser ? tempPassword : null,
      isNewUser
    )

    // 5. Schedule nurturing emails
    const firstName = prenom || 'Membre'
    const planName = getPlanDisplayName(plan)
    const planAmountStr = getPlanAmount(plan)
    const vars = { firstName, email, planName, planAmount: planAmountStr }

    scheduleEmail('nurturing_j1', email, vars, 1, { recipientName: firstName }).catch(() => {})
    scheduleEmail('nurturing_j3', email, vars, 3, { recipientName: firstName }).catch(() => {})
    scheduleEmail('nurturing_j7', email, vars, 7, { recipientName: firstName }).catch(() => {})
    enrollInSequence('subscription', email, firstName).catch(() => {})

    console.log(`[verify-session] Full flow completed for ${email} — plan=${plan}, new=${isNewUser}`)

    return NextResponse.json({
      verified: true,
      email_sent: true,
      webhook_processed: false,
      account_created: isNewUser,
    })
  } catch (err) {
    console.error('verify-session error:', err)
    return NextResponse.json({ error: 'Erreur de vérification' }, { status: 500 })
  }
}

async function sendAccountEmail(
  email: string,
  firstName: string,
  plan: string,
  tempPassword: string | null,
  isNewUser: boolean
) {
  const planName = getPlanDisplayName(plan)
  const siteUrl = getSiteUrl()
  const loginUrl = `${siteUrl}/login`
  const resetUrl = `${siteUrl}/forgot-password`

  if (isNewUser && tempPassword) {
    // New user: send credentials
    const html = `
      <h2 style="color:#D4AF37;font-family:Georgia,'Times New Roman',serif;font-weight:300;font-size:24px;margin:0 0 24px;">
        Bienvenue dans SOS Shine, ${firstName} !
      </h2>
      <p style="color:#E0E0E0;font-size:15px;line-height:1.7;margin:0 0 16px;">
        Votre paiement a bien été confirmé et votre compte <strong>SOS Shine</strong> a été créé
        avec l'offre <strong style="color:#D4AF37;">${planName}</strong>.
      </p>
      <div style="background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.2);border-radius:12px;padding:24px;margin:24px 0;">
        <p style="color:#D4AF37;font-size:13px;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 12px;font-weight:600;">
          Vos identifiants de connexion
        </p>
        <p style="color:#E0E0E0;font-size:15px;margin:0 0 8px;">
          <strong>Email :</strong> ${email}
        </p>
        <p style="color:#E0E0E0;font-size:15px;margin:0;">
          <strong>Mot de passe temporaire :</strong>
          <code style="background:rgba(255,255,255,0.08);padding:3px 8px;border-radius:4px;font-size:16px;">${tempPassword}</code>
        </p>
      </div>
      <p style="color:#E0E0E0;font-size:15px;line-height:1.7;margin:0 0 24px;">
        Connectez-vous et changez votre mot de passe dès que possible.
      </p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#D4AF37,#B8960F);color:#050505;padding:14px 40px;border-radius:50px;text-decoration:none;font-weight:600;font-size:15px;">
          Se connecter
        </a>
      </div>
      <p style="color:#999;font-size:13px;line-height:1.6;text-align:center;">
        Vous pouvez aussi <a href="${resetUrl}" style="color:#D4AF37;text-decoration:underline;">créer un nouveau mot de passe</a>.
      </p>
    `

    await sendRawEmail(email, 'Bienvenue sur SOS Shine — Vos identifiants de connexion', html, { recipientName: firstName, eventType: 'auto_email_account_created' })
  } else {
    // Existing user: send welcome/confirmation
    const result = await sendTemplateEmail('subscription_welcome', email, {
      firstName,
      email,
      planName,
      planAmount: getPlanAmount(plan),
    }, { recipientName: firstName })

    if (!result.success) {
      // Fallback raw email
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
        <div style="text-align:center;margin:32px 0;">
          <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#D4AF37,#B8960F);color:#050505;padding:14px 40px;border-radius:50px;text-decoration:none;font-weight:600;font-size:15px;">
            Accéder à mon espace
          </a>
        </div>
        `,
        { recipientName: firstName }
      )
    }
  }
}
