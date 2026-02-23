'use client'

import { useEffect, useState } from 'react'

interface Contact {
  id: string
  email: string
  first_name: string | null
  source: string
  opted_out: boolean
  created_at: string
}

export default function CRMContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [source, setSource] = useState('all')
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  async function loadContacts(p = page, s = search, src = source) {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(p) })
      if (s) params.set('search', s)
      if (src !== 'all') params.set('source', src)

      const res = await fetch(`/api/crm/contacts?${params}`)
      const data = await res.json()
      setContacts(data.contacts || [])
      setTotal(data.total || 0)
    } catch (e) {
      console.error('Load contacts error:', e)
    }
    setLoading(false)
  }

  useEffect(() => { loadContacts() }, [])

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await fetch('/api/crm/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' }),
      })
      const data = await res.json()
      if (data.error) {
        alert(`Erreur : ${data.error}`)
      } else {
        alert(`Synchronisation terminée : ${data.synced || 0} contacts synchronisés`)
      }
      loadContacts()
    } catch (e) {
      alert('Erreur lors de la synchronisation')
    }
    setSyncing(false)
  }

  function handleSearch() {
    setPage(1)
    loadContacts(1, search, source)
  }

  function handleSourceChange(newSource: string) {
    setSource(newSource)
    setPage(1)
    loadContacts(1, search, newSource)
  }

  const totalPages = Math.ceil(total / 50)

  const sourceLabels: Record<string, string> = {
    all: 'Toutes les sources',
    member: 'Membres inscrits',
    signature_test: 'Test signature',
    waitlist: 'Liste d\'attente',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-light" style={{ color: 'var(--gold)' }}>
            Contacts ({total})
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Tous les contacts collectés sur la plateforme.
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-5 py-2.5 rounded-full text-sm font-medium transition-all disabled:opacity-50"
          style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.3)' }}
        >
          {syncing ? 'Synchronisation...' : '🔄 Synchroniser les contacts'}
        </button>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Rechercher par email ou prénom..."
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
        />
        <select
          value={source}
          onChange={(e) => handleSourceChange(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
          style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }}
        >
          {Object.entries(sourceLabels).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <button
          onClick={handleSearch}
          className="px-5 py-2.5 rounded-xl text-sm font-medium"
          style={{ background: 'var(--gold)', color: '#050505' }}
        >
          Rechercher
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Chargement...</div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-[var(--text-muted)]">Aucun contact trouvé. Cliquez sur "Synchroniser" pour importer vos contacts.</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--dark-border)' }}>
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(212,175,55,0.05)' }}>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[var(--text-muted)]">Email</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[var(--text-muted)]">Prénom</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[var(--text-muted)]">Source</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[var(--text-muted)]">Date</th>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wider text-[var(--text-muted)]">Statut</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-t" style={{ borderColor: 'var(--dark-border)' }}>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>{c.email}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{c.first_name || '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-1 rounded-full text-xs"
                        style={{
                          background: c.source === 'member' ? 'rgba(80,200,120,0.15)' : c.source === 'signature_test' ? 'rgba(212,175,55,0.15)' : 'rgba(74,144,217,0.15)',
                          color: c.source === 'member' ? '#50C878' : c.source === 'signature_test' ? 'var(--gold)' : '#4A90D9',
                        }}
                      >
                        {sourceLabels[c.source] || c.source}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)]">
                      {new Date(c.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs ${c.opted_out ? 'text-red-400' : 'text-green-400'}`}>
                        {c.opted_out ? 'Désabonné' : 'Actif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => { setPage(page - 1); loadContacts(page - 1, search, source) }}
                disabled={page <= 1}
                className="px-4 py-2 rounded-lg text-sm disabled:opacity-30"
                style={{ background: 'var(--dark-card)', color: 'var(--text-primary)', border: '1px solid var(--dark-border)' }}
              >
                ← Précédent
              </button>
              <span className="px-4 py-2 text-sm text-[var(--text-muted)]">
                Page {page} / {totalPages}
              </span>
              <button
                onClick={() => { setPage(page + 1); loadContacts(page + 1, search, source) }}
                disabled={page >= totalPages}
                className="px-4 py-2 rounded-lg text-sm disabled:opacity-30"
                style={{ background: 'var(--dark-card)', color: 'var(--text-primary)', border: '1px solid var(--dark-border)' }}
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
