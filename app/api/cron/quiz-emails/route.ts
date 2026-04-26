import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getResendClient } from '@/lib/crm/resend'
import { generateEmail03 } from '@/lib/email-templates/quiz-v2/email-03-question'
import { generateEmail04 } from '@/lib/email-templates/quiz-v2/email-04-pourquoi'
import { generateEmail05 } from '@/lib/email-templates/quiz-v2/email-05-histoire'
import { generateEmail06 } from '@/lib/email-templates/quiz-v2/email-06-temoignage'
import { generateEmail07 } from '@/lib/email-templates/quiz-v2/email-07-pratique'
import { generateEmail08 } from '@/lib/email-templates/quiz-v2/email-08-temps'
import { generateEmail09 } from '@/lib/email-templates/quiz-v2/email-09-argent'
import { generateEmail10 } from '@/lib/email-templates/quiz-v2/email-10-repos'
import { generateEmail11 } from '@/lib/email-templates/quiz-v2/email-11-bascule'
import { generateEmail12 } from '@/lib/email-templates/quiz-v2/email-12-dedans'
import { generateEmail13 } from '@/lib/email-templates/quiz-v2/email-13-doute'
import { generateEmail14 } from '@/lib/email-templates/quiz-v2/email-14-raisons'
import { generateEmail15 } from '@/lib/email-templates/quiz-v2/email-15-avant-dernier'
import { generateEmail16 } from '@/lib/email-templates/quiz-v2/email-16-dernier'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

// Email schedule: day offset from email_captured_at → email number
const SCHEDULE: { day: number; emailNum: number; generator: (vars: { firstName: string; email: string; topProtocol?: string }) => { subject: string; html: string } }[] = [
  { day: 1,  emailNum: 3,  generator: (v) => generateEmail03(v) },
  { day: 2,  emailNum: 4,  generator: (v) => generateEmail04(v) },
  { day: 3,  emailNum: 5,  generator: (v) => generateEmail05(v) },
  { day: 4,  emailNum: 6,  generator: (v) => generateEmail06(v) },
  { day: 5,  emailNum: 7,  generator: (v) => generateEmail07({ ...v, topProtocol: v.topProtocol || 'Confiance en soi' }) },
  { day: 6,  emailNum: 8,  generator: (v) => generateEmail08(v) },
  { day: 7,  emailNum: 9,  generator: (v) => generateEmail09(v) },
  { day: 8,  emailNum: 10, generator: (v) => generateEmail10(v) },
  { day: 9,  emailNum: 11, generator: (v) => generateEmail11(v) },
  { day: 10, emailNum: 12, generator: (v) => generateEmail12(v) },
  { day: 11, emailNum: 13, generator: (v) => generateEmail13(v) },
  { day: 12, emailNum: 14, generator: (v) => generateEmail14(v) },
  { day: 13, emailNum: 15, generator: (v) => generateEmail15(v) },
  { day: 14, emailNum: 16, generator: (v) => generateEmail16(v) },
]

export async function GET() {
  const supabase = getAdminClient()
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  let sent = 0
  let errors = 0

  try {
    const { client: resend, fromEmail } = await getResendClient()

    // Get all quiz responses with email captured (within 14 days)
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 15)

    const { data: responses } = await supabase
      .from('quiz_v2_responses')
      .select('id, email, first_name, email_captured_at, scores, dominant_dimension')
      .not('email', 'is', null)
      .not('email_captured_at', 'is', null)
      .gte('email_captured_at', fourteenDaysAgo.toISOString())

    if (!responses || responses.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No leads in sequence window' })
    }

    const now = new Date()

    for (const response of responses) {
      const capturedAt = new Date(response.email_captured_at)
      const daysSinceCapture = Math.floor((now.getTime() - capturedAt.getTime()) / (1000 * 60 * 60 * 24))

      // Find which email should be sent today
      const todayEmail = SCHEDULE.find(s => s.day === daysSinceCapture)
      if (!todayEmail) continue

      const eventKey = `quiz_v2_email_${String(todayEmail.emailNum).padStart(2, '0')}_sent`

      // Check if already sent
      const { data: alreadySent } = await supabase
        .from('crm_campaign_events')
        .select('id')
        .eq('contact_email', response.email)
        .eq('event_type', eventKey)
        .limit(1)

      if (alreadySent && alreadySent.length > 0) continue

      // Get top protocol for Email 7
      let topProtocol = 'Confiance en soi'
      if (todayEmail.emailNum === 7 && response.scores) {
        try {
          const { data: protocols } = await (supabase as any).from('protocols').select('title, dimension_weights').eq('status', 'available')
          if (protocols && protocols.length > 0) {
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

      // Generate and send
      try {
        const { subject, html } = todayEmail.generator({
          firstName: response.first_name || '',
          email: response.email,
          topProtocol,
        })

        await resend.emails.send({
          from: `Julia Laureau <${fromEmail}>`,
          to: response.email,
          subject,
          html,
        })

        await supabase.from('crm_campaign_events').insert({
          contact_email: response.email,
          event_type: eventKey,
          metadata: { quiz_response_id: response.id, day: todayEmail.day },
        })

        sent++
      } catch (e) {
        console.error(`Email ${todayEmail.emailNum} send error for ${response.email}:`, e)
        errors++
      }
    }
  } catch (e) {
    console.error('Quiz email cron error:', e)
    return NextResponse.json({ error: 'Cron failed', details: String(e) }, { status: 500 })
  }

  return NextResponse.json({ sent, errors, timestamp: new Date().toISOString() })
}
