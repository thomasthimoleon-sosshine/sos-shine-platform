import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { page_path, referrer, session_id } = body

    if (!page_path) {
      return NextResponse.json({ error: 'page_path requis' }, { status: 400 })
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
      // Continue without user — tracking still works for anonymous visitors
    }

    // Hash IP for privacy
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
    const ipHash = crypto.createHash('sha256').update(ip + (adminKey || 'salt')).digest('hex').slice(0, 16)

    // Detect device type from user agent
    const ua = request.headers.get('user-agent') || ''
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua)
    const isTablet = /iPad|Tablet/i.test(ua)
    const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop'

    if (!adminKey) {
      // Without service role key, try with anon key (needs RLS INSERT policy)
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(supabaseUrl, supabaseKey)
      await supabase.from('site_visits').insert({
        user_id: userId,
        page_path: page_path || '/',
        referrer: referrer || null,
        user_agent: ua.slice(0, 500),
        ip_hash: ipHash,
        device_type: deviceType,
        session_id: session_id || null,
        is_authenticated: !!userId,
      })
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
    })

    if (insertError) {
      console.error('[VisitTracker] Insert error:', insertError.message, insertError.code)
      // Don't return 500 — tracking failure shouldn't cause visible errors
      return NextResponse.json({ ok: false, detail: insertError.message })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[VisitTracker] Error:', e)
    // Return 200 even on error — tracking should never show errors to users
    return NextResponse.json({ ok: false })
  }
}
