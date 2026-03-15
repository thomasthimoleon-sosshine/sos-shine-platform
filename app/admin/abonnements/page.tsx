'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Subscription {
  id: string
  user_id: string
  plan: string
  status: string
  duration: string
  current_period_end: string | null
  cancel_at_period_end: boolean
  payment_failed_at: string | null
  grace_period_end: string | null
  reminder_sent_count: number
  waitlist_discount: boolean
  previous_plan: string | null
  plan_changed_at: string | null
  created_at: string
  updated_at: string
  profiles: {
    prenom: string
    email: string
    avatar_url: string | null
    role: string
  }
}

interface PaymentLog {
  id: string
  user_id: string
  event_type: string
  plan: string | null
  previous_plan: string | null
  amount_cents: number | null
  metadata: Record<string, unknown>
  created_at: string
  profiles: {
    prenom: string
    email: string
  }
}

interface Stats {
  active: number
  trialing: number
  past_due: number
  canceled: number
  inactive: number
  total: number
  essential: number
  serenite: number
  premium: number
  canceling_soon: number
  expiring_week: number
  with_discount: number
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active:   { label: 'Actif',   color: '#55EFC4', bg: 'rgba(85,239,196,0.12)' },
  trialing: { label: 'Essai',   color: '#74C0FC', bg: 'rgba(116,192,252,0.12)' },
  past_due: { label: 'Impayé',  color: '#E17055', bg: 'rgba(225,112,85,0.12)' },
  canceled: { label: 'Annulé',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  inactive: { label: 'Inactif', color: '#9A9080', bg: 'rgba(154,144,128,0.12)' },
}

const planConfig: Record<string, { label: string; color: string; bg: string }> = {
  essential: { label: 'Essentielle', color: '#D4AF37', bg: 'rgba(212,175,55,0.12)' },
  serenite:  { label: 'Sérénité',    color: '#55EFC4', bg: 'rgba(85,239,196,0.12)' },
  premium:   { label: 'Premium',     color: '#74C0FC', bg: 'rgba(116,192,252,0.12)' },
}

const eventLabels: Record<string, { label: string; color: string }> = {
  payment_succeeded:       { label: 'Paiement réussi',      color: '#55EFC4' },
  payment_failed:          { label: 'Paiement échoué',      color: '#E17055' },
  subscription_created:    { label: 'Abonnement créé',      color: '#74C0FC' },
  subscription_updated:    { label: 'Abonnement modifié',   color: '#D4AF37' },
  subscription_canceled:   { label: 'Abonnement annulé',    color: '#ef4444' },
  subscription_reactivated:{ label: 'Réactivation',         color: '#55EFC4' },
  plan_upgraded:           { label: 'Upgrade',              color: '#74C0FC' },
  plan_downgraded:         { label: 'Downgrade',            color: '#E17055' },
  trial_started:           { label: 'Essai démarré',        color: '#74C0FC' },
  trial_ended:             { label: 'Essai terminé',        color: '#9A9080' },
  reminder_sent:           { label: 'Rappel envoyé',        color: '#D4AF37' },
  access_blocked:          { label: 'Accès bloqué',         color: '#ef4444' },
  access_restored:         { label: 'Accès restauré',       color: '#55EFC4' },
  grace_period_started:    { label: 'Période de grâce',     color: '#E17055' },
  grace_period_ended:      { label: 'Grâce terminée',       color: '#ef4444' },
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}
function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function AdminAbonnementsPage() {
  const [subs, setSubs] = useState<Subscription[]>([])
  const [logs, setLogs] = useState<PaymentLog[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'list' | 'history'>('overview')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPlan, setFilterPlan] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()

      const [subsRes, logsRes] = await Promise.all([
        supabase
          .from('subscriptions')
          .select('*, profiles(prenom, email, avatar_url, role)')
          .order('updated_at', { ascending: false }),
        supabase
          .from('subscription_payment_logs')
          .select('*, profiles(prenom, email)')
          .order('created_at', { ascending: false })
          .limit(100),
      ])

      setSubs((subsRes.data || []) as unknown as Subscription[])
      setLogs((logsRes.data || []) as unknown as PaymentLog[])
      setLoading(false)
    }
    load()
  }, [])

  const stats: Stats = useMemo(() => {
    const s = subs
    return {
      active: s.filter(x => x.status === 'active').length,
      trialing: s.filter(x => x.status === 'trialing').length,
      past_due: s.filter(x => x.status === 'past_due').length,
      canceled: s.filter(x => x.status === 'canceled').length,
      inactive: s.filter(x => x.status === 'inactive').length,
      total: s.length,
      essential: s.filter(x => x.plan === 'essential' && ['active', 'trialing'].includes(x.status)).length,
      serenite: s.filter(x => x.plan === 'serenite' && ['active', 'trialing'].includes(x.status)).length,
      premium: s.filter(x => x.plan === 'premium' && ['active', 'trialing'].includes(x.status)).length,
      canceling_soon: s.filter(x => x.cancel_at_period_end && x.status === 'active').length,
      expiring_week: s.filter(x => {
        if (!x.current_period_end || x.status !== 'active') return false
        const d = new Date(x.current_period_end)
        const now = new Date()
        return d > now && d < new Date(now.getTime() + 7 * 86400000)
      }).length,
      with_discount: s.filter(x => x.waitlist_discount && ['active', 'trialing'].includes(x.status)).length,
    }
  }, [subs])

  const filtered = useMemo(() => {
    let list = subs
    if (filterStatus !== 'all') list = list.filter(x => x.status === filterStatus)
    if (filterPlan !== 'all') list = list.filter(x => x.plan === filterPlan)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(x => x.profiles?.prenom?.toLowerCase().includes(q) || x.profiles?.email?.toLowerCase().includes(q))
    }
    return list
  }, [subs, filterStatus, filterPlan, search])

  // MRR calcul
  const mrr = useMemo(() => {
    const priceMap: Record<string, number> = { essential: 990, serenite: 4990, premium: 9990 }
    return subs
      .filter(x => ['active', 'trialing'].includes(x.status))
      .reduce((sum, x) => sum + (priceMap[x.plan] || 0), 0)
  }, [subs])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-light" style={{ color: 'var(--gold)' }}>
          Gestion des abonnements
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Suivi complet des abonnements, paiements et accès membres.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
        {[
          { id: 'overview' as const, label: 'Vue d\'ensemble' },
          { id: 'list' as const, label: 'Liste des abonnés' },
          { id: 'history' as const, label: 'Historique' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer"
            style={{
              background: tab === t.id ? 'rgba(212,175,55,0.12)' : 'transparent',
              color: tab === t.id ? 'var(--gold)' : 'var(--text-muted)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Vue d'ensemble ── */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* KPIs principaux */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'MRR', value: `${(mrr / 100).toFixed(0)}€`, color: '#D4AF37' },
              { label: 'Actifs', value: stats.active + stats.trialing, color: '#55EFC4' },
              { label: 'Impayés', value: stats.past_due, color: '#E17055' },
              { label: 'Annulés', value: stats.canceled, color: '#ef4444' },
            ].map(kpi => (
              <div key={kpi.label} className="p-5 rounded-xl text-center"
                style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
                <p className="font-display text-3xl font-light" style={{ color: kpi.color }}>{kpi.value}</p>
                <p className="text-xs mt-1 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{kpi.label}</p>
              </div>
            ))}
          </div>

          {/* Répartition par plan */}
          <div className="grid grid-cols-3 gap-4">
            {(['essential', 'serenite', 'premium'] as const).map(p => {
              const cfg = planConfig[p]
              const count = stats[p === 'essential' ? 'essential' : p === 'serenite' ? 'serenite' : 'premium']
              return (
                <div key={p} className="p-5 rounded-xl"
                  style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
                  <p className="text-sm font-medium" style={{ color: cfg.color }}>{cfg.label}</p>
                  <p className="font-display text-2xl font-light mt-2" style={{ color: 'var(--text-primary)' }}>{count}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>abonné{count > 1 ? 's' : ''} actif{count > 1 ? 's' : ''}</p>
                </div>
              )
            })}
          </div>

          {/* Alertes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Annulations en cours', value: stats.canceling_soon, color: '#E17055', desc: 'vont annuler en fin de période' },
              { label: 'Expirent cette semaine', value: stats.expiring_week, color: '#D4AF37', desc: 'périodes se terminent sous 7j' },
              { label: 'Réduction fondateur', value: stats.with_discount, color: '#74C0FC', desc: 'bénéficient de -10€/mois' },
            ].map(a => (
              <div key={a.label} className="p-4 rounded-xl"
                style={{ background: 'var(--dark-card)', border: `1px solid ${a.color}25` }}>
                <div className="flex items-center justify-between">
                  <p className="text-sm" style={{ color: a.color }}>{a.label}</p>
                  <p className="font-display text-xl" style={{ color: a.color }}>{a.value}</p>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{a.desc}</p>
              </div>
            ))}
          </div>

          {/* Derniers événements */}
          <div>
            <h2 className="font-display text-lg mb-3" style={{ color: 'var(--text-primary)' }}>Derniers événements</h2>
            <div className="space-y-2">
              {logs.slice(0, 10).map(log => {
                const evt = eventLabels[log.event_type] || { label: log.event_type, color: '#9A9080' }
                return (
                  <div key={log.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: evt.color }} />
                    <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>
                      <span style={{ color: evt.color }}>{evt.label}</span>
                      {' — '}
                      {log.profiles?.prenom || 'Membre'}
                      {log.plan && <span style={{ color: 'var(--text-muted)' }}> ({planConfig[log.plan]?.label || log.plan})</span>}
                      {log.previous_plan && log.previous_plan !== log.plan && (
                        <span style={{ color: 'var(--text-muted)' }}> depuis {planConfig[log.previous_plan]?.label || log.previous_plan}</span>
                      )}
                    </span>
                    <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{formatDateTime(log.created_at)}</span>
                  </div>
                )
              })}
              {logs.length === 0 && (
                <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>Aucun événement pour le moment.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Liste des abonnés ── */}
      {tab === 'list' && (
        <div className="space-y-4">
          {/* Filtres */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
              />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
              style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}>
              <option value="all">Tous les statuts</option>
              <option value="active">Actifs</option>
              <option value="trialing">En essai</option>
              <option value="past_due">Impayés</option>
              <option value="canceled">Annulés</option>
              <option value="inactive">Inactifs</option>
            </select>
            <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)}
              className="px-4 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
              style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}>
              <option value="all">Tous les plans</option>
              <option value="essential">Essentielle</option>
              <option value="serenite">Sérénité</option>
              <option value="premium">Premium</option>
            </select>
          </div>

          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{filtered.length} abonnement{filtered.length > 1 ? 's' : ''}</p>

          {/* Table */}
          <div className="rounded-xl overflow-hidden" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--dark-border)' }}>
                    {['Membre', 'Plan', 'Statut', 'Fin de période', 'Rappels', 'Grâce', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((sub, i) => {
                    const sc = statusConfig[sub.status] || statusConfig.inactive
                    const pc = planConfig[sub.plan] || { label: sub.plan, color: '#9A9080', bg: 'rgba(154,144,128,0.12)' }
                    const daysLeft = sub.current_period_end
                      ? Math.ceil((new Date(sub.current_period_end).getTime() - Date.now()) / 86400000)
                      : null
                    const isInGrace = sub.grace_period_end && new Date(sub.grace_period_end) > new Date()

                    return (
                      <tr key={sub.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--dark-border)' : 'none' }}>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            {sub.profiles?.avatar_url ? (
                              <img src={sub.profiles.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                                style={{ background: `${pc.color}18`, color: pc.color }}>
                                {sub.profiles?.prenom?.charAt(0) || '?'}
                              </div>
                            )}
                            <div>
                              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{sub.profiles?.prenom || '—'}</p>
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub.profiles?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: pc.bg, color: pc.color }}>
                            {pc.label}
                          </span>
                          {sub.previous_plan && sub.previous_plan !== sub.plan && (
                            <span className="block text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                              ex-{planConfig[sub.previous_plan]?.label || sub.previous_plan}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: sc.bg, color: sc.color }}>
                            {sc.label}
                          </span>
                          {sub.cancel_at_period_end && sub.status === 'active' && (
                            <span className="block text-[10px] mt-0.5" style={{ color: '#E17055' }}>Annulation prévue</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {sub.current_period_end ? (
                            <div>
                              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{formatDate(sub.current_period_end)}</p>
                              {daysLeft !== null && (
                                <p className="text-[10px]" style={{ color: daysLeft < 0 ? '#ef4444' : daysLeft < 7 ? '#E17055' : 'var(--text-muted)' }}>
                                  {daysLeft < 0 ? `Expiré il y a ${Math.abs(daysLeft)}j` : `${daysLeft}j restant${daysLeft > 1 ? 's' : ''}`}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {sub.reminder_sent_count > 0 ? (
                            <span className="text-sm" style={{ color: '#E17055' }}>{sub.reminder_sent_count} envoyé{sub.reminder_sent_count > 1 ? 's' : ''}</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {isInGrace ? (
                            <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(225,112,85,0.12)', color: '#E17055' }}>
                              Jusqu&apos;au {formatDate(sub.grace_period_end!)}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {sub.waitlist_discount && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37' }}>-10€</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <p className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>Aucun abonnement trouvé.</p>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: Historique ── */}
      {tab === 'history' && (
        <div className="space-y-3">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>100 derniers événements</p>
          {logs.map(log => {
            const evt = eventLabels[log.event_type] || { label: log.event_type, color: '#9A9080' }
            return (
              <div key={log.id} className="flex items-start gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
                <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: evt.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    <span className="font-medium" style={{ color: evt.color }}>{evt.label}</span>
                    {' — '}
                    {log.profiles?.prenom || 'Membre'} ({log.profiles?.email})
                  </p>
                  {log.plan && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Plan : {planConfig[log.plan]?.label || log.plan}
                      {log.previous_plan && log.previous_plan !== log.plan && (
                        <span> (depuis {planConfig[log.previous_plan]?.label || log.previous_plan})</span>
                      )}
                    </p>
                  )}
                  {log.amount_cents && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Montant : {(log.amount_cents / 100).toFixed(2)}€</p>
                  )}
                </div>
                <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{formatDateTime(log.created_at)}</span>
              </div>
            )
          })}
          {logs.length === 0 && (
            <p className="text-center py-12 text-sm" style={{ color: 'var(--text-muted)' }}>Aucun événement enregistré.</p>
          )}
        </div>
      )}
    </div>
  )
}
