import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isSpamEmail, isSpamName } from '@/lib/anti-spam'
import { getResendClient } from '@/lib/crm/resend'
import { wrapInEmailLayout } from '@/lib/email-templates/automated-emails'

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

    const body = await request.json() as { prenom: string; nom: string; email: string; _hp?: string; isFree?: boolean; eventId?: string; eventTitle?: string; eventDate?: string; eventLocation?: string }
    const { prenom, nom, email, _hp, isFree, eventId, eventTitle, eventDate, eventLocation } = body

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
      .insert({
        prenom: prenom.trim(),
        nom: nom.trim(),
        email: email.trim().toLowerCase(),
        ...(eventId ? { event_id: eventId } : {}),
      })
      .select('id')
      .single()

    if (error) {
      console.error('[ceremonie/reserve] Supabase error:', error)
      return NextResponse.json({ error: 'Erreur lors de la réservation.' }, { status: 500 })
    }

    const reservationId = data.id

    if (isFree) {
      try {
        const { client, fromEmail } = await getResendClient()
        const dateLabel = eventDate
          ? new Date(eventDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
          : null
        const timeLabel = eventDate
          ? new Date(eventDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
          : null

        const bodyContent = `
          <h2 style="font-family:Georgia,serif;font-size:24px;font-weight:300;color:#C9A961;margin:0 0 8px;">
            Ta place est confirmée 🌿
          </h2>
          <p style="font-size:15px;color:rgba(245,241,232,0.6);margin:0 0 32px;line-height:1.6;">
            Bonjour ${prenom},<br/><br/>
            Ton inscription à l'événement <strong style="color:#F5F1E8;">${eventTitle || 'SOS Shine'}</strong> est bien enregistrée. On a hâte de te retrouver !
          </p>
          ${(dateLabel || eventLocation) ? `
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(201,169,97,0.15);border-radius:12px;padding:0;margin-bottom:32px;">
            <tr><td style="padding:20px 24px;">
              ${dateLabel ? `
              <p style="margin:0 0 12px;font-size:14px;color:#F5F1E8;">
                <span style="color:#C9A961;font-weight:600;">📅 Date</span><br/>
                <span style="color:rgba(245,241,232,0.7);">${dateLabel}${timeLabel ? ` à ${timeLabel}` : ''}</span>
              </p>` : ''}
              ${eventLocation ? `
              <p style="margin:0;font-size:14px;color:#F5F1E8;">
                <span style="color:#C9A961;font-weight:600;">📍 Lieu</span><br/>
                <span style="color:rgba(245,241,232,0.7);">${eventLocation}</span>
              </p>` : ''}
            </td></tr>
          </table>` : ''}
          <p style="font-size:13px;color:rgba(245,241,232,0.4);line-height:1.7;margin:0;">
            Si tu as des questions, réponds directement à cet email ou écris-nous à <a href="mailto:hello@sosshine.com" style="color:#C9A961;">hello@sosshine.com</a>.
          </p>
        `

        await client.emails.send({
          from: fromEmail,
          to: email.trim().toLowerCase(),
          subject: `Inscription confirmée, ${eventTitle || 'Événement SOS Shine'}`,
          html: wrapInEmailLayout(bodyContent),
        })
      } catch (emailErr) {
        console.error('[ceremonie/reserve] Email send error:', emailErr)
      }

      return NextResponse.json({ success: true })
    }

    const stripeUrl = `${STRIPE_PAYMENT_LINK}?prefilled_email=${encodeURIComponent(email)}&client_reference_id=${reservationId}`
    return NextResponse.json({ url: stripeUrl })
  } catch (err) {
    console.error('[ceremonie/reserve] Unexpected error:', err)
    return NextResponse.json({ error: 'Erreur inattendue.' }, { status: 500 })
  }
}
