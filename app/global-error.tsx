'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="fr">
      <body style={{ background: '#09090b', color: '#e4e4e7', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', maxWidth: '400px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#D4AF37' }}>
              Une erreur est survenue
            </h2>
            <p style={{ marginBottom: '1.5rem', color: '#a1a1aa' }}>
              Nous sommes désolés, quelque chose s&apos;est mal passé.
            </p>
            <button
              onClick={() => reset()}
              style={{
                background: '#D4AF37',
                color: '#09090b',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Réessayer
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
