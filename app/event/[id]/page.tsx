import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ReserveForm from './ReserveForm'
import LogoSite from '@/components/LogoSite'

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

async function getEvent(id: string): Promise<PhysicalEvent | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
  const { data } = await supabase
    .from('physical_events')
    .select('id, title, subtitle, description, event_date, end_time, location_name, address, image_url, is_free, price_label, stripe_url, cta_label, max_spots')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  return data as PhysicalEvent | null
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const event = await getEvent(id)
  if (!event) return { title: 'Événement, SOS Shine®' }
  const desc = event.description || event.subtitle || 'Un événement physique SOS Shine.'
  return {
    title: `${event.title}, SOS Shine®`,
    description: desc,
    openGraph: {
      title: `${event.title} 🌿`,
      description: desc,
      url: `https://www.sosshine.com/event/${id}`,
      siteName: 'SOS Shine®',
      locale: 'fr_FR',
      type: 'website',
      ...(event.image_url ? { images: [{ url: event.image_url, width: 1200, height: 630, alt: event.title }] } : {}),
    },
    twitter: {
      card: event.image_url ? 'summary_large_image' : 'summary',
      title: `${event.title} 🌿`,
      description: desc,
      ...(event.image_url ? { images: [event.image_url] } : {}),
    },
  }
}

const TZ = 'Europe/Paris'

function formatEventDate(iso: string | null) {
  if (!iso) return { day: '—', month: '—', year: '—', weekday: '—' }
  const d = new Date(iso)
  return {
    weekday: d.toLocaleDateString('fr-FR', { weekday: 'long', timeZone: TZ }),
    day: d.toLocaleDateString('fr-FR', { day: 'numeric', timeZone: TZ }),
    month: d.toLocaleDateString('fr-FR', { month: 'long', timeZone: TZ }),
    year: d.toLocaleDateString('fr-FR', { year: 'numeric', timeZone: TZ }),
  }
}

function formatTime(iso: string | null, endTime: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const start = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: TZ })
  return endTime ? `${start}, ${endTime}` : start
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const event = await getEvent(id)
  if (!event) notFound()

  const date = formatEventDate(event.event_date)
  const time = formatTime(event.event_date, event.end_time)

  return (
    <main style={{ minHeight: '100vh', background: '#0A0A0A', color: '#F5F1E8' }}>
      {/* Header */}
      <header style={{ padding: '24px 24px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '960px', margin: '0 auto' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <LogoSite alt="SOS Shine®" style={{ height: '40px', width: 'auto' }} />
        </Link>
        <Link href="/event" style={{ fontSize: '13px', color: 'rgba(245,241,232,0.4)', textDecoration: 'none', letterSpacing: '0.05em' }}>
          ← Tous les événements
        </Link>
      </header>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* Image */}
        {event.image_url && (
          <div style={{ borderRadius: '20px', overflow: 'hidden', marginBottom: '48px', position: 'relative' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.image_url}
              alt={event.title}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(10,10,10,0.7) 100%)' }} />
          </div>
        )}

        {/* Badge gratuit */}
        {event.is_free && (
          <span style={{ display: 'inline-block', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: '999px', background: 'rgba(85,239,196,0.12)', color: '#55EFC4', border: '1px solid rgba(85,239,196,0.25)', marginBottom: '20px', fontWeight: '600' }}>
            Gratuit
          </span>
        )}

        {/* Date */}
        {event.event_date && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
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
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2.2rem, 6vw, 4rem)', fontWeight: '300', color: '#F5F1E8', margin: '0 0 12px', lineHeight: '1.15' }}>
          {event.title}
        </h1>

        {event.subtitle && (
          <p style={{ fontSize: '13px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,241,232,0.4)', marginBottom: '32px' }}>
            {event.subtitle}
          </p>
        )}

        {/* Divider */}
        <div style={{ width: '48px', height: '1px', background: 'rgba(201,169,97,0.3)', marginBottom: '32px' }} />

        {/* Description */}
        {event.description && (
          <p style={{ fontSize: '18px', lineHeight: '1.85', color: 'rgba(245,241,232,0.7)', marginBottom: '40px', maxWidth: '580px' }}>
            {event.description}
          </p>
        )}

        {/* Infos */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,169,97,0.12)', borderRadius: '16px', padding: '28px', marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {event.location_name && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>📍</span>
              <div>
                <p style={{ fontSize: '15px', color: '#F5F1E8', margin: 0 }}>{event.location_name}</p>
                {event.address && <p style={{ fontSize: '13px', color: 'rgba(245,241,232,0.35)', margin: '4px 0 0' }}>{event.address}</p>}
              </div>
            </div>
          )}
          {event.event_date && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '16px' }}>📅</span>
              <p style={{ fontSize: '15px', color: '#F5F1E8', margin: 0 }}>
                {date.weekday} {date.day} {date.month} {date.year}
                {time && <span style={{ color: 'rgba(245,241,232,0.45)' }}> · {time}</span>}
              </p>
            </div>
          )}
          {!event.is_free && event.price_label && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '16px' }}>💳</span>
              <p style={{ fontSize: '15px', color: '#F5F1E8', margin: 0 }}>{event.price_label}</p>
            </div>
          )}
          {event.max_spots && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '16px' }}>🪑</span>
              <p style={{ fontSize: '15px', color: 'rgba(245,241,232,0.5)', margin: 0 }}>{event.max_spots} places disponibles</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <ReserveForm
          ctaLabel={event.cta_label || 'Réserver ma place'}
          stripeUrl={event.stripe_url}
          isFree={event.is_free}
          eventId={event.id}
          eventTitle={event.title}
          eventDate={event.event_date ?? undefined}
          eventLocation={event.location_name ?? undefined}
        />

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
