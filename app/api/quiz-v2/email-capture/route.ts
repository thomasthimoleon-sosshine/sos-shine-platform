import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getResendClient } from '@/lib/crm/resend'
import { generateEmail01 } from '@/lib/email-templates/quiz-v2/email-01-capture'

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

    // Send Email 1 (capture — quiz not finished yet)
    try {
      const siteUrl = getSiteUrl()
      const resumeUrl = `${siteUrl}/signature-emotionnelle`
      const { subject, html } = generateEmail01({
        firstName: cleanName || '',
        email: cleanEmail,
        resumeUrl,
      })
      const { client: resend, fromEmail } = await getResendClient()
      await resend.emails.send({
        from: `Julia Laureau <${fromEmail}>`,
        to: cleanEmail,
        subject,
        html,
      })

      // Log send event
      await supabase.from('crm_campaign_events').insert({
        contact_email: cleanEmail,
        event_type: 'quiz_v2_email_01_sent',
        metadata: { sessionId, responseId },
      })
    } catch (e) {
      console.error('Email 01 send error:', e)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Quiz V2 email capture error:', e)
    return NextResponse.json({ ok: true })
  }
}
