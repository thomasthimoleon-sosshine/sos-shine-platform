import type { Metadata } from 'next'

// Expérience autonome : on neutralise le chrome global (loader logo, ambient-glow)
// pour un noir absolu au chargement, et on la garde hors des moteurs.
export const metadata: Metadata = {
  title: 'Incarnat',
  description: 'Une traversée intérieure.',
  robots: { index: false, follow: false },
}

export default function IncarnatLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        .page-loader,.ambient-glow{display:none!important}
        body{background:#05040A!important}
      `}</style>
      {children}
    </>
  )
}
