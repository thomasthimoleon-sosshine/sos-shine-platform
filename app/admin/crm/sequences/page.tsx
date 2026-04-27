'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Sequence {
  id: string
  name: string
  trigger_type: string
  status: string
  created_at: string
  active_enrollments: number
  completed_enrollments: number
  crm_sequence_steps: { count: number }[]
}

const triggerLabels: Record<string, string> = {
  signup: 'Inscription membre',
  signature_test: 'Test Signature Émotionnelle',
  waitlist: 'Inscription liste d\'attente',
  manual: 'Manuel',
}

export default function CRMSequencesPage() {
  const [sequences, setSequences] = useState<Sequence[]>([])
  const [loading, setLoading] = useState(true)

  async function loadSequences() {
    setLoading(true)
    try {
      const res = await fetch('/api/crm/sequences')
      const data = await res.json()
      setSequences(data.sequences || [])
    } catch (e) {
      console.error('Load sequences error:', e)
    }
    setLoading(false)
  }

  useEffect(() => { loadSequences() }, [])

  async function toggleStatus(seq: Sequence) {
    const newStatus = seq.status === 'active' ? 'paused' : 'active'
    try {
      await fetch('/api/crm/sequences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: seq.id, status: newStatus }),
      })
      loadSequences()
    } catch {
      alert('Erreur lors de la mise à jour')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette séquence et tous ses emails ? Les contacts en cours recevront plus rien.')) return
    try {
      await fetch(`/api/crm/sequences?id=${id}`, { method: 'DELETE' })
      loadSequences()
    } catch {
      alert('Erreur lors de la suppression')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-light" style={{ color: 'var(--gold)' }}>
            Séquences Automatiques
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Parcours d'emails déclenchés automatiquement selon les actions des contacts.
          </p>
        </div>
        <Link
          href="/admin/crm/sequences/new"
          className="px-6 py-3 rounded-full text-sm font-semibold transition-all"
          style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))', color: '#000000' }}
        >
          + Nouvelle séquence
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Chargement...</div>
      ) : sequences.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔄</div>
          <p className="text-[var(--text-muted)] mb-2">Aucune séquence créée pour le moment.</p>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            Créez des parcours d'emails qui s'envoient automatiquement quand quelqu'un s'inscrit ou fait le test.
          </p>
          <Link
            href="/admin/crm/sequences/new"
            className="inline-block px-6 py-3 rounded-full text-sm font-semibold"
            style={{ background: 'var(--gold)', color: '#000000' }}
          >
            Créer ma première séquence
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sequences.map((seq) => {
            const stepsCount = seq.crm_sequence_steps?.[0]?.count || 0
            return (
              <div
                key={seq.id}
                className="p-5 rounded-xl"
                style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-display text-lg" style={{ color: 'var(--text-primary)' }}>
                        {seq.name}
                      </h3>
                      <span
                        className="px-3 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          background: seq.status === 'active' ? 'rgba(80,200,120,0.15)' : 'rgba(201,169,97,0.15)',
                          color: seq.status === 'active' ? '#50C878' : 'var(--gold)',
                        }}
                      >
                        {seq.status === 'active' ? '● Active' : '⏸ En pause'}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">
                      Déclencheur : {triggerLabels[seq.trigger_type] || seq.trigger_type}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {stepsCount} email{stepsCount > 1 ? 's' : ''} dans la séquence
                      {' · '}
                      {seq.active_enrollments} en cours
                      {' · '}
                      {seq.completed_enrollments} terminé{seq.completed_enrollments > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleStatus(seq)}
                      className="px-4 py-2 rounded-full text-xs font-medium transition-all"
                      style={{
                        background: seq.status === 'active' ? 'rgba(201,169,97,0.1)' : 'rgba(80,200,120,0.1)',
                        color: seq.status === 'active' ? 'var(--gold)' : '#50C878',
                        border: `1px solid ${seq.status === 'active' ? 'rgba(201,169,97,0.2)' : 'rgba(80,200,120,0.2)'}`,
                      }}
                    >
                      {seq.status === 'active' ? '⏸ Mettre en pause' : '▶ Activer'}
                    </button>
                    <button
                      onClick={() => handleDelete(seq.id)}
                      className="px-3 py-2 rounded-full text-xs text-red-400 hover:bg-red-400/10 transition-all"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
