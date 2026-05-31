import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isSpamEmail, isSpamName } from '@/lib/anti-spam'
import { sendRawEmail } from '@/lib/email-templates/automated-emails'

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/bJe5kvai06p5d7r0C65ZC0p'

const EMAIL_SUBJECT = "Ta place est confirmée — L'Éveil · 13 juin au lac ✨"

function buildConfirmationEmail(prenom: string): string {
  return `
<div style="font-family: Georgia, serif; color: #1a1a1a; max-width: 560px; margin: 0 auto;">
  <p style="font-size: 16px; line-height: 1.7;">Bonjour ${prenom},</p>

  <p style="font-size: 16px; line-height: 1.7;">
    Ta réservation pour <strong>L'Éveil</strong> est bien confirmée.<br>
    On a vraiment hâte de te retrouver là-bas.
  </p>

  <div style="background: #f9f6f0; border-left: 3px solid #C9A961; padding: 20px 24px; margin: 28px 0; border-radius: 4px;">
    <p style="margin: 0 0 8px; font-size: 15px;">📅 <strong>Samedi 13 juin 2026</strong></p>
    <p style="margin: 0 0 8px; font-size: 15px;">🕕 <strong>18h00 — 21h30</strong></p>
    <p style="margin: 0; font-size: 15px;">📍 <strong>Lac de Saint-Cassien</strong></p>
    <p style="margin: 8px 0 0; font-size: 14px; color: #666;">L'adresse exacte te sera communiquée 24h avant 🙂</p>
  </div>

  <p style="font-size: 15px; line-height: 1.7; margin-bottom: 8px;"><strong>Quelques petites choses à savoir :</strong></p>
  <ul style="font-size: 15px; line-height: 1.9; color: #333; padding-left: 20px;">
    <li>Le solde de <strong>90€</strong> se règle en espèces sur place le soir de l'événement</li>
    <li>Prévois une tenue dans laquelle tu te sens à l'aise pour bouger et t'asseoir dehors</li>
    <li>Le lieu est en plein air au bord du lac — une petite laine pour le soir peut être utile</li>
    <li>Pense à prendre tes précautions contre les moustiques 🌿</li>
  </ul>

  <p style="font-size: 15px; line-height: 1.7; margin-top: 28px;">
    Si tu as la moindre question d'ici là, réponds simplement à cet email.
  </p>

  <p style="font-size: 15px; line-height: 1.7; margin-top: 24px;">
    À très vite,<br>
    <strong>Julia, William et Thomas 🌿</strong>
  </p>
</div>
  `.trim()
}

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

    // Envoi du mail de confirmation (fire and forget — ne bloque pas la redirection)
    sendRawEmail(
      email.trim().toLowerCase(),
      EMAIL_SUBJECT,
      buildConfirmationEmail(prenom.trim()),
      { recipientName: prenom.trim(), eventType: 'ceremonie_reservation' }
    ).catch(err => console.error('[ceremonie/reserve] Email error:', err))

    const reservationId = data.id
    const stripeUrl = `${STRIPE_PAYMENT_LINK}?prefilled_email=${encodeURIComponent(email)}&client_reference_id=${reservationId}`

    return NextResponse.json({ url: stripeUrl })
  } catch (err) {
    console.error('[ceremonie/reserve] Unexpected error:', err)
    return NextResponse.json({ error: 'Erreur inattendue.' }, { status: 500 })
  }
}
