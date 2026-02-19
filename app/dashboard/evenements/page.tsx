'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Event, EventRegistration } from '@/types/database'

// Default events shown when Supabase table is empty
const defaultEvents: (Omit<Event, 'id' | 'created_at'> & { id: string })[] = [
  {
    id: 'default-0',
    title: 'Shine Walk — Paris',
    description: 'Marche silencieuse puis échange bienveillant au cœur de Paris. Un moment pour respirer, marcher et se reconnecter aux autres.',
    event_type: 'shine_walk',
    location_name: 'Jardin du Luxembourg, Paris',
    latitude: 48.8462,
    longitude: 2.3372,
    event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    live_url: null,
    replay_url: null,
    price: 0,
    max_participants: 20,
    created_by: null,
    is_active: true,
  },
  {
    id: 'default-1',
    title: 'Cercle de parole — Lyon',
    description: 'Cercle intime de partage entre membres SOS Shine. Chacun est accueilli tel qu\'il est, sans jugement.',
    event_type: 'rencontre',
    location_name: 'Parc de la Tête d\'Or, Lyon',
    latitude: 45.7740,
    longitude: 4.8557,
    event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    live_url: null,
    replay_url: null,
    price: 0,
    max_participants: 12,
    created_by: null,
    is_active: true,
  },
  {
    id: 'default-2',
    title: 'Atelier respiration & ancrage — Marseille',
    description: 'Atelier guidé par William pour apprendre les techniques de respiration et d\'ancrage corporel. Ouvert à tous les niveaux.',
    event_type: 'atelier',
    location_name: 'Plage des Catalans, Marseille',
    latitude: 43.2898,
    longitude: 5.3551,
    event_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    live_url: null,
    replay_url: null,
    price: 15,
    max_participants: 15,
    created_by: null,
    is_active: true,
  },
  {
    id: 'default-3',
    title: 'Shine Walk — Bordeaux',
    description: 'Marche méditative le long de la Garonne suivie d\'un partage autour d\'un thé. Reconnectez-vous à votre force intérieure.',
    event_type: 'shine_walk',
    location_name: 'Quais de Bordeaux',
    latitude: 44.8378,
    longitude: -0.5792,
    event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    live_url: null,
    replay_url: null,
    price: 0,
    max_participants: 25,
    created_by: null,
    is_active: true,
  },
]

