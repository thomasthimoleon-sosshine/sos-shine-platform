'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Categorize a referrer URL into a human-readable traffic source
function categorizeSource(referrer: string | null | undefined): string {
  if (!referrer) return 'Direct / App'
  const r = referrer.toLowerCase()
  if (r.includes('instagram') || r.includes('l.instagram')) return 'Instagram'
  if (r.includes('facebook') || r.includes('fb.com') || r.includes('fb.me')) return 'Facebook'
  if (r.includes('tiktok')) return 'TikTok'
  if (r.includes('youtube') || r.includes('youtu.be')) return 'YouTube'
  if (r.includes('linkedin') || r.includes('lnkd.in')) return 'LinkedIn'
  if (r.includes('twitter') || r.includes('t.co') || r.includes('x.com')) return 'X / Twitter'
  if (r.includes('pinterest')) return 'Pinterest'
  if (r.includes('whatsapp') || r.includes('wa.me')) return 'WhatsApp'
  if (r.includes('google')) return 'Google'
  if (r.includes('bing.com')) return 'Bing'
  if (r.includes('duckduckgo')) return 'DuckDuckGo'
  if (r.includes('yahoo')) return 'Yahoo'
  if (r.includes('sosshine')) return 'Navigation interne'
  if (r.includes('vercel.com') || r.includes('vercel.app')) return 'Admin / Preview'
  // Try to extract domain
  const match = referrer.match(/https?:\/\/([^/]+)/)
  return match ? match[1] : 'Autre'
}

const SOURCE_COLORS: Record<string, string> = {
  Instagram: '#E4405F',
  Facebook: '#1877F2',
  TikTok: '#FE2C55',
  YouTube: '#FF0000',
  LinkedIn: '#0A66C2',
  'X / Twitter': '#000000',
  Pinterest: '#BD081C',
  WhatsApp: '#25D366',
  Google: '#4285F4',
  Bing: '#008373',
  DuckDuckGo: '#DE5833',
  Yahoo: '#6001D2',
  'Direct / App': '#A78BFA',
  'Navigation interne': '#55EFC4',
  'Admin / Preview': '#8E6E7E',
  Autre: '#C9A961',
}

interface AbConfig {
  id: string
  test_name: string
  is_active: boolean
  split_ratio: number
  variant_a: string
  variant_b: string
}

interface VariantStats {
  total: number
  unique: number
  converted: number
  rate: number
  signups: number
  paidSubs: number
  signupRate: number
  paymentRate: number
}

interface DailyRow {
  date: string
  views: number
  conversions: number
}

interface SourceRow {
  source: string
  count: number
  color: string
  pct: number
}

