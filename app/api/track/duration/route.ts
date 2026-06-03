import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { session_id: string; page_path: string; duration_seconds: number }
    const { session_id, page_path, duration_seconds } = body

    if (!session_id || !page_path || !duration_seconds) return NextResponse.json({ ok: true })
    if (duration_seconds < 1 || duration_seconds > 3600) return NextResponse.json({ ok: true })

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) return NextResponse.json({ ok: true })

    const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

    // Update the most recent visit for this session + page
    await supabase
      .from('site_visits')
      .update({ time_on_page_seconds: Math.round(duration_seconds) })
      .eq('session_id', session_id)
      .eq('page_path', page_path)
      .order('created_at', { ascending: false })
      .limit(1)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
