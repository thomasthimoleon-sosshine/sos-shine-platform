'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Monthly targets from growth plan (March 2026 → Feb 2027) ───
const MONTHLY_TARGETS = [
  { month: 'Mars 2026',    year: 2026, monthIndex: 2,  newSubs: 50,  cumulActive: 50,  mrr: 1845,  churn: 0,  phase: 'Lancement' },
  { month: 'Avril 2026',   year: 2026, monthIndex: 3,  newSubs: 40,  cumulActive: 85,  mrr: 3150,  churn: 5,  phase: 'Lancement' },
  { month: 'Mai 2026',     year: 2026, monthIndex: 4,  newSubs: 55,  cumulActive: 130, mrr: 4820,  churn: 10, phase: 'Croissance' },
  { month: 'Juin 2026',    year: 2026, monthIndex: 5,  newSubs: 65,  cumulActive: 188, mrr: 6960,  churn: 7,  phase: 'Croissance' },
  { month: 'Juillet 2026', year: 2026, monthIndex: 6,  newSubs: 70,  cumulActive: 245, mrr: 9090,  churn: 13, phase: 'Croissance' },
  { month: 'Août 2026',    year: 2026, monthIndex: 7,  newSubs: 60,  cumulActive: 292, mrr: 10820, churn: 13, phase: 'Croissance' },
  { month: 'Sept 2026',    year: 2026, monthIndex: 8,  newSubs: 85,  cumulActive: 368, mrr: 13630, churn: 9,  phase: 'Accélération' },
  { month: 'Oct 2026',     year: 2026, monthIndex: 9,  newSubs: 90,  cumulActive: 447, mrr: 16560, churn: 11, phase: 'Accélération' },
  { month: 'Nov 2026',     year: 2026, monthIndex: 10, newSubs: 95,  cumulActive: 528, mrr: 19560, churn: 14, phase: 'Accélération' },
  { month: 'Déc 2026',     year: 2026, monthIndex: 11, newSubs: 100, cumulActive: 611, mrr: 22640, churn: 17, phase: 'Accélération' },
  { month: 'Janv 2027',    year: 2027, monthIndex: 0,  newSubs: 110, cumulActive: 703, mrr: 26040, churn: 18, phase: 'Consolidation' },
  { month: 'Fév 2027',     year: 2027, monthIndex: 1,  newSubs: 100, cumulActive: 783, mrr: 29000, churn: 20, phase: 'Consolidation' },
]

const PLAN_TARGET_RATIOS = { essential: 0.55, serenite: 0.30, premium: 0.15 }
const DURATION_RATIOS = { monthly: 0.50, quarterly: 0.20, semiannual: 0.15, annual: 0.15 }

const PLAN_PRICES: Record<string, number> = { essential: 9.90, serenite: 49.90, premium: 99.90 }
const PLAN_LABELS: Record<string, string> = { essential: 'Essentielle', serenite: 'Sérénité', premium: 'Premium' }
const PLAN_COLORS: Record<string, string> = { essential: '#74C0FC', serenite: '#55EFC4', premium: '#D4AF37' }

const MILESTONES = [
  { date: '22/03/2026', label: 'Lancement', target: 'Conversion waitlist → 50 premiers abonnés', icon: '🚀' },
  { date: '30/04/2026', label: 'Cap des 85', target: 'Valider le product-market fit', icon: '✅' },
  { date: '30/06/2026', label: 'Cap des 188', target: 'Activer le programme d\'affiliation', icon: '🤝' },
  { date: '31/08/2026', label: 'Cap des 292', target: 'MRR > 10K€ — seuil de viabilité', icon: '💰' },
  { date: '31/10/2026', label: 'Cap des 447', target: 'MRR > 16K€ — croissance confirmée', icon: '📈' },
  { date: '31/12/2026', label: 'Cap des 611', target: 'MRR > 22K€ — campagne Noël annuels', icon: '🎄' },
  { date: '28/02/2027', label: 'Cap des 783', target: 'MRR ~29K€ — ARR ~348K€', icon: '🏆' },
]

const PHASE_COLORS: Record<string, string> = {
  'Lancement': '#74C0FC',
  'Croissance': '#55EFC4',
  'Accélération': '#D4AF37',
  'Consolidation': '#A29BFE',
}

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n)
const fmtEur = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

