'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

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

export default function AbTestingDashboard() {
  const [config, setConfig] = useState<AbConfig | null>(null)
  const [stats, setStats] = useState<Record<string, VariantStats>>({})
  const [daily, setDaily] = useState<Record<string, DailyRow[]>>({})
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
    const { data: visitsRaw } = await supabase
      .from('ab_test_visits')
      .select('variant, visitor_ip, converted, visited_at')
      .order('visited_at', { ascending: true })
    const visits = (visitsRaw || []) as unknown as { variant: string; visitor_ip: string | null; converted: boolean; visited_at: string }[]

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
    }

    setStats(s)
    setDaily(d)
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
        style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
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
                border: `1px solid ${config.split_ratio === r ? 'rgba(116,192,252,0.3)' : 'var(--dark-border)'}`,
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
          { label: 'Taux global', value: totalViews > 0 ? `${Math.round((totalConversions / totalViews) * 10000) / 100}%` : '—', color: '#D4AF37' },
          { label: 'Leader', value: winner ? (winner === 'julia' ? 'Julia' : 'Thomas') : 'Égalité', color: winner ? '#55EFC4' : 'var(--text-muted)' },
        ].map((c) => (
          <div key={c.label} className="rounded-xl p-5" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
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
              background: 'var(--dark-card)',
              border: `1px solid ${winner === v.variant ? v.color + '40' : 'var(--dark-border)'}`,
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
              <div className="pt-3" style={{ borderTop: '1px solid var(--dark-border)' }}>
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
              <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--dark-border)' }}>
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

      {/* Info */}
      <div className="rounded-xl p-6" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
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
