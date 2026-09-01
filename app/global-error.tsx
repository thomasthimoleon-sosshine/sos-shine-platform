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
      <body className="bg-[var(--surface)] text-[var(--text-primary)] font-[system-ui,sans-serif]">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-[400px] p-8">
            <h2 className="text-2xl mb-4 text-[var(--brand)]">
              Une erreur est survenue
            </h2>
            <p className="mb-6 text-[var(--text-secondary)]">
              Nous sommes désolés, quelque chose s&apos;est mal passé.
            </p>
            <button
              onClick={() => reset()}
              className="bg-[var(--brand)] text-[var(--text-inverse)] border-none px-6 py-3 rounded-xl cursor-pointer font-semibold"
            >
              Réessayer
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
