import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
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

    // Check admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['founder', 'admin_content', 'admin_support'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Use service role for aggregation queries
    const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!adminKey) return NextResponse.json({ error: 'Service key missing' }, { status: 500 })

    const { createClient } = await import('@supabase/supabase-js')
    const admin = createClient(supabaseUrl, adminKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    // Run all queries in parallel
    const [
      totalRes,
      todayRes,
      weekRes,
      monthRes,
      uniqueTodayRes,
      uniqueWeekRes,
      uniqueMonthRes,
      authenticatedRes,
      topPagesRes,
      deviceRes,
      dailyRes,
      hourlyRes,
    ] = await Promise.all([
      // Total visits
      admin.from('site_visits').select('id', { count: 'exact', head: true }),
      // Today visits
      admin.from('site_visits').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
      // This week visits
      admin.from('site_visits').select('id', { count: 'exact', head: true }).gte('created_at', weekStart),
      // This month visits
      admin.from('site_visits').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
      // Unique visitors today (by session_id)
      admin.from('site_visits').select('session_id').gte('created_at', todayStart),
      // Unique visitors this week
      admin.from('site_visits').select('session_id').gte('created_at', weekStart),
      // Unique visitors this month
      admin.from('site_visits').select('session_id').gte('created_at', monthStart),
      // Authenticated visits this month
      admin.from('site_visits').select('id', { count: 'exact', head: true }).gte('created_at', monthStart).eq('is_authenticated', true),
      // Top pages this month (get all, aggregate client side)
      admin.from('site_visits').select('page_path').gte('created_at', monthStart).limit(5000),
      // Device distribution this month
      admin.from('site_visits').select('device_type').gte('created_at', monthStart).limit(5000),
      // Daily visits last 30 days
      admin.from('site_visits').select('created_at').gte('created_at', new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30).toISOString()).limit(10000),
      // Hourly distribution today
      admin.from('site_visits').select('created_at').gte('created_at', todayStart).limit(5000),
    ])

    // Count unique sessions
    const uniqueToday = new Set((uniqueTodayRes.data || []).map(v => v.session_id).filter(Boolean)).size
    const uniqueWeek = new Set((uniqueWeekRes.data || []).map(v => v.session_id).filter(Boolean)).size
    const uniqueMonth = new Set((uniqueMonthRes.data || []).map(v => v.session_id).filter(Boolean)).size

    // Aggregate top pages
    const pageCounts: Record<string, number> = {}
    for (const row of (topPagesRes.data || [])) {
      pageCounts[row.page_path] = (pageCounts[row.page_path] || 0) + 1
    }
    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([path, count]) => ({ path, count }))

    // Aggregate device types
    const deviceCounts: Record<string, number> = {}
    for (const row of (deviceRes.data || [])) {
      const dt = row.device_type || 'desktop'
      deviceCounts[dt] = (deviceCounts[dt] || 0) + 1
    }
    const devices = Object.entries(deviceCounts).map(([type, count]) => ({ type, count }))

    // Aggregate daily visits (last 30 days)
    const dailyCounts: Record<string, number> = {}
    for (const row of (dailyRes.data || [])) {
      const day = row.created_at.slice(0, 10)
      dailyCounts[day] = (dailyCounts[day] || 0) + 1
    }
    const dailyData = Object.entries(dailyCounts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }))

    // Hourly distribution
    const hourlyCounts: number[] = Array(24).fill(0)
    for (const row of (hourlyRes.data || [])) {
      const hour = new Date(row.created_at).getHours()
      hourlyCounts[hour]++
    }
    const hourlyData = hourlyCounts.map((count, hour) => ({ hour: `${hour}h`, count }))

    return NextResponse.json({
      total: totalRes.count || 0,
      today: todayRes.count || 0,
      week: weekRes.count || 0,
      month: monthRes.count || 0,
      uniqueToday,
      uniqueWeek,
      uniqueMonth,
      authenticatedMonth: authenticatedRes.count || 0,
      topPages,
      devices,
      dailyData,
      hourlyData,
    })
  } catch (e) {
    console.error('Visits stats error:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
