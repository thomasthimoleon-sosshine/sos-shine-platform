import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { computeScores, type Answers } from '@/lib/sosmeet/scoring'

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || !url.startsWith('http')) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function cleanAnswers(raw: unknown): Answers {
  const out: Answers = {}
  if (raw && typeof raw === 'object') {
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof v === 'number' && v >= 0 && v <= 100) out[k] = v
    }
  }
  return out
}

export async function POST(request: Request) {
  try {
    const { rateLimit, getIp } = await import('@/lib/rate-limit')
    const { allowed } = rateLimit(getIp(request), { maxRequests: 40, windowMs: 60_000 })
    if (!allowed) return NextResponse.json({ error: 'Trop de requêtes.' }, { status: 429 })

    const body = await request.json().catch(() => ({}))
    const { email, sensitiveConsent, completed } = body as Record<string, unknown>
    const answers = cleanAnswers((body as Record<string, unknown>).answers)

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide.' }, { status: 400 })
    }
    const cleanEmail = email.toLowerCase().trim()
    const scores = computeScores(answers)

    const supabase = getSupabase()
    if (!supabase) {
      console.log('[sosmeet/profile] DEV fallback, profil simulé :', { email: cleanEmail, count: Object.keys(answers).length })
      return NextResponse.json({ message: 'success', simulated: true, scores }, { status: 200 })
    }

    const { error } = await supabase.from('sosmeet_profiles').upsert(
      {
        email: cleanEmail,
        answers,
        scores,
        sensitive_consent: sensitiveConsent === true,
        completed: completed === true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'email' }
    )

    if (error) {
      if (error.code === '23503') {
        return NextResponse.json({ error: 'Merci de rejoindre d\'abord la liste d\'attente.' }, { status: 409 })
      }
      if (error.code === '42P01') {
        return NextResponse.json({ error: 'Service indisponible (schéma manquant).' }, { status: 503 })
      }
      console.error('[sosmeet/profile] upsert error:', error.code, error.message)
      return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'success', scores }, { status: 200 })
  } catch (e) {
    console.error('[sosmeet/profile] exception:', e)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

// Reprise : charge les réponses déjà enregistrées
export async function GET(request: Request) {
  try {
    const email = new URL(request.url).searchParams.get('email')?.toLowerCase().trim()
    if (!email) return NextResponse.json({ answers: {} })
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ answers: {} })
    const { data } = await supabase
      .from('sosmeet_profiles')
      .select('answers, completed')
      .eq('email', email)
      .maybeSingle()
    return NextResponse.json({ answers: (data?.answers as Answers) || {}, completed: data?.completed || false })
  } catch {
    return NextResponse.json({ answers: {} })
  }
}
