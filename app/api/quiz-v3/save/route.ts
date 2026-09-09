import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { generateQuizV3ResultEmail } from '@/lib/email-templates/quiz-v3-result'
import type { V3Profile } from '@/lib/quiz-v3/types'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      sessionId: string
      profile: V3Profile
      resultText: string
    }
    const { sessionId, profile, resultText } = body

    if (!sessionId || !profile || !resultText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // ── 1. Save to Supabase ──────────────────────────────
    const supabase = getAdminClient()
    let savedId: string | null = null

    if (supabase) {
      try {
        const { data } = await supabase
          .from('quiz_v3_responses')
          .insert({
            session_id: sessionId,
            email: profile.email || null,
            first_name: profile.firstName || null,
            birthdate: profile.birthdate || null,
            answers: profile.answers,
            profile: profile,
            result_text: resultText,
            top_protocol_title: profile.topProtocolTitle || null,
            top_protocol_slug: profile.topProtocolSlug || null,
            completed_at: new Date().toISOString(),
          })
          .select('id')
          .single()

        savedId = data?.id || null
      } catch (err) {
        console.error('quiz-v3 save DB error:', err)
      }
    }

    // ── 2. Send email via Resend ────────────────────────
    let emailSent = false
    if (profile.email && profile.firstName) {
      try {
        const apiKey = process.env.RESEND_API_KEY
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'julia@sosshine.com'

        if (apiKey) {
          const resend = new Resend(apiKey)
          const { subject, html } = generateQuizV3ResultEmail(
            profile.firstName,
            resultText,
            profile.topProtocolTitle,
            profile.topProtocolSlug,
          )

          const { error } = await resend.emails.send({
            from: `SOS Shine <${fromEmail}>`,
            to: profile.email,
            subject,
            html,
          })

          if (!error) {
            emailSent = true
            // Mark email sent in DB
            if (supabase && savedId) {
              await supabase
                .from('quiz_v3_responses')
                .update({ email_sent_at: new Date().toISOString() })
                .eq('id', savedId)
            }
          } else {
            console.error('quiz-v3 email send error:', error)
          }
        }
      } catch (err) {
        console.error('quiz-v3 email error:', err)
      }
    }

    return NextResponse.json({ success: true, id: savedId, emailSent })
  } catch (err) {
    console.error('quiz-v3 save route error:', err)
    return NextResponse.json({ error: 'Save failed' }, { status: 500 })
  }
}
