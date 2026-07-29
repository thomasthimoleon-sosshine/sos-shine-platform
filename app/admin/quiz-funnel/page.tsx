'use client'

import { useEffect, useState } from 'react'

interface PerQuestion { index: number; id: number; label: string; reached: number; avgSec: number; medianSec: number }
interface FunnelStep { key: string; label: string; value: number }
interface Data {
  ok: boolean
  missingTable?: boolean
  days: number
  counts: { started: number; completed: number; emailCaptured: number; completionRate: number; emailRate: number; events: number }
  time: { avgSec: number; medianSec: number; sampleSize: number }
  totalQuestions: number
  perQuestion: PerQuestion[]
  funnel: FunnelStep[]
  business: { members: number; subscribers: number; subsTrial: number }
}

function fmt(sec: number): string {
  if (!sec || sec <= 0) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m} min ${s.toString().padStart(2, '0')}` : `${s} s`
}

const RANGES: { days: number; label: string }[] = [
  { days: 7, label: '7 jours' },
  { days: 30, label: '30 jours' },
  { days: 90, label: '90 jours' },
  { days: 365, label: '1 an' },
]

export default function QuizFunnelPage() {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(30)

  useEffect(() => {
    let active = true
    fetch(`/api/admin/quiz-funnel?days=${days}`)
      .then((r) => r.json())
      .then((j) => { if (active) { setData(j); setLoading(false) } })
      .catch(() => { if (active) { setData(null); setLoading(false) } })
    return () => { active = false }
  }, [days])

  const maxReached = data?.perQuestion?.[0]?.reached || 1

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Parcours Quiz
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Temps sur le questionnaire et décrochage question par question.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {RANGES.map((r) => (
            <button key={r.days} type="button" onClick={() => { setLoading(true); setDays(r.days) }}
              className="text-xs px-3 py-1.5 rounded-lg cursor-pointer"
              style={{
                background: days === r.days ? 'rgba(201,169,97,0.15)' : 'transparent',
                color: days === r.days ? '#C9A961' : 'var(--text-muted)',
                border: `1px solid ${days === r.days ? 'rgba(201,169,97,0.3)' : 'var(--border)'}`,
              }}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#C9A961] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !data?.ok ? (
        <div className="rounded-xl p-8 text-center" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          Impossible de charger les données. Réessayez.
        </div>
      ) : data.missingTable ? (
        <div className="rounded-xl p-8" style={{ background: 'var(--surface-card)', border: '1px solid rgba(201,169,97,0.3)' }}>
          <h2 className="font-display text-xl mb-2" style={{ color: '#C9A961' }}>Aucune donnée de quiz pour l&apos;instant</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            La table <code>quiz_v2_responses</code> est introuvable ou vide. Les mesures s&apos;afficheront
            dès que des visiteurs commenceront le questionnaire.
          </p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Temps moyen / questionnaire', value: fmt(data.time.avgSec), color: '#C9A961', hint: `médian ${fmt(data.time.medianSec)} · ${data.time.sampleSize} terminés` },
              { label: 'Taux de complétion', value: `${data.counts.completionRate}%`, color: '#55EFC4', hint: `${data.counts.completed}/${data.counts.started} démarrés` },
              { label: 'Emails capturés', value: data.counts.emailCaptured, color: '#74C0FC', hint: `${data.counts.emailRate}% des démarrages` },
              { label: 'Abonnés actifs', value: data.business.subscribers, color: '#A78BFA', hint: `${data.business.subsTrial} en essai` },
            ].map((k) => (
              <div key={k.label} className="rounded-xl p-5" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
                <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{k.label}</p>
                <p className="font-display text-2xl md:text-3xl font-semibold" style={{ color: k.color }}>{k.value}</p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{k.hint}</p>
              </div>
            ))}
          </div>

          {/* Tunnel */}
          <div className="rounded-xl p-6" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <h2 className="font-display text-xl mb-1" style={{ color: 'var(--text-primary)' }}>Tunnel : du quiz à l&apos;abonné</h2>
            <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>Part du départ, et perte par rapport à l&apos;étape précédente.</p>
            <div className="space-y-3">
              {data.funnel.map((step, i) => {
                const first = data.funnel[0].value || 1
                const prev = i > 0 ? data.funnel[i - 1].value : step.value
                const pct = Math.round((step.value / first) * 100)
                const drop = prev > 0 ? Math.round(((prev - step.value) / prev) * 100) : 0
                return (
                  <div key={step.key}>
                    <div className="flex items-center justify-between mb-1 text-sm">
                      <span style={{ color: 'var(--text-secondary)' }}>{step.label}</span>
                      <span className="flex items-center gap-3">
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{step.value}</span>
                        <span className="text-xs w-10 text-right" style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                        <span className="text-xs w-16 text-right" style={{ color: i > 0 && drop > 0 ? '#E17055' : 'transparent' }}>
                          {i > 0 && drop > 0 ? `−${drop}%` : '—'}
                        </span>
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.max(pct, 1)}%`, background: 'linear-gradient(90deg, #C9A961, #B8960F)' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Décrochage par question */}
          <div className="rounded-xl p-6" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
            <h2 className="font-display text-xl mb-1" style={{ color: 'var(--text-primary)' }}>Décrochage par question</h2>
            <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
              Nombre de personnes atteignant chaque question et temps moyen passé. Barre rouge = chute ≥ 15% (question qui fait fuir).
            </p>
            <div className="space-y-2">
              {data.perQuestion.map((pq, i) => {
                const pct = Math.round((pq.reached / (maxReached || 1)) * 100)
                const prev = i > 0 ? data.perQuestion[i - 1].reached : pq.reached
                const drop = prev > 0 ? Math.round(((prev - pq.reached) / prev) * 100) : 0
                const hot = drop >= 15
                return (
                  <div key={pq.id} className="flex items-center gap-3">
                    <span className="text-xs w-8 shrink-0 text-right" style={{ color: 'var(--text-muted)' }}>Q{pq.index}</span>
                    <div className="flex-1 h-6 rounded-md overflow-hidden relative" style={{ background: 'var(--border)' }} title={pq.label}>
                      <div className="h-full rounded-md flex items-center justify-end px-2"
                        style={{ width: `${Math.max(pct, 3)}%`, background: hot ? 'linear-gradient(90deg,#E17055,#c0392b)' : 'linear-gradient(90deg,#55EFC4,#00B894)' }}>
                        <span className="text-[10px] font-semibold" style={{ color: '#04231a' }}>{pq.reached}</span>
                      </div>
                    </div>
                    <span className="text-[11px] w-14 text-right shrink-0" style={{ color: 'var(--text-muted)' }}>{fmt(pq.avgSec)}</span>
                    <span className="text-[11px] w-12 text-right shrink-0" style={{ color: hot ? '#E17055' : 'var(--text-muted)' }}>
                      {i > 0 && drop > 0 ? `−${drop}%` : ''}
                    </span>
                  </div>
                )
              })}
            </div>
            <p className="text-[11px] mt-4" style={{ color: 'var(--text-muted)' }}>
              Colonnes : atteignant la question · temps moyen · perte vs question précédente. Survolez une barre pour lire l&apos;intitulé.
            </p>
          </div>

          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            {data.counts.events} événements analysés sur {data.days} jours.
          </p>
        </>
      )}
    </div>
  )
}
