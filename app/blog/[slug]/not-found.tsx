import Link from 'next/link'

const gold = '#C9A961'

export default function BlogArticleNotFound() {
  return (
    <main className="grain relative z-0 min-h-screen flex items-center justify-center" style={{ background: 'var(--dark, #000000)' }}>
      <div className="text-center px-6 max-w-md">
        <h1 className="font-display text-2xl md:text-3xl font-light mb-4" style={{ color: gold }}>
          Article introuvable
        </h1>
        <p className="text-sm font-light mb-6" style={{ color: 'var(--text-secondary)' }}>
          Cet article n&apos;existe pas ou n&apos;est plus disponible.
        </p>
        <Link
          href="/blog"
          className="inline-block px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide hover:scale-105 transition-transform"
          style={{ background: `linear-gradient(135deg, ${gold}, #A88248)`, color: '#000000' }}
        >
          Voir tous les articles
        </Link>
      </div>
    </main>
  )
}
