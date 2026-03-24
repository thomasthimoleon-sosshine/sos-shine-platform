'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function CancelPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--dark)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-lg w-full text-center"
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8"
          style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}
        >
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="#D4AF37" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1
          className="font-display text-3xl sm:text-4xl font-light mb-4"
          style={{ color: '#D4AF37' }}
        >
          Paiement annul&eacute;
        </h1>

        <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
          Votre paiement a &eacute;t&eacute; annul&eacute;. Aucun montant n&apos;a &eacute;t&eacute; d&eacute;bit&eacute;.
          Vous pouvez reprendre votre inscription &agrave; tout moment.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/rejoindre"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-medium text-sm tracking-wide transition-all"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #B8960F)', color: '#050505' }}
          >
            Reprendre l&apos;inscription
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full font-medium text-sm tracking-wide transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Retour &agrave; l&apos;accueil
          </Link>
        </div>

        <div className="mt-8 p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Une question ?{' '}
            <a href="mailto:hello@sosshine.com" style={{ color: '#D4AF37', textDecoration: 'underline' }}>hello@sosshine.com</a>
          </p>
        </div>
      </motion.div>
    </main>
  )
}
