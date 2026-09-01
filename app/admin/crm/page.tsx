'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

interface Sequence {
  id: string
  name: string
  trigger_type: string
  status: string
  created_at: string
}

interface Step {
  id: string
  sequence_id: string
  step_order: number
  delay_days: number
  subject: string
  html_content: string
}

interface EmailEvent {
  id: string
  contact_email: string
  event_type: string
  metadata: Record<string, unknown>
  created_at: string
}

interface Contact {
  id: string
  email: string
  first_name: string | null
  source: string
  opted_out: boolean
  created_at: string
}

interface Stats {
  totalContacts: number
  totalSent: number
  totalOpened: number
  totalClicked: number
}

const triggerLabels: Record<string, string> = {
  signup: 'Inscription',
  signature_test_v2: 'Quiz Signature V2',
  signature_test: 'Quiz Signature V1',
  waitlist: 'Liste d\'attente',
  subscription: 'Nouvel abonné',
  manual: 'Manuel',
}

export default function CRMPage() {
  const [sequences, setSequences] = useState<Sequence[]>([])
  const [steps, setSteps] = useState<Step[]>([])
  const [events, setEvents] = useState<EmailEvent[]>([])
  const [stats, setStats] = useState<Stats>({ totalContacts: 0, totalSent: 0, totalOpened: 0, totalClicked: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedSeq, setSelectedSeq] = useState<string | null>(null)
  const [editingStep, setEditingStep] = useState<Step | null>(null)
  const [editSubject, setEditSubject] = useState('')
  const [editHtml, setEditHtml] = useState('')
  const [saving, setSaving] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [tab, setTab] = useState<'sequences' | 'contacts'>('sequences')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [contactsTotal, setContactsTotal] = useState(0)
  const [contactsPage, setContactsPage] = useState(1)
  const [contactsSearch, setContactsSearch] = useState('')
  const [contactsSource, setContactsSource] = useState('all')
  const [contactsLoading, setContactsLoading] = useState(false)

  const supabase = createClient()

  const load = useCallback(async () => {
    setLoading(true)

    const [seqRes, eventsRes, contactsRes] = await Promise.all([
      supabase.from('crm_sequences').select('*').order('created_at', { ascending: false }),
      supabase.from('crm_campaign_events').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('signature_leads').select('*', { count: 'exact', head: true }),
    ])

    const seqs = (seqRes.data || []) as Sequence[]
    const evts = (eventsRes.data || []) as EmailEvent[]
    setSequences(seqs)
    setEvents(evts)

    const sent = evts.filter(e => e.event_type.includes('_sent')).length
    const opened = evts.filter(e => e.event_type.includes('_opened') || e.event_type.includes('open')).length
    const clicked = evts.filter(e => e.event_type.includes('_clicked') || e.event_type.includes('click')).length

    setStats({
      totalContacts: contactsRes.count || 0,
      totalSent: sent,
      totalOpened: opened,
      totalClicked: clicked,
    })

    if (seqs.length > 0 && !selectedSeq) {
      const active = seqs.find(s => s.status === 'active')
      if (active) {
        setSelectedSeq(active.id)
        loadSteps(active.id)
      }
    }

    setLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { load() }, [load])

  async function loadSteps(seqId: string) {
    const { data } = await supabase
      .from('crm_sequence_steps')
      .select('*')
      .eq('sequence_id', seqId)
      .order('step_order', { ascending: true })
    setSteps((data || []) as Step[])
  }

  async function selectSequence(seqId: string) {
    setSelectedSeq(seqId)
    setEditingStep(null)
    await loadSteps(seqId)
  }

  async function toggleSequence(seq: Sequence) {
    const newStatus = seq.status === 'active' ? 'paused' : 'active'
    await (supabase as any).from('crm_sequences').update({ status: newStatus }).eq('id', seq.id)
    setSequences(prev => prev.map(s => s.id === seq.id ? { ...s, status: newStatus } : s))
  }

  async function deleteStep(stepId: string) {
    if (!confirm('Supprimer cet email de la séquence ?')) return
    await (supabase as any).from('crm_sequence_steps').delete().eq('id', stepId)
    setSteps(prev => prev.filter(s => s.id !== stepId))
    setEditingStep(null)
  }

  function startEdit(step: Step) {
    setEditingStep(step)
    setEditSubject(step.subject)
    setEditHtml(step.html_content)
  }

  async function saveEdit() {
    if (!editingStep) return
    setSaving(true)
    await (supabase as any).from('crm_sequence_steps').update({
      subject: editSubject,
      html_content: editHtml,
    }).eq('id', editingStep.id)
    setSteps(prev => prev.map(s => s.id === editingStep.id ? { ...s, subject: editSubject, html_content: editHtml } : s))
    setEditingStep(null)
    setSaving(false)
  }

  function getStepStats(stepOrder: number) {
    const key = `quiz_v2_email_${String(stepOrder).padStart(2, '0')}_sent`
    const sent = events.filter(e => e.event_type === key).length
    const openKey = key.replace('_sent', '_opened')
    const opened = events.filter(e => e.event_type === openKey).length
    return { sent, opened, rate: sent > 0 ? Math.round((opened / sent) * 100) : 0 }
  }

  const openRate = stats.totalSent > 0 ? Math.round((stats.totalOpened / stats.totalSent) * 100) : 0
  const clickRate = stats.totalSent > 0 ? Math.round((stats.totalClicked / stats.totalSent) * 100) : 0

  const sourceLabels: Record<string, string> = {
    all: 'Toutes les sources',
    member: 'Membres inscrits',
    signature_test: 'Quiz Signature',
    waitlist: 'Liste d\'attente',
    quiz_landing: 'Landing Quiz',
    blog: 'Blog',
  }

  async function loadContacts(p = contactsPage, s = contactsSearch, src = contactsSource) {
    setContactsLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p) })
      if (s) params.set('search', s)
      if (src !== 'all') params.set('source', src)
      const res = await fetch(`/api/crm/contacts?${params}`)
      const data = await res.json()
      setContacts(data.contacts || [])
      setContactsTotal(data.total || 0)
    } catch { /* */ }
    setContactsLoading(false)
  }

  function switchToContacts() {
    setTab('contacts')
    if (contacts.length === 0) loadContacts()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* ── Header ── */}
      <div>
        <h1 className="font-display text-3xl font-light text-[var(--brand)]">
          Emails &amp; S&eacute;quences
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          G&eacute;rez vos s&eacute;quences email et suivez les performances.
        </p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 rounded-[var(--radius-lg)] bg-[var(--surface-raised)] w-fit">
        <button
          onClick={() => setTab('sequences')}
          className={`px-5 py-2.5 rounded-[var(--radius-md)] text-[13px] font-medium transition-all cursor-pointer ${tab === 'sequences' ? 'bg-[var(--brand-alpha-medium)] text-[var(--brand)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
        >
          S&eacute;quences
        </button>
        <button
          onClick={switchToContacts}
          className={`px-5 py-2.5 rounded-[var(--radius-md)] text-[13px] font-medium transition-all cursor-pointer ${tab === 'contacts' ? 'bg-[var(--brand-alpha-medium)] text-[var(--brand)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
        >
          Contacts ({stats.totalContacts})
        </button>
      </div>

      {tab === 'sequences' && <>
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Contacts', value: stats.totalContacts, color: 'var(--brand)' },
          { label: 'Emails envoyés', value: stats.totalSent, color: 'var(--success)' },
          { label: 'Taux d\'ouverture', value: `${openRate}%`, color: 'var(--accent-blue)' },
          { label: 'Taux de clic', value: `${clickRate}%`, color: 'var(--accent-purple)' },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-[var(--radius-xl)] bg-[var(--surface-raised)] border border-[var(--border-subtle)]">
            <div className="text-2xl font-display font-light" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[11px] text-[var(--text-muted)] mt-1 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Séquences ── */}
      <div>
        <h2 className="font-display text-xl font-light text-[var(--text-primary)] mb-4">
          S&eacute;quences
        </h2>

        {sequences.length === 0 ? (
          <div className="p-8 rounded-[var(--radius-xl)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-center">
            <p className="text-[var(--text-muted)]">Aucune s&eacute;quence. Lancez le seed pour cr&eacute;er la s&eacute;quence quiz.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sequences.map(seq => (
              <div
                key={seq.id}
                className={`p-5 rounded-[var(--radius-xl)] border transition-all duration-300 cursor-pointer ${selectedSeq === seq.id ? 'bg-[var(--surface-card)] border-[var(--border-medium)]' : 'bg-[var(--surface-raised)] border-[var(--border-subtle)] hover:border-[var(--border)]'}`}
                onClick={() => selectSequence(seq.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Toggle */}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSequence(seq) }}
                      className={`w-11 h-6 rounded-full transition-all duration-300 relative cursor-pointer ${seq.status === 'active' ? 'bg-[var(--success)]' : 'bg-[var(--surface-elevated)]'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${seq.status === 'active' ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>

                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{seq.name}</p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        {triggerLabels[seq.trigger_type] || seq.trigger_type}
                        {' · '}
                        {seq.status === 'active' ? (
                          <span className="text-[var(--success)]">Active</span>
                        ) : (
                          <span className="text-[var(--text-muted)]">En pause</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="text-[11px] text-[var(--text-muted)]">
                    {steps.length > 0 && selectedSeq === seq.id ? `${steps.length} emails` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Steps de la séquence sélectionnée ── */}
      <AnimatePresence>
        {selectedSeq && steps.length > 0 && !editingStep && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="font-display text-xl font-light text-[var(--text-primary)] mb-4">
              Emails de la s&eacute;quence
            </h2>

            <div className="space-y-2">
              {steps.map((step, i) => {
                const stepStats = getStepStats(step.step_order)
                return (
                  <div
                    key={step.id}
                    className="flex items-center gap-4 p-4 rounded-[var(--radius-lg)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] hover:border-[var(--border)] transition-all group"
                  >
                    {/* Step number */}
                    <div className="w-8 h-8 rounded-full bg-[var(--brand-alpha-weak)] text-[var(--brand)] flex items-center justify-center text-xs font-semibold shrink-0">
                      {step.step_order}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--text-primary)] truncate">{step.subject}</p>
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                        {step.delay_days === 0 ? 'Envoi immédiat' : `J+${step.delay_days}`}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-4 text-[11px] text-[var(--text-muted)]">
                      <span>{stepStats.sent} envoy&eacute;s</span>
                      <span>{stepStats.opened} ouverts</span>
                      {stepStats.rate > 0 && (
                        <span className="text-[var(--success)]">{stepStats.rate}%</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setPreviewHtml(step.html_content)}
                        className="px-3 py-1.5 rounded-[var(--radius-md)] text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-card)] transition-all cursor-pointer"
                      >
                        Aper&ccedil;u
                      </button>
                      <button
                        onClick={() => startEdit(step)}
                        className="px-3 py-1.5 rounded-[var(--radius-md)] text-[11px] text-[var(--brand)] hover:bg-[var(--brand-alpha-weak)] transition-all cursor-pointer"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => deleteStep(step.id)}
                        className="px-3 py-1.5 rounded-[var(--radius-md)] text-[11px] text-[var(--danger)] hover:bg-[var(--danger-alpha-weak)] transition-all cursor-pointer"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Éditeur d'email ── */}
      <AnimatePresence>
        {editingStep && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3 }}
            className="p-6 rounded-[var(--radius-xl)] bg-[var(--surface-raised)] border border-[var(--border-medium)]"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg text-[var(--text-primary)]">
                Modifier l&apos;email #{editingStep.step_order}
              </h3>
              <button
                onClick={() => setEditingStep(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer text-sm"
              >
                Annuler
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--text-muted)] mb-2">
                  Objet
                </label>
                <input
                  value={editSubject}
                  onChange={e => setEditSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-[var(--radius-lg)] text-sm bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:border-[var(--brand-alpha-strong)] transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--text-muted)] mb-2">
                  Contenu HTML
                </label>
                <textarea
                  value={editHtml}
                  onChange={e => setEditHtml(e.target.value)}
                  rows={16}
                  className="w-full px-4 py-3 rounded-[var(--radius-lg)] text-xs font-mono bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:border-[var(--brand-alpha-strong)] transition-all resize-y"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-full text-sm font-medium bg-[var(--brand)] text-[var(--text-inverse)] hover:bg-[var(--brand-light)] transition-all cursor-pointer disabled:opacity-40"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  onClick={() => setPreviewHtml(editHtml)}
                  className="px-6 py-2.5 rounded-full text-sm font-medium border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-medium)] transition-all cursor-pointer"
                >
                  Aper&ccedil;u
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Derniers envois ── */}
      {events.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-light text-[var(--text-primary)] mb-4">
            Derniers envois
          </h2>
          <div className="rounded-[var(--radius-xl)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] overflow-hidden">
            <div className="divide-y divide-[var(--border-subtle)]">
              {events.filter(e => e.event_type.includes('_sent')).slice(0, 20).map(evt => (
                <div key={evt.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-[var(--success)] shrink-0" />
                    <span className="text-sm text-[var(--text-primary)] truncate">{evt.contact_email}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-[var(--text-muted)] shrink-0">
                    <span>{evt.event_type.replace('quiz_v2_email_', 'Email ').replace('_sent', '')}</span>
                    <span>{new Date(evt.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      </>}

      {/* ── ONGLET CONTACTS ── */}
      {tab === 'contacts' && (
        <div className="space-y-4">
          {/* Search + filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex gap-2">
              <input
                value={contactsSearch}
                onChange={e => setContactsSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadContacts(1, contactsSearch, contactsSource)}
                placeholder="Rechercher par email ou pr&eacute;nom..."
                className="flex-1 px-4 py-2.5 rounded-[var(--radius-lg)] text-sm bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:border-[var(--brand-alpha-strong)] transition-all placeholder:text-[var(--text-muted)]"
              />
              <button
                onClick={() => loadContacts(1, contactsSearch, contactsSource)}
                className="px-4 py-2.5 rounded-[var(--radius-lg)] text-sm bg-[var(--brand)] text-[var(--text-inverse)] cursor-pointer hover:bg-[var(--brand-light)] transition-all"
              >
                Chercher
              </button>
            </div>
            <select
              value={contactsSource}
              onChange={e => { setContactsSource(e.target.value); setContactsPage(1); loadContacts(1, contactsSearch, e.target.value) }}
              className="px-4 py-2.5 rounded-[var(--radius-lg)] text-sm bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] outline-none cursor-pointer"
            >
              {Object.entries(sourceLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Total */}
          <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider">
            {contactsTotal} contact{contactsTotal > 1 ? 's' : ''}
          </p>

          {/* List */}
          {contactsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-8 rounded-[var(--radius-xl)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] text-center text-[var(--text-muted)]">
              Aucun contact trouv&eacute;.
            </div>
          ) : (
            <div className="rounded-[var(--radius-xl)] bg-[var(--surface-raised)] border border-[var(--border-subtle)] overflow-hidden">
              <div className="divide-y divide-[var(--border-subtle)]">
                {contacts.map(c => (
                  <div key={c.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-[var(--surface-card)] transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[var(--brand-alpha-weak)] text-[var(--brand)] flex items-center justify-center text-xs font-semibold shrink-0">
                        {(c.first_name || c.email)[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-[var(--text-primary)] truncate">
                          {c.first_name ? `${c.first_name} - ` : ''}{c.email}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          {new Date(c.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[var(--surface-card)] text-[var(--text-secondary)]">
                        {sourceLabels[c.source] || c.source}
                      </span>
                      {c.opted_out && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[var(--danger-alpha-weak)] text-[var(--danger)]">
                          D&eacute;sinscrit
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          {Math.ceil(contactsTotal / 50) > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => { const p = contactsPage - 1; setContactsPage(p); loadContacts(p) }}
                disabled={contactsPage <= 1}
                className="px-3 py-1.5 rounded-[var(--radius-md)] text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-card)] disabled:opacity-30 cursor-pointer transition-all"
              >
                &larr;
              </button>
              <span className="text-sm text-[var(--text-muted)]">
                {contactsPage} / {Math.ceil(contactsTotal / 50)}
              </span>
              <button
                onClick={() => { const p = contactsPage + 1; setContactsPage(p); loadContacts(p) }}
                disabled={contactsPage >= Math.ceil(contactsTotal / 50)}
                className="px-3 py-1.5 rounded-[var(--radius-md)] text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-card)] disabled:opacity-30 cursor-pointer transition-all"
              >
                &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Preview Modal ── */}
      <AnimatePresence>
        {previewHtml && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(8,9,10,0.85)] backdrop-blur-md"
            onClick={() => setPreviewHtml(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-2xl max-h-[80vh] overflow-auto rounded-[var(--radius-2xl)] bg-white"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-b">
                <span className="text-sm font-medium text-gray-700">Aper&ccedil;u email</span>
                <button
                  onClick={() => setPreviewHtml(null)}
                  className="text-gray-500 hover:text-gray-800 cursor-pointer text-sm"
                >
                  Fermer
                </button>
              </div>
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
