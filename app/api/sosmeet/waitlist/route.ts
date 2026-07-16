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