/* ─── World Map Component with Diamond markers ─── */
function WorldMap({ events, selectedEvent, onSelect }: {
  events: { id: string; title: string; latitude: number | null; longitude: number | null; location_name: string | null }[]
  selectedEvent: string | null
  onSelect: (id: string) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number>(0)
  const timeRef = useRef(0)

  // Convert lat/lng to x/y on our map (simple equirectangular)
  function project(lat: number, lng: number, w: number, h: number): [number, number] {
    const x = ((lng + 180) / 360) * w
    const y = ((90 - lat) / 180) * h
    return [x, y]
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const dpr = window.devicePixelRatio || 1
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = rect.width + 'px'
    canvas.style.height = rect.height + 'px'

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height

    function draw() {
      if (!ctx) return
      timeRef.current += 0.02
      const t = timeRef.current

      // Clear
      ctx.clearRect(0, 0, w, h)

      // Draw subtle world outline (dots grid)
      ctx.fillStyle = 'rgba(212,175,55,0.06)'
      for (let lat = -60; lat <= 70; lat += 10) {
        for (let lng = -170; lng <= 180; lng += 10) {
          const [x, y] = project(lat, lng, w, h)
          ctx.beginPath()
          ctx.arc(x, y, 1, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Draw continent outlines (simplified dots)
      ctx.fillStyle = 'rgba(212,175,55,0.12)'
      const continentPoints = [
        // Europe
        ...[[-10,36],[0,43],[3,43],[7,44],[10,45],[13,46],[15,47],[18,48],[20,48],[25,50],[30,50],[30,45],[25,38],[20,35],[10,37],[5,48],[0,49],[-5,48],[-9,43]],
        // Africa
        ...[[-17,15],[-15,12],[-10,5],[5,4],[10,2],[15,5],[20,5],[30,5],[35,10],[40,12],[42,2],[40,-5],[35,-15],[30,-25],[25,-34],[20,-34],[15,-30],[12,-25],[10,-15],[5,-5],[0,5],[-5,10]],
        // Asia
        ...[[30,35],[35,33],[40,30],[45,25],[50,25],[55,25],[60,25],[65,30],[70,30],[80,28],[90,25],[95,20],[100,15],[105,10],[110,20],[115,25],[120,30],[125,35],[130,35],[135,35],[140,40],[145,45],[150,50],[140,55],[130,55],[120,50],[110,50],[100,45],[90,45],[80,40],[70,40],[60,40],[50,40],[40,40]],
        // Americas
        ...[[-80,10],[-75,20],[-70,25],[-75,30],[-80,35],[-85,40],[-90,45],[-95,50],[-100,55],[-110,60],[-120,60],[-130,55],[-125,50],[-120,45],[-115,35],[-110,30],[-105,25],[-100,20],[-95,18],[-90,15],[-85,10],[-80,10]],
        ...[[-80,0],[-75,-5],[-70,-15],[-65,-20],[-60,-25],[-55,-30],[-50,-25],[-45,-20],[-40,-15],[-35,-10],[-40,-3],[-50,0],[-55,5],[-60,5],[-65,5],[-70,5],[-75,5],[-77,8]],
        // Australia
        ...[[115,-15],[120,-15],[130,-15],[135,-20],[140,-25],[145,-30],[150,-35],[150,-30],[145,-20],[140,-15],[135,-12],[130,-12],[125,-15],[120,-20],[115,-25],[115,-20]],
      ]
      continentPoints.forEach(([lng, lat]) => {
        const [x, y] = project(lat, lng, w, h)
        ctx.beginPath()
        ctx.arc(x, y, 1.5, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw subtle connection lines between events
      const eventPositions = events
        .filter(e => e.latitude && e.longitude)
        .map(e => ({ ...e, pos: project(e.latitude!, e.longitude!, w, h) }))

      ctx.strokeStyle = 'rgba(212,175,55,0.08)'
      ctx.lineWidth = 0.5
      for (let i = 0; i < eventPositions.length; i++) {
        for (let j = i + 1; j < eventPositions.length; j++) {
          ctx.beginPath()
          ctx.moveTo(eventPositions[i].pos[0], eventPositions[i].pos[1])
          ctx.lineTo(eventPositions[j].pos[0], eventPositions[j].pos[1])
          ctx.stroke()
        }
      }

      // Draw diamond markers for each event
      eventPositions.forEach((event, idx) => {
        const [x, y] = event.pos
        const isSelected = event.id === selectedEvent
        const pulse = Math.sin(t * 2 + idx * 1.5) * 0.5 + 0.5
        const size = isSelected ? 10 : 7

        // Glow
        const glowSize = size + 8 + pulse * 6
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize)
        gradient.addColorStop(0, `rgba(212,175,55,${isSelected ? 0.4 : 0.2 + pulse * 0.15})`)
        gradient.addColorStop(1, 'rgba(212,175,55,0)')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, glowSize, 0, Math.PI * 2)
        ctx.fill()

        // Diamond shape
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(Math.PI / 4)
        const s = size + (isSelected ? Math.sin(t * 3) * 2 : 0)

        // Diamond fill
        ctx.fillStyle = isSelected ? '#D4AF37' : `rgba(212,175,55,${0.7 + pulse * 0.3})`
        ctx.fillRect(-s / 2, -s / 2, s, s)

        // Diamond border shine
        ctx.strokeStyle = `rgba(255,255,255,${0.3 + pulse * 0.4})`
        ctx.lineWidth = 1
        ctx.strokeRect(-s / 2, -s / 2, s, s)

        // Inner sparkle
        ctx.fillStyle = `rgba(255,255,255,${0.3 + pulse * 0.5})`
        ctx.fillRect(-s / 6, -s / 6, s / 3, s / 3)

        ctx.restore()

        // Label
        if (isSelected && event.location_name) {
          ctx.font = '11px "DM Sans", sans-serif'
          ctx.fillStyle = '#D4AF37'
          ctx.textAlign = 'center'
          ctx.fillText(event.location_name, x, y - size - 10)
        }
      })

      // Floating sparkle particles
      for (let i = 0; i < 12; i++) {
        const sparkleX = (Math.sin(t * 0.3 + i * 2.1) * 0.5 + 0.5) * w
        const sparkleY = (Math.cos(t * 0.25 + i * 1.7) * 0.5 + 0.5) * h
        const sparkleAlpha = (Math.sin(t * 1.5 + i * 0.8) * 0.5 + 0.5) * 0.15
        ctx.fillStyle = `rgba(212,175,55,${sparkleAlpha})`
        ctx.save()
        ctx.translate(sparkleX, sparkleY)
        ctx.rotate(Math.PI / 4)
        ctx.fillRect(-1.5, -1.5, 3, 3)
        ctx.restore()
      }

      animFrameRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => cancelAnimationFrame(animFrameRef.current)
  }, [events, selectedEvent])

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const rect = canvas.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top
    const w = rect.width
    const h = rect.height

    // Find closest event within 20px
    let closest: string | null = null
    let minDist = 25

    events.forEach(event => {
      if (!event.latitude || !event.longitude) return
      const [x, y] = project(event.latitude, event.longitude, w, h)
      const dist = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2)
      if (dist < minDist) {
        minDist = dist
        closest = event.id
      }
    })

    if (closest) onSelect(closest)
  }

  return (
    <div ref={containerRef} className="relative w-full rounded-2xl overflow-hidden" style={{ height: 280, background: 'rgba(212,175,55,0.02)', border: '1px solid rgba(212,175,55,0.1)' }}>
      <canvas ref={canvasRef} className="w-full h-full cursor-pointer" onClick={handleClick} />
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <span className="w-2 h-2 rotate-45 inline-block" style={{ background: '#D4AF37' }} />
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Cliquez sur un diamant pour voir l&apos;événement</span>
      </div>
    </div>
  )
}

export default function EvenementsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [registering, setRegistering] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null)

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

  // Merge DB events + default events (defaults only if no DB events)
  const displayEvents = events.length > 0 ? events : defaultEvents as unknown as Event[]

  // Map data for WorldMap
  const mapEvents = (events.length > 0 ? events : defaultEvents).map(e => ({
    id: e.id,
    title: e.title,
    latitude: e.latitude,
    longitude: e.longitude,
    location_name: e.location_name,
  }))

  function isRegistered(eventId: string) {
    return registrations.some((r) => r.event_id === eventId)
  }

  async function handleRegister(eventId: string) {
    if (!userId || registering || eventId.startsWith('default-')) return
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

  function getEventTypeInfo(type: string) {
    const map: Record<string, { label: string; color: string }> = {
      shine_walk: { label: 'Shine Walk', color: '#55EFC4' },
      rencontre: { label: 'Rencontre', color: '#74C0FC' },
      atelier: { label: 'Atelier', color: '#FFEAA7' },
      soin_collectif: { label: 'Soin Collectif', color: '#DDA0DD' },
      live: { label: 'Live', color: '#E17055' },
    }
    return map[type] || { label: type, color: 'var(--text-secondary)' }
  }

  function scrollToEvent(id: string) {
    setSelectedEvent(id)
    const el = document.getElementById(`event-${id}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
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

      {/* World Map */}
      {!loading && (
        <WorldMap events={mapEvents} selectedEvent={selectedEvent} onSelect={scrollToEvent} />
      )}

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
          {displayEvents.map((event) => {
            const isDefault = ('id' in event) && (event as Event).id?.startsWith?.('default-')
            const eventId = (event as Event).id
            const registered = !isDefault && isRegistered(eventId)
            const isSelected = selectedEvent === eventId
            const typeInfo = getEventTypeInfo(event.event_type)

            return (
              <div
                key={eventId}
                id={`event-${eventId}`}
                className="rounded-2xl p-6 transition-all duration-300"
                style={{
                  background: 'var(--dark-card)',
                  border: isSelected ? '1px solid rgba(212,175,55,0.4)' : '1px solid var(--dark-border)',
                  boxShadow: isSelected ? '0 0 20px rgba(212,175,55,0.08)' : 'none',
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
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                            {event.title}
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${typeInfo.color}15`, color: typeInfo.color }}>
                            {typeInfo.label}
                          </span>
                        </div>
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

                      {isDefault ? (
                        <span
                          className="text-xs px-4 py-2 rounded-xl font-medium"
                          style={{ background: 'rgba(212, 168, 67, 0.1)', color: 'var(--gold)' }}
                        >
                          Aperçu
                        </span>
                      ) : registered ? (
                        <span
                          className="text-xs px-4 py-2 rounded-xl font-medium"
                          style={{ background: 'rgba(85, 239, 196, 0.1)', color: '#55EFC4' }}
                        >
                          Inscrit(e) ✓
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRegister(eventId)}
                          disabled={registering === eventId}
                          className="text-xs px-4 py-2 rounded-xl font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50"
                          style={{ background: 'var(--gold)', color: 'var(--dark)' }}
                        >
                          {registering === eventId ? 'Inscription...' : "S'inscrire"}
                        </button>
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
