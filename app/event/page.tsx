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
  description: string | null
  event_date: string | null
  end_time: string | null
  location_name: string | null
  address: string | null
  image_url: string | null
  is_free: boolean
  price_label: string | null
  stripe_url: string | null
  cta_label: string | null
  max_spots: number | null
}

async function getEvents(): Promise<PhysicalEvent[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return []

  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
  const { data } = await supabase
    .from('physical_events')
    .select('id, title, subtitle, description, event_date, end_time, location_name, address, image_url, is_free, price_label, stripe_url, cta_label, max_spots')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('event_date', { ascending: true })

  return (data || []) as PhysicalEvent[]
}

function formatEventDate(iso: string | null): { day: string; month: string; year: string; weekday: string } {
  if (!iso) return { day: '—', month: '—', year: '—', weekday: '—' }
  const d = new Date(iso)
  return {
    weekday: d.toLocaleDateString('fr-FR', { weekday: 'long' }),
    day: d.toLocaleDateString('fr-FR', { day: 'numeric' }),
    month: d.toLocaleDateString('fr-FR', { month: 'long' }),
    year: d.toLocaleDateString('fr-FR', { year: 'numeric' }),
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
      <header style={{ padding: '24px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '900px', margin: '0 auto' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-shine-transparent.png" alt="SOS Shine®" style={{ height: '40px', width: 'auto' }} />
        </Link>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 80px' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#C9A961', marginBottom: '16px', fontWeight: '500' }}>
            Événements
          </p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '300', color: '#F5F1E8', lineHeight: '1.15', margin: '0' }}>
            SOS Shine Events
          </h1>
          <p style={{ marginTop: '16px', fontSize: '16px', color: 'rgba(245,241,232,0.5)', fontWeight: '300' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {events.map(event => {
              const date = formatEventDate(event.event_date)
              const time = formatTime(event.event_date, event.end_time)

              return (
                <Link key={event.id} href={`/event/${event.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <article style={{
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: '1px solid rgba(201,169,97,0.15)',
                    background: 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                  }}>
                    {/* Image */}
                    {event.image_url && (
                      <div style={{ height: '260px', overflow: 'hidden', position: 'relative' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={event.image_url}
                          alt={event.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(10,10,10,0.8) 100%)' }} />
                      </div>
                    )}

                    <div style={{ padding: '32px' }}>
                      {/* Badge free */}
                      {event.is_free && (
                        <span style={{ display: 'inline-block', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '999px', background: 'rgba(85,239,196,0.12)', color: '#55EFC4', border: '1px solid rgba(85,239,196,0.25)', marginBottom: '16px', fontWeight: '600' }}>
                          Gratuit
                        </span>
                      )}

                      {/* Date block */}
                      {event.event_date && (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
                          <span style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#C9A961' }}>
                            {date.weekday} {date.day} {date.month} {date.year}
                          </span>
                          {time && (
                            <>
                              <span style={{ color: 'rgba(201,169,97,0.3)' }}>·</span>
                              <span style={{ fontSize: '11px', letterSpacing: '0.15em', color: 'rgba(245,241,232,0.5)' }}>{time}</span>
                            </>
                          )}
                        </div>
                      )}

                      {/* Title */}
                      <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: '300', color: '#F5F1E8', margin: '0 0 8px', lineHeight: '1.2' }}>
                        {event.title}
                      </h2>

                      {event.subtitle && (
                        <p style={{ fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,241,232,0.4)', marginBottom: '16px' }}>
                          {event.subtitle}
                        </p>
                      )}

                      {/* Description */}
                      {event.description && (
                        <p style={{ fontSize: '16px', lineHeight: '1.7', color: 'rgba(245,241,232,0.6)', marginBottom: '24px', maxWidth: '560px' }}>
                          {event.description}
                        </p>
                      )}

                      {/* Location */}
                      {event.location_name && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '15px' }}>📍</span>
                          <span style={{ fontSize: '14px', color: 'rgba(245,241,232,0.55)' }}>{event.location_name}</span>
                        </div>
                      )}
                      {event.address && (
                        <p style={{ fontSize: '13px', color: 'rgba(245,241,232,0.3)', marginBottom: '24px', paddingLeft: '23px' }}>
                          {event.address}
                        </p>
                      )}

                      {/* Price */}
                      {!event.is_free && event.price_label && (
                        <p style={{ fontSize: '13px', color: 'rgba(245,241,232,0.4)', marginBottom: '24px' }}>
                          💳 {event.price_label}
                        </p>
                      )}

                      {/* Voir l'événement */}
                      <span style={{
                        display: 'inline-block',
                        padding: '14px 32px',
                        borderRadius: '999px',
                        background: 'linear-gradient(135deg, #C9A961, #B8960F)',
                        color: '#000',
                        fontWeight: '600',
                        fontSize: '14px',
                        letterSpacing: '0.03em',
                      }}>
                        Voir l&apos;événement →
                      </span>

                      {/* Max spots */}
                      {event.max_spots && (
                        <p style={{ fontSize: '12px', color: 'rgba(245,241,232,0.25)', marginTop: '12px' }}>
                          {event.max_spots} places disponibles
                        </p>
                      )}
                    </div>
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
