import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { page_path, referrer, session_id } = body

    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Config missing' }, { status: 500 })
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    })

    // Get user if authenticated
    const { data: { user } } = await supabase.auth.getUser()

    // Hash IP for privacy
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
    const ipHash = crypto.createHash('sha256').update(ip + (process.env.SUPABASE_SERVICE_ROLE_KEY || 'salt')).digest('hex').slice(0, 16)

    // Detect device type from user agent
    const ua = request.headers.get('user-agent') || ''
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua)
    const isTablet = /iPad|Tablet/i.test(ua)
    const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop'

    // Use service role to insert (bypass RLS for insert)
    const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!adminKey) {
      return NextResponse.json({ error: 'Service key missing' }, { status: 500 })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const adminSupabase = createClient(adminUrl, adminKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { error: insertError } = await adminSupabase.from('site_visits').insert({
      user_id: user?.id || null,
      page_path: page_path || '/',
      referrer: referrer || null,
      user_agent: ua.slice(0, 500),
      ip_hash: ipHash,
      device_type: deviceType,
      session_id: session_id || null,
      is_authenticated: !!user,
    })

    if (insertError) {
      console.error('Visit tracking insert error:', insertError.message, insertError.code)
      return NextResponse.json({ error: 'Insert failed', detail: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Visit tracking error:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
