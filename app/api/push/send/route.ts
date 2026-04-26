import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

function setupVapid() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const email = process.env.VAPID_EMAIL || 'mailto:noreply@sosshine.com'
  if (!publicKey || !privateKey) return false
  webpush.setVapidDetails(email, publicKey, privateKey)
  return true
}

export async function POST(request: Request) {
  try {
    // Auth check - admin only or cron
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || process.env.BOT_SECRET
    const isVercelCron = request.headers.get('x-vercel-cron') === '1'

    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ error: 'Config missing' }, { status: 500 })

    // Check if caller is admin or cron
    let isAuthorized = isVercelCron || (cronSecret && authHeader === `Bearer ${cronSecret}`)

    if (!isAuthorized) {
      // Check if the user is a founder/admin
      const userAuth = request.headers.get('x-user-token')
      if (userAuth) {
        const { data: { user } } = await supabase.auth.getUser(userAuth)
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
          if (profile && ['founder', 'admin_content'].includes((profile as { role: string }).role)) {
            isAuthorized = true
          }
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    if (!setupVapid()) {
      return NextResponse.json({ error: 'VAPID keys non configurées' }, { status: 500 })
    }

    const { title, body, url, user_ids, type } = await request.json()

    if (!title || !body) {
      return NextResponse.json({ error: 'title et body requis' }, { status: 400 })
    }

    // Get subscriptions
    let query = supabase.from('push_subscriptions').select('*').eq('is_active', true)
    if (user_ids && Array.isArray(user_ids) && user_ids.length > 0) {
      query = query.in('user_id', user_ids)
    }
    const { data: subscriptions } = await query

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0, message: 'Aucun abonné push' })
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      url: url || '/dashboard',
      type: type || 'new_post',
    })

    let sent = 0
    let failed = 0
    const expiredEndpoints: string[] = []

    for (const sub of subscriptions) {
      const s = sub as { endpoint: string; p256dh: string; auth: string }
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload
        )
        sent++
      } catch (err: unknown) {
        failed++
        const statusCode = (err as { statusCode?: number })?.statusCode
        if (statusCode === 404 || statusCode === 410) {
          expiredEndpoints.push(s.endpoint)
        }
      }
    }

    // Clean up expired subscriptions
    if (expiredEndpoints.length > 0) {
      await supabase.from('push_subscriptions').delete().in('endpoint', expiredEndpoints)
    }

    // Also create an in-app notification so the badge (pastille rouge) appears
    try {
      await supabase.from('notifications').insert({
        user_id: null, // broadcast to all
        title,
        body,
        link: url || null,
        notification_type: type || 'new_post',
        is_read: false,
        email_sent: false,
      })
    } catch {
      // Best-effort: don't fail the push send if notification insert fails
    }

    return NextResponse.json({ sent, failed, expired: expiredEndpoints.length })
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
