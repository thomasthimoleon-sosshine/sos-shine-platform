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
    const { sessionId, responseId, email, firstName, scores, dominant, q15Response } = await request.json()

    if (!email || !scores) return NextResponse.json({ error: 'Missing data' }, { status: 400 })

    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ ok: true })

    // Update signature_leads with profile info
    await supabase.from('signature_leads').upsert({
      email: email.toLowerCase().trim(),
      first_name: firstName || null,
      profile_key: `dim_${dominant}`,
      quiz_version: 'v2',
    }, { onConflict: 'email' })

    // Log completion event
    await supabase.from('crm_campaign_events').insert({
      contact_email: email.toLowerCase().trim(),
      event_type: 'signature_v2_completed',
      metadata: {
        session_id: sessionId,
        response_id: responseId,
        dominant_dimension: dominant,
        scores,
        q15_response: q15Response,
        completed_at: new Date().toISOString(),
      },
    })

    // TODO: Send result email (Phase 3 — Email sequence)
    // For now, just log. Email templates will be implemented in Phase 3.

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Quiz V2 complete error:', e)
    return NextResponse.json({ ok: true })
  }
}
