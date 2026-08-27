import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Le Couple Vivant, Telechargement',
  robots: { index: false },
}

const PDF_DOWNLOAD = 'https://drive.google.com/uc?export=download&id=1oYleBJgiDBdkeEau9tLy4JWzFXHPbtRo'
const PDF_VIEW = 'https://drive.google.com/file/d/1oYleBJgiDBdkeEau9tLy4JWzFXHPbtRo/view'

export default function CadeauMerciPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0A0A0A', color: '#F5F1E8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px 64px', textAlign: 'center' }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'block', marginBottom: '52px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-shine.png" alt="SOS Shine" style={{ height: '52px', width: 'auto' }} />
      </Link>

      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Gold line */}
        <div style={{ width: '28px', height: '1px', background: '#C9A961', margin: '0 auto 28px' }} />

        {/* Tag */}
        <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#C9A961', marginBottom: '14px', fontFamily: 'Inter, -apple-system, sans-serif', fontWeight: '500' }}>
          C&apos;est parti
        </p>

        {/* Title */}
        <h1 style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 'clamp(2.8rem, 10vw, 4rem)', fontWeight: '300', lineHeight: '1.1', color: '#F5F1E8', marginBottom: '20px' }}>
          Le guide<br />t&apos;attend.
        </h1>

        {/* Subtitle */}
        <p style={{ fontSize: '15px', color: 'rgba(245,241,232,0.48)', marginBottom: '44px', lineHeight: '1.65', fontFamily: 'Inter, -apple-system, sans-serif', fontWeight: '300' }}>
          Merci. Appuie sur le bouton pour telecharger{' '}
          <em style={{ fontStyle: 'italic' }}>Le Couple Vivant</em>.
        </p>

        {/* Main CTA */}
        <a
          href={PDF_DOWNLOAD}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'block',
            width: '100%',
            padding: '22px',
            background: 'linear-gradient(135deg, #C9A961 0%, #A88248 100%)',
            color: '#0A0A0A',
            textDecoration: 'none',
            borderRadius: '999px',
            fontSize: '16px',
            fontWeight: '700',
            letterSpacing: '0.05em',
            fontFamily: 'Inter, -apple-system, sans-serif',
          }}
        >
          Telecharger le PDF
        </a>

        {/* Fallback link */}
        <p style={{ marginTop: '18px', fontSize: '12px', color: 'rgba(245,241,232,0.28)', fontFamily: 'Inter, sans-serif', lineHeight: '1.55' }}>
          Le telechargement ne demarre pas ?{' '}
          <a
            href={PDF_VIEW}
            target="_blank"
            rel="noreferrer"
            style={{ color: '#C9A961', textDecoration: 'underline', textUnderlineOffset: '3px' }}
          >
            Ouvre-le directement
          </a>
          .
        </p>

        {/* Divider */}
        <div style={{ width: '100%', height: '1px', background: 'rgba(201,169,97,0.1)', margin: '36px 0' }} />

        {/* Back link */}
        <Link href="/" style={{ fontSize: '12px', color: 'rgba(245,241,232,0.25)', textDecoration: 'none', letterSpacing: '0.08em', fontFamily: 'Inter, sans-serif' }}>
          Retour a l&apos;accueil
        </Link>
      </div>

      <p style={{ marginTop: '56px', fontSize: '10px', color: 'rgba(245,241,232,0.12)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
        SOS Shine
      </p>
    </main>
  )
}
