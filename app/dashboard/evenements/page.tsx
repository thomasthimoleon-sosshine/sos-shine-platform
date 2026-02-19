'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Event, EventRegistration } from '@/types/database'

/* ─── Continent polygon data [lng, lat] ─── */
const CONTINENTS: [number, number][][] = [
  // Europe
  [[-10,35],[-9,38],[-9,43],[-5,48],[0,49],[3,47],[5,48],[7,48],[10,45],[13,46],[15,47],[18,48],[24,48],[25,50],[30,50],[32,47],[30,45],[28,41],[26,38],[22,35],[15,37],[10,37],[5,36],[0,36],[-5,36],[-10,35]],
  // Africa
  [[-17,15],[-17,21],[-13,28],[-5,36],[0,36],[10,37],[15,37],[22,35],[26,38],[30,31],[33,30],[35,32],[37,20],[42,12],[51,11],[50,2],[42,-2],[40,-10],[35,-20],[33,-27],[28,-34],[22,-34],[18,-32],[15,-27],[12,-20],[12,-5],[8,4],[5,5],[2,6],[-5,10],[-8,5],[-15,11],[-17,15]],
  // Asia
  [[26,38],[28,41],[30,45],[32,47],[30,50],[40,55],[50,55],[60,55],[70,55],[80,55],[90,50],[100,50],[110,50],[120,53],[130,50],[135,55],[140,55],[145,50],[150,48],[140,40],[130,35],[125,33],[120,30],[118,25],[110,20],[105,15],[100,14],[98,10],[100,5],[104,1],[110,0],[115,2],[120,5],[127,-8],[130,-5],[140,-5],[145,-8],[140,-10],[130,-8],[120,-8],[115,0],[110,-2],[105,0],[100,2],[98,8],[95,15],[90,22],[85,25],[80,28],[73,28],[70,30],[65,28],[60,25],[55,25],[50,28],[44,20],[42,12],[37,20],[35,32],[33,30],[30,31],[26,38]],
  // North America
  [[-170,65],[-165,62],[-150,60],[-140,60],[-130,55],[-125,50],[-120,45],[-118,35],[-115,32],[-110,30],[-105,25],[-100,25],[-97,19],[-92,15],[-88,14],[-83,10],[-80,8],[-77,8],[-75,10],[-80,15],[-82,22],[-81,25],[-80,30],[-76,35],[-75,40],[-70,42],[-67,44],[-65,47],[-60,47],[-55,50],[-58,52],[-65,55],[-70,58],[-75,62],[-80,63],[-85,65],[-95,70],[-110,70],[-130,72],[-145,70],[-155,70],[-165,68],[-170,65]],
  // South America
  [[-80,8],[-77,8],[-75,10],[-73,11],[-70,12],[-62,11],[-60,8],[-55,5],[-52,3],[-50,0],[-50,-3],[-45,-5],[-40,-3],[-38,-5],[-35,-10],[-37,-15],[-40,-20],[-42,-23],[-45,-24],[-48,-28],[-50,-30],[-52,-33],[-55,-35],[-58,-38],[-65,-40],[-68,-48],[-68,-55],[-72,-52],[-75,-46],[-73,-40],[-72,-35],[-70,-30],[-68,-25],[-70,-18],[-75,-15],[-78,-5],[-80,0],[-80,8]],
  // Australia
  [[114,-22],[117,-20],[121,-18],[129,-15],[135,-13],[137,-15],[140,-18],[143,-15],[145,-17],[150,-22],[152,-25],[153,-28],[152,-32],[148,-35],[145,-38],[140,-38],[137,-35],[135,-33],[130,-32],[128,-30],[125,-32],[118,-33],[115,-34],[114,-30],[114,-26],[114,-22]],
  // Greenland
  [[-55,60],[-50,62],[-45,65],[-42,68],[-20,77],[-18,80],[-22,82],[-30,83],[-40,83],[-50,82],[-55,80],[-58,78],[-60,75],[-57,70],[-50,65],[-55,60]],
  // UK+Ireland
  [[-10,50],[-6,52],[-5,55],[-3,58],[0,59],[2,56],[1,53],[0,51],[-5,50],[-10,50]],
  // Japan
  [[130,31],[131,33],[134,35],[137,37],[140,40],[141,42],[145,45],[143,42],[142,39],[140,36],[137,34],[134,33],[130,31]],
  // Indonesia
  [[95,5],[98,3],[104,1],[106,-2],[108,-5],[106,-8],[112,-8],[115,-8],[120,-8],[125,-8],[127,-5],[130,-3],[135,-5],[140,-5],[141,-8],[138,-8],[135,-7],[130,-5],[125,-10],[120,-10],[115,-10],[110,-8],[106,-6],[105,-3],[100,0],[95,5]],
]

