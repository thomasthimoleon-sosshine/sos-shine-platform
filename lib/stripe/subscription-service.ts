// ═══════════════════════════════════════════════════════════════
// SOS SHINE - Service Abonnements
// Logique métier centralisée : création compte, email, DB
// UN SEUL endroit pour toute la logique post-paiement
// ═══════════════════════════════════════════════════════════════

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'
import crypto from 'crypto'
import {
  type PlanId,
  type DurationId,
  detectPlanFromProductId,
  detectPlanFromAmount,
  mapStripeStatus,
  getSiteUrl,
  PLAN_NAMES,
} from './config'
import {
  sendTemplateEmail,
  sendRawEmail,
  scheduleEmail,
  cancelScheduledEmails,
  getPlanDisplayName,
  getPlanAmount,
} from '@/lib/email-templates/automated-emails'
import { enrollInSequence } from '@/lib/crm/enroll'

// ── Supabase Admin Client ──

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getAdminSupabase(): any {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createSupabaseClient(url, key)
}

// ═══════════════════════════════════════════════════════════════
// 1. DETECTER LE PLAN depuis une session Stripe
// ═══════════════════════════════════════════════════════════════

interface DetectedPlan {
  plan: PlanId
  duration: DurationId
}

export function detectPlanFromSession(
  session: Stripe.Checkout.Session,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscription?: any
): DetectedPlan {
  // Priorité 1 : metadata (sessions créées via notre API Checkout)
  if (session.metadata?.plan) {
    return {
      plan: session.metadata.plan as PlanId,
      duration: (session.metadata.duration as DurationId) || 'monthly',
    }
  }

  // Priorité 2 : Product ID Stripe (sessions via Payment Links)
  if (subscription?.items?.data?.[0]?.price) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productId = (subscription.items.data[0].price as any)?.product as string | undefined
    if (productId) {
      const detected = detectPlanFromProductId(productId)
      if (detected) return detected
    }

    // Priorité 3 : Montant (dernier recours)
    const priceAmount = subscription.items.data[0].price.unit_amount
    const plan = detectPlanFromAmount(priceAmount)

    let duration: DurationId = 'monthly'
    const interval = subscription.items.data[0].price.recurring
    if (interval) {
      if (interval.interval === 'month' && interval.interval_count === 3) duration = 'quarterly'
      else if (interval.interval === 'month' && interval.interval_count === 6) duration = 'semiannual'
      else if (interval.interval === 'year' || (interval.interval === 'month' && interval.interval_count === 12)) duration = 'annual'
    }

    return { plan, duration }
  }

  // Fallback absolu
  return { plan: 'essential', duration: 'monthly' }
}

// ═══════════════════════════════════════════════════════════════
// 2. CREER UN COMPTE utilisateur automatiquement
// ═══════════════════════════════════════════════════════════════

interface CreateAccountResult {
  userId: string
  tempPassword: string
  isNew: true
}

interface ExistingAccountResult {
  userId: string
  tempPassword: null
  isNew: false
}

type AccountResult = CreateAccountResult | ExistingAccountResult

export async function findOrCreateAccount(
  email: string,
  prenom?: string | null
): Promise<AccountResult | null> {
  const supabase = getAdminSupabase()
  if (!supabase) {
    console.error('[SubscriptionService] Supabase admin non configuré')
    return null
  }

  // Chercher un profil existant par email
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existingProfile) {
    return { userId: existingProfile.id, tempPassword: null, isNew: false }
  }

  // Créer un nouveau compte
  const tempPassword = crypto.randomBytes(8).toString('base64url') // ~11 chars, URL-safe

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true, // Auto-confirm car ils ont payé
  })

  if (authError || !authUser?.user) {
    console.error('[SubscriptionService] Erreur création compte:', authError)
    return null
  }

  const userId = authUser.user.id

  // Créer le profil
  await supabase.from('profiles').upsert({
    id: userId,
    email,
    prenom: prenom || null,
    role: 'member',
    is_active: true,
    created_at: new Date().toISOString(),
  }, { onConflict: 'id' })

  console.log(`[SubscriptionService] Compte créé pour ${email} (id: ${userId})`)
  return { userId, tempPassword, isNew: true }
}

