'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

type Props = {
  onSubmit: (email: string) => void
  loading?: boolean
  firstName?: string
}

export function EmailCapture({ onSubmit, loading, firstName }: Props) {
  const [email, setEmail] = useState('')
  const isValid = email.includes('@') && email.includes('.')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-lg mx-auto text-center px-6 py-16"
    >
      <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        {firstName ? `${firstName}, ton profil est presque prêt.` : 'Ton profil est presque prêt.'}
      </h2>

      <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
        Un schéma précis est en train de se dessiner - dans tes réactions, tes contradictions, et ce que tu n&apos;as peut-être jamais vraiment nommé.
      </p>

      <p className="text-sm leading-relaxed italic mb-8" style={{ color: 'var(--brand, var(--brand))', opacity: 0.8 }}>
        Les 5 dernières questions vont à la racine. Ton profil t&apos;attend de l&apos;autre côté.
      </p>

      <div className="space-y-4">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && isValid && !loading) onSubmit(email) }}
          placeholder="ton@email.com"
          className="w-full px-5 py-4 rounded-xl text-base text-center outline-none transition-all focus:ring-2 focus:ring-[var(--brand)]"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'var(--text-primary)',
          }}
          autoFocus
        />

        <button
          onClick={() => isValid && onSubmit(email)}
          disabled={!isValid || loading}
          className="w-full py-4 rounded-full text-sm font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: isValid ? 'linear-gradient(135deg, var(--brand), var(--gold-deep, #A88248))' : 'rgba(255,255,255,0.06)',
            color: isValid ? '#000000' : 'var(--text-muted)',
          }}
        >
          {loading ? 'Envoi...' : 'RÉVÉLER MON PROFIL →'}
        </button>
      </div>

      <p className="text-xs mt-4 flex items-center justify-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        Données confidentielles. Aucun spam - uniquement ton résultat.
      </p>
    </motion.div>
  )
}
