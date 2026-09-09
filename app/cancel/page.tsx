'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function CancelPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-[var(--surface)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-lg w-full text-center"
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 bg-[var(--brand-alpha-weak)] border border-[var(--border-medium)]"
        >
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="var(--brand)" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1
          className="font-display text-3xl sm:text-4xl font-light mb-4 text-[var(--brand)]"
        >
          Paiement annul&eacute;
        </h1>

        <p className="text-base leading-relaxed mb-8 text-[var(--text-secondary)]">
          Votre paiement a &eacute;t&eacute; annul&eacute;. Aucun montant n&apos;a &eacute;t&eacute; d&eacute;bit&eacute;.
          Vous pouvez reprendre votre inscription &agrave; tout moment.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard/tarifs"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-medium text-sm tracking-wide transition-all bg-[linear-gradient(135deg,var(--brand),var(--brand-deep))] text-[var(--text-inverse)]"
          >
            Reprendre l&apos;inscription
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-medium text-sm tracking-wide transition-all bg-[var(--border-subtle)] text-[var(--text-secondary)] border border-[var(--border)]"
          >
            Retour &agrave; l&apos;accueil
          </Link>
        </div>

        <div className="mt-8 p-4 rounded-xl text-center bg-[var(--border-subtle)] border border-[var(--border)]">
          <p className="text-xs text-[var(--text-muted)]">
            Une question ?{' '}
            <a href="mailto:hello@sosshine.com" className="text-[var(--brand)] underline">hello@sosshine.com</a>
          </p>
        </div>
      </motion.div>
    </main>
  )
}