function getCurrentMonthTarget() {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  return MONTHLY_TARGETS.find(t => t.year === y && t.monthIndex === m) || MONTHLY_TARGETS[0]
}

function getMonthTargetIndex() {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  return MONTHLY_TARGETS.findIndex(t => t.year === y && t.monthIndex === m)
}

interface RealStats {
  totalActive: number
  essential: number
  serenite: number
  premium: number
  newThisMonth: number
  canceledThisMonth: number
  trialingCount: number
  monthlyCount: number
  quarterlyCount: number
  semiannualCount: number
  annualCount: number
  mrr: number
  waitlistDiscountCount: number
  pastDueCount: number
}

function ProgressRing({ value, max, size = 120, strokeWidth = 10, color, label, sublabel }: {
  value: number; max: number; size?: number; strokeWidth?: number; color: string; label: string; sublabel?: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const pct = Math.min(value / Math.max(max, 1), 1)
  const offset = circumference - pct * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-bold" style={{ color }}>{fmt(value)}</span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>/ {fmt(max)}</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {sublabel && <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{sublabel}</p>}
      </div>
    </div>
  )
}

function ProgressBar({ value, max, color, label, valueLabel }: {
  value: number; max: number; color: string; label: string; valueLabel?: string
}) {
  const pct = Math.min((value / Math.max(max, 1)) * 100, 100)
  const isOver = value > max

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="text-[12px] font-semibold" style={{ color: isOver ? '#55EFC4' : color }}>
          {valueLabel || `${fmt(value)} / ${fmt(max)}`}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${pct}%`,
            background: isOver
              ? 'linear-gradient(90deg, #55EFC4, #2ecc71)'
              : `linear-gradient(90deg, ${color}, ${color}cc)`,
          }} />
      </div>
      <div className="flex justify-between">
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          {pct.toFixed(0)}%
        </span>
        {isOver && (
          <span className="text-[10px] font-medium" style={{ color: '#55EFC4' }}>
            +{fmt(value - max)} au-dessus !
          </span>
        )}
      </div>
    </div>
  )
}

export default function ObjectifsMensuelsPage() {
  const [stats, setStats] = useState<RealStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const currentTarget = useMemo(() => getCurrentMonthTarget(), [])
  const monthIdx = useMemo(() => getMonthTargetIndex(), [])
  const prevTarget = monthIdx > 0 ? MONTHLY_TARGETS[monthIdx - 1] : null

  async function loadStats() {
    const supabase = createClient()
    const now = new Date()
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [
      activeEssential,
      activeSerenite,
      activePremium,
      newThisMonth,
      canceledThisMonth,
      trialingCount,
      monthlyCount,
      quarterlyCount,
      semiannualCount,
      annualCount,
      waitlistCount,
      pastDueCount,
    ] = await Promise.all([
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active').eq('plan', 'essential'),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active').eq('plan', 'serenite'),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active').eq('plan', 'premium'),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).gte('created_at', firstOfMonth),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'canceled').gte('updated_at', firstOfMonth),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'trialing'),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active').eq('duration', 'monthly'),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active').eq('duration', 'quarterly'),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active').eq('duration', 'semiannual'),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active').eq('duration', 'annual'),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('waitlist_discount', true).eq('status', 'active'),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'past_due'),
    ])

    const ess = activeEssential.count || 0
    const ser = activeSerenite.count || 0
    const pre = activePremium.count || 0
    const total = ess + ser + pre

    // Calculate MRR from actual subscribers
    const mrr = ess * PLAN_PRICES.essential + ser * PLAN_PRICES.serenite + pre * PLAN_PRICES.premium

    setStats({
      totalActive: total,
      essential: ess,
      serenite: ser,
      premium: pre,
      newThisMonth: newThisMonth.count || 0,
      canceledThisMonth: canceledThisMonth.count || 0,
      trialingCount: trialingCount.count || 0,
      monthlyCount: monthlyCount.count || 0,
      quarterlyCount: quarterlyCount.count || 0,
      semiannualCount: semiannualCount.count || 0,
      annualCount: annualCount.count || 0,
      mrr: Math.round(mrr),
      waitlistDiscountCount: waitlistCount.count || 0,
      pastDueCount: pastDueCount.count || 0,
    })

    setLoading(false)
    setLastRefresh(new Date())
  }

  useEffect(() => {
    loadStats()
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadStats, 60000)
    return () => clearInterval(interval)
  }, [])

  const daysInMonth = new Date(currentTarget.year, currentTarget.monthIndex + 1, 0).getDate()
  const dayOfMonth = new Date().getDate()
  const monthProgress = (dayOfMonth / daysInMonth) * 100

  // Projected end-of-month values (linear extrapolation)
  const projectedNewSubs = stats ? Math.round((stats.newThisMonth / Math.max(dayOfMonth, 1)) * daysInMonth) : 0
  const projectedMrr = stats ? Math.round((stats.mrr / Math.max(dayOfMonth, 1)) * daysInMonth) : 0

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Objectifs Mensuels
          </h1>
          <p className="mt-1 text-[14px]" style={{ color: 'var(--text-secondary)' }}>
            Suivi en temps réel vs plan de croissance &mdash; {currentTarget.month}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[11px] px-2.5 py-1 rounded-full font-medium"
              style={{ background: `${PHASE_COLORS[currentTarget.phase]}15`, color: PHASE_COLORS[currentTarget.phase] }}>
              Phase : {currentTarget.phase}
            </span>
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Mois {monthIdx + 1}/12
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setLoading(true); loadStats() }}
            className="px-4 py-2 rounded-xl text-[12px] font-medium transition-all cursor-pointer hover:scale-105"
            style={{ background: 'rgba(116,192,252,0.1)', color: '#74C0FC', border: '1px solid rgba(116,192,252,0.2)' }}>
            Rafraîchir
          </button>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            MAJ : {lastRefresh.toLocaleTimeString('fr-FR')}
          </span>
        </div>
      </div>

      {/* Month progress bar */}
      <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
            Progression du mois
          </span>
          <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            Jour {dayOfMonth} / {daysInMonth}
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${monthProgress}%`, background: 'linear-gradient(90deg, #74C0FC, #4DA3E8)' }} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : stats && (
        <>
          {/* Main gauges */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-xl p-6 flex justify-center" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
              <ProgressRing
                value={stats.totalActive}
                max={currentTarget.cumulActive}
                color="#D4AF37"
                label="Abonnés actifs"
                sublabel={`Objectif : ${fmt(currentTarget.cumulActive)}`}
              />
            </div>
            <div className="rounded-xl p-6 flex justify-center" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
              <ProgressRing
                value={stats.newThisMonth}
                max={currentTarget.newSubs}
                color="#55EFC4"
                label="Nouveaux ce mois"
                sublabel={`Objectif : ${fmt(currentTarget.newSubs)}`}
              />
            </div>
            <div className="rounded-xl p-6 flex justify-center" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
              <ProgressRing
                value={stats.mrr}
                max={currentTarget.mrr}
                color="#74C0FC"
                label="MRR actuel"
                sublabel={`Objectif : ${fmtEur(currentTarget.mrr)}`}
              />
            </div>
            <div className="rounded-xl p-6 flex justify-center" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
              <ProgressRing
                value={stats.canceledThisMonth}
                max={currentTarget.churn}
                color={stats.canceledThisMonth > currentTarget.churn ? '#EF4444' : '#A29BFE'}
                label="Churn ce mois"
                sublabel={`Budget : ${fmt(currentTarget.churn)} max`}
              />
            </div>
          </div>

          {/* Detailed progress bars */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By plan */}
            <div className="rounded-xl p-6 space-y-5" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
              <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Répartition par plan
              </h2>
              {(['essential', 'serenite', 'premium'] as const).map(plan => {
                const actual = plan === 'essential' ? stats.essential : plan === 'serenite' ? stats.serenite : stats.premium
                const target = Math.round(currentTarget.cumulActive * PLAN_TARGET_RATIOS[plan])
                return (
                  <ProgressBar
                    key={plan}
                    value={actual}
                    max={target}
                    color={PLAN_COLORS[plan]}
                    label={`${PLAN_LABELS[plan]} (${(PLAN_TARGET_RATIOS[plan] * 100).toFixed(0)}% cible)`}
                    valueLabel={`${fmt(actual)} / ${fmt(target)}`}
                  />
                )
              })}
              <div className="pt-3 mt-3" style={{ borderTop: '1px solid var(--dark-border)' }}>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {(['essential', 'serenite', 'premium'] as const).map(plan => {
                    const actual = plan === 'essential' ? stats.essential : plan === 'serenite' ? stats.serenite : stats.premium
                    const pct = stats.totalActive > 0 ? ((actual / stats.totalActive) * 100).toFixed(1) : '0'
                    return (
                      <div key={plan}>
                        <p className="font-display text-xl font-bold" style={{ color: PLAN_COLORS[plan] }}>{pct}%</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{PLAN_LABELS[plan]}</p>
                        <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Cible : {(PLAN_TARGET_RATIOS[plan] * 100).toFixed(0)}%</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* By duration */}
            <div className="rounded-xl p-6 space-y-5" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
              <h2 className="font-display text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Répartition par durée
              </h2>
              {([
                { key: 'monthly', label: 'Mensuel', actual: stats.monthlyCount, ratio: DURATION_RATIOS.monthly, color: '#E17055' },
                { key: 'quarterly', label: 'Trimestriel (-10%)', actual: stats.quarterlyCount, ratio: DURATION_RATIOS.quarterly, color: '#74C0FC' },
                { key: 'semiannual', label: 'Semestriel (-20%)', actual: stats.semiannualCount, ratio: DURATION_RATIOS.semiannual, color: '#55EFC4' },
                { key: 'annual', label: 'Annuel (-30%)', actual: stats.annualCount, ratio: DURATION_RATIOS.annual, color: '#D4AF37' },
              ]).map(d => {
                const target = Math.round(currentTarget.cumulActive * d.ratio)
                return (
                  <ProgressBar key={d.key} value={d.actual} max={target} color={d.color}
                    label={`${d.label} (${(d.ratio * 100).toFixed(0)}% cible)`}
                    valueLabel={`${fmt(d.actual)} / ${fmt(target)}`}
                  />
                )
              })}
            </div>
          </div>

          {/* Financial KPIs */}
          <div className="rounded-xl p-6" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
            <h2 className="font-display text-lg font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>
              KPIs financiers
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'MRR actuel', value: fmtEur(stats.mrr), target: fmtEur(currentTarget.mrr), color: '#D4AF37', icon: '💰' },
                { label: 'ARR projeté', value: fmtEur(stats.mrr * 12), target: fmtEur(currentTarget.mrr * 12), color: '#55EFC4', icon: '📊' },
                { label: 'ARPU', value: stats.totalActive > 0 ? fmtEur(stats.mrr / stats.totalActive) : '—', target: '~37€', color: '#74C0FC', icon: '👤' },
                { label: 'En essai', value: fmt(stats.trialingCount), target: '', color: '#A29BFE', icon: '⏳' },
                { label: 'Impayés', value: fmt(stats.pastDueCount), target: '', color: stats.pastDueCount > 0 ? '#EF4444' : '#55EFC4', icon: '⚠️' },
                { label: 'Early adopters', value: fmt(stats.waitlistDiscountCount), target: '-10€/mois', color: '#D4AF37', icon: '⭐' },
              ].map(kpi => (
                <div key={kpi.label} className="rounded-lg p-4" style={{ background: `${kpi.color}08`, border: `1px solid ${kpi.color}15` }}>
                  <span className="text-lg">{kpi.icon}</span>
                  <p className="font-display text-xl font-bold mt-2" style={{ color: kpi.color }}>{kpi.value}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{kpi.label}</p>
                  {kpi.target && <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Obj: {kpi.target}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Projections */}
          <div className="rounded-xl p-6" style={{ background: 'rgba(212,175,55,0.03)', border: '1px solid rgba(212,175,55,0.12)' }}>
            <h2 className="font-display text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Projection fin de mois (extrapolation linéaire)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg p-4" style={{ background: 'rgba(85,239,196,0.05)' }}>
                <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Nouveaux abonnés projetés</p>
                <p className="font-display text-2xl font-bold" style={{ color: projectedNewSubs >= currentTarget.newSubs ? '#55EFC4' : '#E17055' }}>
                  ~{fmt(projectedNewSubs)}
                </p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  Objectif : {fmt(currentTarget.newSubs)} &mdash; {projectedNewSubs >= currentTarget.newSubs ? 'En bonne voie' : 'Attention, rythme insuffisant'}
                </p>
              </div>
              <div className="rounded-lg p-4" style={{ background: 'rgba(116,192,252,0.05)' }}>
                <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>MRR projeté fin de mois</p>
                <p className="font-display text-2xl font-bold" style={{ color: projectedMrr >= currentTarget.mrr ? '#55EFC4' : '#E17055' }}>
                  ~{fmtEur(projectedMrr)}
                </p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  Objectif : {fmtEur(currentTarget.mrr)} &mdash; {projectedMrr >= currentTarget.mrr ? 'Objectif atteignable' : 'En dessous de la trajectoire'}
                </p>
              </div>
              <div className="rounded-lg p-4" style={{ background: 'rgba(162,155,254,0.05)' }}>
                <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Taux de rétention estimé</p>
                <p className="font-display text-2xl font-bold" style={{
                  color: stats.totalActive > 0 && stats.canceledThisMonth / stats.totalActive < 0.05 ? '#55EFC4' : '#E17055'
                }}>
                  {stats.totalActive > 0 ? (((stats.totalActive - stats.canceledThisMonth) / stats.totalActive) * 100).toFixed(1) : '100'}%
                </p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  Objectif : &gt;85% &mdash; Churn : {stats.totalActive > 0 ? ((stats.canceledThisMonth / stats.totalActive) * 100).toFixed(1) : '0'}%
                </p>
              </div>
            </div>
          </div>

          {/* Historical comparison */}
          <div className="rounded-xl p-6" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
            <h2 className="font-display text-lg font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>
              Trajectoire Année 1
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--dark-border)' }}>
                    <th className="text-left py-3 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>Mois</th>
                    <th className="text-left py-3 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>Phase</th>
                    <th className="text-right py-3 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>Obj. nouveaux</th>
                    <th className="text-right py-3 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>Obj. actifs</th>
                    <th className="text-right py-3 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>Obj. MRR</th>
                    <th className="text-right py-3 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>Churn max</th>
                    <th className="text-center py-3 px-2 font-medium" style={{ color: 'var(--text-muted)' }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {MONTHLY_TARGETS.map((t, i) => {
                    const isCurrent = i === monthIdx
                    const isPast = i < monthIdx
                    return (
                      <tr key={t.month}
                        style={{
                          borderBottom: '1px solid var(--dark-border)',
                          background: isCurrent ? 'rgba(212,175,55,0.06)' : 'transparent',
                        }}>
                        <td className="py-3 px-2 font-medium" style={{ color: isCurrent ? '#D4AF37' : 'var(--text-primary)' }}>
                          {isCurrent && '▸ '}{t.month}
                        </td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                            style={{ background: `${PHASE_COLORS[t.phase]}15`, color: PHASE_COLORS[t.phase] }}>
                            {t.phase}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right" style={{ color: 'var(--text-secondary)' }}>+{fmt(t.newSubs)}</td>
                        <td className="py-3 px-2 text-right font-semibold" style={{ color: 'var(--text-primary)' }}>{fmt(t.cumulActive)}</td>
                        <td className="py-3 px-2 text-right" style={{ color: '#D4AF37' }}>{fmtEur(t.mrr)}</td>
                        <td className="py-3 px-2 text-right" style={{ color: 'var(--text-muted)' }}>~{fmt(t.churn)}</td>
                        <td className="py-3 px-2 text-center">
                          {isCurrent ? (
                            <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ background: '#D4AF37' }} />
                          ) : isPast ? (
                            <span style={{ color: '#55EFC4' }}>✓</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Milestones */}
          <div className="rounded-xl p-6" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
            <h2 className="font-display text-lg font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>
              Jalons clés
            </h2>
            <div className="space-y-3">
              {MILESTONES.map((m, i) => {
                // Parse milestone date (DD/MM/YYYY)
                const [day, month, year] = m.date.split('/').map(Number)
                const milestoneDate = new Date(year, month - 1, day)
                const isPast = new Date() > milestoneDate
                const targetNum = parseInt(m.label.replace('Cap des ', '')) || 50
                const isReached = stats.totalActive >= targetNum

                return (
                  <div key={i} className="flex items-center gap-4 rounded-lg p-4 transition-all"
                    style={{
                      background: isReached ? 'rgba(85,239,196,0.04)' : isPast ? 'rgba(239,68,68,0.04)' : 'rgba(255,255,255,0.02)',
                      border: isReached ? '1px solid rgba(85,239,196,0.15)' : '1px solid rgba(255,255,255,0.05)',
                    }}>
                    <span className="text-2xl">{m.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[14px]" style={{ color: isReached ? '#55EFC4' : 'var(--text-primary)' }}>
                          {m.label}
                        </p>
                        {isReached && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                            style={{ background: 'rgba(85,239,196,0.15)', color: '#55EFC4' }}>
                            Atteint !
                          </span>
                        )}
                      </div>
                      <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>{m.target}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>{m.date}</p>
                      <p className="text-[11px]" style={{ color: isReached ? '#55EFC4' : 'var(--text-muted)' }}>
                        {stats.totalActive}/{targetNum}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recommendations */}
          <div className="rounded-xl p-6" style={{ background: 'rgba(116,192,252,0.03)', border: '1px solid rgba(116,192,252,0.12)' }}>
            <h2 className="font-display text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Leviers d&apos;action — {currentTarget.phase}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentTarget.phase === 'Lancement' && [
                { text: 'Convertir la waitlist (avantage -10€/mois à vie)', priority: 'Haute' },
                { text: 'Bouche à oreille communauté existante', priority: 'Haute' },
                { text: 'Lancement réseaux sociaux (Instagram, TikTok)', priority: 'Moyenne' },
              ].map((l, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold mt-0.5"
                    style={{ background: l.priority === 'Haute' ? 'rgba(239,68,68,0.15)' : 'rgba(212,175,55,0.15)', color: l.priority === 'Haute' ? '#EF4444' : '#D4AF37' }}>
                    {l.priority}
                  </span>
                  <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{l.text}</p>
                </div>
              ))}
              {currentTarget.phase === 'Croissance' && [
                { text: 'Activer le programme d\'affiliation (4 paliers : 10% → 25%)', priority: 'Haute' },
                { text: 'Contenu organique (encyclopédie bien-être, quiz Signature Émotionnelle)', priority: 'Haute' },
                { text: 'Partenariats avec influenceurs bien-être', priority: 'Moyenne' },
              ].map((l, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold mt-0.5"
                    style={{ background: l.priority === 'Haute' ? 'rgba(239,68,68,0.15)' : 'rgba(212,175,55,0.15)', color: l.priority === 'Haute' ? '#EF4444' : '#D4AF37' }}>
                    {l.priority}
                  </span>
                  <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{l.text}</p>
                </div>
              ))}
              {currentTarget.phase === 'Accélération' && [
                { text: 'Publicité payante (Meta Ads, Google Ads)', priority: 'Haute' },
                { text: 'Événements live pour convertir les essais gratuits', priority: 'Haute' },
                { text: 'Offres spéciales (push abonnements annuels)', priority: 'Moyenne' },
              ].map((l, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold mt-0.5"
                    style={{ background: l.priority === 'Haute' ? 'rgba(239,68,68,0.15)' : 'rgba(212,175,55,0.15)', color: l.priority === 'Haute' ? '#EF4444' : '#D4AF37' }}>
                    {l.priority}
                  </span>
                  <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{l.text}</p>
                </div>
              ))}
              {currentTarget.phase === 'Consolidation' && [
                { text: 'Campagne "bonnes résolutions" bien-être', priority: 'Haute' },
                { text: 'Upsell Essentielle → Sérénité → Premium', priority: 'Haute' },
                { text: 'Optimisation de la rétention (réduire churn à < 3%)', priority: 'Moyenne' },
              ].map((l, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold mt-0.5"
                    style={{ background: l.priority === 'Haute' ? 'rgba(239,68,68,0.15)' : 'rgba(212,175,55,0.15)', color: l.priority === 'Haute' ? '#EF4444' : '#D4AF37' }}>
                    {l.priority}
                  </span>
                  <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{l.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Auto-refresh notice */}
          <div className="text-center py-4">
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Les données se rafraîchissent automatiquement toutes les 60 secondes
            </p>
          </div>
        </>
      )}
    </div>
  )
}
