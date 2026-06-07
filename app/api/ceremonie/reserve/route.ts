import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/bJe5kvai06p5d7r0C65ZC0p'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { prenom: string; nom: string; email: string }
    const { prenom, nom, email } = body

    if (!prenom?.trim() || !nom?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Tous les champs sont obligatoires.' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email invalide.' }, { status: 400 })
    }

    const supabase = getAdminClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Configuration serveur manquante.' }, { status: 500 })
    }

    const { data, error } = await supabase
      .from('ceremonie_reservations')
      .insert({ prenom: prenom.trim(), nom: nom.trim(), email: email.trim().toLowerCase() })
      .select('id')
      .single()

    if (error) {
      console.error('[ceremonie/reserve] Supabase error:', error)
      return NextResponse.json({ error: 'Erreur lors de la réservation.' }, { status: 500 })
    }

    const reservationId = data.id
    const stripeUrl = `${STRIPE_PAYMENT_LINK}?prefilled_email=${encodeURIComponent(email)}&client_reference_id=${reservationId}`

    return NextResponse.json({ url: stripeUrl })
  } catch (err) {
    console.error('[ceremonie/reserve] Unexpected error:', err)
    return NextResponse.json({ error: 'Erreur inattendue.' }, { status: 500 })
  }
}
