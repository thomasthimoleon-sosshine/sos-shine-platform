import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, quizResponseId, eventType, eventData } = await request.json()

    if (!sessionId || !eventType) {
      return NextResponse.json({ error: 'sessionId and eventType required' }, { status: 400 })
    }

    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ ok: true })

    await supabase.from('quiz_v2_events').insert({
      session_id: sessionId,
      quiz_response_id: quizResponseId || null,
      event_type: eventType,
      event_data: eventData || null,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
