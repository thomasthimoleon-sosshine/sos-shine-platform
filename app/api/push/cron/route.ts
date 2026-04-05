import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

function getTimeSlot(): 'night' | 'morning' | 'afternoon' | 'evening' {
  // Use Paris timezone for French users
  const now = new Date()
  const parisHour = parseInt(now.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: 'Europe/Paris' }))
  if (parisHour < 5) return 'night'
  if (parisHour < 12) return 'morning'
  if (parisHour < 18) return 'afternoon'
  return 'evening'
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || process.env.BOT_SECRET
    const isVercelCron = request.headers.get('x-vercel-cron') === '1'
    if (!isVercelCron && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ error: 'Config missing' }, { status: 500 })

    // Setup VAPID
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY
    const email = process.env.VAPID_EMAIL || 'mailto:noreply@sosshine.com'
    if (!publicKey || !privateKey) {
      return NextResponse.json({ error: 'VAPID non configuré' }, { status: 500 })
    }
    webpush.setVapidDetails(email, publicKey, privateKey)

    const currentSlot = getTimeSlot()

    // Get encouragement messages from DB
    const { data: messages } = await supabase
      .from('encouragement_messages')
      .select('message')
      .eq('time_slot', currentSlot)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (!messages || messages.length === 0) {
      return NextResponse.json({ message: 'Aucun message pour ce créneau', slot: currentSlot })
    }

    // Pick a random message
    const randomMsg = (messages as { message: string }[])[Math.floor(Math.random() * messages.length)]

    // Get all active push subscriptions
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('is_active', true)

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: 'Aucun abonné push', slot: currentSlot })
    }

    const payload = JSON.stringify({
      title: 'SOS Shine',
      body: randomMsg.message,
      icon: '/icon-192.png',
      url: '/dashboard',
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

    if (expiredEndpoints.length > 0) {
      await supabase.from('push_subscriptions').delete().in('endpoint', expiredEndpoints)
    }

    return NextResponse.json({
      slot: currentSlot,
      message: randomMsg.message,
      sent,
      failed,
      expired: expiredEndpoints.length,
      total_subscribers: subscriptions.length,
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Erreur' }, { status: 500 })
  }
}
