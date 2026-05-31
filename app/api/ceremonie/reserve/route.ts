import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isSpamEmail, isSpamName } from '@/lib/anti-spam'

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/bJe5kvai06p5d7r0C65ZC0p'

// In-memory rate limiter: max 3 attempts per IP per 60 seconds
const rateLimitMap = new Map<string, { count: number; firstAt: number }>()
const RATE_WINDOW_MS = 60_000
const RATE_MAX = 3

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now - entry.firstAt > RATE_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, firstAt: now })
    return true
  }
  if (entry.count >= RATE_MAX) return false
  entry.count++
  return true
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Trop de tentatives. Réessaie dans une minute.' }, { status: 429 })
    }

    const body = await request.json() as { prenom: string; nom: string; email: string; _hp?: string }
    const { prenom, nom, email, _hp } = body

    if (_hp) {
      return NextResponse.json({ error: 'Réservation invalide.' }, { status: 400 })
    }

    if (!prenom?.trim() || !nom?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Tous les champs sont obligatoires.' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email invalide.' }, { status: 400 })
    }

    if (isSpamName(prenom.trim()) || isSpamName(nom.trim())) {
      return NextResponse.json({ error: 'Le nom saisi semble invalide.' }, { status: 400 })
    }
    if (isSpamEmail(email.trim())) {
      return NextResponse.json({ error: "Cette adresse email n'est pas acceptée." }, { status: 400 })
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
