import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getResendClient } from '@/lib/crm/resend'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// Emails that always receive every email (no dedup, for testing)
const TEST_EMAILS = new Set([
  'julialaureau@sosshine.com',
  'ttse335@gmail.com',
])

/**
 * Replace template variables in subject and HTML
 */
function replaceVars(text: string, vars: Record<string, string>): string {
  let result = text
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
  }
  return result
}

export async function GET() {
  const supabase = getAdminClient()
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  let sent = 0
  let errors = 0

  try {
    const { client: resend, fromEmail } = await getResendClient()

    // 1. Find the active quiz v2 sequence
    const { data: sequences } = await supabase
      .from('crm_sequences')
      .select('id')
      .eq('trigger_type', 'signature_test_v2')
      .eq('status', 'active')
      .limit(1)

    if (!sequences || sequences.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No active signature_test_v2 sequence' })
    }

    const sequenceId = sequences[0].id

    // 2. Load all steps for this sequence (from DB — editable by admin)
    const { data: steps } = await supabase
      .from('crm_sequence_steps')
      .select('step_order, delay_days, subject, html_content')
      .eq('sequence_id', sequenceId)
      .order('step_order', { ascending: true })

    if (!steps || steps.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No steps in sequence. Run seed first.' })
    }

    // 3. Get quiz responses with email (within 15 days)
    const fifteenDaysAgo = new Date()
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 16)

    const { data: allResponses } = await supabase
      .from('quiz_v2_responses')
      .select('id, email, first_name, email_captured_at, scores, dominant_dimension')
      .not('email', 'is', null)
      .not('email_captured_at', 'is', null)
      .gte('email_captured_at', fifteenDaysAgo.toISOString())
      .order('email_captured_at', { ascending: false })

    if (!allResponses || allResponses.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No leads in sequence window' })
    }

    // 4. Deduplicate: one response per email (latest for test emails)
    const seen = new Map<string, boolean>()
    const responses = allResponses.filter(r => {
      const emailLower = r.email.toLowerCase()
      if (seen.has(emailLower)) return false
      seen.set(emailLower, true)
      return true
    })

    const now = new Date()

    // 5. Get top protocol names for variable injection
    let protocolNames: Record<string, string> = {}
    try {
      const { data: protocols } = await (supabase as any).from('protocols').select('title, dimension_weights').eq('status', 'available')
      if (protocols) {
        protocolNames = protocols.reduce((acc: Record<string, string>, p: { title: string }) => {
          acc[p.title] = p.title
          return acc
        }, {})
      }
    } catch { /* non-critical */ }

    for (const response of responses) {
      const capturedAt = new Date(response.email_captured_at)
      const daysSinceCapture = Math.floor((now.getTime() - capturedAt.getTime()) / (1000 * 60 * 60 * 24))

      // Find step matching this day (delay_days === daysSinceCapture)
      // Skip steps with delay_days 0 (those are sent immediately by capture/complete APIs)
      const step = steps.find(s => s.delay_days === daysSinceCapture && s.delay_days > 0)
      if (!step) continue

      const eventKey = `quiz_v2_email_${String(step.step_order).padStart(2, '0')}_sent`

      // Check dedup (skip for test emails)
      if (!TEST_EMAILS.has(response.email.toLowerCase())) {
        const { data: alreadySent } = await supabase
          .from('crm_campaign_events')
          .select('id')
          .eq('contact_email', response.email)
          .eq('event_type', eventKey)
          .limit(1)

        if (alreadySent && alreadySent.length > 0) continue
      }

      // Calculate top protocol for variable injection
      let topProtocol = 'Confiance en soi'
      if (response.scores) {
        try {
          const { data: protocols } = await (supabase as any).from('protocols').select('title, dimension_weights').eq('status', 'available')
          if (protocols) {
            let bestMatch = 0
            for (const proto of protocols) {
              let match = 0, total = 0
              for (const [dim, weight] of Object.entries(proto.dimension_weights as Record<string, number>)) {
                match += (response.scores[dim] || 0) * weight
                total += weight * 100
              }
              const score = total > 0 ? (match / total) * 100 : 0
              if (score > bestMatch) { bestMatch = score; topProtocol = proto.title }
            }
          }
        } catch { /* use default */ }
      }

      // Replace variables in subject and HTML from DB
      const vars: Record<string, string> = {
        firstName: response.first_name || '',
        email: response.email,
        topProtocol,
        q15Response: '',
        resumeUrl: 'https://sosshine.com/signature-emotionnelle',
      }

      const subject = replaceVars(step.subject, vars)
      const html = replaceVars(step.html_content, vars)

      // Send
      try {
        await resend.emails.send({
          from: `Julia Laureau <${fromEmail}>`,
          to: response.email,
          subject,
          html,
        })

        await supabase.from('crm_campaign_events').insert({
          contact_email: response.email,
          event_type: eventKey,
          metadata: { quiz_response_id: response.id, step_order: step.step_order, delay_days: step.delay_days },
        })

        sent++
      } catch (e) {
        console.error(`Email step ${step.step_order} send error for ${response.email}:`, e)
        errors++
      }
    }
  } catch (e) {
    console.error('Quiz email cron error:', e)
    return NextResponse.json({ error: 'Cron failed', details: String(e) }, { status: 500 })
  }

  return NextResponse.json({ sent, errors, timestamp: new Date().toISOString() })
}
