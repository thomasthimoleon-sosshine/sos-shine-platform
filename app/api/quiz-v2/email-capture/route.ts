import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : 'https://sosshine.com')
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, responseId, email, firstName } = await request.json()

    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ ok: true })

    const cleanEmail = email.toLowerCase().trim()

    // Upsert into signature_leads (with quiz_version = v2)
    await supabase.from('signature_leads').upsert({
      email: cleanEmail,
      first_name: firstName || null,
      profile_key: null,
      quiz_version: 'v2',
    }, { onConflict: 'email' })

    // Upsert into CRM contacts
    const abVariant = request.cookies.get('ab_variant')?.value
    try {
      await (supabase as any).from('crm_contacts').upsert({
        email: cleanEmail,
        first_name: firstName || null,
        source: 'signature_test_v2',
        ...(abVariant === 'julia' || abVariant === 'thomas' ? { ab_variant: abVariant } : {}),
      }, { onConflict: 'email', ignoreDuplicates: true })
    } catch { /* non-critical */ }

    // Enroll in CRM sequence for quiz v2
    try {
      const siteUrl = getSiteUrl()
      await fetch(`${siteUrl}/api/crm/sequences/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger_type: 'signature_test_v2',
          email: cleanEmail,
          first_name: firstName || null,
        }),
      })
    } catch { /* non-critical */ }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Quiz V2 email capture error:', e)
    return NextResponse.json({ ok: true })
  }
}
