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
    const { rateLimit, getIp } = await import('@/lib/rate-limit')
    const { allowed } = rateLimit(getIp(request), { maxRequests: 30, windowMs: 60_000 })
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    const body = await request.json()
    const { sessionId, responseId, ...data } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
    }

    const supabase = getAdminClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Server config missing' }, { status: 500 })
    }

    if (responseId) {
      const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (data.responses) updateData.responses = data.responses
      if (data.currentQuestion) updateData.current_question = data.currentQuestion
      if (data.email) updateData.email = data.email
      if (data.emailCapturedAt) updateData.email_captured_at = data.emailCapturedAt
      if (data.completedAt) updateData.completed_at = data.completedAt
      if (data.scores) updateData.scores = data.scores
      if (data.dominantDimension) updateData.dominant_dimension = data.dominantDimension
      if (data.secondaryDimension) updateData.secondary_dimension = data.secondaryDimension
      if (data.q15Response) updateData.q15_response = data.q15Response

      await supabase.from('quiz_v2_responses').update(updateData).eq('id', responseId)
      return NextResponse.json({ id: responseId })
    }

    const { data: inserted, error } = await supabase
      .from('quiz_v2_responses')
      .insert({
        session_id: sessionId,
        first_name: data.firstName || null,
        current_question: data.currentQuestion || 1,
        responses: data.responses || {},
      })
      .select('id')
      .single()

    if (error) {
      console.error('Quiz V2 save error:', error)
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }

    return NextResponse.json({ id: inserted.id })
  } catch (e) {
    console.error('Quiz V2 save exception:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
