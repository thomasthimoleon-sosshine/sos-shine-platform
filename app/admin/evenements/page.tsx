'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Event } from '@/types/database'

const EVENT_TYPE_LABELS: Record<Event['event_type'], string> = {
  soin_collectif: 'Soin collectif',
  atelier: 'Atelier',
  live: 'Live',
  rencontre: 'Rencontre',
  shine_walk: 'Shine Walk',
}

const EVENT_TYPE_COLORS: Record<Event['event_type'], string> = {
  soin_collectif: '#74C0FC',
  atelier: '#55EFC4',
  live: '#E17055',
  rencontre: '#D4AF37',
  shine_walk: '#FF6B35',
}

const EMPTY_FORM = {
  title: '',
  description: '',
  event_type: 'soin_collectif' as Event['event_type'],
  location_name: '',
  latitude: '',
  longitude: '',
  event_date: '',
  price: 0,
  max_participants: '',
  live_url: '',
  replay_url: '',
}

function formatDateFR(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminEvenements() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [geocoding, setGeocoding] = useState(false)
  const [geocodeResult, setGeocodeResult] = useState<string | null>(null)

  async function geocodeCity(city: string) {
    if (!city || city.trim().length < 2) return
    setGeocoding(true)
    setGeocodeResult(null)
    try {
      const res = await fetch(`/api/geocode?city=${encodeURIComponent(city.trim())}`)
      const data = await res.json()
      if (res.ok && data.latitude != null && data.longitude != null) {
        setForm(prev => ({
          ...prev,
          latitude: String(data.latitude),
          longitude: String(data.longitude),
        }))
        setGeocodeResult(data.display_name)
      } else {
        setGeocodeResult(data.error || 'Ville introuvable')
      }
    } catch {
      setGeocodeResult('Erreur de connexion')
    } finally {
      setGeocoding(false)
    }
  }

  const loadEvents = useCallback(async () => {
    const supabase = createClient()
    const { data, error: fetchError } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: false })

    if (fetchError) {
      setError('Erreur lors du chargement des événements.')
      return
    }
    setEvents((data as Event[]) || [])
  }, [])

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
      await loadEvents()
      setLoading(false)
    }
    init()
  }, [loadEvents])

  function openCreateForm() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
    setError(null)
    setGeocodeResult(null)
  }

  function openEditForm(event: Event) {
    setEditingId(event.id)
    setForm({
      title: event.title,
      description: event.description || '',
      event_type: event.event_type,
      location_name: event.location_name || '',
      latitude: event.latitude != null ? String(event.latitude) : '',
      longitude: event.longitude != null ? String(event.longitude) : '',
      event_date: event.event_date ? event.event_date.slice(0, 16) : '',
      price: event.price,
      max_participants: event.max_participants != null ? String(event.max_participants) : '',
      live_url: event.live_url || '',
      replay_url: event.replay_url || '',
    })
    setShowForm(true)
    setError(null)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError(null)
    setGeocodeResult(null)
  }

  async function handleSave() {
    if (!form.title.trim()) { setError('Le titre est requis.'); return }
    if (!form.event_date) { setError('La date est requise.'); return }

    setSaving(true)
    setError(null)

    // Auto-géocodage si ville renseignée mais pas de coordonnées
    let lat = form.latitude ? Number(form.latitude) : null
    let lng = form.longitude ? Number(form.longitude) : null
    if (form.location_name.trim() && (!lat || !lng)) {
      try {
        const geoRes = await fetch(`/api/geocode?city=${encodeURIComponent(form.location_name.trim())}`)
        const geoData = await geoRes.json()
        if (geoRes.ok && geoData.latitude != null && geoData.longitude != null) {
          lat = geoData.latitude
          lng = geoData.longitude
        }
      } catch {
        // On continue sans coordonnées si le géocodage échoue
      }
    }

    const supabase = createClient()

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      event_type: form.event_type,
      location_name: form.location_name.trim() || null,
      latitude: lat,
      longitude: lng,
      event_date: new Date(form.event_date).toISOString(),
      price: Number(form.price) || 0,
      max_participants: form.max_participants ? Number(form.max_participants) : null,
      live_url: form.live_url.trim() || null,
      replay_url: form.replay_url.trim() || null,
    }

    if (editingId) {
      const { error: updateError } = await supabase
        .from('events')
        .update(payload)
        .eq('id', editingId)

      if (updateError) {
        setError(`Erreur lors de la mise à jour : ${updateError.message}`)
        setSaving(false)
        return
      }
    } else {
      const { error: insertError } = await supabase
        .from('events')
        .insert({ ...payload, created_by: userId, is_active: true })

      if (insertError) {
        setError(`Erreur lors de la création : ${insertError.message}`)
        setSaving(false)
        return
      }

      try {
        await fetch('/api/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'new_event',
            title: 'Nouvel événement',
            body: payload.title,
            link: '/dashboard/evenements',
          }),
        })
      } catch {
        // notification sending failed silently
      }
    }

    await loadEvents()
    cancelForm()
    setSaving(false)
  }

  async function handleToggleActive(event: Event) {
    setTogglingId(event.id)
    const supabase = createClient()
    await supabase
      .from('events')
      .update({ is_active: !event.is_active })
      .eq('id', event.id)
    await loadEvents()
    setTogglingId(null)
  }

  async function handleDelete(eventId: string) {
    if (!confirm('Supprimer cet événement ? Cette action est irréversible.')) return
    setDeletingId(eventId)
    const supabase = createClient()
    await supabase.from('events').delete().eq('id', eventId)
    await loadEvents()
    setDeletingId(null)
  }

  // ── Input style helpers ──
  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--dark-border)',
    color: 'var(--text-primary)',
    borderRadius: '0.5rem',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    width: '100%',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    color: 'var(--text-secondary)',
    fontSize: '0.75rem',
    fontWeight: 600,
    marginBottom: '0.25rem',
    display: 'block',
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Événements
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Gérez les soins collectifs, ateliers, lives et Shine Walks.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, #74C0FC, #4DA3E8)',
              color: '#fff',
            }}
          >
            <span className="text-base">+</span>
            Créer un événement
          </button>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{ background: 'rgba(225,112,85,0.1)', border: '1px solid rgba(225,112,85,0.3)', color: '#E17055' }}
        >
          {error}
        </div>
      )}

      {/* Inline form */}
      {showForm && (
        <div
          className="rounded-xl p-6 space-y-5"
          style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}
        >
          <h2 className="font-semibold text-lg" style={{ color: '#74C0FC' }}>
            {editingId ? 'Modifier l\u2019événement' : 'Nouvel événement'}
          </h2>

          {/* Row 1: title + event_type */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label style={labelStyle}>Titre *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex: Soin collectif — Pleine lune"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Type *</label>
              <select
                value={form.event_type}
                onChange={(e) => setForm({ ...form, event_type: e.target.value as Event['event_type'] })}
                style={inputStyle}
              >
                {(Object.keys(EVENT_TYPE_LABELS) as Event['event_type'][]).map((t) => (
                  <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Décrivez l'événement..."
              style={{ ...inputStyle, resize: 'vertical' as const }}
            />
          </div>

          {/* Row 2: date */}
          <div>
            <label style={labelStyle}>Date et heure *</label>
            <input
              type="datetime-local"
              value={form.event_date}
              onChange={(e) => setForm({ ...form, event_date: e.target.value })}
              style={inputStyle}
            />
          </div>

          {/* Row 2b: Ville pour géocodage automatique */}
          <div>
            <label style={labelStyle}>
              Ville <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(pour positionner sur le globe)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.location_name}
                onChange={(e) => setForm({ ...form, location_name: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    geocodeCity(form.location_name)
                  }
                }}
                placeholder="Ex: Paris, Lyon, Bali, New York..."
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => geocodeCity(form.location_name)}
                disabled={geocoding || !form.location_name.trim()}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap disabled:opacity-40"
                style={{
                  background: geocoding ? 'rgba(116,192,252,0.15)' : 'rgba(116,192,252,0.2)',
                  color: '#74C0FC',
                  border: '1px solid rgba(116,192,252,0.3)',
                }}
              >
                {geocoding ? 'Recherche...' : 'Localiser'}
              </button>
            </div>
            {geocodeResult && (
              <p
                className="mt-1.5 text-xs"
                style={{
                  color: form.latitude && form.longitude ? '#55EFC4' : '#E17055',
                }}
              >
                {form.latitude && form.longitude
                  ? `Coordonnées trouvées (${Number(form.latitude).toFixed(4)}, ${Number(form.longitude).toFixed(4)})`
                  : geocodeResult}
              </p>
            )}
            {form.latitude && form.longitude && !geocodeResult && (
              <p className="mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                Coordonnées actuelles : {Number(form.latitude).toFixed(4)}, {Number(form.longitude).toFixed(4)}
              </p>
            )}
          </div>

          {/* Row 3: price + max_participants */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>Prix (EUR)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Participants max</label>
              <input
                type="number"
                min={0}
                value={form.max_participants}
                onChange={(e) => setForm({ ...form, max_participants: e.target.value })}
                placeholder="Illimité si vide"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Row 4: live_url + replay_url */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>
                Lien Zoom / visio <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(visible par les inscrits)</span>
              </label>
              <input
                type="url"
                value={form.live_url}
                onChange={(e) => setForm({ ...form, live_url: e.target.value })}
                placeholder="https://zoom.us/j/123456789..."
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>
                Lien du replay <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(après l'événement)</span>
              </label>
              <input
                type="url"
                value={form.replay_url}
                onChange={(e) => setForm({ ...form, replay_url: e.target.value })}
                placeholder="https://..."
                style={inputStyle}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #74C0FC, #4DA3E8)',
                color: '#fff',
              }}
            >
              {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Créer l\u2019événement'}
            </button>
            <button
              onClick={cancelForm}
              className="px-5 py-2.5 rounded-xl text-sm transition-colors"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--dark-border)' }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Events list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#74C0FC] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}
        >
          <p className="text-4xl mb-3">📅</p>
          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Aucun événement</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Créez votre premier événement pour commencer.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const typeColor = EVENT_TYPE_COLORS[event.event_type]
            const isPast = new Date(event.event_date) < new Date()

            return (
              <div
                key={event.id}
                className="rounded-xl p-5 transition-all duration-200"
                style={{
                  background: 'var(--dark-card)',
                  border: '1px solid var(--dark-border)',
                  opacity: event.is_active ? 1 : 0.55,
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Left: info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className="font-semibold text-base truncate"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {event.title}
                      </h3>
                      <span
                        className="text-[0.65rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{
                          background: `${typeColor}15`,
                          color: typeColor,
                          border: `1px solid ${typeColor}30`,
                        }}
                      >
                        {EVENT_TYPE_LABELS[event.event_type]}
                      </span>
                      {!event.is_active && (
                        <span
                          className="text-[0.65rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={{
                            background: 'rgba(225,112,85,0.1)',
                            color: '#E17055',
                            border: '1px solid rgba(225,112,85,0.2)',
                          }}
                        >
                          Inactif
                        </span>
                      )}
                      {isPast && event.is_active && (
                        <span
                          className="text-[0.65rem] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={{
                            background: 'rgba(90,83,71,0.2)',
                            color: 'var(--text-muted)',
                            border: '1px solid rgba(90,83,71,0.3)',
                          }}
                        >
                          Passé
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span>{formatDateFR(event.event_date)}</span>
                      {event.location_name && (
                        <span style={{ color: 'var(--text-muted)' }}>{event.location_name}</span>
                      )}
                      {event.price > 0 && (
                        <span style={{ color: 'var(--gold)' }}>{event.price.toFixed(2)} EUR</span>
                      )}
                      {event.price === 0 && (
                        <span style={{ color: '#55EFC4' }}>Gratuit</span>
                      )}
                      {event.max_participants != null && (
                        <span style={{ color: 'var(--text-muted)' }}>
                          Max {event.max_participants} participants
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Toggle active */}
                    <button
                      onClick={() => handleToggleActive(event)}
                      disabled={togglingId === event.id}
                      title={event.is_active ? 'Désactiver' : 'Activer'}
                      className="p-2 rounded-lg text-xs transition-colors disabled:opacity-50"
                      style={{
                        background: event.is_active
                          ? 'rgba(85,239,196,0.1)'
                          : 'rgba(225,112,85,0.1)',
                        color: event.is_active ? '#55EFC4' : '#E17055',
                        border: `1px solid ${event.is_active ? 'rgba(85,239,196,0.2)' : 'rgba(225,112,85,0.2)'}`,
                      }}
                    >
                      {togglingId === event.id ? '...' : event.is_active ? 'Actif' : 'Inactif'}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => openEditForm(event)}
                      title="Modifier"
                      className="p-2 rounded-lg text-xs transition-colors"
                      style={{
                        background: 'rgba(116,192,252,0.1)',
                        color: '#74C0FC',
                        border: '1px solid rgba(116,192,252,0.2)',
                      }}
                    >
                      Modifier
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(event.id)}
                      disabled={deletingId === event.id}
                      title="Supprimer"
                      className="p-2 rounded-lg text-xs transition-colors disabled:opacity-50"
                      style={{
                        background: 'rgba(255,107,107,0.1)',
                        color: '#FF6B6B',
                        border: '1px solid rgba(255,107,107,0.2)',
                      }}
                    >
                      {deletingId === event.id ? '...' : 'Supprimer'}
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
