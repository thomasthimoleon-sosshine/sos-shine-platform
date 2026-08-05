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
    const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30).toISOString()

    // ── Query site_visits (may not exist yet) ──
    let siteVisitsOk = true
    let svTotal = 0, svToday = 0, svWeek = 0, svMonth = 0
    let svUniqueToday = 0, svUniqueWeek = 0, svUniqueMonth = 0
    let svAuthMonth = 0
    let svTopPages: { path: string; count: number }[] = []
    let svDevices: { type: string; count: number }[] = []
    let svDailyData: { date: string; count: number }[] = []
    let svHourlyData: { hour: string; count: number }[] = []
    let svSources: { source: string; visits: number; uniques: number }[] = []
    let svReferrers: { referrer: string; count: number }[] = []
    let svWeekday: { day: string; count: number }[] = []
    let svAvgDuration = 0
    let svMedianDuration = 0

    try {
      const [
        totalRes, todayRes, weekRes, monthRes,
        uniqueTodayRes, uniqueWeekRes, uniqueMonthRes,
        authenticatedRes, topPagesRes, deviceRes, dailyRes, hourlyRes,
      ] = await Promise.all([
        admin.from('site_visits').select('id', { count: 'exact', head: true }),
        admin.from('site_visits').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
        admin.from('site_visits').select('id', { count: 'exact', head: true }).gte('created_at', weekStart),
        admin.from('site_visits').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
        admin.from('site_visits').select('session_id').gte('created_at', todayStart),
        admin.from('site_visits').select('session_id').gte('created_at', weekStart),
        admin.from('site_visits').select('session_id').gte('created_at', monthStart),
        admin.from('site_visits').select('id', { count: 'exact', head: true }).gte('created_at', monthStart).eq('is_authenticated', true),
        admin.from('site_visits').select('page_path').gte('created_at', monthStart).limit(5000),
        admin.from('site_visits').select('device_type').gte('created_at', monthStart).limit(5000),
        admin.from('site_visits').select('created_at').gte('created_at', thirtyDaysAgo).limit(10000),
        admin.from('site_visits').select('created_at').gte('created_at', todayStart).limit(5000),
      ])

      // Check if site_visits table exists (first query error indicates table missing)
      if (totalRes.error) {
        console.error('site_visits query error:', totalRes.error.message)
        siteVisitsOk = false
      } else {
        svTotal = totalRes.count || 0
        svToday = todayRes.count || 0
        svWeek = weekRes.count || 0
        svMonth = monthRes.count || 0
        svUniqueToday = new Set((uniqueTodayRes.data || []).map(v => v.session_id).filter(Boolean)).size
        svUniqueWeek = new Set((uniqueWeekRes.data || []).map(v => v.session_id).filter(Boolean)).size
        svUniqueMonth = new Set((uniqueMonthRes.data || []).map(v => v.session_id).filter(Boolean)).size
        svAuthMonth = authenticatedRes.count || 0

        // Top pages
        const pageCounts: Record<string, number> = {}
        for (const row of (topPagesRes.data || [])) pageCounts[row.page_path] = (pageCounts[row.page_path] || 0) + 1
        svTopPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([path, count]) => ({ path, count }))

        // Devices
        const deviceCounts: Record<string, number> = {}
        for (const row of (deviceRes.data || [])) { const dt = row.device_type || 'desktop'; deviceCounts[dt] = (deviceCounts[dt] || 0) + 1 }
        svDevices = Object.entries(deviceCounts).map(([type, count]) => ({ type, count }))

        // Daily
        const dailyCounts: Record<string, number> = {}
        for (const row of (dailyRes.data || [])) { const day = row.created_at.slice(0, 10); dailyCounts[day] = (dailyCounts[day] || 0) + 1 }
        svDailyData = Object.entries(dailyCounts).sort((a, b) => a[0].localeCompare(b[0])).map(([date, count]) => ({ date, count }))

        // Hourly
        const hourlyCounts: number[] = Array(24).fill(0)
        for (const row of (hourlyRes.data || [])) { hourlyCounts[new Date(row.created_at).getHours()]++ }
        svHourlyData = hourlyCounts.map((count, hour) => ({ hour: `${hour}h`, count }))

        // Jour de la semaine (à partir des 30 derniers jours), réordonné Lun→Dim
        const wd = Array(7).fill(0)
        for (const row of (dailyRes.data || [])) { wd[new Date(row.created_at).getDay()]++ }
        const WD = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
        svWeekday = [1, 2, 3, 4, 5, 6, 0].map(i => ({ day: WD[i], count: wd[i] }))

        // ── Métriques enrichies : plateforme d'origine, durée, référents (30 j) ──
        const [utmRes, durationRes, referrerRes] = await Promise.all([
          admin.from('site_visits').select('utm_source, session_id').gte('created_at', thirtyDaysAgo).limit(20000),
          admin.from('site_visits').select('time_on_page_seconds').gte('created_at', thirtyDaysAgo).not('time_on_page_seconds', 'is', null).limit(20000),
          admin.from('site_visits').select('referrer').gte('created_at', thirtyDaysAgo).limit(20000),
        ])

        // Plateforme d'origine (UTM source) : visites + visiteurs uniques
        const srcVisits: Record<string, number> = {}
        const srcSessions: Record<string, Set<string>> = {}
        for (const row of (utmRes.data || [])) {
          const src = ((row as { utm_source?: string }).utm_source || '(direct)') as string
          srcVisits[src] = (srcVisits[src] || 0) + 1
          if (!srcSessions[src]) srcSessions[src] = new Set()
          const sid = (row as { session_id?: string }).session_id
          if (sid) srcSessions[src].add(sid)
        }
        svSources = Object.entries(srcVisits)
          .map(([source, visits]) => ({ source, visits, uniques: srcSessions[source]?.size || 0 }))
          .sort((a, b) => b.visits - a.visits)

        // Durée de visite (moyenne + médiane), bornée pour ignorer les aberrations
        const durs = (durationRes.data || [])
          .map(r => Number((r as { time_on_page_seconds?: number }).time_on_page_seconds))
          .filter(n => n > 0 && n < 3600)
        if (durs.length) {
          svAvgDuration = Math.round(durs.reduce((a, b) => a + b, 0) / durs.length)
          const sorted = [...durs].sort((a, b) => a - b)
          svMedianDuration = sorted[Math.floor(sorted.length / 2)]
        }

        // Référents (d'où le clic vient — Google, Instagram, direct…)
        const refCounts: Record<string, number> = {}
        for (const row of (referrerRes.data || [])) {
          let ref = ((row as { referrer?: string }).referrer || '') as string
          if (!ref) ref = '(accès direct)'
          else { try { ref = new URL(ref).hostname.replace(/^www\./, '') } catch { /* garder tel quel */ } }
          refCounts[ref] = (refCounts[ref] || 0) + 1
        }
        svReferrers = Object.entries(refCounts)
          .map(([referrer, count]) => ({ referrer, count }))
          .sort((a, b) => b.count - a.count).slice(0, 12)
      }
    } catch (e) {
      console.error('site_visits queries failed:', e)
      siteVisitsOk = false
    }

    // ── Query ab_test_visits (always exists if A/B testing is active) ──
    let abTotal = 0, abToday = 0, abWeek = 0, abMonth = 0
    let abUniqueToday = 0, abUniqueWeek = 0, abUniqueMonth = 0
    let abDevices: { type: string; count: number }[] = []
    let abDailyData: { date: string; count: number }[] = []
    let abHourlyData: number[] = Array(24).fill(0)

    try {
      const [
        abTotalRes, abTodayRes, abWeekRes, abMonthRes,
        abUniqueTodayRes, abUniqueWeekRes, abUniqueMonthRes,
        abDeviceRes, abDailyRes, abHourlyRes,
      ] = await Promise.all([
        admin.from('ab_test_visits').select('id', { count: 'exact', head: true }),
        admin.from('ab_test_visits').select('id', { count: 'exact', head: true }).gte('visited_at', todayStart),
        admin.from('ab_test_visits').select('id', { count: 'exact', head: true }).gte('visited_at', weekStart),
        admin.from('ab_test_visits').select('id', { count: 'exact', head: true }).gte('visited_at', monthStart),
        admin.from('ab_test_visits').select('visitor_ip').gte('visited_at', todayStart),
        admin.from('ab_test_visits').select('visitor_ip').gte('visited_at', weekStart),
        admin.from('ab_test_visits').select('visitor_ip').gte('visited_at', monthStart),
        admin.from('ab_test_visits').select('user_agent').gte('visited_at', monthStart).limit(5000),
        admin.from('ab_test_visits').select('visited_at').gte('visited_at', thirtyDaysAgo).limit(10000),
        admin.from('ab_test_visits').select('visited_at').gte('visited_at', todayStart).limit(5000),
      ])

      if (!abTotalRes.error) {
        abTotal = abTotalRes.count || 0
        abToday = abTodayRes.count || 0
        abWeek = abWeekRes.count || 0
        abMonth = abMonthRes.count || 0
        abUniqueToday = new Set((abUniqueTodayRes.data || []).map(v => v.visitor_ip).filter(Boolean)).size
        abUniqueWeek = new Set((abUniqueWeekRes.data || []).map(v => v.visitor_ip).filter(Boolean)).size
        abUniqueMonth = new Set((abUniqueMonthRes.data || []).map(v => v.visitor_ip).filter(Boolean)).size

        // Devices from user_agent
        const abDeviceCounts: Record<string, number> = {}
        for (const row of (abDeviceRes.data || [])) {
          const ua = (row.user_agent || '') as string
          const isTablet = /iPad|Tablet/i.test(ua)
          const isMobile = /Mobile|Android|iPhone/i.test(ua)
          const dt = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop'
          abDeviceCounts[dt] = (abDeviceCounts[dt] || 0) + 1
        }
        abDevices = Object.entries(abDeviceCounts).map(([type, count]) => ({ type, count }))

        // Daily
        const abDailyCounts: Record<string, number> = {}
        for (const row of (abDailyRes.data || [])) { const day = (row.visited_at as string).slice(0, 10); abDailyCounts[day] = (abDailyCounts[day] || 0) + 1 }
        abDailyData = Object.entries(abDailyCounts).sort((a, b) => a[0].localeCompare(b[0])).map(([date, count]) => ({ date, count }))

        // Hourly
        for (const row of (abHourlyRes.data || [])) { abHourlyData[new Date(row.visited_at as string).getHours()]++ }
      }
    } catch (e) {
      console.error('ab_test_visits queries failed:', e)
    }

    // ── Merge data from both sources ──
    const total = svTotal + abTotal
    const today = svToday + abToday
    const week = svWeek + abWeek
    const month = svMonth + abMonth
    const uniqueToday = svUniqueToday + abUniqueToday
    const uniqueWeek = svUniqueWeek + abUniqueWeek
    const uniqueMonth = svUniqueMonth + abUniqueMonth

    // Merge daily data
    const mergedDailyMap: Record<string, number> = {}
    for (const d of svDailyData) mergedDailyMap[d.date] = (mergedDailyMap[d.date] || 0) + d.count
    for (const d of abDailyData) mergedDailyMap[d.date] = (mergedDailyMap[d.date] || 0) + d.count
    const dailyData = Object.entries(mergedDailyMap).sort((a, b) => a[0].localeCompare(b[0])).map(([date, count]) => ({ date, count }))

    // Merge hourly data
    const mergedHourly = Array(24).fill(0).map((_, i) => {
      const svCount = svHourlyData.find(h => h.hour === `${i}h`)?.count || 0
      return { hour: `${i}h`, count: svCount + abHourlyData[i] }
    })

    // Merge devices
    const mergedDeviceMap: Record<string, number> = {}
    for (const d of svDevices) mergedDeviceMap[d.type] = (mergedDeviceMap[d.type] || 0) + d.count
    for (const d of abDevices) mergedDeviceMap[d.type] = (mergedDeviceMap[d.type] || 0) + d.count
    const devices = Object.entries(mergedDeviceMap).map(([type, count]) => ({ type, count }))

    // Top pages: add landing page from ab_test_visits
    const topPages = [...svTopPages]
    if (abMonth > 0) {
      const landingEntry = topPages.find(p => p.path === '/')
      if (landingEntry) {
        landingEntry.count += abMonth
      } else {
        topPages.push({ path: '/', count: abMonth })
      }
      topPages.sort((a, b) => b.count - a.count)
    }

    return NextResponse.json({
      total,
      today,
      week,
      month,
      uniqueToday,
      uniqueWeek,
      uniqueMonth,
      authenticatedMonth: svAuthMonth,
      topPages: topPages.slice(0, 10),
      devices,
      dailyData,
      hourlyData: mergedHourly,
      sources: svSources,
      referrers: svReferrers,
      weekdayData: svWeekday,
      avgDuration: svAvgDuration,
      medianDuration: svMedianDuration,
      _sources: {
        site_visits: siteVisitsOk ? svTotal : 'table_unavailable',
        ab_test_visits: abTotal,
      },
    })
  } catch (e) {
    console.error('Visits stats error:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
