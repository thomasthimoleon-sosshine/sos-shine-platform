import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import webpush from 'web-push'

/**
 * Send push notifications to all active subscribers (fire-and-forget).
 */
async function sendPushToAll(title: string, body: string, url?: string, notificationType?: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY
    if (!supabaseUrl || !serviceKey || !publicKey || !privateKey) return

    webpush.setVapidDetails(
      process.env.VAPID_EMAIL || 'mailto:noreply@sosshine.com',
      publicKey,
      privateKey
    )

    const admin = createAdminClient(supabaseUrl, serviceKey)
    const { data: subscriptions } = await admin
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('is_active', true)

    if (!subscriptions || subscriptions.length === 0) return

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      url: url || '/dashboard',
      type: notificationType || 'new_post',
    })

    const expiredEndpoints: string[] = []

    for (const sub of subscriptions) {
      const s = sub as { endpoint: string; p256dh: string; auth: string }
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload
        )
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode
        if (statusCode === 404 || statusCode === 410) {
          expiredEndpoints.push(s.endpoint)
        }
      }
    }

    if (expiredEndpoints.length > 0) {
      await admin.from('push_subscriptions').delete().in('endpoint', expiredEndpoints)
    }
  } catch {
    // Push is best-effort, don't block the response
  }
}

/**
 * POST /api/notify
 * Send notifications to members.
 *
 * Broadcast mode (default):
 *   Body: { type: 'new_douleur' | 'new_event' | 'new_post', title: string, body: string, link?: string }
 *
 * Targeted mode (for warnings):
 *   Body: { type: 'warning', target_user_id: string, title: string, body: string, link?: string }
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
    const { type, title, body: notifBody, link, target_user_id } = body

    if (!type || !title || !notifBody) {
      return NextResponse.json({ error: 'Champs requis: type, title, body' }, { status: 400 })
    }

    // Targeted warning to a specific user
    if (type === 'warning' && target_user_id) {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: target_user_id,
          title,
          body: notifBody,
          link: link || null,
          notification_type: 'warning',
          is_read: false,
          email_sent: false,
        })

      if (error) {
        console.error('Error creating warning notification:', error)
        return NextResponse.json({ error: 'Erreur lors de l\'envoi de l\'avertissement' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Avertissement envoyé',
        count: 1,
      })
    }

    // Broadcast to all members
    const { data: members } = await supabase
      .from('profiles')
      .select('id')

    if (!members || members.length === 0) {
      return NextResponse.json({ message: 'Aucun membre à notifier' })
    }

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

    // Also send push notification to all subscribers (fire-and-forget)
    sendPushToAll(title, notifBody, link || undefined, type)

    return NextResponse.json({
      success: true,
      message: `${notifications.length} notifications créées`,
      count: notifications.length,
    })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
