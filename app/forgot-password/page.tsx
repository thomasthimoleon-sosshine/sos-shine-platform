'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/useTranslation'

export default function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (resetError) {
        setError(resetError.message)
        setLoading(false)
        return
      }
      setSuccess(true)
    } catch {
      setError(t('auth.connection_error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 50% 40% at 50% 30%, rgba(212, 175, 55, 0.04), transparent)',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as unknown as [number, number, number, number] }}
        className="max-w-md w-full relative z-10"
      >
        <div className="text-center mb-10">
          <Link href="/" className="font-display text-2xl text-[var(--brand)] font-medium tracking-tight">SOS Shine</Link>
          <p className="text-[var(--text-muted)] text-[13px] mt-2">{t('auth.forgot_subtitle')}</p>
        </div>

        <div className="glass p-8 md:p-10">
          <h1 className="font-display text-[var(--text-primary)] mb-8 text-center" style={{ fontSize: '1.875rem' }}>
            {t('auth.forgot_title')}
          </h1>

          {success ? (
            <div className="text-center space-y-4">
              <div className="px-4 py-3 rounded-xl text-[13px]" style={{ color: '#34d399', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
                {t('auth.forgot_success')}
              </div>
              <Link href="/login" className="inline-block text-[13px] font-medium transition-colors duration-200 hover:underline" style={{ color: 'var(--brand)' }}>
                {t('auth.forgot_back')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-[13px] text-[var(--text-secondary)] mb-2 font-medium">Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  placeholder="votre@email.com"
                  className="w-full px-4 py-3 rounded-xl text-sm transition-colors"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-primary)', outline: 'none' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                />
              </div>
              {error && (
                <p className="text-[13px] px-4 py-3 rounded-xl" style={{ color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.15)' }}>
                  {error}
                </p>
              )}
              <button type="submit" disabled={loading}
                className="cta-glow w-full py-3.5 rounded-full font-medium tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                style={{ background: 'var(--button-bg)', color: 'var(--dark)' }}>
                {loading ? t('auth.forgot_sending') : t('auth.forgot_send')}
              </button>
              <div className="text-center">
                <Link href="/login" className="text-[13px] transition-colors duration-200 hover:underline" style={{ color: 'var(--brand)' }}>
                  {t('auth.forgot_back')}
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </main>
  )
}
