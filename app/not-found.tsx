import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--dark, #050505)' }}>
      <div className="max-w-md text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center" style={{ background: 'rgba(201,169,97,0.1)', border: '1px solid rgba(201,169,97,0.2)' }}>
          <span className="text-4xl">✨</span>
        </div>
        <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary, #e0e0e0)' }}>
          Page introuvable
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary, #a1a1aa)' }}>
          Cette page n&apos;existe pas ou a été déplacée. Pas de panique, on te ramène.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/"
            className="px-6 py-3 rounded-full text-sm font-semibold transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, var(--gold, #C9A961), var(--gold-deep, #B8960F))', color: '#050505' }}>
            Retour à l&apos;accueil
          </Link>
          <Link href="/dashboard/encyclopedie"
            className="px-6 py-3 rounded-full text-sm font-medium transition-all"
            style={{ background: 'rgba(201,169,97,0.08)', border: '1px solid rgba(201,169,97,0.2)', color: 'var(--gold, #C9A961)' }}>
            Explorer l&apos;encyclopédie
          </Link>
        </div>
      </div>
    </main>
  )
}
