import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { test_id, variant, event_type, session_id, metadata } = body

    if (!variant || !event_type) {
      return NextResponse.json({ error: 'variant and event_type are required' }, { status: 400 })
    }

    const supabase = await createClient()

    // If no test_id provided, find the active test
    let finalTestId = test_id
    if (!finalTestId) {
      const { data: activeTest } = await supabase
        .from('ab_tests')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle()
      finalTestId = activeTest?.id || null
    }

    const { error } = await supabase.from('ab_test_events').insert({
      test_id: finalTestId,
      variant,
      event_type,
      session_id: session_id || null,
      user_agent: request.headers.get('user-agent') || null,
      referrer: request.headers.get('referer') || null,
      metadata: metadata || {},
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    // Get active test
    const { data: test } = await supabase
      .from('ab_tests')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()

    if (!test) {
      return NextResponse.json({ test: null, stats: null })
    }

    // Get aggregated stats
    const { data: events } = await supabase
      .from('ab_test_events')
      .select('variant, event_type, created_at')
      .eq('test_id', test.id)

    const stats: Record<string, { views: number; conversions: number; conversion_rate: number }> = {}

    for (const variant of [test.variant_a, test.variant_b]) {
      const variantEvents = (events || []).filter((e) => e.variant === variant)
      const views = variantEvents.filter((e) => e.event_type === 'view').length
      const conversions = variantEvents.filter((e) => e.event_type === 'conversion').length
      stats[variant] = {
        views,
        conversions,
        conversion_rate: views > 0 ? Math.round((conversions / views) * 10000) / 100 : 0,
      }
    }

    return NextResponse.json({ test, stats })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
