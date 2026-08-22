import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inscription confirmée — SOS Shine®',
  description: 'Votre inscription à l\'événement SOS Shine est confirmée.',
}

export default function EventConfirmationPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#0A0A0A', color: '#F5F1E8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>

        {/* Icône succès */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(85,239,196,0.1)', border: '1px solid rgba(85,239,196,0.25)',
        }}>
          <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#55EFC4" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 300, color: '#C9A961', marginBottom: '12px' }}>
          Tu es inscrit·e !
        </h1>
        <p style={{ fontSize: '16px', color: 'rgba(245,241,232,0.6)', lineHeight: '1.65', marginBottom: '40px' }}>
          Ton inscription est bien enregistrée.<br />
          Un email de confirmation va t&apos;être envoyé.
        </p>

        {/* Bloc info */}
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,169,97,0.15)',
          borderRadius: '16px', padding: '24px', marginBottom: '32px', textAlign: 'left',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#C9A961" strokeWidth={1.5} style={{ flexShrink: 0, marginTop: '2px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#C9A961', marginBottom: '6px' }}>
                Vérifie ta boîte mail
              </p>
              <p style={{ fontSize: '13px', color: 'rgba(245,241,232,0.5)', lineHeight: '1.6' }}>
                Tu vas recevoir un email avec les détails pratiques de l&apos;événement. Pense à vérifier tes spams si tu ne le vois pas.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link
            href="/event"
            style={{
              display: 'block', padding: '14px 32px', borderRadius: '999px',
              background: 'linear-gradient(135deg, #C9A961, #A88248)',
              color: '#000', fontWeight: 700, fontSize: '14px', textDecoration: 'none',
              letterSpacing: '0.03em',
            }}
          >
            Voir tous les événements
          </Link>
          <Link
            href="/"
            style={{
              display: 'block', padding: '14px 32px', borderRadius: '999px',
              background: 'transparent', border: '1px solid rgba(245,241,232,0.1)',
              color: 'rgba(245,241,232,0.4)', fontSize: '14px', textDecoration: 'none',
            }}
          >
            Retour à l&apos;accueil
          </Link>
        </div>

      </div>
    </main>
  )
}
