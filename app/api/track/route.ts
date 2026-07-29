import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Endpoint public d'ingestion des événements de parcours.
// Écrit via la service role (contourne RLS). Best-effort : renvoie
// toujours 200 pour ne jamais perturber le visiteur, même en cas d'erreur.

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

const ALLOWED_EVENTS = new Set([
  'test_started',
  'question_answered',
  'test_completed',
  'email_gate_shown',
  'email_submitted',
  'result_viewed',
  'join_clicked',
  'checkout_started',
  'signup_submitted',
])

export async function POST(request: Request) {
  try {
    const raw = await request.text()
    if (!raw) return NextResponse.json({ ok: true })

    const body = JSON.parse(raw)
    const event = typeof body.event === 'string' ? body.event : null
    const sessionId = typeof body.session_id === 'string' ? body.session_id.slice(0, 80) : null

    // On ignore silencieusement ce qui n'est pas reconnu (anti-bruit).
    if (!event || !sessionId || !ALLOWED_EVENTS.has(event)) {
      return NextResponse.json({ ok: true })
    }

    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ ok: true })

    const step = Number.isFinite(body.step) ? Math.trunc(body.step) : null
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim().slice(0, 200) : null
    const path = typeof body.path === 'string' ? body.path.slice(0, 300) : null
    const metadata = body.metadata && typeof body.metadata === 'object' ? body.metadata : {}

    await supabase.from('funnel_events').insert({
      session_id: sessionId,
      event,
      step,
      email: email || null,
      path,
      metadata,
    })

    return NextResponse.json({ ok: true })
  } catch {
    // Table absente, JSON invalide, etc. — on ne casse jamais le parcours.
    return NextResponse.json({ ok: true })
  }
}
