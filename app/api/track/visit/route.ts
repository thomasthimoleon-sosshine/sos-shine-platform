import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// User agents that are NOT real visitors (monitoring, bots, scrapers)
const BOT_UA_PATTERNS = [
  /vercel-favicon/i,
  /vercel-screenshot/i,
  /vercel-health-check/i,
  /googlebot/i,
  /bingbot/i,
  /ahrefsbot/i,
  /semrushbot/i,
  /mj12bot/i,
  /yandexbot/i,
  /baiduspider/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /linkedinbot/i,
  /slackbot/i,
  /whatsapp/i,
  /pingdom/i,
  /uptimerobot/i,
  /lighthouse/i,
  /headlesschrome/i,
  /crawler/i,
  /spider/i,
  /bot\//i,
]

// Referrers that are NOT real organic traffic (internal tools)
const INTERNAL_REFERRER_PATTERNS = [
  /vercel\.com/i,
  /vercel\.app\/_/i,
  /supabase\.com/i,
]

function isBotUserAgent(ua: string): boolean {
  if (!ua) return true
  return BOT_UA_PATTERNS.some((p) => p.test(ua))
}

function isInternalReferrer(referrer: string | null | undefined): boolean {
  if (!referrer) return false
  return INTERNAL_REFERRER_PATTERNS.some((p) => p.test(referrer))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { page_path, referrer, session_id, utm_source, utm_medium, utm_campaign, utm_content } = body

    if (!page_path) {
      return NextResponse.json({ error: 'page_path requis' }, { status: 400 })
    }

    const ua = request.headers.get('user-agent') || ''

    // ─── Skip bots and internal tooling referrers ───
    if (isBotUserAgent(ua) || isInternalReferrer(referrer)) {
      return NextResponse.json({ ok: true, skipped: 'bot_or_internal' })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ ok: true }) // Fail silently if not configured
    }

    // Get user if authenticated
    let userId: string | null = null
    try {
      const cookieStore = await cookies()
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      })
      const { data: { user } } = await supabase.auth.getUser()
      userId = user?.id || null
    } catch {
      // Continue without user - tracking still works for anonymous visitors
    }

    // Hash IP for privacy
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
    const ipHash = crypto.createHash('sha256').update(ip + (adminKey || 'salt')).digest('hex').slice(0, 16)

    // Detect device type from user agent
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua)
    const isTablet = /iPad|Tablet/i.test(ua)
    const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop'

    if (!adminKey) {
      // Without service role key, try with anon key (needs RLS INSERT policy)
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, supabaseKey)
      const { error: anonInsertError } = await supabase.from('site_visits').insert({
        user_id: userId,
        page_path: page_path || '/',
        referrer: referrer || null,
        user_agent: ua.slice(0, 500),
        ip_hash: ipHash,
        device_type: deviceType,
        session_id: session_id || null,
        is_authenticated: !!userId,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        utm_content: utm_content || null,
      })
      if (anonInsertError) {
        console.error('[VisitTracker] Anon insert error:', anonInsertError.message, anonInsertError.code)
        return NextResponse.json({ ok: false, detail: anonInsertError.message })
      }
      return NextResponse.json({ ok: true })
    }

    // Use service role to insert (bypass RLS)
    const { createClient } = await import('@supabase/supabase-js')
    const adminSupabase = createClient(supabaseUrl, adminKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { error: insertError } = await adminSupabase.from('site_visits').insert({
      user_id: userId,
      page_path: page_path || '/',
      referrer: referrer || null,
      user_agent: ua.slice(0, 500),
      ip_hash: ipHash,
      device_type: deviceType,
      session_id: session_id || null,
      is_authenticated: !!userId,
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
      utm_content: utm_content || null,
    })

    if (insertError) {
      console.error('[VisitTracker] Insert error:', insertError.message, insertError.code)
      // Don't return 500 - tracking failure shouldn't cause visible errors
      return NextResponse.json({ ok: false, detail: insertError.message })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[VisitTracker] Error:', e)
    // Return 200 even on error - tracking should never show errors to users
    return NextResponse.json({ ok: false })
  }
}