// ═══════════════════════════════════════════════════════════════
// 3. CREER/METTRE A JOUR l'abonnement en base
// ═══════════════════════════════════════════════════════════════

interface UpsertSubscriptionParams {
  userId: string
  plan: PlanId
  duration: DurationId
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  status: string
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
  trialEnd?: string | null
  waitlistDiscount?: boolean
}

export async function upsertSubscription(params: UpsertSubscriptionParams): Promise<boolean> {
  const supabase = getAdminSupabase()
  if (!supabase) return false

  // Données de base (colonnes toujours présentes)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upsertData: Record<string, any> = {
    user_id: params.userId,
    stripe_customer_id: params.stripeCustomerId,
    stripe_subscription_id: params.stripeSubscriptionId,
    plan: params.plan,
    duration: params.duration,
    status: params.status,
    current_period_end: params.currentPeriodEnd || null,
    cancel_at_period_end: params.cancelAtPeriodEnd || false,
    trial_end: params.trialEnd || null,
    waitlist_discount: params.waitlistDiscount || false,
    payment_failed_at: null,
    grace_period_end: null,
    reminder_sent_count: 0,
    updated_at: new Date().toISOString(),
  }

  let { error } = await supabase.from('subscriptions').upsert(upsertData, { onConflict: 'user_id' })

  // Si la colonne 'duration' n'existe pas encore en base, réessayer sans
  if (error && error.code === 'PGRST204' && error.message?.includes('duration')) {
    console.warn('[SubscriptionService] Colonne "duration" absente — upsert sans duration')
    delete upsertData.duration
    const retry = await supabase.from('subscriptions').upsert(upsertData, { onConflict: 'user_id' })
    error = retry.error
  }

  if (error) {
    console.error('[SubscriptionService] Erreur upsert subscription:', error)
    return false
  }

  // Mettre à jour le profil
  await supabase.from('profiles').update({
    plan: params.plan,
    is_active: true,
  }).eq('id', params.userId)

  return true
}

// ═══════════════════════════════════════════════════════════════
// 4. ENVOYER L'EMAIL de bienvenue / identifiants
// ═══════════════════════════════════════════════════════════════

