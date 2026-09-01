import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getResendClient } from '@/lib/crm/resend'
import { generateEmailNotification } from '@/lib/email-templates/quiz-v2/email-notification-protocol'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export async function POST(request: NextRequest) {
  try {
    const { protocolId } = await request.json()
    if (!protocolId) return NextResponse.json({ error: 'protocolId required' }, { status: 400 })

    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

    // Get protocol info
    const { data: protocol } = await (supabase as any).from('protocols').select('*').eq('id', protocolId).single()
    if (!protocol || protocol.status !== 'available') {
      return NextResponse.json({ error: 'Protocol not found or not available' }, { status: 404 })
    }

    // Find users who requested notification for this protocol
    const { data: notifications } = await (supabase as any)
      .from('protocol_notifications')
      .select('id, user_email, match_score')
      .eq('protocol_id', protocolId)
      .is('notified_at', null)

    if (!notifications || notifications.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No pending notifications' })
    }

    const { client: resend, fromEmail } = await getResendClient()
    let sent = 0

    for (const notif of notifications) {
      try {
        const { subject, html } = generateEmailNotification({
          firstName: '',
          email: notif.user_email,
          protocolTitle: protocol.title,
          protocolSlug: protocol.slug,
          matchPercentage: notif.match_score || 80,
        })

        await resend.emails.send({
          from: `SOS Shine <${fromEmail}>`,
          to: notif.user_email,
          subject,
          html,
        })

        await (supabase as any).from('protocol_notifications')
          .update({ notified_at: new Date().toISOString() })
          .eq('id', notif.id)

        sent++
      } catch (e) {
        console.error(`Notification error for ${notif.user_email}:`, e)
      }
    }

    return NextResponse.json({ sent, total: notifications.length })
  } catch (e) {
    console.error('Protocol notification error:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