export default function AbTestingDashboard() {
  const [config, setConfig] = useState<AbConfig | null>(null)
  const [stats, setStats] = useState<Record<string, VariantStats>>({})
  const [daily, setDaily] = useState<Record<string, DailyRow[]>>({})
  const [sources, setSources] = useState<Record<string, SourceRow[]>>({})
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  const load = useCallback(async () => {
    const supabase = createClient()

    // Load config
    const { data: configData } = await supabase
      .from('ab_test_config')
      .select('*')
      .eq('test_name', 'landing_page')
      .maybeSingle()

    if (!configData) { setLoading(false); return }
    const cfg = configData as unknown as AbConfig
    setConfig(cfg)

    // Load visit stats
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: visitsRaw } = await (supabase.from('ab_test_visits') as any)
      .select('variant, visitor_ip, converted, visited_at, referrer')
      .order('visited_at', { ascending: true })
    const visits = (visitsRaw || []) as unknown as { variant: string; visitor_ip: string | null; converted: boolean; visited_at: string; referrer: string | null }[]

    // Load REAL signups + paid subs per variant (attribution)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profilesRaw } = await (supabase.from('profiles') as any)
      .select('id, ab_variant')
      .not('ab_variant', 'is', null)
    const profiles = (profilesRaw || []) as Array<{ id: string; ab_variant: string }>

    // Map profile id -> variant
    const userVariants: Record<string, string> = {}
    for (const p of profiles) userVariants[p.id] = p.ab_variant

    // Load active subscriptions
    const { data: subsRaw } = await supabase
      .from('subscriptions')
      .select('user_id, status, plan')
      .in('status', ['active', 'trialing'])
    const subs = (subsRaw || []) as Array<{ user_id: string; status: string; plan: string }>

    const s: Record<string, VariantStats> = {}
    const d: Record<string, DailyRow[]> = {}
    const srcByVariant: Record<string, SourceRow[]> = {}

    for (const v of [cfg.variant_a, cfg.variant_b]) {
      const variantVisits = visits.filter((vis) => vis.variant === v)
      const uniqueIps = new Set(variantVisits.map((vis) => vis.visitor_ip).filter(Boolean))
      const converted = variantVisits.filter((vis) => vis.converted).length
      const total = variantVisits.length

      // Real attribution: signups and paid subs with this variant
      const variantSignups = profiles.filter((p) => p.ab_variant === v).length
      const variantPaidSubs = subs.filter((sub) => userVariants[sub.user_id] === v).length

      s[v] = {
        total,
        unique: uniqueIps.size,
        converted,
        rate: total > 0 ? Math.round((converted / total) * 10000) / 100 : 0,
        signups: variantSignups,
        paidSubs: variantPaidSubs,
        signupRate: total > 0 ? Math.round((variantSignups / total) * 10000) / 100 : 0,
        paymentRate: variantSignups > 0 ? Math.round((variantPaidSubs / variantSignups) * 10000) / 100 : 0,
      }

      // Daily breakdown
      const dayMap: Record<string, { views: number; conversions: number }> = {}
      for (const vis of variantVisits) {
        const day = vis.visited_at?.substring(0, 10) || 'unknown'
        if (!dayMap[day]) dayMap[day] = { views: 0, conversions: 0 }
        dayMap[day].views++
        if (vis.converted) dayMap[day].conversions++
      }
      d[v] = Object.entries(dayMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, val]) => ({ date, ...val }))

      // Sources breakdown (per variant)
      const sourceMap: Record<string, number> = {}
      for (const vis of variantVisits) {
        const src = categorizeSource(vis.referrer)
        sourceMap[src] = (sourceMap[src] || 0) + 1
      }
      srcByVariant[v] = Object.entries(sourceMap)
        .sort(([, a], [, b]) => b - a)
        .map(([source, count]) => ({
          source,
          count,
          color: SOURCE_COLORS[source] || '#C9A961',
          pct: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
        }))
    }

    setStats(s)
    setDaily(d)
    setSources(srcByVariant)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function toggleTest() {
    if (!config) return
    setToggling(true)
    const supabase = createClient()
    await (supabase.from('ab_test_config') as unknown as { update: (v: Record<string, unknown>) => { eq: (k: string, v: string) => Promise<unknown> } })
      .update({ is_active: !config.is_active, updated_at: new Date().toISOString() })
      .eq('test_name', 'landing_page')
    setConfig({ ...config, is_active: !config.is_active })
    setToggling(false)
  }

  async function updateSplit(ratio: number) {
    if (!config) return
    const supabase = createClient()
    await (supabase.from('ab_test_config') as unknown as { update: (v: Record<string, unknown>) => { eq: (k: string, v: string) => Promise<unknown> } })
      .update({ split_ratio: ratio, updated_at: new Date().toISOString() })
      .eq('test_name', 'landing_page')
    setConfig({ ...config, split_ratio: ratio })
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#74C0FC] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!config) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          Aucun test A/B configuré. Lancez la migration SQL <code>20260410_ab_testing_variants.sql</code> pour initialiser.
        </p>
      </div>
    )
  }

  const sA = stats[config.variant_a] || { total: 0, unique: 0, converted: 0, rate: 0 }
  const sB = stats[config.variant_b] || { total: 0, unique: 0, converted: 0, rate: 0 }
  const totalViews = sA.total + sB.total
  const totalConversions = sA.converted + sB.converted
  // Winner based on the FULL funnel: visits → paid subs (the only metric that matters)
  const fullRateA = sA.total > 0 ? (sA.paidSubs / sA.total) : 0
  const fullRateB = sB.total > 0 ? (sB.paidSubs / sB.total) : 0
  const winner = fullRateA > fullRateB ? config.variant_a : fullRateB > fullRateA ? config.variant_b : null

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>A/B Testing</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Split test : Landing Page Julia vs Landing Page Thomas
          </p>
        </div>
        <button onClick={toggleTest} disabled={toggling}
          className="px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50"
          style={{
            background: config.is_active ? 'rgba(255,107,107,0.1)' : 'rgba(85,239,196,0.1)',
            border: `1px solid ${config.is_active ? 'rgba(255,107,107,0.3)' : 'rgba(85,239,196,0.3)'}`,
            color: config.is_active ? '#FF6B6B' : '#55EFC4',
          }}>
          {toggling ? '...' : config.is_active ? 'Désactiver' : 'Activer le test'}
        </button>
      </div>

      {/* Status bar */}
      <div className="rounded-xl p-4 flex flex-wrap items-center gap-4"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: config.is_active ? '#55EFC4' : '#FF6B6B' }} />
          <span className="text-sm font-medium" style={{ color: config.is_active ? '#55EFC4' : '#FF6B6B' }}>
            {config.is_active ? 'Actif' : 'Inactif'}
          </span>
        </div>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>|</span>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Split : {Math.round(config.split_ratio * 100)}% Julia / {Math.round((1 - config.split_ratio) * 100)}% Thomas
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>|</span>
        <div className="flex items-center gap-2">
          {[0.5, 0.7, 0.8, 1.0].map((r) => (
            <button key={r} onClick={() => updateSplit(r)}
              className="text-xs px-2 py-1 rounded cursor-pointer"
              style={{
                background: config.split_ratio === r ? 'rgba(116,192,252,0.15)' : 'transparent',
                color: config.split_ratio === r ? '#74C0FC' : 'var(--text-muted)',
                border: `1px solid ${config.split_ratio === r ? 'rgba(116,192,252,0.3)' : 'var(--border)'}`,
              }}>
              {r === 1 ? '100% Julia' : `${Math.round(r * 100)}/${Math.round((1 - r) * 100)}`}
            </button>
          ))}
        </div>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Vues totales', value: totalViews, color: '#74C0FC' },
          { label: 'Conversions', value: totalConversions, color: '#55EFC4' },
          { label: 'Taux global', value: totalViews > 0 ? `${Math.round((totalConversions / totalViews) * 10000) / 100}%` : '—', color: '#C9A961' },
          { label: 'Leader', value: winner ? (winner === 'julia' ? 'Julia' : 'Thomas') : 'Égalité', color: winner ? '#55EFC4' : 'var(--text-muted)' },
        ].map((c) => (
          <div key={c.label} className="rounded-xl p-5" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{c.label}</p>
            <p className="font-display text-2xl font-semibold" style={{ color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Per-variant comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { name: 'Version Julia', variant: config.variant_a, s: sA, color: '#A78BFA' },
          { name: 'Version Thomas', variant: config.variant_b, s: sB, color: '#74C0FC' },
        ].map((v) => (
          <div key={v.variant} className="rounded-xl p-6"
            style={{
              background: 'var(--surface-card)',
              border: `1px solid ${winner === v.variant ? v.color + '40' : 'var(--border)'}`,
            }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg" style={{ color: v.color }}>{v.name}</h3>
              {winner === v.variant && (
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: `${v.color}15`, color: v.color }}>Leader</span>
              )}
            </div>

            <div className="space-y-3">
              {[
                { label: 'Vues totales', val: v.s.total },
                { label: 'Visiteurs uniques', val: v.s.unique },
                { label: 'Clicks CTA', val: v.s.converted },
                { label: 'Inscriptions (attribuées)', val: v.s.signups },
                { label: 'Abonnés payants', val: v.s.paidSubs },
              ].map((r) => (
                <div key={r.label} className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{r.val}</span>
                </div>
              ))}
              <div className="pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Taux signup (visite→compte)</span>
                  <span className="font-semibold text-sm" style={{ color: v.color }}>{v.s.signupRate}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(v.s.signupRate * 5, 100)}%`, background: v.color, opacity: 0.6 }} />
                </div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Taux paiement (compte→payant)</span>
                  <span className="font-semibold text-sm" style={{ color: v.color }}>{v.s.paymentRate}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${Math.min(v.s.paymentRate * 2, 100)}%`, background: v.color }} />
                </div>
              </div>
            </div>

            {/* Daily */}
            {(daily[v.variant] || []).length > 0 && (
              <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                  7 derniers jours
                </p>
                <div className="space-y-1">
                  {(daily[v.variant] || []).slice(-7).map((d) => (
                    <div key={d.date} className="flex items-center justify-between text-xs">
                      <span style={{ color: 'var(--text-muted)' }}>{d.date}</span>
                      <div className="flex gap-4">
                        <span style={{ color: 'var(--text-secondary)' }}>{d.views} vues</span>
                        <span style={{ color: '#55EFC4' }}>{d.conversions} conv.</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ─── Traffic Sources ─────────────────────────── */}
      <div className="rounded-xl p-6" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-start justify-between mb-5 flex-wrap gap-2">
          <div>
            <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
              Sources de trafic
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              D&apos;où viennent les visiteurs pour chaque variant
            </p>
          </div>
        </div>

        {(() => {
          // Aggregate global sources (all variants combined)
          const allRows: SourceRow[] = []
          const globalMap: Record<string, { count: number; color: string }> = {}
          for (const v of [config.variant_a, config.variant_b]) {
            for (const row of sources[v] || []) {
              if (!globalMap[row.source]) globalMap[row.source] = { count: 0, color: row.color }
              globalMap[row.source].count += row.count
            }
          }
          const grandTotal = Object.values(globalMap).reduce((acc, r) => acc + r.count, 0)
          for (const [source, data] of Object.entries(globalMap)) {
            allRows.push({
              source,
              count: data.count,
              color: data.color,
              pct: grandTotal > 0 ? Math.round((data.count / grandTotal) * 1000) / 10 : 0,
            })
          }
          allRows.sort((a, b) => b.count - a.count)

          if (allRows.length === 0) {
            return (
              <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
                Aucune visite enregistrée pour le moment. Les sources apparaîtront dès que les premiers visiteurs arriveront sur la landing.
              </p>
            )
          }

          return (
            <>
              {/* Global distribution — big bar */}
              <div className="mb-6">
                <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                  Répartition globale ({grandTotal} visites)
                </p>
                <div className="flex h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {allRows.map((r) => (
                    <div key={r.source} style={{ width: `${r.pct}%`, background: r.color }} title={`${r.source}: ${r.count} (${r.pct}%)`} />
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 mt-3">
                  {allRows.map((r) => (
                    <div key={r.source} className="flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{r.source}</span>
                      <span style={{ color: 'var(--text-muted)' }}>· {r.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Per-variant split */}
              <div className="grid md:grid-cols-2 gap-4 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
                {[
                  { name: 'Julia', variant: config.variant_a, color: '#A78BFA' },
                  { name: 'Thomas', variant: config.variant_b, color: '#74C0FC' },
                ].map((v) => {
                  const rows = sources[v.variant] || []
                  const total = rows.reduce((acc, r) => acc + r.count, 0)
                  return (
                    <div key={v.variant}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-sm" style={{ color: v.color }}>
                          Version {v.name}
                        </h4>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {total} visite{total > 1 ? 's' : ''}
                        </span>
                      </div>
                      {rows.length === 0 ? (
                        <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
                          Aucune source pour cette version
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {rows.slice(0, 8).map((r) => (
                            <div key={r.source}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                                  <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                                  {r.source}
                                </span>
                                <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                                  {r.count} <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>({r.pct}%)</span>
                                </span>
                              </div>
                              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                <div className="h-full rounded-full" style={{ width: `${r.pct}%`, background: r.color }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )
        })()}
      </div>

      {/* Info */}
      <div className="rounded-xl p-6" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
        <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Fonctionnement</h3>
        <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <p>Chaque nouveau visiteur est assigné aléatoirement à une version via un cookie persistant <code className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>ab_variant</code> (30 jours).</p>
          <p>Les <strong>vues</strong> sont tracées automatiquement. Les <strong>conversions</strong> sont enregistrées lors du clic sur un bouton d&apos;inscription.</p>
          <p>Modifiez chaque version via <strong>Landing Page Julia</strong> et <strong>Landing Page</strong> dans le menu.</p>
        </div>
      </div>
    </div>
  )
}
