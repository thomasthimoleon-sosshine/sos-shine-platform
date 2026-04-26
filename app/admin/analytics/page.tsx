'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface KPIs {
  totalMembers: number
  newThisMonth: number
  activeSubs: number
  essentialSubs: number
  sereniteSubs: number
  trialingSubs: number
  mrr: number
  canceledLast30: number
  churnRate: number
  conversionRate: number
}

interface DailyPoint {
  date: string
  signups: number
  conversions: number
}

interface PlanBreakdown {
  plan: string
  count: number
  mrr: number
  color: string
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [daily, setDaily] = useState<DailyPoint[]>([])
  const [planBreakdown, setPlanBreakdown] = useState<PlanBreakdown[]>([])
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d')

  const load = useCallback(async () => {
    const supabase = createClient()
    setLoading(true)

    const now = new Date()
    const rangeDays = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
    const startDate = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const start30DaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // ── KPIs ──
    const [membersRes, newMonthRes, subsRes, canceledRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth.toISOString()),
      supabase.from('subscriptions').select('plan, status'),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true })
        .eq('status', 'canceled')
        .gte('updated_at', start30DaysAgo.toISOString()),
    ])

    const allSubs = (subsRes.data || []) as Array<{ plan: string; status: string }>
    const activeOrTrial = allSubs.filter(s => s.status === 'active' || s.status === 'trialing')
    const essential = activeOrTrial.filter(s => s.plan === 'essential').length
    const serenite = activeOrTrial.filter(s => s.plan === 'serenite').length
    const trialing = allSubs.filter(s => s.status === 'trialing').length

    const mrr = essential * 9.90 + serenite * 49.90
    const activeSubs = activeOrTrial.length
    const totalMembers = membersRes.count || 0
    const canceledCount = canceledRes.count || 0
    const churnRate = activeSubs > 0 ? (canceledCount / (activeSubs + canceledCount)) * 100 : 0
    const conversionRate = totalMembers > 0 ? (activeSubs / totalMembers) * 100 : 0

    setKpis({
      totalMembers,
      newThisMonth: newMonthRes.count || 0,
      activeSubs,
      essentialSubs: essential,
      sereniteSubs: serenite,
      trialingSubs: trialing,
      mrr: Math.round(mrr * 100) / 100,
      canceledLast30: canceledCount,
      churnRate: Math.round(churnRate * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
    })

    setPlanBreakdown([
      { plan: 'Essentielle', count: essential, mrr: essential * 9.90, color: '#74C0FC' },
      { plan: 'Sérénité', count: serenite, mrr: serenite * 49.90, color: '#D4AF37' },
    ])

    // ── Daily signups + conversions ──
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    const { data: convData } = await supabase
      .from('subscriptions')
      .select('created_at, status')
      .in('status', ['active', 'trialing'])
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    const dayMap: Record<string, { signups: number; conversions: number }> = {}
    for (let i = 0; i <= rangeDays; i++) {
      const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().substring(0, 10)
      dayMap[key] = { signups: 0, conversions: 0 }
    }
    for (const row of (profilesData || []) as Array<{ created_at: string }>) {
      const key = row.created_at.substring(0, 10)
      if (dayMap[key]) dayMap[key].signups++
    }
    for (const row of (convData || []) as Array<{ created_at: string }>) {
      const key = row.created_at.substring(0, 10)
      if (dayMap[key]) dayMap[key].conversions++
    }

    const dailyArr = Object.entries(dayMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, signups: v.signups, conversions: v.conversions }))

    setDaily(dailyArr)
    setLoading(false)
  }, [dateRange])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#74C0FC] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const maxDaily = Math.max(1, ...daily.map(d => Math.max(d.signups, d.conversions)))

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Analytics Business
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Tableau de bord complet : conversion, MRR, churn, croissance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d'] as const).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setDateRange(r)}
              className="text-xs px-3 py-1.5 rounded-lg cursor-pointer"
              style={{
                background: dateRange === r ? 'rgba(116,192,252,0.15)' : 'transparent',
                color: dateRange === r ? '#74C0FC' : 'var(--text-muted)',
                border: `1px solid ${dateRange === r ? 'rgba(116,192,252,0.3)' : 'var(--border)'}`,
              }}
            >
              {r === '7d' ? '7 jours' : r === '30d' ? '30 jours' : '90 jours'}
            </button>
          ))}
        </div>
      </div>

      {/* Top KPIs */}
      {kpis && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'MRR', value: `${kpis.mrr.toFixed(2)}€`, color: '#D4AF37', hint: 'Revenu mensuel récurrent' },
              { label: 'Membres total', value: kpis.totalMembers, color: '#74C0FC', hint: `+${kpis.newThisMonth} ce mois` },
              { label: 'Abonnés actifs', value: kpis.activeSubs, color: '#55EFC4', hint: `${kpis.trialingSubs} en essai` },
              { label: 'Taux conversion', value: `${kpis.conversionRate}%`, color: '#A78BFA', hint: 'Inscrits → Payants' },
            ].map(k => (
              <div key={k.label} className="rounded-xl p-5"
                style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
                <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{k.label}</p>
                <p className="font-display text-2xl md:text-3xl font-semibold" style={{ color: k.color }}>{k.value}</p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{k.hint}</p>
              </div>
            ))}
          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Churn 30j', value: `${kpis.churnRate}%`, color: '#FF6B6B', hint: `${kpis.canceledLast30} annulations` },
              { label: 'Plan Essentielle', value: kpis.essentialSubs, color: '#74C0FC', hint: '9,90€/mois' },
              { label: 'Plan Sérénité', value: kpis.sereniteSubs, color: '#D4AF37', hint: '49,90€/mois' },
              { label: 'ARR projeté', value: `${(kpis.mrr * 12).toFixed(0)}€`, color: '#55EFC4', hint: 'MRR × 12' },
            ].map(k => (
              <div key={k.label} className="rounded-xl p-4"
                style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
                <p className="text-[10px] mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{k.label}</p>
                <p className="font-display text-xl font-semibold" style={{ color: k.color }}>{k.value}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{k.hint}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Daily chart */}
      <div className="rounded-xl p-6" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Inscriptions & Conversions ({dateRange})
          </h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: '#74C0FC' }} /> Inscrits
            </span>
            <span className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: '#D4AF37' }} /> Payants
            </span>
          </div>
        </div>
        <div className="flex items-end gap-1 h-40">
          {daily.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-1 group relative" title={`${d.date} · ${d.signups} inscrits · ${d.conversions} payants`}>
              <div className="w-full relative flex flex-col items-center justify-end" style={{ height: '100%' }}>
                <div className="w-full rounded-t transition-all"
                  style={{ height: `${(d.signups / maxDaily) * 100}%`, background: '#74C0FC', minHeight: d.signups > 0 ? '2px' : '0' }} />
                <div className="w-full rounded-t transition-all absolute bottom-0 opacity-80"
                  style={{ height: `${(d.conversions / maxDaily) * 100}%`, background: '#D4AF37', minHeight: d.conversions > 0 ? '2px' : '0', width: '50%', left: '25%' }} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] mt-3" style={{ color: 'var(--text-muted)' }}>
          <span>{daily[0]?.date.substring(5)}</span>
          <span>{daily[Math.floor(daily.length / 2)]?.date.substring(5)}</span>
          <span>{daily[daily.length - 1]?.date.substring(5)}</span>
        </div>
      </div>

      {/* Plan breakdown */}
      <div className="rounded-xl p-6" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
        <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
          Répartition du MRR par plan
        </h3>
        <div className="space-y-4">
          {planBreakdown.map((p) => {
            const totalMrr = planBreakdown.reduce((acc, x) => acc + x.mrr, 0)
            const pct = totalMrr > 0 ? (p.mrr / totalMrr) * 100 : 0
            return (
              <div key={p.plan}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium" style={{ color: p.color }}>{p.plan}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span style={{ color: 'var(--text-muted)' }}>{p.count} abonnés</span>
                    <span className="font-semibold" style={{ color: p.color }}>{p.mrr.toFixed(2)}€</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: p.color }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Goal progress 2000 subs */}
      {kpis && (
        <div className="rounded-xl p-6" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(116,192,252,0.04))', border: '1px solid rgba(212,175,55,0.2)' }}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--brand)' }}>
                Objectif 2000 abonnés
              </p>
              <h3 className="font-display text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                {kpis.activeSubs} / 2000
              </h3>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-semibold" style={{ color: 'var(--brand)' }}>
                {Math.round((kpis.activeSubs / 2000) * 100)}%
              </p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>complété</p>
            </div>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${Math.min((kpis.activeSubs / 2000) * 100, 100)}%`, background: 'linear-gradient(90deg, var(--brand), #74C0FC)' }} />
          </div>
          <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
            Il manque <strong style={{ color: 'var(--brand)' }}>{Math.max(0, 2000 - kpis.activeSubs)}</strong> abonnés pour atteindre l&apos;objectif.
            MRR cible : <strong style={{ color: 'var(--brand)' }}>~79 800€</strong>
          </p>
        </div>
      )}
    </div>
  )
}
