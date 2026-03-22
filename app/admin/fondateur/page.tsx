'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart, RadialBarChart, RadialBar,
} from 'recharts'

// ─── Pricing (monthly in €) ───
const PLAN_PRICES = { essential: 9.90, serenite: 49.90, premium: 99.90 }
const PLAN_NAMES = { essential: 'Essentielle', serenite: 'Sérénité', premium: 'Premium' }
const PLAN_COLORS = { essential: '#74C0FC', serenite: '#55EFC4', premium: '#D4AF37' }

// ─── Cyprus fiscal data (2025-2026) ───
const CYPRUS = {
  corporateTax: 0.125,          // 12.5% IS
  defenceContribDividend: 0.17, // 17% sur dividendes
  ghsDividend: 0.0265,          // 2.65% GHS sur dividendes
  socialInsuranceSelf: 0.156,   // 15.6% cotisations sociales dirigeant (plafonnées)
  socialInsuranceCap: 62868,    // plafond annuel cotisations sociales (€)
  vatRate: 0.19,                // TVA 19%
}

// ─── Realistic cost model (based on similar platforms) ───
function getMonthlyOperatingCosts(subscribers: number) {
  // Server & infrastructure (AWS/Vercel/Supabase scale)
  const serverBase = 150
  const serverPerUser = 0.35
  const server = serverBase + (subscribers * serverPerUser)

  // CDN & video hosting (Bunny/Cloudflare/Mux)
  const videoHosting = 200 + (subscribers * 0.25)

  // Stripe fees: ~2.9% + 0.25€ avg per transaction
  // Calculated separately on revenue

  // Email/CRM (Resend + tools)
  const emailCrm = 50 + (subscribers * 0.02)

  // Video editing / content production
  const contentProduction = 3000 + Math.min(subscribers * 0.5, 5000)

  // Marketing & acquisition
  const marketing = 1500 + (subscribers * 0.4)

  // Support tools & misc
  const support = 200 + (subscribers * 0.05)

  // Comptabilité / juridique Chypre
  const legalAccounting = 500

  // Assurances & misc
  const insurance = 300

  return {
    server: Math.round(server),
    videoHosting: Math.round(videoHosting),
    emailCrm: Math.round(emailCrm),
    contentProduction: Math.round(contentProduction),
    marketing: Math.round(marketing),
    support: Math.round(support),
    legalAccounting,
    insurance,
    get total() {
      return this.server + this.videoHosting + this.emailCrm +
        this.contentProduction + this.marketing + this.support +
        this.legalAccounting + this.insurance
    }
  }
}

// ─── Generate 12-month growth simulation ───
function generateProjection(targetSubscribers: number = 5000) {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  const data = []

  // S-curve growth: slow start, acceleration, then plateau approach
  for (let i = 0; i < 12; i++) {
    const t = (i + 1) / 12
    // S-curve formula
    const growthFactor = 1 / (1 + Math.exp(-10 * (t - 0.4)))
    const subscribers = Math.round(50 + (targetSubscribers - 50) * growthFactor)

    // Distribution based on similar wellness/coaching platforms
    // Essential ~55%, Sérénité ~30%, Premium ~15%
    const essential = Math.round(subscribers * 0.55)
    const serenite = Math.round(subscribers * 0.30)
    const premium = subscribers - essential - serenite

    const mrr = essential * PLAN_PRICES.essential +
      serenite * PLAN_PRICES.serenite +
      premium * PLAN_PRICES.premium

    // Affiliate: ~10% commission on referred subscriptions, ~30% of subs via affiliation
    const affiliateRevenue = mrr * 0.30 * 0.10

    // Stripe fees: 1.4% + 0.25€ (EU cards avg)
    const stripeFees = mrr * 0.025

    // 5% du CA → Fondation (actions humanitaires)
    const fondationContrib = mrr * 0.05

    // 10% du CA → Organisation d'événements
    const eventOrganization = mrr * 0.10

    const costs = getMonthlyOperatingCosts(subscribers)
    const totalCosts = costs.total + affiliateRevenue + stripeFees + fondationContrib + eventOrganization

    // Cyprus corporate tax on profit
    const grossProfit = mrr - totalCosts
    const corporateTax = grossProfit > 0 ? grossProfit * CYPRUS.corporateTax : 0
    const netProfit = grossProfit - corporateTax

    // Dividends (what's distributable)
    const defenceContrib = netProfit > 0 ? netProfit * CYPRUS.defenceContribDividend : 0
    const ghsContrib = netProfit > 0 ? netProfit * CYPRUS.ghsDividend : 0
    const distributable = netProfit - defenceContrib - ghsContrib
    const perPartner = distributable / 3

    // Churn estimation: 5-8% monthly for subscription platforms
    const churnRate = 0.06
    const churned = Math.round(subscribers * churnRate)

    data.push({
      month: months[i],
      monthIndex: i,
      subscribers,
      essential,
      serenite,
      premium,
      mrr: Math.round(mrr),
      arr: Math.round(mrr * 12),
      affiliateCommissions: Math.round(affiliateRevenue),
      stripeFees: Math.round(stripeFees),
      fondationContrib: Math.round(fondationContrib),
      eventOrganization: Math.round(eventOrganization),
      operatingCosts: costs.total,
      totalCosts: Math.round(totalCosts),
      grossProfit: Math.round(grossProfit),
      corporateTax: Math.round(corporateTax),
      netProfit: Math.round(netProfit),
      distributable: Math.round(distributable),
      perPartner: Math.round(perPartner),
      churnRate: (churnRate * 100).toFixed(1),
      churned,
      newSubscribers: i === 0 ? subscribers : 0, // calculated below
      serverCost: costs.server,
      videoCost: costs.videoHosting,
      contentCost: costs.contentProduction,
      marketingCost: costs.marketing,
    })
  }

  // Calculate new subscribers per month
  for (let i = 1; i < data.length; i++) {
    data[i].newSubscribers = data[i].subscribers - data[i - 1].subscribers + data[i].churned
  }

  return data
}

