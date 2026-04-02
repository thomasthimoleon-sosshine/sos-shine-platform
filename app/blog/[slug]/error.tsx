'use client'

import Link from 'next/link'

const gold = '#D4AF37'

export default function BlogArticleError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grain relative z-0 min-h-screen flex items-center justify-center" style={{ background: 'var(--dark, #050505)' }}>
      <div className="text-center px-6 max-w-md">
        <h1 className="font-display text-2xl md:text-3xl font-light mb-4" style={{ color: gold }}>
          Article indisponible
        </h1>
        <p className="text-sm font-light mb-6" style={{ color: 'var(--text-secondary)' }}>
          Cet article n&apos;est pas disponible pour le moment. Veuillez réessayer.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide hover:scale-105 transition-transform"
            style={{ background: `linear-gradient(135deg, ${gold}, #B8960F)`, color: '#050505' }}
          >
            Réessayer
          </button>
          <Link
            href="/blog"
            className="px-6 py-2.5 rounded-full text-sm font-medium tracking-wide hover:opacity-80 transition-opacity"
            style={{ color: gold, border: `1px solid ${gold}` }}
          >
            Retour au blog
          </Link>
        </div>
      </div>
    </main>
  )
}
