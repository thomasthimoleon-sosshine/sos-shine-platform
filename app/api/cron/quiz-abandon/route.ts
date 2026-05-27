import { NextResponse } from 'next/server'
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
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://sosshine.com'
}

// Runs hourly. Sends email-01 only to users who:
// - provided their email 1h+ ago
// - have NOT completed the quiz (completed_at IS NULL)
// - have NOT already received email-01
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET || process.env.BOT_SECRET
  const isVercelCron = request.headers.get('x-vercel-cron') === '1'
  const authHeader = request.headers.get('authorization')
  if (cronSecret && !isVercelCron && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getAdminClient()
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()

  // Leads who provided email 1h-48h ago and have NOT completed the quiz
  const { data: abandons } = await supabase
    .from('quiz_v2_responses')
    .select('id, email, first_name, email_captured_at')
    .not('email', 'is', null)
    .not('email_captured_at', 'is', null)
    .is('completed_at', null)
    .lte('email_captured_at', oneHourAgo)
    .gte('email_captured_at', twoDaysAgo)

  if (!abandons || abandons.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No abandons found' })
  }

  const siteUrl = getSiteUrl()
  const resumeUrl = `${siteUrl}/signature-emotionnelle`
  const { client: resend, fromEmail } = await getResendClient()
  let sent = 0

  for (const row of abandons) {
    // Dedup: skip if email-01 already sent
    const { data: alreadySent } = await supabase
      .from('crm_campaign_events')
      .select('id')
      .eq('contact_email', row.email)
      .eq('event_type', 'quiz_v2_email_01_sent')
      .limit(1)

    if (alreadySent && alreadySent.length > 0) continue

    try {
      const { subject, html } = generateEmail01({
        firstName: row.first_name || '',
        email: row.email,
        resumeUrl,
      })

      await resend.emails.send({
        from: `Julia Laureau <${fromEmail}>`,
        to: row.email,
        subject,
        html,
      })

      await supabase.from('crm_campaign_events').insert({
        contact_email: row.email,
        event_type: 'quiz_v2_email_01_sent',
        metadata: { quiz_response_id: row.id, triggered_by: 'abandon_cron' },
      })

      sent++
    } catch (e) {
      console.error(`Email-01 abandon send error for ${row.email}:`, e)
    }
  }

  return NextResponse.json({ sent, timestamp: new Date().toISOString() })
}
