import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { visitor_id, conversion_type } = body

    if (!visitor_id || !conversion_type) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !adminKey) {
      return NextResponse.json({ ok: true })
    }

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, adminKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Update the most recent visit for this visitor as converted
    const { error } = await supabase
      .from('ab_test_visits')
      .update({
        converted: true,
        converted_at: new Date().toISOString(),
        conversion_type,
      })
      .eq('visitor_id', visitor_id)
      .order('visited_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error('[AB Convert] Update error:', error.message)
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[AB Convert] Error:', e)
    return NextResponse.json({ ok: false })
  }
}
