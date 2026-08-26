/**
 * LA LETTRE — envoi hebdomadaire.
 * Envoie la lettre du mois courant aux abonnés de newsletter_weekly_subscribers.
 * Déduplication par (email, lettre du mois) via crm_campaign_events : chaque
 * abonné reçoit chaque lettre mensuelle au plus une fois (cadence ≈ mensuelle,
 * jamais deux fois la même). À planifier le dimanche soir.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getResendClient } from '@/lib/crm/resend'
import { withTrackingPixel } from '@/lib/crm/tracking-pixel'
import { letterForMonth } from '@/lib/email-templates/newsletter/letters'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function replaceVars(text: string, vars: Record<string, string>): string {
  let out = text
  for (const [k, val] of Object.entries(vars)) out = out.replace(new RegExp(`\\{${k}\\}`, 'g'), val)
  return out
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET || process.env.BOT_SECRET
  const isVercelCron = request.headers.get('x-vercel-cron') === '1'
  const authHeader = request.headers.get('authorization')
  if (cronSecret && !isVercelCron && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getAdminClient()
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const month = new Date().getMonth() + 1 // 1-12
  const letter = letterForMonth(month)
  const eventKey = `newsletter_letter_${String(month).padStart(2, '0')}_sent`

  let sent = 0
  let errors = 0

  try {
    const { client: resend, fromEmail } = await getResendClient()

    // Abonnés à la lettre.
    const { data: subs } = await supabase
      .from('newsletter_weekly_subscribers')
      .select('email, first_name')
      .limit(2000)

    if (!subs || subs.length === 0) {
      return NextResponse.json({ sent: 0, month, message: 'Aucun abonné' })
    }

    for (const sub of subs) {
      const email = (sub.email || '').toLowerCase()
      if (!email) continue

      // Déjà reçu la lettre de ce mois ? → on passe.
      const { data: already } = await supabase
        .from('crm_campaign_events')
        .select('id')
        .eq('contact_email', email)
        .eq('event_type', eventKey)
        .limit(1)
      if (already && already.length > 0) continue

      const vars = { firstName: sub.first_name || '', email }
      const built = letter.build({ firstName: sub.first_name || '', email })
      const subject = replaceVars(built.subject, vars)
      const html = withTrackingPixel(replaceVars(built.html, vars), email, eventKey)

      try {
        await resend.emails.send({ from: `Julia Laureau <${fromEmail}>`, to: email, subject, html })
        await supabase.from('crm_campaign_events').insert({
          contact_email: email,
          event_type: eventKey,
          metadata: { month, theme: letter.theme, format: letter.format },
        })
        sent++
      } catch (e) {
        console.error(`[Newsletter] envoi échoué pour ${email}:`, e)
        errors++
      }
    }
  } catch (e) {
    console.error('[Newsletter] cron error:', e)
    return NextResponse.json({ error: 'Cron failed', details: String(e) }, { status: 500 })
  }

  return NextResponse.json({ sent, errors, month, theme: letter.theme, timestamp: new Date().toISOString() })
}
