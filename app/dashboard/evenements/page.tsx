'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Event, EventRegistration } from '@/types/database'

// Default events shown when Supabase table is empty
const defaultEvents: Omit<Event, 'id' | 'created_at'>[] = [
  {
    title: 'Shine Walk — Paris',
    description: 'Marche silencieuse puis échange bienveillant au cœur de Paris. Un moment pour respirer, marcher et se reconnecter aux autres.',
    location_name: 'Jardin du Luxembourg, Paris',
    latitude: 48.8462,
    longitude: 2.3372,
    event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    price: 0,
    max_participants: 20,
    created_by: null,
    is_active: true,
  },
  {
    title: 'Cercle de parole — Lyon',
    description: 'Cercle intime de partage entre membres SOS Shine. Chacun est accueilli tel qu\'il est, sans jugement.',
    location_name: 'Parc de la Tête d\'Or, Lyon',
    latitude: 45.7740,
    longitude: 4.8557,
    event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    price: 0,
    max_participants: 12,
    created_by: null,
    is_active: true,
  },
  {
    title: 'Atelier respiration & ancrage — Marseille',
    description: 'Atelier guidé par William pour apprendre les techniques de respiration et d\'ancrage corporel. Ouvert à tous les niveaux.',
    location_name: 'Plage des Catalans, Marseille',
    latitude: 43.2898,
    longitude: 5.3551,
    event_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    price: 15,
    max_participants: 15,
    created_by: null,
    is_active: true,
  },
  {
    title: 'Shine Walk — Bordeaux',
    description: 'Marche méditative le long de la Garonne suivie d\'un partage autour d\'un thé. Reconnectez-vous à votre force intérieure.',
    location_name: 'Quais de Bordeaux',
    latitude: 44.8378,
    longitude: -0.5792,
    event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    price: 0,
    max_participants: 25,
    created_by: null,
    is_active: true,
  },
]

export default function EvenementsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [registering, setRegistering] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // Load events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })

      if (eventsData && eventsData.length > 0) {
        setEvents(eventsData as Event[])
      }

      // Load user registrations
      const { data: regsData } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'registered')

      if (regsData) {
        setRegistrations(regsData as EventRegistration[])
      }

      setLoading(false)
    }
    init()
  }, [])

  const displayEvents: (Event | Omit<Event, 'id' | 'created_at'>)[] = events.length > 0 ? events : defaultEvents

  function isRegistered(eventId: string) {
    return registrations.some((r) => r.event_id === eventId)
  }

  async function handleRegister(eventId: string) {
    if (!userId || registering) return
    setRegistering(eventId)

    const supabase = createClient()
    const { error } = await supabase.from('event_registrations').insert({
      event_id: eventId,
      user_id: userId,
      status: 'registered',
    })

    if (!error) {
      setRegistrations((prev) => [
        ...prev,
        { id: crypto.randomUUID(), event_id: eventId, user_id: userId, status: 'registered', created_at: new Date().toISOString() },
      ])
    }
    setRegistering(null)
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function daysUntil(dateString: string) {
    const diff = new Date(dateString).getTime() - Date.now()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return "Aujourd'hui"
    if (days === 1) return 'Demain'
    return `Dans ${days} jours`
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Événements
        </h1>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
          Shine Walks, cercles de parole, ateliers... Retrouvez-vous dans la vraie vie.
        </p>
      </div>

      {/* Info banner */}
      <div
        className="rounded-2xl p-5 flex items-start gap-4"
        style={{
          background: 'rgba(85, 239, 196, 0.06)',
          border: '1px solid rgba(85, 239, 196, 0.15)',
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(85, 239, 196, 0.12)', color: '#55EFC4' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Les rencontres réelles
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Nos événements sont gratuits ou à prix libre. L&apos;important, c&apos;est d&apos;être ensemble.
          </p>
        </div>
      </div>

      {/* Events list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {displayEvents.map((event, index) => {
            const eventId = 'id' in event ? (event as Event).id : `default-${index}`
            const registered = isRegistered(eventId)

            return (
              <div
                key={eventId}
                className="rounded-2xl p-6 transition-all duration-200"
                style={{
                  background: 'var(--dark-card)',
                  border: '1px solid var(--dark-border)',
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Date badge */}
                  <div
                    className="w-16 h-16 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(212, 168, 67, 0.1)' }}
                  >
                    <span className="text-lg font-bold" style={{ color: 'var(--gold)' }}>
                      {new Date(event.event_date).getDate()}
                    </span>
                    <span className="text-xs uppercase" style={{ color: 'var(--gold-deep, var(--gold))' }}>
                      {new Date(event.event_date).toLocaleDateString('fr-FR', { month: 'short' })}
                    </span>
                  </div>

                  {/* Event info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                          {event.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 mt-1">
                          <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                            {event.location_name}
                          </span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {formatDate(event.event_date)} à {formatTime(event.event_date)}
                          </span>
                        </div>
                      </div>

                      <span
                        className="text-xs px-2.5 py-1 rounded-full flex-shrink-0"
                        style={{ background: 'rgba(85, 239, 196, 0.1)', color: '#55EFC4' }}
                      >
                        {daysUntil(event.event_date)}
                      </span>
                    </div>

                    <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {event.description}
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {event.price === 0 ? 'Gratuit' : `${event.price}€`}
                        </span>
                        {event.max_participants && (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {event.max_participants} places max
                          </span>
                        )}
                      </div>

                      {'id' in event ? (
                        registered ? (
                          <span
                            className="text-xs px-4 py-2 rounded-xl font-medium"
                            style={{ background: 'rgba(85, 239, 196, 0.1)', color: '#55EFC4' }}
                          >
                            Inscrit(e) ✓
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRegister((event as Event).id)}
                            disabled={registering === (event as Event).id}
                            className="text-xs px-4 py-2 rounded-xl font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50"
                            style={{ background: 'var(--gold)', color: 'var(--dark)' }}
                          >
                            {registering === event.id ? 'Inscription...' : "S'inscrire"}
                          </button>
                        )
                      ) : (
                        <span
                          className="text-xs px-4 py-2 rounded-xl font-medium"
                          style={{ background: 'rgba(212, 168, 67, 0.1)', color: 'var(--gold)' }}
                        >
                          Bientôt disponible
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Become host CTA */}
      <div
        className="rounded-2xl p-6 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(212, 168, 67, 0.06), rgba(212, 168, 67, 0.02))',
          border: '1px solid rgba(212, 168, 67, 0.12)',
        }}
      >
        <h3 className="font-display text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Devenez hôte certifié
        </h3>
        <p className="text-sm mb-4 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Après 4 mois dans la communauté, vous pouvez organiser vos propres Shine Walks et devenir Éclaireur.
        </p>
        <span className="text-xs font-medium" style={{ color: 'var(--gold)' }}>
          Programme Éclaireur — bientôt disponible
        </span>
      </div>
    </div>
  )
}
