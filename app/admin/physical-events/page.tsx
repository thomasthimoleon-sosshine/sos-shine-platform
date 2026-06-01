'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import FileUpload from '@/components/FileUpload'

type PhysicalEvent = {
  id: string
  title: string
  subtitle: string
  description: string
  event_date: string
  end_time: string
  location_name: string
  address: string
  image_url: string
  is_free: boolean
  price_label: string
  stripe_url: string
  cta_label: string
  max_spots: string
  is_published: boolean
  sort_order: number
}

const EMPTY: Omit<PhysicalEvent, 'id'> = {
  title: '',
  subtitle: '',
  description: '',
  event_date: '',
  end_time: '',
  location_name: '',
  address: '',
  image_url: '',
  is_free: false,
  price_label: '',
  stripe_url: '',
  cta_label: 'Réserver ma place',
  max_spots: '',
  is_published: false,
  sort_order: 0,
}

function toInputDatetime(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function toIso(local: string): string {
  if (!local) return ''
  return new Date(local).toISOString()
}

export default function PhysicalEventsAdmin() {
  const [events, setEvents] = useState<PhysicalEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<PhysicalEvent> | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const supabase = createClient()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('physical_events')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('event_date', { ascending: true })
    setEvents((data || []) as PhysicalEvent[])
    setLoading(false)
  }

  function openNew() {
    setEditing({ ...EMPTY })
    setMsg(null)
  }

  function openEdit(e: PhysicalEvent) {
    setEditing({ ...e, event_date: toInputDatetime(e.event_date) })
    setMsg(null)
  }

  async function save() {
    if (!editing) return
    setSaving(true)
    setMsg(null)

    const payload = {
      ...editing,
      event_date: editing.event_date ? toIso(editing.event_date) : null,
      max_spots: editing.max_spots ? parseInt(String(editing.max_spots)) : null,
      sort_order: Number(editing.sort_order) || 0,
    }

    let error
    if (editing.id) {
      const { id, ...rest } = payload as unknown as PhysicalEvent
      const res = await supabase.from('physical_events').update(rest).eq('id', id)
      error = res.error
    } else {
      const { id: _id, ...rest } = payload as unknown as PhysicalEvent
      const res = await supabase.from('physical_events').insert(rest)
      error = res.error
    }

    setSaving(false)
    if (error) {
      setMsg({ type: 'err', text: 'Erreur : ' + error.message })
    } else {
      setMsg({ type: 'ok', text: editing.id ? 'Modifié ✓' : 'Créé ✓' })
      setEditing(null)
      load()
    }
  }

  async function togglePublish(id: string, current: boolean) {
    await supabase.from('physical_events').update({ is_published: !current }).eq('id', id)
    load()
  }

  async function deleteEvent(id: string) {
    if (!confirm('Supprimer cet événement ?')) return
    await supabase.from('physical_events').delete().eq('id', id)
    load()
  }

  function field(key: keyof typeof EMPTY, label: string, type = 'text', hint?: string) {
    return (
      <div>
        <label className="block text-xs font-medium mb-1.5 text-[var(--text-muted)]">{label}</label>
        {hint && <p className="text-xs text-[var(--text-muted)] mb-1.5 opacity-60">{hint}</p>}
        <input
          type={type}
          value={String(editing?.[key] ?? '')}
          onChange={e => setEditing(prev => ({ ...prev, [key]: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
          style={{ background: 'var(--dark-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        />
      </div>
    )
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-light text-[var(--text-primary)]">Événements physiques</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Page publique : <span className="text-[var(--brand)]">sosshine.com/event</span></p>
        </div>
        <button onClick={openNew}
          className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
          style={{ background: 'linear-gradient(135deg, #C9A961, #B8960F)', color: '#000' }}>
          + Nouvel événement
        </button>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-3 rounded-xl text-sm"
          style={{ background: msg.type === 'ok' ? 'rgba(85,239,196,0.1)' : 'rgba(239,68,68,0.1)', color: msg.type === 'ok' ? '#55EFC4' : '#ef4444', border: `1px solid ${msg.type === 'ok' ? 'rgba(85,239,196,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
          {msg.text}
        </div>
      )}

      {/* Form */}
      {editing !== null && (
        <div className="rounded-2xl p-6 mb-8" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <h2 className="font-display text-lg font-light text-[var(--text-primary)] mb-6">
            {editing.id ? 'Modifier l\'événement' : 'Nouvel événement'}
          </h2>

          <div className="space-y-4">
            {/* Image */}
            <div>
              <label className="block text-xs font-medium mb-1.5 text-[var(--text-muted)]">Visuel</label>
              <FileUpload
                label="Image de couverture"
                accept="image/*"
                folder="events"
                currentUrl={editing.image_url || null}
                onUploaded={url => setEditing(prev => ({ ...prev, image_url: url }))}
                onRemoved={() => setEditing(prev => ({ ...prev, image_url: '' }))}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {field('title', 'Titre *')}
              {field('subtitle', 'Sous-titre')}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-[var(--text-muted)]">Description</label>
              <textarea
                value={editing.description || ''}
                onChange={e => setEditing(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-colors resize-none"
                style={{ background: 'var(--dark-bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {field('event_date', 'Date & heure de début', 'datetime-local')}
              {field('end_time', 'Heure de fin', 'text', 'ex: 21h30')}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {field('location_name', 'Lieu')}
              {field('address', 'Adresse', 'text', 'ex: "Adresse communiquée 24h avant"')}
            </div>

            {/* Free toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setEditing(prev => ({ ...prev, is_free: !prev?.is_free }))}
                className="relative w-11 h-6 rounded-full transition-colors"
                style={{ background: editing.is_free ? '#55EFC4' : 'rgba(255,255,255,0.1)' }}>
                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                  style={{ left: editing.is_free ? '22px' : '2px' }} />
              </button>
              <span className="text-sm text-[var(--text-secondary)]">Événement gratuit</span>
            </div>

            {!editing.is_free && (
              <div className="grid sm:grid-cols-2 gap-4">
                {field('price_label', 'Tarif affiché', 'text', 'ex: "21€ d\'acompte · Solde 90€ sur place"')}
                {field('max_spots', 'Nombre de places', 'number')}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {field('stripe_url', 'Lien Stripe / paiement', 'url', 'Payment Link Stripe ou autre URL')}
              {field('cta_label', 'Texte du bouton', 'text')}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {field('sort_order', 'Ordre d\'affichage', 'number', '0 = en premier')}
              <div className="flex items-end pb-1">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditing(prev => ({ ...prev, is_published: !prev?.is_published }))}
                    className="relative w-11 h-6 rounded-full transition-colors"
                    style={{ background: editing.is_published ? '#55EFC4' : 'rgba(255,255,255,0.1)' }}>
                    <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                      style={{ left: editing.is_published ? '22px' : '2px' }} />
                  </button>
                  <span className="text-sm text-[var(--text-secondary)]">Publié sur /event</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={save} disabled={saving}
              className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #C9A961, #B8960F)', color: '#000' }}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button onClick={() => setEditing(null)}
              className="px-6 py-2.5 rounded-full text-sm font-medium transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Events list */}
      {events.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]">Aucun événement. Crée le premier !</div>
      ) : (
        <div className="space-y-4">
          {events.map(e => {
            const d = e.event_date ? new Date(e.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'
            return (
              <div key={e.id} className="rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${e.is_published ? 'rgba(85,239,196,0.2)' : 'var(--border)'}`, background: 'var(--surface-card)' }}>
                <div className="flex items-center gap-4 p-5">
                  {e.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.image_url} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-medium text-[var(--text-primary)] truncate">{e.title}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          background: e.is_published ? 'rgba(85,239,196,0.12)' : 'rgba(255,255,255,0.06)',
                          color: e.is_published ? '#55EFC4' : 'var(--text-muted)',
                          border: `1px solid ${e.is_published ? 'rgba(85,239,196,0.25)' : 'var(--border)'}`,
                        }}>
                        {e.is_published ? 'Publié' : 'Brouillon'}
                      </span>
                      {e.is_free && (
                        <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: 'rgba(201,169,97,0.12)', color: '#C9A961', border: '1px solid rgba(201,169,97,0.2)' }}>
                          Gratuit
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">{d}</p>
                    {e.location_name && <p className="text-xs text-[var(--text-muted)] mt-0.5">📍 {e.location_name}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => togglePublish(e.id, e.is_published)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                      {e.is_published ? 'Dépublier' : 'Publier'}
                    </button>
                    <button onClick={() => openEdit(e)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{ background: 'rgba(201,169,97,0.1)', color: 'var(--brand)', border: '1px solid rgba(201,169,97,0.2)' }}>
                      Modifier
                    </button>
                    <button onClick={() => deleteEvent(e.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-red-500/20"
                      style={{ color: '#ef4444' }}>
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
