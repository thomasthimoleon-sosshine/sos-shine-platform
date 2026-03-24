'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Diagnostic {
  config: Record<string, string>
  tables: Record<string, string>
  templates: { total: number; active: number }
  scheduled_emails: { pending: number; sent: number; failed: number }
  recent_failures: Array<{ template_key: string; recipient_email: string; error_message: string; scheduled_at: string }>
  sequences: Array<{ name: string; trigger_type: string; status: string; active_enrollments: number; completed_enrollments: number }>
  due_enrollments: number
  recent_events: Array<{ event_type: string; metadata: Record<string, unknown>; created_at: string }>
}

const TRIGGER_LABELS: Record<string, string> = {
  signup: 'Inscription membre',
  signature_test: 'Test Signature',
  waitlist: 'Liste d\'attente',
  subscription: 'Nouvel abonné',
  renewal: 'Renouvellement',
  cancellation: 'Résiliation',
  affiliate: 'Programme affilié',
  events: 'Événements',
  manual: 'Manuel',
}

export default function AutomationsPage() {
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null)
  const [loading, setLoading] = useState(true)
  const [testEmail, setTestEmail] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionResult, setActionResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  async function loadDiagnostic() {
    try {
      const res = await fetch('/api/crm/automations')
      if (res.ok) {
        setDiagnostic(await res.json())
      }
    } catch (e) {
      console.error('Load diagnostic error:', e)
    }
    setLoading(false)
  }

  useEffect(() => { loadDiagnostic() }, [])

  async function doAction(action: string, extraData?: Record<string, string>) {
    setActionLoading(action)
    setActionResult(null)
    try {
      const res = await fetch('/api/crm/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extraData }),
      })
      const data = await res.json()

      if (action === 'test_email') {
        if (data.success) {
          setActionResult({ type: 'success', message: `Email de test envoyé avec succès à ${extraData?.email} (ID: ${data.resend_id})` })
        } else {
          setActionResult({ type: 'error', message: data.conseil || data.error || 'Erreur inconnue' })
        }
      } else if (action === 'trigger_cron') {
        if (data.success) {
          const r = data.cron_result
          setActionResult({
            type: 'success',
            message: `Cron exécuté : ${r.scheduled_emails_sent || 0} emails programmés, ${r.sequence_emails_sent || 0} séquences, ${r.event_reminders_sent || 0} rappels${r.errors ? ` | Erreurs: ${r.errors.length}` : ''}`,
          })
        } else {
          setActionResult({ type: 'error', message: data.cron_result?.error || 'Erreur cron' })
        }
      } else if (action === 'retry_failed') {
        setActionResult({ type: 'success', message: `${data.retried || 0} emails échoués remis en file d'attente` })
      }

      // Refresh diagnostic after action
      await loadDiagnostic()
    } catch (err) {
      setActionResult({ type: 'error', message: String(err) })
    }
    setActionLoading(null)
  }

  const configStatus = (val: string) => val === 'ok'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/crm" className="text-sm text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors">
            &larr; Retour au CRM
          </Link>
          <h1 className="font-display text-3xl font-light mt-2" style={{ color: 'var(--gold)' }}>
            Automatisations & Diagnostic
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Vérifiez l&apos;état de vos emails automatiques, testez l&apos;envoi et déclenchez manuellement.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Chargement du diagnostic...</div>
      ) : !diagnostic ? (
        <div className="text-center py-12 text-red-400">Impossible de charger le diagnostic. Vérifiez votre connexion.</div>
      ) : (
        <>
          {/* Action Result Toast */}
          {actionResult && (
            <div
              className="p-4 rounded-xl border"
              style={{
                background: actionResult.type === 'success' ? 'rgba(80,200,120,0.1)' : 'rgba(239,68,68,0.1)',
                borderColor: actionResult.type === 'success' ? 'rgba(80,200,120,0.3)' : 'rgba(239,68,68,0.3)',
                color: actionResult.type === 'success' ? '#50C878' : '#EF4444',
              }}
            >
              <div className="flex items-center justify-between">
                <span>{actionResult.type === 'success' ? '✓' : '✗'} {actionResult.message}</span>
                <button onClick={() => setActionResult(null)} className="text-[var(--text-muted)] hover:text-white ml-4">&times;</button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Test Email */}
            <div className="p-6 rounded-xl" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
              <h3 className="font-display text-lg mb-3" style={{ color: 'var(--gold)' }}>Tester l&apos;envoi</h3>
              <p className="text-xs text-[var(--text-muted)] mb-4">Envoie un email de test pour vérifier que Resend fonctionne.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="flex-1 px-3 py-2 rounded-lg text-sm"
                  style={{ background: 'var(--dark)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
                />
                <button
                  onClick={() => testEmail && doAction('test_email', { email: testEmail })}
                  disabled={!testEmail || actionLoading === 'test_email'}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))', color: '#050505' }}
                >
                  {actionLoading === 'test_email' ? '...' : 'Envoyer'}
                </button>
              </div>
            </div>

            {/* Trigger Cron */}
            <div className="p-6 rounded-xl" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
              <h3 className="font-display text-lg mb-3" style={{ color: 'var(--gold)' }}>Déclencher le cron</h3>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Exécute immédiatement le traitement des emails programmés et séquences.
                {diagnostic.due_enrollments > 0 && (
                  <span style={{ color: '#E8A87C' }}> {diagnostic.due_enrollments} email(s) en attente d&apos;envoi.</span>
                )}
              </p>
              <button
                onClick={() => doAction('trigger_cron')}
                disabled={actionLoading === 'trigger_cron'}
                className="w-full px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))', color: '#050505' }}
              >
                {actionLoading === 'trigger_cron' ? 'Exécution...' : 'Exécuter maintenant'}
              </button>
            </div>

            {/* Retry Failed */}
            <div className="p-6 rounded-xl" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
              <h3 className="font-display text-lg mb-3" style={{ color: 'var(--gold)' }}>Relancer les échecs</h3>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Remet les emails échoués en file d&apos;attente pour un nouvel essai.
                {diagnostic.scheduled_emails.failed > 0 && (
                  <span style={{ color: '#EF4444' }}> {diagnostic.scheduled_emails.failed} email(s) en échec.</span>
                )}
              </p>
              <button
                onClick={() => doAction('retry_failed')}
                disabled={actionLoading === 'retry_failed' || diagnostic.scheduled_emails.failed === 0}
                className="w-full px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                style={{ background: diagnostic.scheduled_emails.failed > 0 ? 'linear-gradient(135deg, #EF4444, #DC2626)' : 'rgba(255,255,255,0.1)', color: diagnostic.scheduled_emails.failed > 0 ? '#fff' : 'var(--text-muted)' }}
              >
                {actionLoading === 'retry_failed' ? '...' : `Relancer (${diagnostic.scheduled_emails.failed})`}
              </button>
            </div>
          </div>

          {/* Config Health */}
          <div className="p-6 rounded-xl" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
            <h3 className="font-display text-lg mb-4" style={{ color: 'var(--gold)' }}>Configuration</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(diagnostic.config).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2">
                  <span style={{ color: configStatus(val) ? '#50C878' : '#EF4444' }}>
                    {configStatus(val) ? '●' : '●'}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
            {!configStatus(diagnostic.config.resend_api_key) && (
              <p className="mt-3 text-sm text-red-400">RESEND_API_KEY manquant dans .env.local — aucun email ne peut être envoyé.</p>
            )}
            {!configStatus(diagnostic.config.cron_secret) && (
              <p className="mt-2 text-sm text-yellow-500">CRON_SECRET manquant — le cron job n&apos;est pas sécurisé. Ajoutez-le dans .env.local.</p>
            )}
          </div>

          {/* Tables & Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-xl" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
              <h3 className="font-display text-lg mb-4" style={{ color: 'var(--gold)' }}>Tables Supabase</h3>
              <div className="space-y-2">
                {Object.entries(diagnostic.tables).map(([table, status]) => (
                  <div key={table} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-[var(--text-muted)]">{table}</span>
                    <span style={{ color: status === 'ok' ? '#50C878' : '#EF4444' }}>
                      {status === 'ok' ? '● OK' : `● ${status}`}
                    </span>
                  </div>
                ))}
              </div>
              {Object.values(diagnostic.tables).some(s => s !== 'ok') && (
                <p className="mt-3 text-xs text-red-400">
                  Certaines tables sont manquantes. Exécutez la migration SQL dans Supabase.
                </p>
              )}
            </div>

            <div className="p-6 rounded-xl" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
              <h3 className="font-display text-lg mb-4" style={{ color: 'var(--gold)' }}>Emails programmés</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-display" style={{ color: '#E8A87C' }}>{diagnostic.scheduled_emails.pending}</div>
                  <div className="text-xs text-[var(--text-muted)]">En attente</div>
                </div>
                <div>
                  <div className="text-2xl font-display" style={{ color: '#50C878' }}>{diagnostic.scheduled_emails.sent}</div>
                  <div className="text-xs text-[var(--text-muted)]">Envoyés</div>
                </div>
                <div>
                  <div className="text-2xl font-display" style={{ color: '#EF4444' }}>{diagnostic.scheduled_emails.failed}</div>
                  <div className="text-xs text-[var(--text-muted)]">Échoués</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--dark-border)' }}>
                <div className="text-sm text-[var(--text-muted)]">
                  Templates : <span style={{ color: 'var(--gold)' }}>{diagnostic.templates.active}</span> actifs / {diagnostic.templates.total} total
                </div>
                {diagnostic.templates.total === 0 && (
                  <Link
                    href="/api/crm/email-templates/seed"
                    className="mt-2 inline-block text-xs underline"
                    style={{ color: 'var(--gold)' }}
                  >
                    Initialiser les 23 templates &rarr;
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Sequences */}
          <div className="p-6 rounded-xl" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg" style={{ color: 'var(--gold)' }}>Séquences automatiques</h3>
              <Link href="/admin/crm/sequences" className="text-xs underline" style={{ color: 'var(--gold)' }}>
                Gérer &rarr;
              </Link>
            </div>
            {diagnostic.sequences.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">
                Aucune séquence créée.{' '}
                <Link href="/admin/crm/sequences" className="underline" style={{ color: 'var(--gold)' }}>
                  Créer une séquence
                </Link>{' '}
                ou{' '}
                <Link href="/admin/crm/sequences?seed=true" className="underline" style={{ color: 'var(--gold)' }}>
                  initialiser les séquences par défaut
                </Link>.
              </p>
            ) : (
              <div className="space-y-3">
                {diagnostic.sequences.map((seq, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--dark)', border: '1px solid var(--dark-border)' }}>
                    <div className="flex items-center gap-3">
                      <span style={{ color: seq.status === 'active' ? '#50C878' : '#a1a1aa', fontSize: 10 }}>●</span>
                      <div>
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{seq.name}</div>
                        <div className="text-xs text-[var(--text-muted)]">
                          Déclencheur : {TRIGGER_LABELS[seq.trigger_type] || seq.trigger_type}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span style={{ color: '#4A90D9' }}>{seq.active_enrollments} actifs</span>
                      <span style={{ color: '#50C878' }}>{seq.completed_enrollments} terminés</span>
                      <span
                        className="px-2 py-1 rounded-full"
                        style={{
                          background: seq.status === 'active' ? 'rgba(80,200,120,0.15)' : 'rgba(161,161,170,0.15)',
                          color: seq.status === 'active' ? '#50C878' : '#a1a1aa',
                        }}
                      >
                        {seq.status === 'active' ? 'Active' : 'En pause'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {diagnostic.due_enrollments > 0 && (
              <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(232,168,124,0.1)', border: '1px solid rgba(232,168,124,0.3)' }}>
                <span style={{ color: '#E8A87C' }}>
                  {diagnostic.due_enrollments} email(s) de séquence prêts à être envoyés — utilisez &quot;Déclencher le cron&quot; ci-dessus.
                </span>
              </div>
            )}
          </div>

          {/* Recent Failures */}
          {diagnostic.recent_failures.length > 0 && (
            <div className="p-6 rounded-xl" style={{ background: 'var(--dark-card)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <h3 className="font-display text-lg mb-4" style={{ color: '#EF4444' }}>Derniers échecs</h3>
              <div className="space-y-2">
                {diagnostic.recent_failures.map((f, i) => (
                  <div key={i} className="p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs" style={{ color: '#E8A87C' }}>{f.template_key}</span>
                      <span className="text-xs text-[var(--text-muted)]">
                        {new Date(f.scheduled_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">{f.recipient_email}</div>
                    <div className="text-xs mt-1" style={{ color: '#EF4444' }}>{f.error_message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Events */}
          <div className="p-6 rounded-xl" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
            <h3 className="font-display text-lg mb-4" style={{ color: 'var(--gold)' }}>Activité récente</h3>
            {diagnostic.recent_events.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">Aucune activité email récente.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {diagnostic.recent_events.map((evt, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded text-sm" style={{ borderBottom: '1px solid var(--dark-border)' }}>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 10, color: evt.event_type.includes('sent') ? '#50C878' : evt.event_type.includes('open') ? '#4A90D9' : '#D4AF37' }}>●</span>
                      <span className="font-mono text-xs" style={{ color: 'var(--text-primary)' }}>{evt.event_type}</span>
                      {(evt.metadata as any)?.recipient && (
                        <span className="text-xs text-[var(--text-muted)]">→ {(evt.metadata as any).recipient}</span>
                      )}
                    </div>
                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(evt.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
