import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/notify
 * Send notifications to all members when a new douleur or event is published.
 *
 * Body: { type: 'new_douleur' | 'new_event' | 'new_post', title: string, body: string, link?: string }
 *
 * This creates notification records in the database.
 * Email sending will be handled by a Supabase Edge Function or external service (Resend, SendGrid, etc.)
 * connected to the notifications table via a database trigger.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const p = profile as { role: string } | null
    if (!p || (p.role !== 'founder' && p.role !== 'admin_content')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    const body = await request.json()
    const { type, title, body: notifBody, link } = body

    if (!type || !title || !notifBody) {
      return NextResponse.json({ error: 'Champs requis: type, title, body' }, { status: 400 })
    }

    // Get all member IDs
    const { data: members } = await supabase
      .from('profiles')
      .select('id')

    if (!members || members.length === 0) {
      return NextResponse.json({ message: 'Aucun membre à notifier' })
    }

    // Create notification for each member
    const notifications = (members as { id: string }[]).map((member) => ({
      user_id: member.id,
      title,
      body: notifBody,
      link: link || null,
      notification_type: type,
      is_read: false,
      email_sent: false,
    }))

    const { error } = await supabase
      .from('notifications')
      .insert(notifications)

    if (error) {
      console.error('Error creating notifications:', error)
      return NextResponse.json({ error: 'Erreur lors de la création des notifications' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `${notifications.length} notifications créées`,
      count: notifications.length,
    })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