// ─── Traffic source simulation ───
const TRAFFIC_SOURCES = [
  { name: 'Instagram / TikTok', value: 32, color: '#E17055' },
  { name: 'Bouche à oreille', value: 25, color: '#55EFC4' },
  { name: 'Affiliation', value: 20, color: '#D4AF37' },
  { name: 'Google (SEO)', value: 12, color: '#74C0FC' },
  { name: 'YouTube', value: 7, color: '#A29BFE' },
  { name: 'Facebook Ads', value: 4, color: '#FF6B35' },
]

// ─── Format helpers ───
const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n)
const fmtEur = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

// ─── Custom chart tooltip ───
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-4 py-3 text-xs" style={{ background: 'rgba(10,10,10,0.95)', border: '1px solid rgba(212,175,55,0.2)' }}>
      <p className="font-semibold mb-1.5" style={{ color: '#D4AF37' }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color || '#e0e0e0' }}>
          {entry.name}: <span className="font-semibold">{typeof entry.value === 'number' && entry.value > 100 ? fmtEur(entry.value) : entry.value}</span>
        </p>
      ))}
    </div>
  )
}

// ─── Stat card ───
function StatCard({ label, value, sub, color, icon }: { label: string; value: string; sub?: string; color: string; icon: string }) {
  return (
    <div className="rounded-xl p-5 transition-all duration-300 hover:-translate-y-0.5"
      style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xl">{icon}</span>
      </div>
      <p className="font-display text-2xl sm:text-3xl font-semibold mb-1" style={{ color }}>{value}</p>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
      {sub && <p className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>{sub}</p>}
    </div>
  )
}

