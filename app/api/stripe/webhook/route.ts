import { NextResponse } from 'next/server'
import { getStripe, detectPlanFromProductId } from '@/lib/stripe'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'
import { sendTemplateEmail, scheduleEmail, getPlanDisplayName, getPlanAmount, cancelScheduledEmails, sendRawEmail } from '@/lib/email-templates/automated-emails'
import { enrollInSequence } from '@/lib/crm/enroll'
import crypto from 'crypto'

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createSupabaseClient(url, key)
}

export async function POST(request: Request) {
  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getAdminSupabase()
  if (!supabase) {
    console.error('Supabase admin not configured')
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log(`[Stripe Webhook] checkout.session.completed — email: ${session.customer_email || session.metadata?.email}, plan: ${session.metadata?.plan}`)
        await handleCheckoutComplete(supabase, stripe, session)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(supabase, subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(supabase, subscription)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(supabase, invoice)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(supabase, invoice)
        break
      }

      default:
        // Unhandled event type
        break
    }
  } catch (err) {
    console.error(`Error handling ${event.type}:`, err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleCheckoutComplete(supabase: any, stripe: Stripe, session: Stripe.Checkout.Session) {
  if (session.mode !== 'subscription') return

  const customerId = session.customer as string
  const subscriptionId = session.subscription as string
  const userEmail = session.customer_email || session.metadata?.email
  const userId = session.metadata?.user_id
  const hasWaitlistDiscount = session.metadata?.waitlist_discount === 'true'

  if (!userEmail && !userId) return

  // Find user by ID or email
  let profileId = userId
  let isNewUser = false
  let tempPassword: string | null = null

  if (!profileId && userEmail) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single()
    profileId = profile?.id
  }

  // Auto-create user account if no profile exists
  if (!profileId && userEmail) {
    const result = await autoCreateUser(supabase, userEmail, session.metadata?.prenom)
    if (!result) return
    profileId = result.userId
    isNewUser = true
    tempPassword = result.tempPassword
  }

  if (!profileId) return

  // Get subscription details from Stripe
  const sub = await stripe.subscriptions.retrieve(subscriptionId) as unknown as {
    status: string
    current_period_end: number
    cancel_at_period_end: boolean
    items: { data: Array<{ price: { unit_amount: number | null; recurring: { interval: string; interval_count: number } | null } }> }
  }

  // Déterminer le plan et la durée :
  // 1. Depuis metadata (Checkout API)
  // 2. Depuis le Product ID Stripe (Payment Links)
  // 3. Fallback : depuis le montant
  let plan = session.metadata?.plan as 'essential' | 'serenite' | 'premium' | undefined
  let duration: 'monthly' | 'quarterly' | 'semiannual' | 'annual' =
    (session.metadata?.duration as 'monthly' | 'quarterly' | 'semiannual' | 'annual') || 'monthly'

  if (!plan) {
    // Essayer de détecter depuis le Product ID (Payment Links)
    const productId = (sub.items?.data?.[0]?.price as any)?.product as string | undefined
    const detected = productId ? detectPlanFromProductId(productId) : null

    if (detected) {
      plan = detected.plan
      duration = detected.duration
    } else {
      // Fallback : détecter depuis le montant
      const priceAmount = sub.items?.data?.[0]?.price?.unit_amount || (session as any).amount_total
      plan = detectPlanFromAmount(priceAmount)

      // Déterminer la durée depuis l'intervalle Stripe
      const interval = sub.items?.data?.[0]?.price?.recurring
      if (interval) {
        if (interval.interval === 'month' && interval.interval_count === 3) duration = 'quarterly'
        else if (interval.interval === 'month' && interval.interval_count === 6) duration = 'semiannual'
        else if (interval.interval === 'year' || (interval.interval === 'month' && interval.interval_count === 12)) duration = 'annual'
      }
    }
  }

  // Upsert subscription record
  await supabase.from('subscriptions').upsert({
    user_id: profileId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    plan,
    duration,
    status: mapStripeStatus(sub.status),
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    cancel_at_period_end: sub.cancel_at_period_end,
    waitlist_discount: hasWaitlistDiscount,
    payment_failed_at: null,
    grace_period_end: null,
    reminder_sent_count: 0,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  // Update profile
  await supabase.from('profiles').update({
    plan,
    is_active: true,
  }).eq('id', profileId)

  // Logger la création
  await supabase.from('subscription_payment_logs').insert({
    user_id: profileId,
    event_type: 'subscription_created',
    plan,
    metadata: {
      stripe_subscription_id: subscriptionId,
      duration,
      amount_total: (session as any).amount_total,
      via_payment_link: !session.metadata?.plan,
    },
  })

  // ── Emails automatiques : bienvenue + nurturing ──
  const { data: profile } = await supabase
    .from('profiles')
    .select('prenom, email')
    .eq('id', profileId)
    .single()

  if (profile?.email) {
    const firstName = profile.prenom || 'Membre'
    const planName = getPlanDisplayName(plan || 'essential')
    const planAmountStr = getPlanAmount(plan || 'essential')
    const vars = { firstName, email: profile.email, planName, planAmount: planAmountStr }

    // Annuler les emails de conversion en attente (waitlist, quiz) car la personne s'est abonnée
    await cancelScheduledEmails(profile.email, [
      'waitlist_reminder_j3', 'waitlist_opening',
      'quiz_followup_j2', 'quiz_conversion_j5',
    ])

    if (isNewUser && tempPassword) {
      // Send account creation email with temporary password
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
        || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://sosshine.com')
      console.log(`[Stripe Webhook] Sending account creation email to ${profile.email}`)
      await sendAccountCreatedEmail(profile.email, firstName, planName, tempPassword, siteUrl)
      console.log(`[Stripe Webhook] Account creation email sent to ${profile.email}`)
    } else {
      // Email de bienvenue immédiat (utilisateur existant)
      console.log(`[Stripe Webhook] Sending subscription_welcome email to ${profile.email}`)
      sendTemplateEmail('subscription_welcome', profile.email, vars, { recipientName: firstName })
        .then(r => console.log(`[Stripe Webhook] subscription_welcome result:`, r))
        .catch(err => console.error(`[Stripe Webhook] subscription_welcome failed:`, err))
    }

    // Séquence nurturing post-inscription
    scheduleEmail('nurturing_j1', profile.email, vars, 1, { recipientName: firstName }).catch(() => {})
    scheduleEmail('nurturing_j3', profile.email, vars, 3, { recipientName: firstName }).catch(() => {})
    scheduleEmail('nurturing_j7', profile.email, vars, 7, { recipientName: firstName }).catch(() => {})
    scheduleEmail('nurturing_j14', profile.email, vars, 14, { recipientName: firstName }).catch(() => {})

    // Enrôler dans la séquence CRM "subscription"
    enrollInSequence('subscription', profile.email, firstName).catch(() => {})
  }
}

// Détecter le plan depuis le montant mensuel en centimes
function detectPlanFromAmount(amountCents: number | null): 'essential' | 'serenite' | 'premium' {
  if (!amountCents) return 'essential'
  // Montants mensuels : Essential ~990, Sérénité ~4990, Premium ~9990
  // Montants trimestriels : Sérénité ~13473, Premium ~28970
  // Montants semestriels : Sérénité ~23952, Premium ~57940
  // Montants annuels : Sérénité ~41916, Premium ~83916
  if (amountCents >= 50000) return 'premium'    // >= 500€ → Premium (semiannual ou annual)
  if (amountCents >= 20000) return 'serenite'    // >= 200€ → Sérénité (semiannual ou annual)
  if (amountCents >= 9000) return 'premium'      // ~99,90€ → Premium mensuel
  if (amountCents >= 4000) return 'serenite'     // ~49,90€ → Sérénité mensuel
  return 'essential'                              // ~9,90€ → Essentielle
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionUpdate(supabase: any, subscription: Stripe.Subscription) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub = subscription as any
  const customerId = sub.customer as string

  // Find subscription by Stripe ID
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('user_id, plan')
    .eq('stripe_subscription_id', sub.id)
    .single()

  if (!existingSub) {
    // Try finding by customer ID
    const { data: subByCustomer } = await supabase
      .from('subscriptions')
      .select('user_id, plan')
      .eq('stripe_customer_id', customerId)
      .single()
    if (!subByCustomer) return

    await updateSubscriptionRecord(supabase, subByCustomer.user_id, sub)
    return
  }

  await updateSubscriptionRecord(supabase, existingSub.user_id, sub)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateSubscriptionRecord(supabase: any, userId: string, subscription: any) {
  const status = mapStripeStatus(subscription.status)
  const isActive = status === 'active' || status === 'trialing'

  await supabase.from('subscriptions').update({
    status,
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    stripe_subscription_id: subscription.id,
    updated_at: new Date().toISOString(),
  }).eq('user_id', userId)

  // Update profile active status
  await supabase.from('profiles').update({
    is_active: isActive,
  }).eq('id', userId)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionDeleted(supabase: any, subscription: Stripe.Subscription) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub = subscription as any
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', sub.id)
    .single()

  if (!existingSub) return

  await supabase.from('subscriptions').update({
    status: 'canceled',
    updated_at: new Date().toISOString(),
  }).eq('user_id', existingSub.user_id)

  await supabase.from('profiles').update({
    is_active: false,
    plan: null,
  }).eq('id', existingSub.user_id)

  // ── Email automatique : confirmation résiliation + win-back J+7 ──
  const { data: profile } = await supabase
    .from('profiles')
    .select('prenom, email, plan')
    .eq('id', existingSub.user_id)
    .single()

  if (profile?.email) {
    const firstName = profile.prenom || 'Membre'
    const planName = getPlanDisplayName(profile.plan || 'essential')
    const vars = { firstName, email: profile.email, planName }

    // Annuler les emails de nurturing en attente
    await cancelScheduledEmails(profile.email, [
      'nurturing_j1', 'nurturing_j3', 'nurturing_j7', 'nurturing_j14',
      'renewal_reminder_j7',
    ])

    sendTemplateEmail('cancellation_confirmation', profile.email, vars, { recipientName: firstName }).catch(() => {})
    scheduleEmail('cancellation_winback_j7', profile.email, vars, 7, { recipientName: firstName }).catch(() => {})

    // Enrôler dans la séquence CRM "cancellation"
    enrollInSequence('cancellation', profile.email, firstName).catch(() => {})
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handlePaymentFailed(supabase: any, invoice: Stripe.Invoice) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inv = invoice as any
  const customerId = inv.customer as string

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, user_id, plan, reminder_sent_count')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!sub) return

  const now = new Date()
  const graceEnd = new Date(now)
  graceEnd.setDate(graceEnd.getDate() + 7) // 7 jours de grâce

  await supabase.from('subscriptions').update({
    status: 'past_due',
    payment_failed_at: now.toISOString(),
    grace_period_end: graceEnd.toISOString(),
    reminder_sent_count: 0,
    updated_at: now.toISOString(),
  }).eq('user_id', sub.user_id)

  // Deactivate profile after payment failure
  await supabase.from('profiles').update({
    is_active: false,
  }).eq('id', sub.user_id)

  // Logger l'échec de paiement
  await supabase.from('subscription_payment_logs').insert({
    user_id: sub.user_id,
    subscription_id: sub.id,
    event_type: 'payment_failed',
    plan: sub.plan,
    amount_cents: inv.amount_due || null,
    stripe_event_id: inv.id,
    metadata: {
      invoice_id: inv.id,
      attempt_count: inv.attempt_count,
      grace_period_end: graceEnd.toISOString(),
    },
  })

  // ── Email automatique : échec de paiement ──
  const { data: profile } = await supabase
    .from('profiles')
    .select('prenom, email')
    .eq('id', sub.user_id)
    .single()

  if (profile?.email) {
    const firstName = profile.prenom || 'Membre'
    const planName = getPlanDisplayName(sub.plan || 'essential')
    const planAmountStr = getPlanAmount(sub.plan || 'essential')
    sendTemplateEmail('renewal_failed', profile.email, {
      firstName, email: profile.email, planName, planAmount: planAmountStr,
    }, { recipientName: firstName }).catch(() => {})

    // Enrôler dans la séquence CRM "renewal"
    enrollInSequence('renewal', profile.email, firstName).catch(() => {})
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handlePaymentSucceeded(supabase: any, invoice: Stripe.Invoice) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inv = invoice as any
  const customerId = inv.customer as string
  const subscriptionId = inv.subscription as string

  if (!subscriptionId) return

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, user_id, plan, status')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!sub) return

  const wasPastDue = sub.status === 'past_due'

  await supabase.from('subscriptions').update({
    status: 'active',
    payment_failed_at: null,
    grace_period_end: null,
    reminder_sent_count: 0,
    last_reminder_sent_at: null,
    updated_at: new Date().toISOString(),
  }).eq('user_id', sub.user_id)

  await supabase.from('profiles').update({
    is_active: true,
  }).eq('id', sub.user_id)

  // Logger le paiement réussi
  await supabase.from('subscription_payment_logs').insert({
    user_id: sub.user_id,
    subscription_id: sub.id,
    event_type: wasPastDue ? 'access_restored' : 'payment_succeeded',
    plan: sub.plan,
    amount_cents: inv.amount_paid || null,
    stripe_event_id: inv.id,
    metadata: {
      invoice_id: inv.id,
      was_past_due: wasPastDue,
    },
  })

  // ── Email automatique : confirmation paiement / renouvellement ──
  const { data: profile } = await supabase
    .from('profiles')
    .select('prenom, email')
    .eq('id', sub.user_id)
    .single()

  if (profile?.email) {
    const firstName = profile.prenom || 'Membre'
    const planName = getPlanDisplayName(sub.plan || 'essential')
    const planAmountStr = getPlanAmount(sub.plan || 'essential')
    const vars = { firstName, email: profile.email, planName, planAmount: planAmountStr }

    // Envoyer confirmation de paiement (pour renouvellements, pas la première souscription)
    sendTemplateEmail(
      wasPastDue ? 'renewal_success' : 'subscription_confirmation',
      profile.email, vars, { recipientName: firstName }
    ).catch(() => {})
  }
}

// ── Auto-create Supabase user when payment is made without an account ──
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function autoCreateUser(supabase: any, email: string, prenom?: string | null): Promise<{ userId: string; tempPassword: string } | null> {
  try {
    // Generate a secure temporary password
    const tempPassword = crypto.randomBytes(6).toString('base64url') // ~8 chars, URL-safe

    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email since they paid
    })

    if (authError || !authUser?.user) {
      console.error('Failed to auto-create user:', authError)
      return null
    }

    const userId = authUser.user.id

    // Create profile (the DB trigger may also do this, but let's be explicit)
    await supabase.from('profiles').upsert({
      id: userId,
      email,
      prenom: prenom || null,
      role: 'member',
      is_active: true,
      created_at: new Date().toISOString(),
    }, { onConflict: 'id' })

    return { userId, tempPassword }
  } catch (err) {
    console.error('autoCreateUser error:', err)
    return null
  }
}

// ── Send account creation email with temporary password ──
async function sendAccountCreatedEmail(
  email: string,
  firstName: string,
  planName: string,
  tempPassword: string,
  siteUrl: string,
) {
  const loginUrl = `${siteUrl}/login`
  const resetUrl = `${siteUrl}/forgot-password`

  const html = `
    <h2 style="color:#D4AF37;font-family:Georgia,'Times New Roman',serif;font-weight:300;font-size:24px;margin:0 0 24px;">
      Bienvenue dans SOS Shine, ${firstName} !
    </h2>
    <p style="color:#E0E0E0;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Votre paiement a bien été confirmé et votre compte <strong>SOS Shine</strong> a été créé automatiquement
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
        <strong>Mot de passe temporaire :</strong> <code style="background:rgba(255,255,255,0.08);padding:3px 8px;border-radius:4px;font-size:16px;letter-spacing:0.05em;">${tempPassword}</code>
      </p>
    </div>
    <p style="color:#E0E0E0;font-size:15px;line-height:1.7;margin:0 0 24px;">
      Connectez-vous et changez votre mot de passe d&egrave;s que possible pour s&eacute;curiser votre compte.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#D4AF37,#B8960F);color:#050505;padding:14px 40px;border-radius:50px;text-decoration:none;font-weight:600;font-size:15px;">
        Se connecter
      </a>
    </div>
    <p style="color:#999;font-size:13px;line-height:1.6;margin:24px 0 0;text-align:center;">
      Vous pouvez aussi <a href="${resetUrl}" style="color:#D4AF37;text-decoration:underline;">cr&eacute;er un nouveau mot de passe</a> si vous pr&eacute;f&eacute;rez.
    </p>
  `

  await sendRawEmail(
    email,
    `Bienvenue sur SOS Shine — Vos identifiants de connexion`,
    html,
    { recipientName: firstName }
  )
}

function mapStripeStatus(status: string): 'trialing' | 'active' | 'inactive' | 'canceled' | 'past_due' {
  switch (status) {
    case 'trialing': return 'trialing'
    case 'active': return 'active'
    case 'past_due': return 'past_due'
    case 'canceled':
    case 'unpaid': return 'canceled'
    default: return 'inactive'
  }
}
