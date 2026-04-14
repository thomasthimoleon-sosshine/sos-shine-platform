import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const BOT_UA_PATTERNS = [
  /vercel-favicon/i, /vercel-screenshot/i, /vercel-health-check/i,
  /googlebot/i, /bingbot/i, /ahrefsbot/i, /semrushbot/i, /mj12bot/i,
  /yandexbot/i, /baiduspider/i, /facebookexternalhit/i, /twitterbot/i,
  /linkedinbot/i, /slackbot/i, /whatsapp/i, /pingdom/i, /uptimerobot/i,
  /lighthouse/i, /headlesschrome/i, /crawler/i, /spider/i, /bot\//i,
]

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
    const { visitor_id, variant, referrer } = body

    if (!visitor_id || !variant) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const ua = request.headers.get('user-agent') || ''

    // Skip bots and internal tooling
    if (isBotUserAgent(ua) || isInternalReferrer(referrer)) {
      return NextResponse.json({ ok: true, skipped: 'bot_or_internal' })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !adminKey) {
      return NextResponse.json({ ok: true })
    }

    // Hash IP for privacy
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
    const ipHash = crypto.createHash('sha256').update(ip + adminKey).digest('hex').slice(0, 16)

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, adminKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { error } = await supabase.from('ab_test_visits').insert({
      visitor_id,
      variant,
      visitor_ip: ipHash,
      user_agent: ua.slice(0, 500),
      referrer: referrer || null,
    })

    if (error) {
      console.error('[AB Visit] Insert error:', error.message)
      return NextResponse.json({ ok: false, error: error.message })
    }

    // Set cookie in response so variant persists
    const response = NextResponse.json({ ok: true })
    response.cookies.set('ab_variant', variant, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    })

    return response
  } catch (e) {
    console.error('[AB Visit] Error:', e)
    return NextResponse.json({ ok: false })
  }
}
