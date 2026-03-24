import { NextResponse } from 'next/server'
import { getPaymentLink } from '@/lib/stripe'
import type { PlanId, DurationId } from '@/lib/stripe'

const VALID_PLANS: PlanId[] = ['essential', 'serenite', 'premium']
const VALID_DURATIONS: DurationId[] = ['monthly', 'quarterly', 'semiannual', 'annual']

export async function POST(request: Request) {
  try {
    const { plan, duration = 'monthly', email, prenom } = await request.json()

    if (!plan || !VALID_PLANS.includes(plan)) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    if (!VALID_DURATIONS.includes(duration)) {
      return NextResponse.json({ error: 'Durée invalide' }, { status: 400 })
    }

    // Essential plan only supports monthly
    const effectiveDuration: DurationId = (plan === 'essential' && duration !== 'monthly') ? 'monthly' : duration

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    // Use direct Stripe Payment Links (manual management)
    const paymentLink = getPaymentLink(plan as PlanId, effectiveDuration)
    if (!paymentLink) {
      return NextResponse.json({ error: `L'offre ${plan} en ${effectiveDuration} n'est pas encore disponible.` }, { status: 400 })
    }

    // Append prefilled email and name to payment link URL
    const url = new URL(paymentLink)
    url.searchParams.set('prefilled_email', email.trim())
    if (prenom) url.searchParams.set('client_reference_id', prenom.trim())

    console.log(`[Checkout] Redirecting to Payment Link: ${plan}_${effectiveDuration} for ${email}`)

    return NextResponse.json({ url: url.toString() })
  } catch (err: unknown) {
    console.error('[Checkout] Error:', err)
    return NextResponse.json({ error: 'Une erreur est survenue. Veuillez réessayer.' }, { status: 500 })
  }
}
