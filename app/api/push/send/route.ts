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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function autoriser(request: Request, supabase: any) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET || process.env.BOT_SECRET
  const isVercelCron = request.headers.get('x-vercel-cron') === '1'

  // L'en-tête x-vercel-cron ne suffit plus : il se forge depuis n'importe où,
  // et il autorisait à lui seul l'envoi d'une notification à tous les abonnés.
  // Seul le secret partagé fait foi.
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true
  void isVercelCron

  const userAuth = request.headers.get('x-user-token')
  if (!userAuth) return false
  const { data: { user } } = await supabase.auth.getUser(userAuth)
  if (!user) return false
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return !!profile && ['founder', 'admin_content'].includes((profile as { role: string }).role)
}

/**
 * L'état de la chaîne de notification, pour le back-office : sans lui, un envoi
 * qui ne produit rien ne dit pas pourquoi. Trois causes possibles, et elles se
 * ressemblent toutes de l'extérieur : clés VAPID absentes, aucun abonné, ou
 * table injoignable.
 */
export async function GET(request: Request) {
  const supabase = getAdminClient()
  if (!supabase) {
    return NextResponse.json({ error: 'Configuration serveur incomplète' }, { status: 500 })
  }
  if (!(await autoriser(request, supabase))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const vapid = !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && !!process.env.VAPID_PRIVATE_KEY

  const { count: abonnes } = await supabase
    .from('push_subscriptions')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)

  const { count: enBase } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })

  return NextResponse.json({ vapid, abonnes: abonnes ?? 0, notifications: enBase ?? 0 })
}

export async function POST(request: Request) {
  try {
    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ error: 'Config missing' }, { status: 500 })

    if (!(await autoriser(request, supabase))) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const pushPret = setupVapid()

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


    /*
      La notification dans l'application d'abord, l'envoi push ensuite.
      L'ordre comptait : la route sortait plus haut quand personne n'était
      abonné au push, et n'insérait donc rien. Envoyer une annonce sans aucun
      abonné ne produisait alors strictement rien — pas même la pastille rouge.
      La cloche ne dépend pas du push : elle lit cette table.
    */
    let enregistree = false
    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: user_ids && Array.isArray(user_ids) && user_ids.length === 1 ? user_ids[0] : null,
        title,
        body,
        link: url || null,
        notification_type: type || 'new_post',
        is_read: false,
        email_sent: false,
      })
      enregistree = !error
    } catch {
      enregistree = false
    }

    if (!pushPret) {
      return NextResponse.json({
        sent: 0, failed: 0, expired: 0, enregistree, vapid: false,
        message: 'Notification enregistrée dans l\'application. L\'envoi push est impossible : les clés VAPID ne sont pas configurées.',
      })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        sent: 0, failed: 0, expired: 0, enregistree, vapid: true,
        message: 'Notification enregistrée. Personne n\'a encore activé les notifications push.',
      })
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

    return NextResponse.json({ sent, failed, expired: expiredEndpoints.length, enregistree, vapid: true })
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
