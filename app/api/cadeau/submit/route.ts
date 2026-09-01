import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// In-memory rate limiter: 5 requests per minute per IP
const rl = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rl.get(ip)
  if (!entry || entry.resetAt < now) {
    rl.set(ip, { count: 1, resetAt: now + 60_000 })
    return false
  }
  if (entry.count >= 5) return true
  entry.count++
  return false
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Reessaie dans une minute.' },
      { status: 429 }
    )
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Requete invalide.' }, { status: 400 })
  }

  const { prenom, email, consent, _hp } = body as {
    prenom?: string
    email?: string
    consent?: boolean
    _hp?: string
  }

  // Honeypot: silently succeed to not reveal detection
  if (_hp) return NextResponse.json({ success: true })

  // Validation
  if (!prenom?.trim()) {
    return NextResponse.json({ error: 'Le prenom est requis.' }, { status: 400 })
  }
  if (!email?.trim()) {
    return NextResponse.json({ error: "L'email est requis." }, { status: 400 })
  }
  if (!consent) {
    return NextResponse.json({ error: 'Le consentement est requis.' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    return NextResponse.json({ error: 'Configuration serveur manquante.' }, { status: 500 })
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { error: dbError } = await supabase
    .from('event_leads')
    .upsert(
      {
        prenom: prenom.trim(),
        email: email.trim().toLowerCase(),
        consent: true,
        source: 'plage-couples-2025',
      },
      { onConflict: 'email' }
    )

  if (dbError) {
    console.error('[cadeau/submit] Supabase error:', dbError)
    return NextResponse.json({ error: 'Une erreur est survenue. Reessaie.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
