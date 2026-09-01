import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-[var(--surface)]">
      <div className="max-w-md text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center bg-[var(--brand-alpha-medium)] border border-[var(--border-medium)]">
          <span className="text-4xl">✨</span>
        </div>
        <h1 className="font-display text-3xl font-semibold text-[var(--text-primary)]">
          Page introuvable
        </h1>
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
          Cette page n&apos;existe pas ou a été déplacée. Pas de panique, on te ramène.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/"
            className="px-6 py-3 rounded-full text-sm font-semibold transition-all hover:brightness-110 bg-[linear-gradient(135deg,var(--brand),var(--brand-deep))] text-[var(--text-inverse)]">
            Retour à l&apos;accueil
          </Link>
          <Link href="/signature-emotionnelle"
            className="px-6 py-3 rounded-full text-sm font-medium transition-all bg-[var(--brand-alpha-weak)] border border-[var(--border-medium)] text-[var(--brand)]">
            Découvrir ma Signature
          </Link>
        </div>
      </div>
    </main>
  )
}
