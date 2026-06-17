import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Événements SOS Shine® — Soirées, ateliers & cérémonies',
  description: 'Rejoins-nous en vrai : soirées au bord du lac, ateliers, cérémonies. Découvrez les prochains événements physiques SOS Shine.',
  openGraph: {
    title: 'Événements SOS Shine® 🌿',
    description: 'Rejoins-nous en vrai : soirées au bord du lac, ateliers, cérémonies. Événements payants et gratuits.',
    url: 'https://www.sosshine.com/event',
    siteName: 'SOS Shine®',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Événements SOS Shine® 🌿',
    description: 'Rejoins-nous en vrai : soirées au bord du lac, ateliers, cérémonies.',
  },
}

export const revalidate = 60

type PhysicalEvent = {
  id: string
  title: string
  subtitle: string | null
  event_date: string | null
  end_time: string | null
  location_name: string | null
  image_url: string | null
  is_free: boolean
}

async function getEvents(): Promise<PhysicalEvent[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return []

  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
  const { data } = await supabase
    .from('physical_events')
    .select('id, title, subtitle, event_date, end_time, location_name, image_url, is_free')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('event_date', { ascending: true })

  return (data || []) as PhysicalEvent[]
}

function formatEventDate(iso: string | null): { day: string; month: string; weekday: string } {
  if (!iso) return { day: '—', month: '—', weekday: '—' }
  const d = new Date(iso)
  return {
    weekday: d.toLocaleDateString('fr-FR', { weekday: 'long' }),
    day: d.toLocaleDateString('fr-FR', { day: 'numeric' }),
    month: d.toLocaleDateString('fr-FR', { month: 'long' }),
  }
}

function formatTime(iso: string | null, endTime: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const start = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return endTime ? `${start} — ${endTime}` : start
}

export default async function EventPage() {
  const events = await getEvents()

  return (
    <main style={{ minHeight: '100vh', background: '#0A0A0A', color: '#F5F1E8' }}>
      {/* Header */}
      <header style={{ padding: '24px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '680px', margin: '0 auto' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-shine.png" alt="SOS Shine®" style={{ height: '40px', width: 'auto' }} />
        </Link>
      </header>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#C9A961', marginBottom: '12px', fontWeight: '500' }}>
            Événements
          </p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '300', color: '#F5F1E8', lineHeight: '1.15', margin: '0' }}>
            SOS Shine Events
          </h1>
          <p style={{ marginTop: '12px', fontSize: '15px', color: 'rgba(245,241,232,0.4)', fontWeight: '300' }}>
            Retrouvez-nous en vrai, en dehors des écrans.
          </p>
        </div>

        {/* Events */}
        {events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: '15px', color: 'rgba(245,241,232,0.35)' }}>Aucun événement à venir pour le moment.</p>
            <p style={{ fontSize: '13px', color: 'rgba(245,241,232,0.2)', marginTop: '8px' }}>Revenez bientôt ✨</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {events.map(event => {
              const date = formatEventDate(event.event_date)
              const time = formatTime(event.event_date, event.end_time)

              return (
                <Link key={event.id} href={`/event/${event.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <article style={{ borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
                    {event.image_url ? (
                      <div style={{ position: 'relative' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={event.image_url}
                          alt={event.title}
                          style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                        {/* Gradient overlay */}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%', background: 'linear-gradient(to top, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.5) 60%, transparent 100%)' }} />
                        {/* Info overlay */}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 24px 24px' }}>
                          {event.is_free && (
                            <span style={{ display: 'inline-block', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '999px', background: 'rgba(85,239,196,0.18)', color: '#55EFC4', border: '1px solid rgba(85,239,196,0.3)', marginBottom: '10px', fontWeight: '600' }}>
                              Gratuit
                            </span>
                          )}
                          {event.event_date && (
                            <p style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#C9A961', margin: '0 0 6px', fontWeight: '500' }}>
                              {date.weekday} {date.day} {date.month}
                              {time && <span style={{ color: 'rgba(201,169,97,0.6)', marginLeft: '6px' }}>· {time}</span>}
                            </p>
                          )}
                          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', fontWeight: '300', color: '#F5F1E8', margin: 0, lineHeight: '1.2' }}>
                            {event.title}
                          </h2>
                          {event.location_name && (
                            <p style={{ fontSize: '12px', color: 'rgba(245,241,232,0.45)', margin: '6px 0 0', letterSpacing: '0.05em' }}>
                              📍 {event.location_name}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Fallback si pas d'image */
                      <div style={{ padding: '36px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,169,97,0.15)', borderRadius: '20px' }}>
                        {event.is_free && (
                          <span style={{ display: 'inline-block', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '999px', background: 'rgba(85,239,196,0.12)', color: '#55EFC4', border: '1px solid rgba(85,239,196,0.25)', marginBottom: '14px', fontWeight: '600' }}>
                            Gratuit
                          </span>
                        )}
                        {event.event_date && (
                          <p style={{ fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#C9A961', margin: '0 0 8px' }}>
                            {date.weekday} {date.day} {date.month}{time && ` · ${time}`}
                          </p>
                        )}
                        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.6rem', fontWeight: '300', color: '#F5F1E8', margin: 0 }}>
                          {event.title}
                        </h2>
                        {event.location_name && (
                          <p style={{ fontSize: '13px', color: 'rgba(245,241,232,0.4)', marginTop: '8px' }}>📍 {event.location_name}</p>
                        )}
                      </div>
                    )}
                  </article>
                </Link>
              )
            })}
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '80px' }}>
          <div style={{ width: '40px', height: '1px', background: 'rgba(201,169,97,0.2)', margin: '0 auto 20px' }} />
          <p style={{ fontSize: '12px', color: 'rgba(245,241,232,0.2)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            SOS Shine® · sosshine.com
          </p>
        </div>
      </div>
    </main>
  )
}
