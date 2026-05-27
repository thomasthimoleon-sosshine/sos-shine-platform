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

    const { sessionId, responseId, email, firstName } = await request.json()

    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ ok: true })

    const cleanEmail = email.toLowerCase().trim()
    const cleanName = firstName?.trim() || null

    // Upsert into signature_leads (with quiz_version = v2)
    await supabase.from('signature_leads').upsert({
      email: cleanEmail,
      first_name: cleanName,
      profile_key: null,
      quiz_version: 'v2',
    }, { onConflict: 'email' })

    // Upsert into CRM contacts
    const abVariant = request.cookies.get('ab_variant')?.value
    try {
      await (supabase as any).from('crm_contacts').upsert({
        email: cleanEmail,
        first_name: cleanName,
        source: 'signature_test_v2',
        ...(abVariant === 'julia' || abVariant === 'thomas' ? { ab_variant: abVariant } : {}),
      }, { onConflict: 'email', ignoreDuplicates: true })
    } catch { /* non-critical */ }

    // Email-01 (abandon) is NOT sent here — it's sent by /api/cron/quiz-abandon
    // after 1h if completed_at is still null, so completers never receive it.
    void sessionId; void responseId

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Quiz V2 email capture error:', e)
    return NextResponse.json({ ok: true })
  }
}
