import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

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

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
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
  const plan = session.metadata?.plan as 'essential' | 'serenite' | 'premium' || 'essential'
  const hasWaitlistDiscount = session.metadata?.waitlist_discount === 'true'

  if (!userEmail && !userId) return

  // Find user by ID or email
  let profileId = userId
  if (!profileId && userEmail) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single()
    profileId = profile?.id
  }
  if (!profileId) return

  // Get subscription details from Stripe
  const sub = await stripe.subscriptions.retrieve(subscriptionId) as unknown as {
    status: string
    current_period_end: number
    cancel_at_period_end: boolean
  }

  // Upsert subscription record
  await supabase.from('subscriptions').upsert({
    user_id: profileId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    plan,
    status: mapStripeStatus(sub.status),
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    cancel_at_period_end: sub.cancel_at_period_end,
    waitlist_discount: hasWaitlistDiscount,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  // Update profile
  await supabase.from('profiles').update({
    plan,
    is_active: true,
  }).eq('id', profileId)
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
