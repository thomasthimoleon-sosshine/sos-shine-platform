'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/useTranslation'

export default function ResetPasswordPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [checking, setChecking] = useState(true)
  const sessionFound = useRef(false)

  useEffect(() => {
    const supabase = createClient()

    // Listen for auth state changes - handles recovery token from URL hash
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session) {
        sessionFound.current = true
        setChecking(false)
      }
    })

    // Also check if already have a valid session (e.g. from auth callback redirect)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        sessionFound.current = true
        setChecking(false)
      }
    })

    // Wait for potential auth state change from URL hash/code
    const timeout = setTimeout(() => {
      if (!sessionFound.current) {
        router.push('/forgot-password')
      }
    }, 8000)

    return () => {
      authSub.unsubscribe()
      clearTimeout(timeout)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        setError(updateError.message)
        setLoading(false)
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 3000)
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[var(--surface)]">
        <div className="w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_50%_40%_at_50%_30%,var(--brand-alpha-weak),transparent)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as unknown as [number, number, number, number] }}
        className="max-w-md w-full relative z-10"
      >
        <div className="text-center mb-10">
          <Link href="/" className="font-display text-2xl text-[var(--brand)] font-medium tracking-tight">SOS Shine</Link>
          <p className="text-[var(--text-muted)] text-[13px] mt-2">Sécurisez votre compte</p>
        </div>

        <div className="bg-[var(--surface-raised)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] p-8 md:p-10">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-[rgba(107,207,160,0.1)] border border-[rgba(107,207,160,0.15)]">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="var(--success)" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h2 className="font-display text-xl text-[var(--text-primary)]">Mot de passe mis à jour</h2>
              <p className="text-[13px] text-[var(--text-secondary)]">
                Redirection vers votre tableau de bord...
              </p>
            </motion.div>
          ) : (
            <>
              <h1 className="font-display text-[var(--text-primary)] mb-2 text-center text-[1.875rem]">
                Nouveau mot de passe
              </h1>
              <p className="text-[13px] text-center mb-8 text-[var(--text-muted)]">
                Choisissez un mot de passe sécurisé pour votre compte.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="password" className="block text-[13px] text-[var(--text-secondary)] mb-2 font-medium">
                    Nouveau mot de passe
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Minimum 6 caractères"
                    className="w-full px-4 py-3 rounded-xl text-sm transition-colors bg-[var(--border-subtle)] border border-[var(--border)] text-[var(--text-primary)] outline-none focus:border-[var(--brand-alpha-strong)]"
                  />
                </div>
                <div>
                  <label htmlFor="confirm" className="block text-[13px] text-[var(--text-secondary)] mb-2 font-medium">
                    Confirmer le mot de passe
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Retapez votre mot de passe"
                    className="w-full px-4 py-3 rounded-xl text-sm transition-colors bg-[var(--border-subtle)] border border-[var(--border)] text-[var(--text-primary)] outline-none focus:border-[var(--brand-alpha-strong)]"
                  />
                </div>
                {error && (
                  <p className="text-[13px] px-4 py-3 rounded-xl text-[var(--danger)] bg-[rgba(212,106,106,0.08)] border border-[rgba(212,106,106,0.15)]">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="cta-glow w-full py-3.5 rounded-full font-medium tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm bg-[linear-gradient(135deg,var(--brand),var(--brand-deep))] text-[var(--text-inverse)]"
                >
                  {loading ? 'Mise à jour...' : 'Mettre à jour mon mot de passe'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-[13px] text-[var(--text-muted)] mt-8">
          <Link href="/login" className="gold-underline font-medium text-[var(--brand)]">
            Retour à la connexion
          </Link>
        </p>
      </motion.div>
    </main>
  )
}
