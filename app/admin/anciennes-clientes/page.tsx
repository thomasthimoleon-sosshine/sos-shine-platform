'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type LegacyClient = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  notes: string | null
  created_at: string
}

export default function AnciennesClientesPage() {
  const [clients, setClients] = useState<LegacyClient[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', notes: '' })
  const [csvImporting, setCsvImporting] = useState(false)
  const [csvResult, setCsvResult] = useState<{ added: number; skipped: number; errors: string[] } | null>(null)

  useEffect(() => {
    loadClients()
  }, [])

  async function loadClients() {
    const supabase = createClient()
    const { data, error: fetchError } = await (supabase as any)
      .from('legacy_clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setClients(data || [])
    }
    setLoading(false)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const email = form.email.trim().toLowerCase()
    if (!email) {
      setError("L'email est obligatoire.")
      return
    }

    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error: insertError } = await (supabase as any).from('legacy_clients').insert({
      email,
      first_name: form.first_name.trim() || null,
      last_name: form.last_name.trim() || null,
      notes: form.notes.trim() || null,
      added_by: user?.id || null,
    })

    if (insertError) {
      if (insertError.code === '23505') {
        setError('Cette adresse email est déjà dans la liste.')
      } else {
        setError(insertError.message)
      }
    } else {
      setForm({ email: '', first_name: '', last_name: '', notes: '' })
      setSuccess(`${email} ajoutée avec succès.`)
      await loadClients()
    }
    setSaving(false)
  }

  async function handleCsvImport(file: File) {
    setError(null)
    setSuccess(null)
    setCsvResult(null)
    setCsvImporting(true)

    try {
      const text = await file.text()
      const lines = text.split(/\r?\n/).filter(l => l.trim())
      if (lines.length === 0) {
        setError('Le fichier CSV est vide.')
        setCsvImporting(false)
        return
      }

      // Detect header row
      const headerLine = lines[0].toLowerCase()
      const hasHeader = headerLine.includes('email') || headerLine.includes('mail') || headerLine.includes('prénom') || headerLine.includes('prenom') || headerLine.includes('nom')
      const dataLines = hasHeader ? lines.slice(1) : lines

      // Detect separator (, or ;)
      const sep = lines[0].includes(';') ? ';' : ','

      // Parse header to find column indices
      let emailIdx = 0, firstNameIdx = -1, lastNameIdx = -1
      if (hasHeader) {
        const headers = lines[0].split(sep).map(h => h.trim().toLowerCase().replace(/"/g, ''))
        emailIdx = headers.findIndex(h => h.includes('email') || h.includes('mail'))
        firstNameIdx = headers.findIndex(h => h.includes('prénom') || h.includes('prenom') || h.includes('first'))
        lastNameIdx = headers.findIndex(h => h.includes('nom') && !h.includes('prénom') && !h.includes('prenom') && !h.includes('first'))
        if (emailIdx === -1) emailIdx = 0 // fallback: first column
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      let added = 0
      let skipped = 0
      const errors: string[] = []

      for (const line of dataLines) {
        const cols = line.split(sep).map(c => c.trim().replace(/^"|"$/g, ''))
        const email = (cols[emailIdx] || '').toLowerCase().trim()

        if (!email || !email.includes('@')) {
          if (email) errors.push(`"${email}" - email invalide`)
          continue
        }

        const firstName = firstNameIdx >= 0 ? cols[firstNameIdx]?.trim() || null : null
        const lastName = lastNameIdx >= 0 ? cols[lastNameIdx]?.trim() || null : null

        const { error: insertErr } = await (supabase as any).from('legacy_clients').insert({
          email,
          first_name: firstName,
          last_name: lastName,
          notes: 'Import CSV',
          added_by: user?.id || null,
        })

        if (insertErr) {
          if (insertErr.code === '23505') {
            skipped++
          } else {
            errors.push(`${email} - ${insertErr.message}`)
          }
        } else {
          added++
        }
      }

      setCsvResult({ added, skipped, errors })
      if (added > 0) {
        setSuccess(`${added} cliente${added > 1 ? 's' : ''} importée${added > 1 ? 's' : ''} avec succès.${skipped > 0 ? ` ${skipped} doublon${skipped > 1 ? 's' : ''} ignoré${skipped > 1 ? 's' : ''}.` : ''}`)
        await loadClients()
      } else if (skipped > 0) {
        setSuccess(`Toutes les ${skipped} adresses étaient déjà dans la liste.`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la lecture du fichier.')
    }
    setCsvImporting(false)
  }

  async function handleDelete(client: LegacyClient) {
    if (!confirm(`Supprimer ${client.email} de la liste ?`)) return
    const supabase = createClient()
    await (supabase as any).from('legacy_clients').delete().eq('id', client.id)
    setClients(prev => prev.filter(c => c.id !== client.id))
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold" style={{ color: 'var(--brand)' }}>
          Anciennes clientes Julia
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Les adresses ajoutées ici ont accès gratuitement au protocole <strong style={{ color: 'var(--text-secondary)' }}>Déconditionnement</strong> de l&apos;encyclopédie.
          <br />
          L&apos;accès est automatique dès que la personne s&apos;inscrit sur SOS Shine avec le même email.
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.25)', color: '#FF6B6B' }}>
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'rgba(85,239,196,0.1)', border: '1px solid rgba(85,239,196,0.25)', color: '#55EFC4' }}>
          {success}
        </div>
      )}

      {/* Formulaire d'ajout */}
      <div className="rounded-xl p-5" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
        <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Ajouter une ancienne cliente
        </h2>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Email *</label>
              <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="cliente@email.com"
                className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Prénom</label>
              <input type="text" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                placeholder="Prénom"
                className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Nom</label>
              <input type="text" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                placeholder="Nom"
                className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Notes (optionnel)</label>
              <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Ex: programme 2024"
                className="w-full px-3 py-2 rounded-lg text-sm" style={inputStyle} />
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, rgba(201,169,97,0.2), rgba(201,169,97,0.1))',
              border: '1px solid rgba(201,169,97,0.3)',
              color: '#C9A961',
              opacity: saving ? 0.5 : 1,
            }}>
            {saving ? 'Ajout en cours...' : 'Ajouter la cliente'}
          </button>
        </form>
      </div>

      {/* Import CSV */}
      <div className="rounded-xl p-5" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
        <h2 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Importer depuis un fichier CSV
        </h2>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          Export Systeme.io ou tout CSV avec une colonne email. Les colonnes prénom et nom sont détectées automatiquement. Les doublons sont ignorés.
        </p>
        <label
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, rgba(116,192,252,0.15), rgba(116,192,252,0.05))',
            border: '1px solid rgba(116,192,252,0.3)',
            color: '#74C0FC',
            opacity: csvImporting ? 0.5 : 1,
          }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {csvImporting ? 'Import en cours...' : 'Choisir un fichier CSV'}
          <input type="file" accept=".csv,.txt" className="hidden" disabled={csvImporting}
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) handleCsvImport(file)
              e.target.value = ''
            }} />
        </label>

        {csvResult && csvResult.errors.length > 0 && (
          <div className="mt-3 rounded-lg px-4 py-3 text-xs" style={{ background: 'rgba(255,165,0,0.1)', border: '1px solid rgba(255,165,0,0.25)', color: '#FFA500' }}>
            <p className="font-medium mb-1">{csvResult.errors.length} erreur{csvResult.errors.length > 1 ? 's' : ''} :</p>
            {csvResult.errors.slice(0, 10).map((err, i) => (
              <p key={i}>{err}</p>
            ))}
            {csvResult.errors.length > 10 && <p>... et {csvResult.errors.length - 10} autres</p>}
          </div>
        )}
      </div>

      {/* Liste des clientes */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {loading ? 'Chargement...' : `${clients.length} cliente${clients.length !== 1 ? 's' : ''} enregistrée${clients.length !== 1 ? 's' : ''}`}
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-[#C9A961] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : clients.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Aucune ancienne cliente ajoutée pour l&apos;instant.
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {clients.map(client => (
              <div key={client.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {[client.first_name, client.last_name].filter(Boolean).join(' ') || 'Sans nom'}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                    {client.email}
                    {client.notes && <span className="ml-2 opacity-50">- {client.notes}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {new Date(client.created_at).toLocaleDateString('fr-FR')}
                  </span>
                  <button onClick={() => handleDelete(client)}
                    className="text-xs px-2 py-1 rounded cursor-pointer"
                    style={{ color: '#FF6B6B', background: 'rgba(255,107,107,0.1)' }}>
                    Retirer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