/* ─── 3D Globe Component ─── */
function WorldGlobe({ events, selectedEvent, onSelect }: {
  events: { id: string; title: string; latitude: number | null; longitude: number | null; location_name: string | null }[]
  selectedEvent: string | null
  onSelect: (id: string) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)
  const rotRef = useRef(0)
  const dragRef = useRef({ active: false, startX: 0, startRot: 0 })
  const rotOffsetRef = useRef(0)

  // 3D sphere projection
  function project3D(lat: number, lng: number, rotY: number, cx: number, cy: number, R: number): [number, number, number] | null {
    const phi = (90 - lat) * Math.PI / 180
    const theta = (lng + rotY) * Math.PI / 180
    const x3d = R * Math.sin(phi) * Math.cos(theta)
    const y3d = R * Math.cos(phi)
    const z3d = R * Math.sin(phi) * Math.sin(theta)
    if (z3d < 0) return null // behind globe
    return [cx + x3d, cy - y3d, z3d]
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
    const cx = w / 2
    const cy = h / 2
    const R = Math.min(w, h) * 0.38
    let time = 0

    function draw() {
      if (!ctx) return
      time += 0.016
      rotRef.current += 0.08
      const rotY = rotRef.current + rotOffsetRef.current

      ctx.clearRect(0, 0, w, h)

      // Globe background sphere
      const sphereGrad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R)
      sphereGrad.addColorStop(0, 'rgba(212,175,55,0.06)')
      sphereGrad.addColorStop(0.7, 'rgba(212,175,55,0.02)')
      sphereGrad.addColorStop(1, 'rgba(212,175,55,0)')
      ctx.fillStyle = sphereGrad
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fill()

      // Globe outline
      ctx.strokeStyle = 'rgba(212,175,55,0.15)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.stroke()

      // Latitude lines
      ctx.strokeStyle = 'rgba(212,175,55,0.04)'
      ctx.lineWidth = 0.5
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath()
        let started = false
        for (let lng = -180; lng <= 180; lng += 3) {
          const p = project3D(lat, lng, rotY, cx, cy, R)
          if (p) {
            if (!started) { ctx.moveTo(p[0], p[1]); started = true }
            else ctx.lineTo(p[0], p[1])
          } else { started = false }
        }
        ctx.stroke()
      }

      // Longitude lines
      for (let lng = -180; lng < 180; lng += 30) {
        ctx.beginPath()
        let started = false
        for (let lat = -90; lat <= 90; lat += 3) {
          const p = project3D(lat, lng, rotY, cx, cy, R)
          if (p) {
            if (!started) { ctx.moveTo(p[0], p[1]); started = true }
            else ctx.lineTo(p[0], p[1])
          } else { started = false }
        }
        ctx.stroke()
      }

      // Draw continents as filled polygons
      CONTINENTS.forEach(continent => {
        // First pass: fill
        ctx.beginPath()
        let started = false
        const visiblePoints: [number, number][] = []
        continent.forEach(([lng, lat]) => {
          const p = project3D(lat, lng, rotY, cx, cy, R)
          if (p) {
            visiblePoints.push([p[0], p[1]])
            if (!started) { ctx.moveTo(p[0], p[1]); started = true }
            else ctx.lineTo(p[0], p[1])
          }
        })
        if (visiblePoints.length > 2) {
          ctx.closePath()
          ctx.fillStyle = 'rgba(212,175,55,0.12)'
          ctx.fill()
          ctx.strokeStyle = 'rgba(212,175,55,0.25)'
          ctx.lineWidth = 0.8
          ctx.stroke()
        }
      })

      // Draw events as shining diamonds
      const eventScreenPos: { id: string; x: number; y: number; location_name: string | null }[] = []

      events.forEach((event, idx) => {
        if (!event.latitude || !event.longitude) return
        const p = project3D(event.latitude, event.longitude, rotY, cx, cy, R)
        if (!p) return

        const [x, y, z] = p
        const isSelected = event.id === selectedEvent
        const pulse = Math.sin(time * 2.5 + idx * 1.5) * 0.5 + 0.5
        const depthFade = 0.4 + (z / R) * 0.6
        const size = (isSelected ? 11 : 8) * depthFade

        eventScreenPos.push({ id: event.id, x, y, location_name: event.location_name })

        // Glow
        const glowR = size + 10 + pulse * 8
        const glow = ctx.createRadialGradient(x, y, 0, x, y, glowR)
        glow.addColorStop(0, `rgba(212,175,55,${(isSelected ? 0.5 : 0.3) * depthFade})`)
        glow.addColorStop(1, 'rgba(212,175,55,0)')
        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(x, y, glowR, 0, Math.PI * 2)
        ctx.fill()

        // Diamond
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(Math.PI / 4)
        const s = size + (isSelected ? Math.sin(time * 3) * 2 : 0)

        ctx.fillStyle = isSelected ? '#D4AF37' : `rgba(212,175,55,${(0.7 + pulse * 0.3) * depthFade})`
        ctx.fillRect(-s / 2, -s / 2, s, s)

        ctx.strokeStyle = `rgba(255,255,255,${(0.4 + pulse * 0.4) * depthFade})`
        ctx.lineWidth = 1
        ctx.strokeRect(-s / 2, -s / 2, s, s)

        // Inner shine
        ctx.fillStyle = `rgba(255,255,255,${(0.3 + pulse * 0.5) * depthFade})`
        ctx.fillRect(-s / 5, -s / 5, s / 2.5, s / 2.5)

        ctx.restore()

        // Label
        if (isSelected && event.location_name) {
          ctx.font = 'bold 12px "DM Sans", sans-serif'
          ctx.textAlign = 'center'
          ctx.fillStyle = 'rgba(0,0,0,0.5)'
          ctx.fillText(event.location_name, x + 1, y - size - 9)
          ctx.fillStyle = '#D4AF37'
          ctx.fillText(event.location_name, x, y - size - 10)
        }
      })

      // Atmosphere edge glow
      const atmoGrad = ctx.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 1.15)
      atmoGrad.addColorStop(0, 'rgba(212,175,55,0.05)')
      atmoGrad.addColorStop(0.5, 'rgba(212,175,55,0.02)')
      atmoGrad.addColorStop(1, 'rgba(212,175,55,0)')
      ctx.fillStyle = atmoGrad
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.15, 0, Math.PI * 2)
      ctx.fill()

      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [events, selectedEvent])

  // Mouse/touch drag for rotation
  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    dragRef.current = { active: true, startX: e.clientX, startRot: rotRef.current + rotOffsetRef.current }
    ;(e.target as HTMLCanvasElement).setPointerCapture(e.pointerId)
  }
  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragRef.current.active) return
    const dx = e.clientX - dragRef.current.startX
    rotOffsetRef.current = dragRef.current.startRot - rotRef.current + dx * 0.3
  }
  function onPointerUp() { dragRef.current.active = false }

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const rect = canvas.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top
    const w = rect.width
    const h = rect.height
    const cx = w / 2
    const cy = h / 2
    const R = Math.min(w, h) * 0.38
    const rotY = rotRef.current + rotOffsetRef.current

    let closest: string | null = null
    let minDist = 30

    events.forEach(event => {
      if (!event.latitude || !event.longitude) return
      const p = project3D(event.latitude, event.longitude, rotY, cx, cy, R)
      if (!p) return
      const dist = Math.sqrt((clickX - p[0]) ** 2 + (clickY - p[1]) ** 2)
      if (dist < minDist) { minDist = dist; closest = event.id }
    })

    if (closest) onSelect(closest)
  }

  return (
    <div ref={containerRef} className="relative w-full rounded-2xl overflow-hidden" style={{ height: 380, background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.03) 0%, transparent 70%)', border: '1px solid rgba(212,175,55,0.1)' }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onClick={handleClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <span className="w-2 h-2 rotate-45 inline-block" style={{ background: '#D4AF37' }} />
        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Glissez pour tourner le globe &middot; Cliquez sur un diamant</span>
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

      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })

      if (eventsData) {
        setEvents(eventsData as Event[])
      }

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

  const mapEvents = events
    .filter(e => e.latitude && e.longitude)
    .map(e => ({
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
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  function formatTime(dateString: string) {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
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

      {/* World Map — only if events with coordinates exist */}
      {!loading && mapEvents.length > 0 && (
        <WorldGlobe events={mapEvents} selectedEvent={selectedEvent} onSelect={scrollToEvent} />
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
      ) : events.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl" style={{ background: 'rgba(212,175,55,0.08)' }}>
            📅
          </div>
          <h3 className="font-display text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Les événements arrivent
          </h3>
          <p className="text-sm max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Les prochains événements SOS Shine (Shine Walks, cercles de parole, ateliers...) apparaîtront ici. Restez connecté !
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const registered = isRegistered(event.id)
            const isSelected = selectedEvent === event.id
            const typeInfo = getEventTypeInfo(event.event_type)

            return (
              <div
                key={event.id}
                id={`event-${event.id}`}
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
                          {event.location_name && (
                            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                              </svg>
                              {event.location_name}
                            </span>
                          )}
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

                    {event.description && (
                      <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {event.description}
                      </p>
                    )}

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

                      {registered ? (
                        <span
                          className="text-xs px-4 py-2 rounded-xl font-medium"
                          style={{ background: 'rgba(85, 239, 196, 0.1)', color: '#55EFC4' }}
                        >
                          Inscrit(e) ✓
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRegister(event.id)}
                          disabled={registering === event.id}
                          className="text-xs px-4 py-2 rounded-xl font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50"
                          style={{ background: 'var(--gold)', color: 'var(--dark)' }}
                        >
                          {registering === event.id ? 'Inscription...' : "S'inscrire"}
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
