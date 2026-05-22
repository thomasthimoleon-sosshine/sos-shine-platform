import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getResendClient } from '@/lib/crm/resend'
import { generateEmail02 } from '@/lib/email-templates/quiz-v2/email-02-result'
import { calculateMatchScores, getDominantDimensions } from '@/lib/quiz-v2/scoring'

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

    const cleanEmail = email.toLowerCase().trim()
    const cleanName = firstName?.trim() || null

    const { dominant: calcDominant, secondary } = getDominantDimensions(scores)
    const finalDominant = dominant || calcDominant

    // Update signature_leads with profile info
    await supabase.from('signature_leads').upsert({
      email: cleanEmail,
      first_name: cleanName,
      profile_key: `dim_${finalDominant}`,
      quiz_version: 'v2',
    }, { onConflict: 'email' })

    // Log completion event
    await supabase.from('crm_campaign_events').insert({
      contact_email: cleanEmail,
      event_type: 'signature_v2_completed',
      metadata: {
        session_id: sessionId,
        response_id: responseId,
        dominant_dimension: finalDominant,
        secondary_dimension: secondary,
        scores,
        q15_response: q15Response,
        completed_at: new Date().toISOString(),
      },
    })

    // Fetch protocols for email and top slug persistence
    let matchedProtocols: Array<{ title: string; matchScore: number; status: string; duration_days: number }> = []
    let topProtocolSlug: string | null = null
    try {
      const { data: protocols } = await supabase.from('protocols').select('*')
      if (protocols) {
        const allScored = protocols
          .map((proto: Record<string, unknown>) => ({
            title: proto.title as string,
            slug: proto.slug as string,
            status: proto.status as string,
            duration_days: (proto.duration_days as number) || 30,
            matchScore: calculateMatchScores(scores, (proto.dimension_weights as Record<string, number>) || {}),
          }))
          .sort((a, b) => b.matchScore - a.matchScore)

        // Best match regardless of threshold (available protocols first)
        topProtocolSlug = allScored.find(p => p.status === 'available')?.slug || allScored[0]?.slug || null

        // Email: only protocols scoring >= 70
        matchedProtocols = allScored.filter(p => p.matchScore >= 70).slice(0, 5)
      }
    } catch (e) {
      console.error('Protocol fetch error:', e)
    }

    // Persist top slug on the quiz response row
    if (responseId && topProtocolSlug) {
      const { error: slugUpdateError } = await supabase.from('quiz_v2_responses')
        .update({ top_protocol_slug: topProtocolSlug })
        .eq('id', responseId)
      if (slugUpdateError) {
        console.error('[quiz/complete] top_protocol_slug update failed:', slugUpdateError.message, { responseId, topProtocolSlug })
      }
    } else {
      console.warn('[quiz/complete] top_protocol_slug not persisted - missing data:', { responseId, topProtocolSlug })
    }

    // Send Email 2 (résultat complet)
    try {
      const { subject, html } = generateEmail02({
        firstName: cleanName || '',
        email: cleanEmail,
        dominant: finalDominant,
        secondary,
        scores,
        q15Response: q15Response || '',
        protocols: matchedProtocols,
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
        event_type: 'quiz_v2_email_02_sent',
        metadata: { sessionId, responseId, dominant: finalDominant, protocolCount: matchedProtocols.length },
      })
    } catch (e) {
      console.error('Email 02 send error:', e)
    }

    return NextResponse.json({ ok: true, emailSent: true })
  } catch (e) {
    console.error('Quiz V2 complete error:', e)
    return NextResponse.json({ ok: true })
  }
}
