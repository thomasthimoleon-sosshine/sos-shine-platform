'use client'

import { useEffect, useState } from 'react'

interface PerQuestion { question: number; reached: number; avgMs: number; medianMs: number }
interface FunnelStep { key: string; label: string; value: number }
interface AnalyticsData {
  ok: boolean
  missingTable: boolean
  days: number
  totalEvents: number
  questionnaire: {
    started: number
    completed: number
    completionRate: number
    avgTotalMs: number
    medianTotalMs: number
    totalQuestions: number
    perQuestion: PerQuestion[]
  }
  funnel: FunnelStep[]
  totals: { leads: number; members: number; onboarded: number; subscribers: number; subsActive: number; subsTrial: number }
}

function fmtDuration(ms: number): string {
  if (!ms || ms <= 0) return '—'
  const totalSec = Math.round(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return m > 0 ? `${m} min ${s.toString().padStart(2, '0')} s` : `${s} s`
}

const RANGES = [
  { days: 7, label: '7 jours' },
  { days: 30, label: '30 jours' },
  { days: 90, label: '90 jours' },
  { days: 365, label: '1 an' },
]

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  // setState est appelé dans les callbacks async (pas dans le corps de
  // l'effet) pour éviter les rendus en cascade.
  useEffect(() => {
    let active = true
    fetch(`/api/admin/analytics?days=${days}`)
      .then((r) => r.json())
      .then((json) => { if (active) { setData(json); setLoading(false) } })
      .catch(() => { if (active) { setData(null); setLoading(false) } })
    return () => { active = false }
  }, [days])

  const q = data?.questionnaire
  const maxReached = q?.perQuestion?.[0]?.reached || 1

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Parcours & Conversion
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Temps sur le questionnaire et décrochage à chaque étape du tunnel.
          </p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-full" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          {RANGES.map((r) => (
            <button key={r.days} onClick={() => { setLoading(true); setDays(r.days) }}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
              style={{ background: days === r.days ? 'linear-gradient(135deg, #D4AF37, #B8960F)' : 'transparent', color: days === r.days ? '#050505' : 'var(--text-muted)' }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !data?.ok ? (
        <div className="glass p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
          Impossible de charger les données. Réessayez.
        </div>
      ) : data.missingTable ? (
        <div className="glass p-8" style={{ borderColor: 'rgba(212,175,55,0.25)' }}>
          <h2 className="font-display text-xl mb-3" style={{ color: '#D4AF37' }}>⚙️ Activation en une étape</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            La table de mesure n&apos;existe pas encore. Ouvre l&apos;éditeur SQL de Supabase, colle le contenu du
            fichier <code style={{ color: '#D4AF37' }}>SQL_FUNNEL_ANALYTICS.sql</code> (à la racine du projet), puis clique sur <strong>Run</strong>.
            Les mesures commenceront à s&apos;afficher dès les premières visites.
          </p>
        </div>
      ) : (
        <>
          {/* ── Cartes clés ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Temps moyen / questionnaire', value: fmtDuration(q!.avgTotalMs), color: '#D4AF37', sub: `médian ${fmtDuration(q!.medianTotalMs)}` },
              { label: 'Taux de complétion du test', value: `${q!.completionRate}%`, color: '#55EFC4', sub: `${q!.completed}/${q!.started} démarrés` },
              { label: 'Abonnés actifs', value: data.totals.subscribers, color: '#A78BFA', sub: `${data.totals.subsTrial} en essai` },
              { label: 'Leads (email test)', value: data.totals.leads, color: '#74C0FC', sub: `${data.totals.members} membres inscrits` },
            ].map((c) => (
              <div key={c.label} className="glass p-5">
                <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{c.label}</p>
                <p className="font-display text-2xl font-semibold" style={{ color: c.color }}>{c.value}</p>
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{c.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Tunnel de conversion ── */}
          <div className="glass p-6">
            <h2 className="font-display text-xl mb-1" style={{ color: 'var(--text-primary)' }}>Tunnel de conversion</h2>
            <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
              À chaque étape : nombre de visiteurs, part du départ, et perte par rapport à l&apos;étape précédente.
            </p>
            <div className="space-y-3">
              {data.funnel.map((step, i) => {
                const first = data.funnel[0].value || 1
                const prev = i > 0 ? data.funnel[i - 1].value : step.value
                const pctOfStart = Math.round((step.value / first) * 100)
                const dropFromPrev = prev > 0 ? Math.round(((prev - step.value) / prev) * 100) : 0
                return (
                  <div key={step.key}>
                    <div className="flex items-center justify-between mb-1 text-sm">
                      <span style={{ color: 'var(--text-secondary)' }}>{step.label}</span>
                      <span className="flex items-center gap-3">
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{step.value}</span>
                        <span className="text-xs w-10 text-right" style={{ color: 'var(--text-muted)' }}>{pctOfStart}%</span>
                        {i > 0 && dropFromPrev > 0 && (
                          <span className="text-xs w-16 text-right" style={{ color: '#E17055' }}>−{dropFromPrev}%</span>
                        )}
                        {i === 0 && <span className="text-xs w-16" />}
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--dark-border)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(pctOfStart, 1)}%`, background: 'linear-gradient(90deg, #D4AF37, #B8960F)' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Décrochage par question ── */}
          <div className="glass p-6">
            <h2 className="font-display text-xl mb-1" style={{ color: 'var(--text-primary)' }}>Décrochage par question</h2>
            <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
              Combien de personnes atteignent chaque question, et le temps qu&apos;elles y passent. Une chute brutale = une question qui fait fuir.
            </p>
            <div className="space-y-2">
              {q!.perQuestion.map((pq, i) => {
                const pct = Math.round((pq.reached / (maxReached || 1)) * 100)
                const prev = i > 0 ? q!.perQuestion[i - 1].reached : pq.reached
                const drop = prev > 0 ? Math.round(((prev - pq.reached) / prev) * 100) : 0
                return (
                  <div key={pq.question} className="flex items-center gap-3">
                    <span className="text-xs w-8 shrink-0" style={{ color: 'var(--text-muted)' }}>Q{pq.question}</span>
                    <div className="flex-1 h-5 rounded-md overflow-hidden" style={{ background: 'var(--dark-border)' }}>
                      <div className="h-full rounded-md flex items-center justify-end px-2 transition-all"
                        style={{ width: `${Math.max(pct, 2)}%`, background: drop >= 15 ? 'linear-gradient(90deg,#E17055,#c0392b)' : 'linear-gradient(90deg,#55EFC4,#00B894)' }}>
                        <span className="text-[10px] font-semibold" style={{ color: '#062' }}>{pq.reached}</span>
                      </div>
                    </div>
                    <span className="text-[11px] w-14 text-right shrink-0" style={{ color: 'var(--text-muted)' }}>{fmtDuration(pq.avgMs)}</span>
                    <span className="text-[11px] w-12 text-right shrink-0" style={{ color: drop >= 15 ? '#E17055' : 'var(--text-muted)' }}>
                      {i > 0 && drop > 0 ? `−${drop}%` : ''}
                    </span>
                  </div>
                )
              })}
            </div>
            <p className="text-[11px] mt-4" style={{ color: 'var(--text-muted)' }}>
              Colonnes : nombre atteignant la question · temps moyen passé · perte vs question précédente (rouge si ≥ 15%).
            </p>
          </div>

          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            {data.totalEvents} événements analysés sur {data.days} jours.
          </p>
        </>
      )}
    </div>
  )
}