export async function sendWelcomeEmail(
  email: string,
  firstName: string,
  plan: PlanId,
  tempPassword: string | null,
  isNewUser: boolean
): Promise<boolean> {
  const planName = getPlanDisplayName(plan)
  const siteUrl = getSiteUrl()

  if (isNewUser && tempPassword) {
    // Nouvel utilisateur : email avec identifiants
    const loginUrl = `${siteUrl}/login`
    const resetUrl = `${siteUrl}/forgot-password`

    const html = `
      <h2 style="color:#D4AF37;font-family:Georgia,'Times New Roman',serif;font-weight:300;font-size:24px;margin:0 0 24px;">
        Bienvenue dans SOS Shine, ${firstName} !
      </h2>
      <p style="color:#E0E0E0;font-size:15px;line-height:1.7;margin:0 0 16px;">
        Votre paiement a bien &eacute;t&eacute; confirm&eacute; et votre compte <strong>SOS Shine</strong> a &eacute;t&eacute; cr&eacute;&eacute; automatiquement
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
          <code style="background:rgba(255,255,255,0.08);padding:3px 8px;border-radius:4px;font-size:16px;letter-spacing:0.05em;">${tempPassword}</code>
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

    const result = await sendRawEmail(
      email,
      `Bienvenue sur SOS Shine — Vos identifiants de connexion`,
      html,
      { recipientName: firstName, eventType: 'auto_email_account_created' }
    )

    if (!result.success) {
      console.error(`[SubscriptionService] Email identifiants ECHOUE pour ${email}:`, result.error)
      return false
    }
    console.log(`[SubscriptionService] Email identifiants ENVOYE à ${email}`)
    return true
  } else {
    // Utilisateur existant : email de bienvenue template
    const planAmountStr = getPlanAmount(plan)
    const result = await sendTemplateEmail('subscription_welcome', email, {
      firstName,
      email,
      planName,
      planAmount: planAmountStr,
    }, { recipientName: firstName })

    if (!result.success) {
      // Fallback : email brut
      const html = `
        <h2 style="color:#D4AF37;font-family:Georgia,'Times New Roman',serif;font-weight:300;font-size:24px;margin:0 0 24px;">
          Bienvenue dans SOS Shine, ${firstName} !
        </h2>
        <p style="color:#E0E0E0;font-size:15px;line-height:1.7;margin:0 0 16px;">
          Votre paiement a bien &eacute;t&eacute; confirm&eacute; pour l'offre <strong style="color:#D4AF37;">${planName}</strong>.
        </p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${siteUrl}/login" style="display:inline-block;background:linear-gradient(135deg,#D4AF37,#B8960F);color:#050505;padding:14px 40px;border-radius:50px;text-decoration:none;font-weight:600;font-size:15px;">
            Acc&eacute;der &agrave; mon espace
          </a>
        </div>
      `
      await sendRawEmail(email, 'Bienvenue sur SOS Shine — Paiement confirmé', html, { recipientName: firstName })
    }
    return true
  }
}

// ═══════════════════════════════════════════════════════════════
// 5. PROGRAMMER LES EMAILS de nurturing post-inscription
// ═══════════════════════════════════════════════════════════════

export async function scheduleNurturingEmails(
  email: string,
  firstName: string,
  plan: PlanId
): Promise<void> {
  const planName = getPlanDisplayName(plan)
  const planAmountStr = getPlanAmount(plan)
  const vars = { firstName, email, planName, planAmount: planAmountStr }

  // Annuler les emails de conversion en attente
  await cancelScheduledEmails(email, [
    'waitlist_reminder_j3', 'waitlist_opening',
    'quiz_followup_j2', 'quiz_conversion_j5',
  ])

  // Programmer la séquence nurturing
  scheduleEmail('nurturing_j1', email, vars, 1, { recipientName: firstName }).catch(() => {})
  scheduleEmail('nurturing_j3', email, vars, 3, { recipientName: firstName }).catch(() => {})
  scheduleEmail('nurturing_j7', email, vars, 7, { recipientName: firstName }).catch(() => {})
  scheduleEmail('nurturing_j14', email, vars, 14, { recipientName: firstName }).catch(() => {})

  // CRM
  enrollInSequence('subscription', email, firstName).catch(() => {})
}

// ═══════════════════════════════════════════════════════════════
// 6. LOGGER un événement de paiement
// ═══════════════════════════════════════════════════════════════

export async function logPaymentEvent(
  userId: string,
  eventType: string,
  plan: PlanId,
  metadata?: Record<string, unknown>
): Promise<void> {
  const supabase = getAdminSupabase()
  if (!supabase) return

  const { error } = await supabase.from('subscription_payment_logs').insert({
    user_id: userId,
    event_type: eventType,
    plan,
    metadata: metadata || {},
  })
  if (error) {
    console.error('[SubscriptionService] Erreur log événement:', error)
  }
}

// ═══════════════════════════════════════════════════════════════
// 7. FLUX COMPLET POST-PAIEMENT (appelé par webhook ET verify-session)
// ═══════════════════════════════════════════════════════════════

interface ProcessPaymentParams {
  email: string
  prenom?: string | null
  plan: PlanId
  duration: DurationId
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  stripeStatus: string
  currentPeriodEnd?: number // Unix timestamp
  cancelAtPeriodEnd?: boolean
  trialEnd?: number | null // Unix timestamp
  waitlistDiscount?: boolean
  amountTotal?: number | null
  source: 'webhook' | 'verify-session'
}

interface ProcessPaymentResult {
  success: boolean
  userId: string | null
  isNewUser: boolean
  emailSent: boolean
  error?: string
}

export async function processSuccessfulPayment(params: ProcessPaymentParams): Promise<ProcessPaymentResult> {
  const {
    email, prenom, plan, duration,
    stripeCustomerId, stripeSubscriptionId,
    stripeStatus, currentPeriodEnd, cancelAtPeriodEnd,
    trialEnd, waitlistDiscount, amountTotal, source
  } = params

  console.log(`[SubscriptionService] Traitement paiement (${source}) — email: ${email}, plan: ${plan}, durée: ${duration}`)

  // Étape 1 : Trouver ou créer le compte
  const account = await findOrCreateAccount(email, prenom)
  if (!account) {
    return { success: false, userId: null, isNewUser: false, emailSent: false, error: 'Impossible de créer le compte' }
  }

  // Étape 2 : Créer/mettre à jour l'abonnement
  const subCreated = await upsertSubscription({
    userId: account.userId,
    plan,
    duration,
    stripeCustomerId,
    stripeSubscriptionId,
    status: mapStripeStatus(stripeStatus),
    currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : undefined,
    cancelAtPeriodEnd: cancelAtPeriodEnd || false,
    trialEnd: trialEnd ? new Date(trialEnd * 1000).toISOString() : null,
    waitlistDiscount: waitlistDiscount || false,
  })

  if (!subCreated) {
    return { success: false, userId: account.userId, isNewUser: account.isNew, emailSent: false, error: 'Erreur création abonnement' }
  }

  // Étape 3 : Logger l'événement
  await logPaymentEvent(account.userId, 'subscription_created', plan, {
    stripe_subscription_id: stripeSubscriptionId,
    duration,
    amount_total: amountTotal,
    source,
    is_new_user: account.isNew,
  })

  // Étape 4 : Envoyer l'email de bienvenue
  const firstName = prenom || 'Membre'
  const emailSent = await sendWelcomeEmail(
    email,
    firstName,
    plan,
    account.isNew ? account.tempPassword : null,
    account.isNew
  )

  // Étape 5 : Programmer les emails de nurturing
  await scheduleNurturingEmails(email, firstName, plan)

  console.log(`[SubscriptionService] Paiement traité avec succès — userId: ${account.userId}, nouveau: ${account.isNew}, email: ${emailSent}`)

  return {
    success: true,
    userId: account.userId,
    isNewUser: account.isNew,
    emailSent,
  }
}

// ═══════════════════════════════════════════════════════════════
// 8. GESTION DES EVENEMENTS d'abonnement (update/delete/payment)
// ═══════════════════════════════════════════════════════════════

export async function handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
  const supabase = getAdminSupabase()
  if (!supabase) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sub = subscription as any
  const customerId = sub.customer as string

  // Trouver par subscription ID ou customer ID
  let { data: existingSub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', sub.id)
    .maybeSingle()

  if (!existingSub) {
    const result = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle()
    existingSub = result.data
  }

  if (!existingSub) return

  const status = mapStripeStatus(sub.status)
  const isActive = status === 'active' || status === 'trialing'

  await supabase.from('subscriptions').update({
    status,
    current_period_end: sub.current_period_end
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null,
    cancel_at_period_end: sub.cancel_at_period_end ?? false,
    stripe_subscription_id: sub.id,
    updated_at: new Date().toISOString(),
  }).eq('user_id', existingSub.user_id)

  await supabase.from('profiles').update({
    is_active: isActive,
  }).eq('id', existingSub.user_id)
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  const supabase = getAdminSupabase()
  if (!supabase) return

  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .maybeSingle()

  if (!existingSub) return

  await supabase.from('subscriptions').update({
    status: 'canceled',
    updated_at: new Date().toISOString(),
  }).eq('user_id', existingSub.user_id)

  await supabase.from('profiles').update({
    is_active: false,
    plan: null,
  }).eq('id', existingSub.user_id)

  // Emails de résiliation
  const { data: profile } = await supabase
    .from('profiles')
    .select('prenom, email, plan')
    .eq('id', existingSub.user_id)
    .single()

  if (profile?.email) {
    const firstName = profile.prenom || 'Membre'
    const planName = getPlanDisplayName(profile.plan || 'essential')
    const vars = { firstName, email: profile.email, planName }

    await cancelScheduledEmails(profile.email, [
      'nurturing_j1', 'nurturing_j3', 'nurturing_j7', 'nurturing_j14',
      'renewal_reminder_j7',
    ])

    sendTemplateEmail('cancellation_confirmation', profile.email, vars, { recipientName: firstName }).catch(() => {})
    scheduleEmail('cancellation_winback_j7', profile.email, vars, 7, { recipientName: firstName }).catch(() => {})
    enrollInSequence('cancellation', profile.email, firstName).catch(() => {})
  }
}

export async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const supabase = getAdminSupabase()
  if (!supabase) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inv = invoice as any
  const customerId = inv.customer as string

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, user_id, plan')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()

  if (!sub) return

  const now = new Date()
  const graceEnd = new Date(now)
  graceEnd.setDate(graceEnd.getDate() + 7)

  await supabase.from('subscriptions').update({
    status: 'past_due',
    payment_failed_at: now.toISOString(),
    grace_period_end: graceEnd.toISOString(),
    reminder_sent_count: 0,
    updated_at: now.toISOString(),
  }).eq('user_id', sub.user_id)

  await logPaymentEvent(sub.user_id, 'payment_failed', sub.plan, {
    invoice_id: inv.id,
    attempt_count: inv.attempt_count,
    grace_period_end: graceEnd.toISOString(),
  })

  // Email
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
    enrollInSequence('renewal', profile.email, firstName).catch(() => {})
  }
}

export async function handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  const supabase = getAdminSupabase()
  if (!supabase) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inv = invoice as any
  const customerId = inv.customer as string
  const subscriptionId = inv.subscription as string

  if (!subscriptionId) return

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, user_id, plan, status')
    .eq('stripe_customer_id', customerId)
    .maybeSingle()

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

  await logPaymentEvent(sub.user_id, wasPastDue ? 'access_restored' : 'payment_succeeded', sub.plan, {
    invoice_id: inv.id,
    was_past_due: wasPastDue,
  })

  // Email
  const { data: profile } = await supabase
    .from('profiles')
    .select('prenom, email')
    .eq('id', sub.user_id)
    .single()

  if (profile?.email) {
    const firstName = profile.prenom || 'Membre'
    const planName = getPlanDisplayName(sub.plan || 'essential')
    const planAmountStr = getPlanAmount(sub.plan || 'essential')
    sendTemplateEmail(
      wasPastDue ? 'renewal_success' : 'subscription_confirmation',
      profile.email,
      { firstName, email: profile.email, planName, planAmount: planAmountStr },
      { recipientName: firstName }
    ).catch(() => {})
  }
}

// ═══════════════════════════════════════════════════════════════
// 9. VÉRIFIER SI UN PAIEMENT A DÉJÀ ÉTÉ TRAITÉ
// ═══════════════════════════════════════════════════════════════

export async function isPaymentAlreadyProcessed(stripeSubscriptionId: string): Promise<{
  processed: boolean
  userId?: string
  emailSent?: boolean
}> {
  const supabase = getAdminSupabase()
  if (!supabase) return { processed: false }

  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('id, user_id')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .maybeSingle()

  if (!existingSub) return { processed: false }

  // Vérifier si l'email a été envoyé
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', existingSub.user_id)
    .single()

  if (!profile?.email) return { processed: true, userId: existingSub.user_id }

  const { data: emailLog } = await supabase
    .from('crm_campaign_events')
    .select('id')
    .or('event_type.eq.auto_email_subscription_welcome,event_type.eq.auto_email_account_created')
    .filter('metadata->>recipient', 'eq', profile.email)
    .limit(1)
    .maybeSingle()

  return {
    processed: true,
    userId: existingSub.user_id,
    emailSent: !!emailLog,
  }
}

// ═══════════════════════════════════════════════════════════════
// 10. RÉCUPÉRER L'EMAIL depuis un customer Stripe
// ═══════════════════════════════════════════════════════════════

export async function getEmailFromStripeCustomer(stripe: Stripe, customerId: string): Promise<string | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId)
    if (customer && !customer.deleted && 'email' in customer) {
      return customer.email || null
    }
  } catch (e) {
    console.error('[SubscriptionService] Erreur récupération email client Stripe:', e)
  }
  return null
}
