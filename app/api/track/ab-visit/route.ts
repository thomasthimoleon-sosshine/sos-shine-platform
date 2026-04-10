import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { visitor_id, variant, referrer } = body

    if (!visitor_id || !variant) {
      return NextResponse.json({ ok: false }, { status: 400 })
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

    const ua = request.headers.get('user-agent') || ''

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