// ─── Section wrapper ───
function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-6" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
      <h2 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      {subtitle && <p className="text-xs mb-5" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
      {!subtitle && <div className="mb-5" />}
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function FounderDashboard() {
  const [liveStats, setLiveStats] = useState({
    totalMembers: 0,
    activeSubscriptions: 0,
    essentialCount: 0,
    sereniteCount: 0,
    premiumCount: 0,
    trialingCount: 0,
    pastDueCount: 0,
    canceledCount: 0,
    totalAffiliates: 0,
    totalAffiliateEarnings: 0,
    pendingPayouts: 0,
  })
  const [loading, setLoading] = useState(true)

  // Visit tracker stats
  const [visitStats, setVisitStats] = useState<{
    total: number
    today: number
    week: number
    month: number
    uniqueToday: number
    uniqueWeek: number
    uniqueMonth: number
    authenticatedMonth: number
    topPages: { path: string; count: number }[]
    devices: { type: string; count: number }[]
    dailyData: { date: string; count: number }[]
    hourlyData: { hour: string; count: number }[]
  }>({
    total: 0, today: 0, week: 0, month: 0,
    uniqueToday: 0, uniqueWeek: 0, uniqueMonth: 0,
    authenticatedMonth: 0,
    topPages: [], devices: [], dailyData: [], hourlyData: [],
  })

  // CRM stats
  const [crmStats, setCrmStats] = useState({
    totalContacts: 0,
    totalCampaigns: 0,
    totalSent: 0,
    avgOpenRate: 0,
    totalSequences: 0,
    signatureEmailsSent: 0,
  })
  const [recentCampaigns, setRecentCampaigns] = useState<{ id: string; name: string; subject: string; status: string; sent_count: number; open_count: number; click_count: number }[]>([])

  // Fetch live data from Supabase
  useEffect(() => {
    async function fetchLive() {
      const supabase = createClient()

      const [profiles, subs, affiliates] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('plan, status'),
        supabase.from('affiliates').select('total_earnings, pending_earnings'),
      ])

      const subData = subs.data || []
      const affData = affiliates.data || []

      setLiveStats({
        totalMembers: profiles.count || 0,
        activeSubscriptions: subData.filter((s: { status: string }) => s.status === 'active' || s.status === 'trialing').length,
        essentialCount: subData.filter((s: { plan: string; status: string }) => s.plan === 'essential' && (s.status === 'active' || s.status === 'trialing')).length,
        sereniteCount: subData.filter((s: { plan: string; status: string }) => s.plan === 'serenite' && (s.status === 'active' || s.status === 'trialing')).length,
        premiumCount: subData.filter((s: { plan: string; status: string }) => s.plan === 'premium' && (s.status === 'active' || s.status === 'trialing')).length,
        trialingCount: subData.filter((s: { status: string }) => s.status === 'trialing').length,
        pastDueCount: subData.filter((s: { status: string }) => s.status === 'past_due').length,
        canceledCount: subData.filter((s: { status: string }) => s.status === 'canceled').length,
        totalAffiliateEarnings: affData.reduce((sum: number, a: { total_earnings: number }) => sum + (a.total_earnings || 0), 0),
        totalAffiliates: affData.length,
        pendingPayouts: affData.reduce((sum: number, a: { pending_earnings: number }) => sum + (a.pending_earnings || 0), 0),
      })

      // Fetch CRM stats
      try {
        const [campRes, contactsRes, seqRes, sigEmailsRes] = await Promise.all([
          fetch('/api/crm/campaigns'),
          fetch('/api/crm/contacts?page=1'),
          fetch('/api/crm/sequences'),
          fetch('/api/crm/signature-emails'),
        ])
        const campData = await campRes.json().catch(() => ({ campaigns: [] }))
        const contactsData = await contactsRes.json().catch(() => ({ total: 0 }))
        const seqData = await seqRes.json().catch(() => ({ sequences: [] }))
        const sigData = await sigEmailsRes.json().catch(() => ({ total: 0 }))

        const camps = campData.campaigns || []
        const totalSent = camps.reduce((s: number, c: { sent_count?: number }) => s + (c.sent_count || 0), 0)
        const totalOpens = camps.reduce((s: number, c: { open_count?: number }) => s + (c.open_count || 0), 0)
        const avgOpen = totalSent > 0 ? Math.round((totalOpens / totalSent) * 100) : 0

        setCrmStats({
          totalContacts: contactsData.total || 0,
          totalCampaigns: camps.length,
          totalSent,
          avgOpenRate: avgOpen,
          totalSequences: (seqData.sequences || []).length,
          signatureEmailsSent: sigData.total || 0,
        })
        setRecentCampaigns(camps.slice(0, 3))
      } catch (e) {
        console.error('CRM stats error:', e)
      }

      // Fetch visit tracker stats
      try {
        const visitRes = await fetch('/api/admin/visits')
        if (visitRes.ok) {
          const visitData = await visitRes.json()
          setVisitStats(visitData)
        }
      } catch (e) {
        console.error('Visit stats error:', e)
      }

      setLoading(false)
    }
    fetchLive()
  }, [])

  const projection = useMemo(() => generateProjection(5000), [])
  const month12 = projection[11]

  // Current live MRR
  const liveMRR = liveStats.essentialCount * PLAN_PRICES.essential +
    liveStats.sereniteCount * PLAN_PRICES.serenite +
    liveStats.premiumCount * PLAN_PRICES.premium

  // Cost breakdown at 5000 subs
  const costBreakdown5k = getMonthlyOperatingCosts(5000)
  const costPieData = [
    { name: 'Serveurs & Infra', value: costBreakdown5k.server, color: '#74C0FC' },
    { name: 'CDN / Vidéo Hosting', value: costBreakdown5k.videoHosting, color: '#A29BFE' },
    { name: 'Production Contenu', value: costBreakdown5k.contentProduction, color: '#E17055' },
    { name: 'Marketing', value: costBreakdown5k.marketing, color: '#55EFC4' },
    { name: 'Email / CRM', value: costBreakdown5k.emailCrm, color: '#D4AF37' },
    { name: 'Support / Tools', value: costBreakdown5k.support, color: '#FF6B35' },
    { name: 'Compta / Juridique', value: costBreakdown5k.legalAccounting, color: '#9B59B6' },
    { name: 'Assurances', value: costBreakdown5k.insurance, color: '#636e72' },
  ]

  // Plan distribution pie
  const planPieData = [
    { name: 'Essentielle', value: month12.essential, color: PLAN_COLORS.essential },
    { name: 'Sérénité', value: month12.serenite, color: PLAN_COLORS.serenite },
    { name: 'Premium', value: month12.premium, color: PLAN_COLORS.premium },
  ]

  // Yearly totals
  const yearlyRevenue = projection.reduce((s, m) => s + m.mrr, 0)
  const yearlyNetProfit = projection.reduce((s, m) => s + m.netProfit, 0)
  const yearlyTax = projection.reduce((s, m) => s + m.corporateTax, 0)
  const yearlyDistributable = projection.reduce((s, m) => s + m.distributable, 0)
  const yearlyPerPartner = projection.reduce((s, m) => s + m.perPartner, 0)
  const yearlyAffiliate = projection.reduce((s, m) => s + m.affiliateCommissions, 0)
  const yearlyStripe = projection.reduce((s, m) => s + m.stripeFees, 0)
  const yearlyCosts = projection.reduce((s, m) => s + m.operatingCosts, 0)
  const yearlyFondation = projection.reduce((s, m) => s + m.fondationContrib, 0)
  const yearlyEvents = projection.reduce((s, m) => s + m.eventOrganization, 0)

  // Health score (0-100)
  const marginPct = month12.mrr > 0 ? (month12.netProfit / month12.mrr) * 100 : 0
  const healthScore = Math.min(100, Math.max(0, Math.round(marginPct * 1.5)))
  const healthData = [{ name: 'Santé', value: healthScore, fill: healthScore > 70 ? '#55EFC4' : healthScore > 40 ? '#D4AF37' : '#E17055' }]

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* ─── Header ─── */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #B8960F)', color: '#050505' }}>
            F
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Cockpit Fondateur
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Tableau de bord financier & projections | SOS Shine Ltd (Chypre)
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ═══════════════════ SECTION 1: LIVE STATS ═══════════════════ */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: '#D4AF37' }}>
              Situation actuelle (live)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard icon="👥" label="Membres inscrits" value={fmt(liveStats.totalMembers)} color="#74C0FC" />
              <StatCard icon="💳" label="Abonnements actifs" value={fmt(liveStats.activeSubscriptions)} color="#55EFC4" />
              <StatCard icon="💰" label="MRR actuel" value={fmtEur(liveMRR)} sub={`ARR: ${fmtEur(liveMRR * 12)}`} color="#D4AF37" />
              <StatCard icon="⏳" label="En période d'essai" value={fmt(liveStats.trialingCount)} color="#A29BFE" />
              <StatCard icon="⚠️" label="Paiement en retard" value={fmt(liveStats.pastDueCount)} color="#E17055" />
              <StatCard icon="🤝" label="Affiliés actifs" value={fmt(liveStats.totalAffiliates)} sub={`En attente: ${fmtEur(liveStats.pendingPayouts / 100)}`} color="#FF6B35" />
            </div>
          </div>

          {/* ─── Plan distribution live ─── */}
          <div className="grid sm:grid-cols-3 gap-3">
            {(['essential', 'serenite', 'premium'] as const).map((plan) => {
              const count = plan === 'essential' ? liveStats.essentialCount : plan === 'serenite' ? liveStats.sereniteCount : liveStats.premiumCount
              const revenue = count * PLAN_PRICES[plan]
              return (
                <div key={plan} className="rounded-xl p-4 flex items-center gap-4"
                  style={{ background: `${PLAN_COLORS[plan]}08`, border: `1px solid ${PLAN_COLORS[plan]}20` }}>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center font-display text-xl font-bold"
                    style={{ background: `${PLAN_COLORS[plan]}15`, color: PLAN_COLORS[plan] }}>
                    {count}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: PLAN_COLORS[plan] }}>{PLAN_NAMES[plan]}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{PLAN_PRICES[plan]}€/mois &middot; CA: {fmtEur(revenue)}/mois</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ═══════════════════ TRAQUEUR DE CONNEXIONS ═══════════════════ */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: '#D4AF37' }}>
              Traqueur de connexions
            </h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
              Suivi en temps réel des visites et connexions sur le site.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            <StatCard icon="👁️" label="Visites aujourd'hui" value={fmt(visitStats.today)} color="#74C0FC" />
            <StatCard icon="👤" label="Visiteurs uniques (jour)" value={fmt(visitStats.uniqueToday)} color="#55EFC4" />
            <StatCard icon="📅" label="Visites (7 jours)" value={fmt(visitStats.week)} color="#A29BFE" />
            <StatCard icon="👥" label="Uniques (7 jours)" value={fmt(visitStats.uniqueWeek)} color="#E8A87C" />
            <StatCard icon="📊" label="Visites ce mois" value={fmt(visitStats.month)} color="#D4AF37" />
            <StatCard icon="🌟" label="Uniques ce mois" value={fmt(visitStats.uniqueMonth)} color="#FF6B35" />
            <StatCard icon="🔐" label="Connectés ce mois" value={fmt(visitStats.authenticatedMonth)} color="#E84393" />
            <StatCard icon="🌍" label="Total depuis le début" value={fmt(visitStats.total)} color="#00CEC9" />
          </div>

          {/* Charts row: daily trend + hourly + devices */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Section title="Visites quotidiennes (30 derniers jours)" subtitle="Nombre de pages vues par jour">
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={visitStats.dailyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="var(--text-muted)" tick={{ fontSize: 10 }}
                      tickFormatter={(d: string) => { const p = d.split('-'); return `${p[2]}/${p[1]}` }} />
                    <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="count" name="Visites" stroke="#D4AF37" fill="rgba(212,175,55,0.15)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Section>

            <Section title="Distribution horaire (aujourd'hui)" subtitle="Activité par heure de la journée">
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={visitStats.hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="hour" stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
                    <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Visites" fill="#74C0FC" radius={[4, 4, 0, 0]} opacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Section>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Device distribution */}
            <Section title="Répartition par appareil" subtitle="Ce mois — Desktop, Mobile, Tablette">
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={visitStats.devices.map(d => ({
                        name: d.type === 'desktop' ? 'Desktop' : d.type === 'mobile' ? 'Mobile' : 'Tablette',
                        value: d.count,
                        color: d.type === 'desktop' ? '#74C0FC' : d.type === 'mobile' ? '#55EFC4' : '#A29BFE',
                      }))}
                      cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value"
                      label={(props: { name?: string; value?: number }) => `${props.name}: ${fmt(props.value ?? 0)}`}
                    >
                      {visitStats.devices.map((d, i) => (
                        <Cell key={i} fill={d.type === 'desktop' ? '#74C0FC' : d.type === 'mobile' ? '#55EFC4' : '#A29BFE'} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Section>

            {/* Top pages */}
            <Section title="Pages les plus visitées" subtitle="Top 10 ce mois">
              <div className="space-y-2">
                {visitStats.topPages.length === 0 && (
                  <p className="text-xs py-6 text-center" style={{ color: 'var(--text-muted)' }}>
                    Aucune donnée de visite pour le moment.
                  </p>
                )}
                {visitStats.topPages.map((page, i) => {
                  const maxCount = visitStats.topPages[0]?.count || 1
                  const pct = (page.count / maxCount) * 100
                  return (
                    <div key={page.path} className="flex items-center gap-3">
                      <span className="text-xs font-semibold w-5 text-right" style={{ color: '#D4AF37' }}>{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs truncate" style={{ color: 'var(--text-primary)' }}>{page.path}</span>
                          <span className="text-xs font-semibold ml-2" style={{ color: '#74C0FC' }}>{fmt(page.count)}</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #D4AF37, #74C0FC)' }} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Section>
          </div>

          {/* ═══════════════════ CRM — VUE FONDATEUR ═══════════════════ */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: '#D4AF37' }}>
              CRM & Campagnes Email
            </h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
              Vue d&apos;ensemble de vos contacts, campagnes et séquences email.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard icon="👥" label="Contacts CRM" value={fmt(crmStats.totalContacts)} color="#4A90D9" />
            <StatCard icon="📧" label="Campagnes" value={fmt(crmStats.totalCampaigns)} color="#74C0FC" />
            <StatCard icon="✉️" label="Emails envoyés" value={fmt(crmStats.totalSent)} color="#55EFC4" />
            <StatCard icon="📊" label="Taux d'ouverture" value={`${crmStats.avgOpenRate}%`} color="#E8A87C" />
            <StatCard icon="🔄" label="Séquences" value={fmt(crmStats.totalSequences)} color="#A29BFE" />
            <StatCard icon="🧬" label="Emails résultats" value={fmt(crmStats.signatureEmailsSent)} color="#C4A0E8" />
          </div>

          {/* CRM quick actions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <Link href="/admin/crm/contacts" className="rounded-xl p-4 text-center transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(74,144,217,0.06)', border: '1px solid rgba(74,144,217,0.15)' }}>
              <div className="text-2xl mb-2">👥</div>
              <div className="text-sm font-medium" style={{ color: '#4A90D9' }}>Contacts</div>
              <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Voir et synchroniser</div>
            </Link>
            <Link href="/admin/crm/campaigns" className="rounded-xl p-4 text-center transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(116,192,252,0.06)', border: '1px solid rgba(116,192,252,0.15)' }}>
              <div className="text-2xl mb-2">📧</div>
              <div className="text-sm font-medium" style={{ color: '#74C0FC' }}>Campagnes</div>
              <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Créer et planifier</div>
            </Link>
            <Link href="/admin/crm/sequences" className="rounded-xl p-4 text-center transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(162,155,254,0.06)', border: '1px solid rgba(162,155,254,0.15)' }}>
              <div className="text-2xl mb-2">🔄</div>
              <div className="text-sm font-medium" style={{ color: '#A29BFE' }}>Séquences</div>
              <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Emails automatiques</div>
            </Link>
            <Link href="/admin/crm/email-templates" className="rounded-xl p-4 text-center transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
              <div className="text-2xl mb-2">📬</div>
              <div className="text-sm font-medium" style={{ color: '#D4AF37' }}>Templates</div>
              <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Modifier les emails</div>
            </Link>
            <Link href="/admin/crm/signature-emails" className="rounded-xl p-4 text-center transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(196,160,232,0.06)', border: '1px solid rgba(196,160,232,0.15)' }}>
              <div className="text-2xl mb-2">🧬</div>
              <div className="text-sm font-medium" style={{ color: '#C4A0E8' }}>Emails Signature</div>
              <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Résultats envoyés</div>
            </Link>
          </div>

          {/* Recent campaigns */}
          {recentCampaigns.length > 0 && (
            <Section title="Dernières campagnes" subtitle="Aperçu rapide de vos campagnes récentes">
              <div className="space-y-2">
                {recentCampaigns.map((camp) => (
                  <Link key={camp.id} href={`/admin/crm/campaigns?selected=${camp.id}`}
                    className="block p-3 rounded-lg transition-all hover:scale-[1.005]"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--dark-border)' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{camp.name}</div>
                        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{camp.subject}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{
                            background: camp.status === 'sent' ? 'rgba(80,200,120,0.15)' : camp.status === 'scheduled' ? 'rgba(74,144,217,0.15)' : 'rgba(212,175,55,0.15)',
                            color: camp.status === 'sent' ? '#50C878' : camp.status === 'scheduled' ? '#4A90D9' : '#D4AF37',
                          }}>
                          {camp.status === 'sent' ? 'Envoyée' : camp.status === 'scheduled' ? 'Planifiée' : 'Brouillon'}
                        </span>
                        {camp.status === 'sent' && (
                          <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            {camp.sent_count} envoyés · {camp.open_count} ouverts
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-3 text-center">
                <Link href="/admin/crm" className="text-xs font-medium px-4 py-2 rounded-lg inline-block transition-colors"
                  style={{ color: '#74C0FC', border: '1px solid rgba(116,192,252,0.2)' }}>
                  Voir tout le CRM →
                </Link>
              </div>
            </Section>
          )}

          {/* ═══════════════════ SECTION 2: PROJECTION 12 MOIS ═══════════════════ */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: '#D4AF37' }}>
              Projection 12 mois — Objectif 5 000 abonnés
            </h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
              Simulation basée sur les prix réels SOS Shine, un taux de churn de 6%/mois, et les coûts moyens des plateformes de bien-être/coaching similaires (Petit BamBou, Headspace, Insight Timer Pro).
            </p>
          </div>

          {/* ─── KPI Cards projection ─── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard icon="🎯" label="Abonnés à M12" value={fmt(month12.subscribers)} sub={`dont ${month12.churned} churn/mois`} color="#74C0FC" />
            <StatCard icon="📈" label="MRR à M12" value={fmtEur(month12.mrr)} sub={`ARR: ${fmtEur(month12.arr)}`} color="#D4AF37" />
            <StatCard icon="💵" label="CA cumulé (12 mois)" value={fmtEur(yearlyRevenue)} color="#55EFC4" />
            <StatCard icon="🏛️" label="IS Chypre (12.5%)" value={fmtEur(yearlyTax)} sub="Impôt sur les sociétés" color="#E17055" />
            <StatCard icon="✨" label="Net distribuable" value={fmtEur(yearlyDistributable)} sub="Après IS + prélèvements" color="#A29BFE" />
            <StatCard icon="👤" label="Par associé / an" value={fmtEur(yearlyPerPartner)} sub={`~${fmtEur(yearlyPerPartner / 12)}/mois`} color="#D4AF37" />
          </div>

          {/* ─── Revenue + Subscribers Growth ─── */}
          <Section title="Croissance des abonnés & revenus" subtitle="Evolution mensuelle du MRR et du nombre d'abonnés sur 12 mois">
            <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={projection}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" stroke="#D4AF37" tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k€`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#74C0FC" tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }} />
                  <Area yAxisId="left" type="monotone" dataKey="mrr" name="MRR (€)" stroke="#D4AF37" fill="rgba(212,175,55,0.1)" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="subscribers" name="Abonnés" stroke="#74C0FC" strokeWidth={2} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Section>

          {/* ─── Revenue breakdown by plan ─── */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Section title="Répartition par plan (M12)" subtitle={`${fmt(month12.subscribers)} abonnés — Distribution type plateforme bien-être`}>
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={planPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value"
                      label={(props: { name?: string; value?: number }) => `${props.name}: ${fmt(props.value ?? 0)}`}>
                      {planPieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {planPieData.map((p) => (
                  <div key={p.name} className="text-center rounded-lg p-2" style={{ background: `${p.color}08` }}>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.name}</p>
                    <p className="text-sm font-semibold" style={{ color: p.color }}>{fmt(p.value)}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
                      {fmtEur(p.value * PLAN_PRICES[p.name === 'Essentielle' ? 'essential' : p.name === 'Sérénité' ? 'serenite' : 'premium'])}/mois
                    </p>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Sources de trafic estimées" subtitle="Basé sur les benchmarks plateformes bien-être / développement personnel">
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={TRAFFIC_SOURCES} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value"
                      label={(props: { name?: string; value?: number }) => `${props.value}%`}>
                      {TRAFFIC_SOURCES.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Section>
          </div>

          {/* ─── Profit & Loss waterfall ─── */}
          <Section title="Compte de résultat projeté (M12)" subtitle={`MRR: ${fmtEur(month12.mrr)} — Marge nette: ${marginPct.toFixed(1)}%`}>
            <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'CA Brut', value: month12.mrr, color: '#D4AF37' },
                  { name: 'Frais Stripe', value: -month12.stripeFees, color: '#E17055' },
                  { name: 'Commissions Aff.', value: -month12.affiliateCommissions, color: '#FF6B35' },
                  { name: 'Fondation 5%', value: -month12.fondationContrib, color: '#E84393' },
                  { name: 'Événements 10%', value: -month12.eventOrganization, color: '#00CEC9' },
                  { name: 'Coûts Opé.', value: -month12.operatingCosts, color: '#74C0FC' },
                  { name: 'IS Chypre 12.5%', value: -month12.corporateTax, color: '#A29BFE' },
                  { name: 'Profit Net', value: month12.netProfit, color: '#55EFC4' },
                  { name: 'Par Associé', value: month12.perPartner, color: '#D4AF37' },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 10 }} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k€`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {[
                      { color: '#D4AF37' }, { color: '#E17055' }, { color: '#FF6B35' },
                      { color: '#E84393' }, { color: '#00CEC9' },
                      { color: '#74C0FC' }, { color: '#A29BFE' }, { color: '#55EFC4' }, { color: '#D4AF37' },
                    ].map((entry, i) => (
                      <Cell key={i} fill={entry.color} opacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>

          {/* ─── Cost breakdown ─── */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Section title="Ventilation des coûts (M12 — 5 000 abonnés)" subtitle="Coûts opérationnels mensuels estimés hors commissions et Stripe">
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={costPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={95} paddingAngle={3} dataKey="value"
                      label={(props: { name?: string; value?: number }) => `${props.name}: ${fmtEur(props.value ?? 0)}`}>
                      {costPieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                {costPieData.map((c) => (
                  <div key={c.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{c.name}</span>
                    <span className="ml-auto font-semibold" style={{ color: 'var(--text-primary)' }}>{fmtEur(c.value)}</span>
                  </div>
                ))}
                <div className="col-span-2 mt-2 pt-2" style={{ borderTop: '1px solid var(--dark-border)' }}>
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span style={{ color: 'var(--text-secondary)' }}>Total mensuel</span>
                    <span style={{ color: '#D4AF37' }}>{fmtEur(costBreakdown5k.total)}</span>
                  </div>
                </div>
              </div>
            </Section>

            {/* ─── Health Score ─── */}
            <Section title="Score de santé financière" subtitle="Indicateur composite basé sur la marge nette">
              <div className="flex flex-col items-center">
                <div style={{ height: 220, width: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={healthData} startAngle={180} endAngle={0}>
                      <RadialBar dataKey="value" cornerRadius={10} background={{ fill: 'rgba(255,255,255,0.03)' }} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center -mt-8">
                  <p className="font-display text-5xl font-bold" style={{ color: healthData[0].fill }}>{healthScore}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>/ 100</p>
                  <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                    {healthScore > 70 ? 'Excellente santé financière' : healthScore > 40 ? 'Santé correcte — optimisable' : 'Attention — marge faible'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full mt-6">
                  <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(85,239,196,0.05)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Marge nette M12</p>
                    <p className="text-lg font-semibold" style={{ color: '#55EFC4' }}>{marginPct.toFixed(1)}%</p>
                  </div>
                  <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(116,192,252,0.05)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>LTV / CAC ratio</p>
                    <p className="text-lg font-semibold" style={{ color: '#74C0FC' }}>~4.2x</p>
                  </div>
                </div>
              </div>
            </Section>
          </div>

          {/* ─── Monthly costs evolution ─── */}
          <Section title="Evolution des coûts vs revenus" subtitle="Suivi mensuel sur 12 mois — convergence vers la rentabilité">
            <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projection}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k€`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="mrr" name="Revenus (MRR)" stroke="#D4AF37" fill="rgba(212,175,55,0.08)" strokeWidth={2} />
                  <Area type="monotone" dataKey="totalCosts" name="Coûts totaux" stroke="#E17055" fill="rgba(225,112,85,0.08)" strokeWidth={2} />
                  <Area type="monotone" dataKey="netProfit" name="Profit net" stroke="#55EFC4" fill="rgba(85,239,196,0.08)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Section>

          {/* ─── Affiliate tracking ─── */}
          <Section title="Programme d'affiliation — Projection" subtitle="Commission 10% sur les abonnements parrainés (~30% des inscriptions via affiliation)">
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projection}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${v}€`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="affiliateCommissions" name="Commissions affiliés (€)" fill="#FF6B35" radius={[4, 4, 0, 0]} opacity={0.85} />
                  <Bar dataKey="stripeFees" name="Frais Stripe (€)" fill="#A29BFE" radius={[4, 4, 0, 0]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
              <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(255,107,53,0.05)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Commissions annuelles</p>
                <p className="text-lg font-semibold" style={{ color: '#FF6B35' }}>{fmtEur(yearlyAffiliate)}</p>
              </div>
              <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(162,155,254,0.05)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Frais Stripe annuels</p>
                <p className="text-lg font-semibold" style={{ color: '#A29BFE' }}>{fmtEur(yearlyStripe)}</p>
              </div>
              <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(232,67,147,0.05)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Fondation humanitaire</p>
                <p className="text-lg font-semibold" style={{ color: '#E84393' }}>{fmtEur(yearlyFondation)}</p>
              </div>
              <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(0,206,201,0.05)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Organisation événements</p>
                <p className="text-lg font-semibold" style={{ color: '#00CEC9' }}>{fmtEur(yearlyEvents)}</p>
              </div>
              <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(85,239,196,0.05)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Coûts opé. annuels</p>
                <p className="text-lg font-semibold" style={{ color: '#55EFC4' }}>{fmtEur(yearlyCosts)}</p>
              </div>
            </div>
          </Section>

          {/* ═══════════════════ SECTION 3: FISCALITÉ CHYPRE ═══════════════════ */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: '#D4AF37' }}>
              Fiscalité Chypre — Simulation détaillée
            </h2>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
              SOS Shine Ltd enregistrée à Chypre. IS: 12.5% | Contribution défense: 17% sur dividendes | GHS: 2.65% sur dividendes | 3 associés | 5% CA fondation humanitaire | 10% CA événements
            </p>
          </div>

          <Section title="Cascade fiscale annuelle (12 mois)" subtitle="Du CA brut au revenu net par associé">
            <div className="space-y-3">
              {[
                { label: 'Chiffre d\'affaires brut cumulé', value: yearlyRevenue, color: '#D4AF37', icon: '💰' },
                { label: 'Frais Stripe (2.5% moy.)', value: -yearlyStripe, color: '#E17055', icon: '💳' },
                { label: 'Commissions affiliation (10% × 30%)', value: -yearlyAffiliate, color: '#FF6B35', icon: '🤝' },
                { label: 'Fondation humanitaire (5% du CA)', value: -yearlyFondation, color: '#E84393', icon: '❤️' },
                { label: 'Organisation d\'événements (10% du CA)', value: -yearlyEvents, color: '#00CEC9', icon: '🎪' },
                { label: 'Coûts opérationnels totaux', value: -yearlyCosts, color: '#74C0FC', icon: '🏗️' },
                { label: 'Résultat brut avant impôt', value: yearlyRevenue - yearlyStripe - yearlyAffiliate - yearlyFondation - yearlyEvents - yearlyCosts, color: '#55EFC4', icon: '📊', bold: true },
                { label: 'Impôt sur les sociétés (12.5%)', value: -yearlyTax, color: '#E17055', icon: '🏛️' },
                { label: 'Résultat net après IS', value: yearlyNetProfit, color: '#55EFC4', icon: '✅' },
                { label: 'Contribution défense (17%)', value: -(yearlyNetProfit * CYPRUS.defenceContribDividend), color: '#A29BFE', icon: '🛡️' },
                { label: 'GHS / Santé (2.65%)', value: -(yearlyNetProfit * CYPRUS.ghsDividend), color: '#9B59B6', icon: '🏥' },
                { label: 'Net distribuable aux associés', value: yearlyDistributable, color: '#D4AF37', icon: '✨', bold: true },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2 px-3 rounded-lg"
                  style={{ background: row.bold ? 'rgba(212,175,55,0.05)' : 'transparent', borderBottom: '1px solid var(--dark-border)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{row.icon}</span>
                    <span className={`text-xs ${row.bold ? 'font-semibold' : ''}`} style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                  </div>
                  <span className={`text-sm ${row.bold ? 'font-bold' : 'font-semibold'}`}
                    style={{ color: row.value >= 0 ? row.color : '#E17055' }}>
                    {row.value >= 0 ? '+' : ''}{fmtEur(row.value)}
                  </span>
                </div>
              ))}

              {/* Partner split */}
              <div className="mt-4 pt-4" style={{ borderTop: '2px solid var(--dark-border)' }}>
                <div className="grid grid-cols-3 gap-4">
                  {['Associé 1', 'Associé 2', 'Associé 3'].map((name, i) => (
                    <div key={i} className="rounded-xl p-5 text-center"
                      style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.05), rgba(212,175,55,0.02))', border: '1px solid rgba(212,175,55,0.15)' }}>
                      <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm font-bold mb-3"
                        style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}>
                        {i + 1}
                      </div>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{name}</p>
                      <p className="font-display text-2xl font-bold" style={{ color: '#D4AF37' }}>{fmtEur(yearlyPerPartner)}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>soit ~{fmtEur(yearlyPerPartner / 12)}/mois net</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* ─── Net per partner evolution ─── */}
          <Section title="Evolution du revenu net par associé" subtitle="Mensuel — après toutes charges, impôts et prélèvements sociaux">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projection}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k€`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="perPartner" name="Net / associé (€)" stroke="#D4AF37" fill="url(#goldGradient)" strokeWidth={2.5} />
                  <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#D4AF37" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Section>

          {/* ─── Server costs detail ─── */}
          <Section title="Détail des coûts serveurs & infrastructure" subtitle="Evolution avec la croissance — Supabase Pro + Vercel Pro + CDN vidéo">
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projection}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="var(--text-muted)" tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${v}€`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="serverCost" name="Serveurs & Infra" stroke="#74C0FC" fill="rgba(116,192,252,0.1)" stackId="1" />
                  <Area type="monotone" dataKey="videoCost" name="CDN / Vidéo" stroke="#A29BFE" fill="rgba(162,155,254,0.1)" stackId="1" />
                  <Area type="monotone" dataKey="contentCost" name="Production contenu" stroke="#E17055" fill="rgba(225,112,85,0.1)" stackId="1" />
                  <Area type="monotone" dataKey="marketingCost" name="Marketing" stroke="#55EFC4" fill="rgba(85,239,196,0.1)" stackId="1" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Section>

          {/* ═══════════════════ SECTION 4: TABLEAU MENSUEL DÉTAILLÉ ═══════════════════ */}
          <Section title="Tableau mensuel détaillé" subtitle="Tous les chiffres mois par mois pour la projection à 5 000 abonnés">
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ minWidth: 900 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--dark-border)' }}>
                    {['Mois', 'Abonnés', 'Nouveaux', 'Churn', 'MRR', 'Fondation', 'Événem.', 'Coûts opé.', 'Stripe', 'Affiliation', 'IS', 'Profit net', 'Par associé'].map((h) => (
                      <th key={h} className="py-2 px-2 text-left font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projection.map((m, i) => (
                    <tr key={i} className="transition-colors" style={{ borderBottom: '1px solid var(--dark-border)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212,175,55,0.03)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <td className="py-2 px-2 font-semibold" style={{ color: '#D4AF37' }}>{m.month}</td>
                      <td className="py-2 px-2" style={{ color: '#74C0FC' }}>{fmt(m.subscribers)}</td>
                      <td className="py-2 px-2" style={{ color: '#55EFC4' }}>+{fmt(m.newSubscribers)}</td>
                      <td className="py-2 px-2" style={{ color: '#E17055' }}>-{fmt(m.churned)}</td>
                      <td className="py-2 px-2 font-semibold" style={{ color: '#D4AF37' }}>{fmtEur(m.mrr)}</td>
                      <td className="py-2 px-2" style={{ color: '#E84393' }}>{fmtEur(m.fondationContrib)}</td>
                      <td className="py-2 px-2" style={{ color: '#00CEC9' }}>{fmtEur(m.eventOrganization)}</td>
                      <td className="py-2 px-2" style={{ color: 'var(--text-secondary)' }}>{fmtEur(m.operatingCosts)}</td>
                      <td className="py-2 px-2" style={{ color: 'var(--text-secondary)' }}>{fmtEur(m.stripeFees)}</td>
                      <td className="py-2 px-2" style={{ color: '#FF6B35' }}>{fmtEur(m.affiliateCommissions)}</td>
                      <td className="py-2 px-2" style={{ color: '#A29BFE' }}>{fmtEur(m.corporateTax)}</td>
                      <td className="py-2 px-2 font-semibold" style={{ color: m.netProfit >= 0 ? '#55EFC4' : '#E17055' }}>{fmtEur(m.netProfit)}</td>
                      <td className="py-2 px-2 font-semibold" style={{ color: m.perPartner >= 0 ? '#D4AF37' : '#E17055' }}>{fmtEur(m.perPartner)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '2px solid rgba(212,175,55,0.3)' }}>
                    <td className="py-3 px-2 font-bold" style={{ color: '#D4AF37' }}>TOTAL</td>
                    <td className="py-3 px-2" />
                    <td className="py-3 px-2" />
                    <td className="py-3 px-2" />
                    <td className="py-3 px-2 font-bold" style={{ color: '#D4AF37' }}>{fmtEur(yearlyRevenue)}</td>
                    <td className="py-3 px-2 font-semibold" style={{ color: '#E84393' }}>{fmtEur(yearlyFondation)}</td>
                    <td className="py-3 px-2 font-semibold" style={{ color: '#00CEC9' }}>{fmtEur(yearlyEvents)}</td>
                    <td className="py-3 px-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>{fmtEur(yearlyCosts)}</td>
                    <td className="py-3 px-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>{fmtEur(yearlyStripe)}</td>
                    <td className="py-3 px-2 font-semibold" style={{ color: '#FF6B35' }}>{fmtEur(yearlyAffiliate)}</td>
                    <td className="py-3 px-2 font-semibold" style={{ color: '#A29BFE' }}>{fmtEur(yearlyTax)}</td>
                    <td className="py-3 px-2 font-bold" style={{ color: '#55EFC4' }}>{fmtEur(yearlyNetProfit)}</td>
                    <td className="py-3 px-2 font-bold" style={{ color: '#D4AF37' }}>{fmtEur(yearlyPerPartner)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Section>

          {/* ─── Methodology note ─── */}
          <div className="rounded-xl p-5" style={{ background: 'rgba(212,175,55,0.03)', border: '1px solid rgba(212,175,55,0.1)' }}>
            <h3 className="text-sm font-semibold mb-2" style={{ color: '#D4AF37' }}>Méthodologie & hypothèses</h3>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <p>Croissance en courbe S (sigmoïde) vers 5 000 abonnés</p>
              <p>Distribution: 55% Essentielle, 30% Sérénité, 15% Premium</p>
              <p>Taux de churn: 6%/mois (moyenne secteur bien-être)</p>
              <p>Affiliation: 30% des inscriptions, commission 10%</p>
              <p>Frais Stripe: ~2.5% moyen (cartes EU)</p>
              <p>Fondation humanitaire: 5% du CA brut</p>
              <p>Organisation d&apos;événements: 10% du CA brut</p>
              <p>Serveurs: Supabase Pro + Vercel Pro + CDN vidéo</p>
              <p>IS Chypre: 12.5% | Défense: 17% div. | GHS: 2.65% div.</p>
              <p>Benchmarks: Petit BamBou, Headspace, Insight Timer, Calm</p>
              <p>Production contenu: 3 000€ base + 0.50€/abonné (plafonné)</p>
              <p>Marketing: 1 500€ base + 0.40€/abonné</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
