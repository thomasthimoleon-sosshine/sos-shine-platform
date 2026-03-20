'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface SignatureEmail {
  id: string
  metadata: {
    email: string
    first_name: string | null
    profile_key: string
    profile_name: string
    sent_at: string
  }
  created_at: string
}

const PROFILE_COLORS: Record<string, string> = {
  P1: '#74C0FC', P2: '#FF8C42', P3: '#E879A8', P4: '#8B9DC3', P5: '#A3BE8C',
  P6: '#C4A0E8', P7: '#FFD93D', P8: '#FF6B9D', P9: '#88D8B0', P10: '#FF5E5B',
}

const PROFILE_ICONS: Record<string, string> = {
  P1: '🧠', P2: '⚡', P3: '💗', P4: '🏰', P5: '🛡️',
  P6: '🦎', P7: '🔭', P8: '✨', P9: '🕊️', P10: '🔥',
}

export default function SignatureEmailsPage() {
  const [emails, setEmails] = useState<SignatureEmail[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/crm/signature-emails')
        const data = await res.json()
        setEmails(data.emails || [])
        setTotal(data.total || 0)
      } catch (e) {
        console.error('Load error:', e)
      }
      setLoading(false)
    }
    load()
  }, [])

  // Count profiles
  const profileStats: Record<string, number> = {}
  for (const em of emails) {
    const key = em.metadata?.profile_key || 'unknown'
    profileStats[key] = (profileStats[key] || 0) + 1
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/admin/crm"
              className="text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors"
            >
              ← CRM
            </Link>
          </div>
          <h1 className="font-display text-3xl font-light" style={{ color: 'var(--gold)' }}>
            Emails Signature Emotionnelle
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Suivi des resultats de test envoyes automatiquement par email.
          </p>
        </div>
        <div
          className="px-6 py-3 rounded-full text-sm font-semibold"
          style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.2)' }}
        >
          {total} emails envoyes
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Chargement...</div>
      ) : (
        <>
          {/* Profile distribution */}
          {Object.keys(profileStats).length > 0 && (
            <div>
              <h2 className="font-display text-xl mb-4" style={{ color: 'var(--text-primary)' }}>
                Repartition par profil
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(profileStats)
                  .sort((a, b) => b[1] - a[1])
                  .map(([key, count]) => (
                    <div
                      key={key}
                      className="p-4 rounded-xl text-center"
                      style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}
                    >
                      <div className="text-2xl mb-1">{PROFILE_ICONS[key] || '❓'}</div>
                      <div className="text-lg font-display" style={{ color: PROFILE_COLORS[key] || 'var(--gold)' }}>
                        {count}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{key}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Email list */}
          <div>
            <h2 className="font-display text-xl mb-4" style={{ color: 'var(--text-primary)' }}>
              Derniers emails envoyes
            </h2>
            {emails.length === 0 ? (
              <div
                className="p-8 rounded-xl text-center"
                style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}
              >
                <div className="text-3xl mb-3">📭</div>
                <p className="text-[var(--text-muted)]">
                  Aucun email de resultat envoye pour le moment.<br />
                  Les emails seront envoyes automatiquement lorsque les visiteurs completeront le test.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {emails.map((em) => {
                  const meta = em.metadata || {} as SignatureEmail['metadata']
                  const profileColor = PROFILE_COLORS[meta.profile_key] || 'var(--gold)'
                  const profileIcon = PROFILE_ICONS[meta.profile_key] || '❓'
                  const date = new Date(em.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })

                  return (
                    <div
                      key={em.id}
                      className="p-4 rounded-xl flex items-center justify-between"
                      style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{profileIcon}</span>
                        <div>
                          <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {meta.first_name || 'Anonyme'}
                          </div>
                          <div className="text-xs text-[var(--text-muted)]">{meta.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{ background: `${profileColor}15`, color: profileColor, border: `1px solid ${profileColor}30` }}
                        >
                          {meta.profile_name || meta.profile_key}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">{date}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
