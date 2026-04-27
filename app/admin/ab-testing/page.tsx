'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AbTest {
  id: string
  name: string
  variant_a: string
  variant_b: string
  split_ratio: number
  is_active: boolean
  created_at: string
}

interface VariantStats {
  views: number
  conversions: number
  conversion_rate: number
}

interface DailyPoint {
  date: string
  views: number
  conversions: number
}

export default function AbTestingDashboard() {
  const [test, setTest] = useState<AbTest | null>(null)
  const [stats, setStats] = useState<Record<string, VariantStats>>({})
  const [daily, setDaily] = useState<Record<string, DailyPoint[]>>({})
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)

  const load = useCallback(async () => {
    const supabase = createClient()

    const { data: tests } = await supabase
      .from('ab_tests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)

    const t = tests?.[0] as AbTest | undefined
    if (!t) { setLoading(false); return }
    setTest(t)

    const { data: events } = await supabase
      .from('ab_test_events')
      .select('variant, event_type, created_at')
      .eq('test_id', t.id)
      .order('created_at', { ascending: true })

    const s: Record<string, VariantStats> = {}
    const d: Record<string, DailyPoint[]> = {}

    for (const variant of [t.variant_a, t.variant_b]) {
      const variantEvents = (events || []).filter((e) => e.variant === variant)
      const views = variantEvents.filter((e) => e.event_type === 'view').length
      const conversions = variantEvents.filter((e) => e.event_type === 'conversion').length
      s[variant] = {
        views,
        conversions,
        conversion_rate: views > 0 ? Math.round((conversions / views) * 10000) / 100 : 0,
      }

      // Daily breakdown
      const dayMap: Record<string, { views: number; conversions: number }> = {}
      for (const e of variantEvents) {
        const day = e.created_at.substring(0, 10)
        if (!dayMap[day]) dayMap[day] = { views: 0, conversions: 0 }
        if (e.event_type === 'view') dayMap[day].views++
        if (e.event_type === 'conversion') dayMap[day].conversions++
      }
      d[variant] = Object.entries(dayMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, v]) => ({ date, ...v }))
    }

    setStats(s)
    setDaily(d)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function toggleTest() {
    if (!test) return
    setToggling(true)
    const supabase = createClient()
    await supabase.from('ab_tests').update({ is_active: !test.is_active, updated_at: new Date().toISOString() }).eq('id', test.id)
    setTest({ ...test, is_active: !test.is_active })
    setToggling(false)
  }

  async function updateSplit(ratio: number) {
    if (!test) return
    const supabase = createClient()
    await supabase.from('ab_tests').update({ split_ratio: ratio, updated_at: new Date().toISOString() }).eq('id', test.id)
    setTest({ ...test, split_ratio: ratio })
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#74C0FC] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!test) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
          Aucun test A/B configure. Lancez la migration SQL pour initialiser.
        </p>
      </div>
    )
  }

  const variantA = test.variant_a
  const variantB = test.variant_b
  const statsA = stats[variantA] || { views: 0, conversions: 0, conversion_rate: 0 }
  const statsB = stats[variantB] || { views: 0, conversions: 0, conversion_rate: 0 }
  const totalViews = statsA.views + statsB.views
  const totalConversions = statsA.conversions + statsB.conversions

  const winner = statsA.conversion_rate > statsB.conversion_rate ? variantA
    : statsB.conversion_rate > statsA.conversion_rate ? variantB
    : null

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            A/B Testing
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Suivi des performances : {test.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTest} disabled={toggling}
            className="px-5 py-3 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-50"
            style={{
              background: test.is_active ? 'rgba(255,107,107,0.1)' : 'rgba(85,239,196,0.1)',
              border: `1px solid ${test.is_active ? 'rgba(255,107,107,0.3)' : 'rgba(85,239,196,0.3)'}`,
              color: test.is_active ? '#FF6B6B' : '#55EFC4',
            }}>
            {toggling ? '...' : test.is_active ? 'Desactiver le test' : 'Activer le test'}
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div className="rounded-xl p-4 flex items-center gap-4"
        style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: test.is_active ? '#55EFC4' : '#FF6B6B' }} />
          <span className="text-sm font-medium" style={{ color: test.is_active ? '#55EFC4' : '#FF6B6B' }}>
            {test.is_active ? 'Actif' : 'Inactif'}
          </span>
        </div>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>|</span>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Split : {Math.round(test.split_ratio * 100)}% / {Math.round((1 - test.split_ratio) * 100)}%
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>|</span>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Ratio :</span>
          {[0.5, 0.7, 0.8, 1.0].map((r) => (
            <button key={r} onClick={() => updateSplit(r)}
              className="text-xs px-2 py-1 rounded cursor-pointer"
              style={{
                background: test.split_ratio === r ? 'rgba(116,192,252,0.15)' : 'transparent',
                color: test.split_ratio === r ? '#74C0FC' : 'var(--text-muted)',
                border: `1px solid ${test.split_ratio === r ? 'rgba(116,192,252,0.3)' : 'var(--dark-border)'}`,
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
          { label: 'Conversions totales', value: totalConversions, color: '#55EFC4' },
          { label: 'Taux global', value: totalViews > 0 ? `${Math.round((totalConversions / totalViews) * 10000) / 100}%` : '0%', color: '#C9A961' },
          { label: 'Leader', value: winner ? (winner === variantA ? 'Julia' : 'Standard') : 'Egalite', color: winner ? '#55EFC4' : 'var(--text-muted)' },
        ].map((c) => (
          <div key={c.label} className="rounded-xl p-5"
            style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
            <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{c.label}</p>
            <p className="font-display text-2xl font-semibold" style={{ color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Variant comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { name: 'Version Julia', variant: variantA, stats: statsA, color: '#C9A961' },
          { name: 'Version Standard', variant: variantB, stats: statsB, color: '#74C0FC' },
        ].map((v) => (
          <div key={v.variant} className="rounded-xl p-6"
            style={{
              background: 'var(--dark-card)',
              border: `1px solid ${winner === v.variant ? v.color + '40' : 'var(--dark-border)'}`,
            }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg" style={{ color: v.color }}>{v.name}</h3>
              {winner === v.variant && (
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: `${v.color}15`, color: v.color }}>
                  Leader
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Vues</span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{v.stats.views}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Conversions</span>
                <span className="font-semibold" style={{ color: '#55EFC4' }}>{v.stats.conversions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Taux de conversion</span>
                <span className="font-display text-xl font-semibold" style={{ color: v.color }}>{v.stats.conversion_rate}%</span>
              </div>

              {/* Mini bar */}
              <div className="mt-2">
                <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-2 rounded-full transition-all" style={{
                    width: `${Math.min(v.stats.conversion_rate * 2, 100)}%`,
                    background: v.color,
                  }} />
                </div>
              </div>
            </div>

            {/* Daily breakdown */}
            {(daily[v.variant] || []).length > 0 && (
              <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--dark-border)' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                  Par jour (derniers)
                </p>
                <div className="space-y-1 max-h-40 overflow-y-auto">
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

      {/* How it works */}
      <div className="rounded-xl p-6" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
        <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
          Comment fonctionne le split ?
        </h3>
        <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <p>Chaque nouveau visiteur est assigne aleatoirement a une version (Julia ou Standard) via un cookie persistant <code className="text-xs px-1 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>ab_variant</code>.</p>
          <p>Les evenements de <strong>vue</strong> sont enregistres automatiquement au chargement de la page. Les <strong>conversions</strong> sont tracees quand le visiteur clique sur un bouton d&apos;inscription ou d&apos;essai.</p>
          <p>Modifiez le contenu de chaque version independamment via <strong>Landing Julia</strong> et <strong>Landing Page</strong> dans le menu admin.</p>
        </div>
      </div>
    </div>
  )
}
