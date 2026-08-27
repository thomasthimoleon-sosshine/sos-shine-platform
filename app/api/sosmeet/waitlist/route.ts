import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || !url.startsWith('http')) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

const VALID_CITIES = ['Paris', 'Lyon', 'Bordeaux', 'Autre']
const VALID_STAGES = [
  'Je débute mon chemin',
  'Je pratique régulièrement',
  "C'est au cœur de ma vie",
  'En couple, on veut se retrouver',
]

export async function POST(request: Request) {
  try {
    // Rate limiting
    const { rateLimit, getIp } = await import('@/lib/rate-limit')
    const { allowed } = rateLimit(getIp(request), { maxRequests: 6, windowMs: 60_000 })
    if (!allowed) return NextResponse.json({ error: 'Trop de requêtes, réessayez dans une minute.' }, { status: 429 })

    const body = await request.json().catch(() => ({}))
    const { email, firstName, city, stage, consent, hp } = body as Record<string, unknown>

    // Honeypot : rempli => bot
    if (hp) return NextResponse.json({ message: 'success' }, { status: 201 })

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 })
    }
    if (!firstName || typeof firstName !== 'string' || firstName.trim().length < 2) {
      return NextResponse.json({ error: 'Veuillez indiquer votre prénom.' }, { status: 400 })
    }
    if (consent !== true) {
      return NextResponse.json({ error: 'Le consentement est requis pour rejoindre la liste.' }, { status: 400 })
    }

    // Anti-spam
    const { validateAntiSpam } = await import('@/lib/anti-spam')
    const spamError = validateAntiSpam(email, firstName)
    if (spamError) return NextResponse.json({ error: spamError }, { status: 400 })

    const cleanEmail = email.toLowerCase().trim()
    const cleanFirst = firstName.trim().slice(0, 80)
    const cleanCity = typeof city === 'string' && VALID_CITIES.includes(city) ? city : null
    const cleanStage = typeof stage === 'string' && VALID_STAGES.includes(stage) ? stage : null

    const supabase = getSupabase()

    // Fallback dev : pas d'env Supabase -> succès simulé (permet de tester l'UI)
    if (!supabase) {
      console.log('[sosmeet/waitlist] DEV fallback (pas de Supabase) — inscription simulée :', {
        email: cleanEmail, firstName: cleanFirst, city: cleanCity, stage: cleanStage,
      })
      return NextResponse.json({ message: 'success', simulated: true }, { status: 201 })
    }

    const { error } = await supabase.from('sosmeet_waitlist').insert({
      email: cleanEmail,
      first_name: cleanFirst,
      city: cleanCity,
      stage: cleanStage,
      consent: true,
    })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ message: 'already_registered' }, { status: 200 })
      }
      if (error.code === '42P01') {
        console.error('[sosmeet/waitlist] Table sosmeet_waitlist absente — exécutez supabase/schema.sql')
        return NextResponse.json({ error: 'Service temporairement indisponible.' }, { status: 503 })
      }
      console.error('[sosmeet/waitlist] insert error:', error.code, error.message)
      return NextResponse.json({ error: 'Erreur serveur, réessayez.' }, { status: 500 })
    }

    // Email de bienvenue (non bloquant)
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
      const profileUrl = `${siteUrl}/sos-meet/profil?email=${encodeURIComponent(cleanEmail)}`
      const { sendRawEmail } = await import('@/lib/email-templates/automated-emails')
      const body = `
        <h2 style="color:#C9A961;font-family:Georgia,serif;font-weight:400;margin:0 0 16px;">Bienvenue sur le chemin, ${cleanFirst} 🤍</h2>
        <p style="color:#E0E0E0;font-size:15px;line-height:1.8;">Votre place sur la liste d'attente de <strong>SOS Meet</strong> est réservée. Vous serez parmi les premiers invités à la bêta des rencontres conscientes.</p>
        <p style="color:#a1a1aa;font-size:14px;line-height:1.8;">Envie de prendre de l'avance ? Préparez dès maintenant votre <strong>profil de compatibilité</strong> — un questionnaire profond qui nous permettra de vous présenter des personnes réellement alignées.</p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${profileUrl}" style="display:inline-block;padding:14px 32px;border-radius:50px;font-size:14px;font-weight:600;text-decoration:none;color:#050505;background:linear-gradient(135deg,#C9A961,#E2CB86);">Préparer mon profil</a>
        </div>
        <p style="color:#a1a1aa;font-size:13px;line-height:1.7;">À très vite,<br/>L'équipe SOS Meet, par SOS Shine®</p>
      `
      // Fire-and-forget : ne pas bloquer la réponse
      sendRawEmail(cleanEmail, 'Bienvenue sur SOS Meet ✨', body, { recipientName: cleanFirst, eventType: 'sosmeet_waitlist_welcome' }).catch(() => {})
    } catch {}

    return NextResponse.json({ message: 'success' }, { status: 201 })
  } catch (e) {
    console.error('[sosmeet/waitlist] exception:', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

// Compteur public (preuve sociale)
export async function GET() {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ count: 0 })
    const { count, error } = await supabase
      .from('sosmeet_waitlist')
      .select('*', { count: 'exact', head: true })
    if (error) return NextResponse.json({ count: 0 })
    return NextResponse.json({ count: count || 0 })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
