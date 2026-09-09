import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PreviewPlayer from './PreviewPlayer'
import LogoSite from '@/components/LogoSite'

export const revalidate = 3600

type VideoRow = {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  video_url: string | null
  category: string
  duration_minutes: number
  year: number
  is_published: boolean
}

async function getVideo(id: string): Promise<VideoRow | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
  const { data } = await supabase
    .from('shine_tv_videos')
    .select('id, title, description, thumbnail_url, video_url, category, duration_minutes, year, is_published')
    .eq('id', id)
    .eq('is_published', true)
    .single()
  return data as VideoRow | null
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const video = await getVideo(id)
  if (!video) return { title: 'Shine TV, SOS Shine®' }
  return {
    title: `${video.title}, Shine TV · SOS Shine®`,
    description: video.description || 'Aperçu exclusif sur Shine TV',
    openGraph: {
      title: video.title,
      description: video.description || 'Aperçu exclusif sur Shine TV',
      images: video.thumbnail_url ? [{ url: video.thumbnail_url, width: 1200, height: 630 }] : [],
      type: 'video.other',
    },
  }
}

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const video = await getVideo(id)
  if (!video) notFound()

  return (
    <main style={{ minHeight: '100vh', background: '#09090B', color: '#F5F1E8', fontFamily: 'DM Sans, sans-serif' }}>
      {/* Header */}
      <header style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <a href="https://www.sosshine.com" style={{ textDecoration: 'none' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <LogoSite alt="SOS Shine®" style={{ height: '36px', width: 'auto' }} />
        </a>
        <a
          href="/login"
          style={{ fontSize: '13px', padding: '8px 18px', borderRadius: '999px', background: 'linear-gradient(135deg, #C9A961, #B8963E)', color: '#09090B', fontWeight: '600', textDecoration: 'none', letterSpacing: '0.02em' }}
        >
          Rejoindre SOS Shine
        </a>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px 80px' }}>
        {/* Preview player */}
        <PreviewPlayer
          videoUrl={video.video_url || ''}
          thumbnail={video.thumbnail_url || ''}
          title={video.title}
          previewSeconds={120}
        />

        {/* Info */}
        <div style={{ marginTop: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '999px', background: 'rgba(201,169,97,0.12)', color: '#C9A961', border: '1px solid rgba(201,169,97,0.25)', fontWeight: '600' }}>
              Aperçu · 2 min
            </span>
            <span style={{ fontSize: '12px', color: 'rgba(245,241,232,0.35)' }}>
              {video.year} · {video.duration_minutes} min au total
            </span>
          </div>

          <h1 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: '400', color: '#F5F1E8', margin: '0 0 12px', lineHeight: '1.2' }}>
            {video.title}
          </h1>

          {video.description && (
            <p style={{ fontSize: '15px', lineHeight: '1.75', color: 'rgba(245,241,232,0.55)', maxWidth: '620px' }}>
              {video.description}
            </p>
          )}
        </div>

        {/* CTA */}
        <div style={{ marginTop: '40px', padding: '32px', borderRadius: '20px', background: 'rgba(201,169,97,0.06)', border: '1px solid rgba(201,169,97,0.15)', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#C9A961', marginBottom: '12px', fontWeight: '600' }}>
            Shine TV
          </p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: '400', color: '#F5F1E8', margin: '0 0 8px' }}>
            Envie de voir la suite ?
          </h2>
          <p style={{ fontSize: '14px', color: 'rgba(245,241,232,0.45)', marginBottom: '24px' }}>
            Accède à la vidéo complète + tout le contenu SOS Shine en rejoignant la communauté.
          </p>
          <a
            href="/login"
            style={{ display: 'inline-block', padding: '14px 36px', borderRadius: '999px', background: 'linear-gradient(135deg, #C9A961, #B8963E)', color: '#09090B', fontWeight: '700', textDecoration: 'none', fontSize: '15px', letterSpacing: '0.03em' }}
          >
            Rejoindre SOS Shine®
          </a>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '60px' }}>
          <div style={{ width: '40px', height: '1px', background: 'rgba(201,169,97,0.2)', margin: '0 auto 16px' }} />
          <p style={{ fontSize: '11px', color: 'rgba(245,241,232,0.2)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            SOS Shine® · sosshine.com
          </p>
        </div>
      </div>
    </main>
  )
}
