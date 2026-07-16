'use client'

import { useEffect, useState } from 'react'

type Row = { email: string; first_name: string; city: string | null; stage: string | null; consent: boolean; created_at: string }
type Prof = { completed: boolean; scores: Record<string, number>; updated_at: string }

export default function AdminSosMeetPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [profiles, setProfiles] = useState<Record<string, Prof>>({})
  const [counts, setCounts] = useState<{ waitlist: number; profilesCompleted: number }>({ waitlist: 0, profilesCompleted: 0 })
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/sosmeet/admin')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setErr(d.error); return }
        setRows(d.waitlist || [])
        setProfiles(d.profiles || {})
        setCounts(d.counts || { waitlist: 0, profilesCompleted: 0 })
      })
      .catch(() => setErr('Erreur de chargement'))
      .finally(() => setLoading(false))
  }, [])

  function exportCsv() {
    const header = ['email', 'prenom', 'ville', 'stade', 'consentement', 'inscrit_le', 'profil_complet']
    const lines = rows.map((r) => [
      r.email, r.first_name, r.city || '', r.stage || '', r.consent ? 'oui' : 'non',
      new Date(r.created_at).toLocaleString('fr-FR'),
      profiles[r.email]?.completed ? 'oui' : 'non',
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    const csv = [header.join(','), ...lines].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `sosmeet-waitlist-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  const box: React.CSSProperties = { background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 14 }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl" style={{ color: '#C9A961' }}>SOS Meet — Waitlist</h1>
        <button onClick={exportCsv} disabled={!rows.length}
          className="text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg,#C9A961,#E2CB86)', color: '#050505' }}>
          Exporter en CSV
        </button>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chargement…</p>
      ) : err ? (
        <p className="text-sm" style={{ color: 'var(--danger)' }}>{err}</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-5" style={box}>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{counts.waitlist}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Inscrits à la liste d&apos;attente</p>
            </div>
            <div className="p-5" style={box}>
              <p className="text-3xl font-bold" style={{ color: '#C9A961' }}>{counts.profilesCompleted}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Profils de compatibilité complétés</p>
            </div>
          </div>

          <div className="overflow-x-auto" style={box}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: 'var(--text-muted)', textAlign: 'left' }}>
                  <th className="px-4 py-3 font-medium">Prénom</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Ville</th>
                  <th className="px-4 py-3 font-medium">Stade</th>
                  <th className="px-4 py-3 font-medium">Profil</th>
                  <th className="px-4 py-3 font-medium">Inscrit le</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.email} style={{ borderTop: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                    <td className="px-4 py-3">{r.first_name}</td>
                    <td className="px-4 py-3">{r.email}</td>
                    <td className="px-4 py-3">{r.city || '—'}</td>
                    <td className="px-4 py-3">{r.stage || '—'}</td>
                    <td className="px-4 py-3">
                      {profiles[r.email]?.completed
                        ? <span style={{ color: '#55EFC4' }}>✓ complet</span>
                        : profiles[r.email]
                          ? <span style={{ color: '#C9A961' }}>en cours</span>
                          : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td className="px-4 py-3">{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: 'var(--text-muted)' }}>Aucun inscrit pour le moment.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
