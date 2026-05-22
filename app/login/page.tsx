'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/useTranslation'

const DEFAULTS: Record<string, string> = {
  login_title: 'Bon retour.',
  login_subtitle: 'Votre sanctuaire vous attend.',
  login_button_text: 'Entrer',
  login_signup_text: 'Pas encore membre ?',
  login_signup_link_text: 'Créer mon compte',
  login_title_font: 'Cormorant Garamond',
  login_title_size: 'md',
  login_title_align: 'center',
  login_bg_image: '',
  login_header_image: '',
  logo_url: '',
}

export default function LoginPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULTS)
  const [focused, setFocused] = useState<string | null>(null)

  const loadSettings = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data } = await supabase.from('site_settings').select('key, value').in('key', Object.keys(DEFAULTS))
      if (data && data.length > 0) {
        const map = { ...DEFAULTS }
        data.forEach((row: { key: string; value: string }) => { if (row.value) map[row.key] = row.value })
        setSettings(map)
      }
    } catch { /* use defaults */ }
  }, [])

  useEffect(() => { loadSettings() }, [loadSettings])

  function s(key: string) { return settings[key] || DEFAULTS[key] || '' }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) { setError(signInError.message); setLoading(false); return }
      const params = new URLSearchParams(window.location.search)
      const next = params.get('next')
      if (next && next.startsWith('/')) {
        router.push(next)
        return
      }
      let protocolSlug: string | null = null
      try { protocolSlug = sessionStorage.getItem('sos_protocol_slug') } catch {}
      router.push(protocolSlug ? `/mon-chemin?protocol=${protocolSlug}` : '/dashboard')
    } catch {
      setError(t('auth.connection_error'))
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    const supabase = createClient()
    const params = new URLSearchParams(window.location.search)
    const urlNext = params.get('next')
    let next = urlNext && urlNext.startsWith('/') ? urlNext : null
    if (!next) {
      let protocolSlug: string | null = null
      try { protocolSlug = sessionStorage.getItem('sos_protocol_slug') } catch {}
      if (protocolSlug) next = `/mon-chemin?protocol=${protocolSlug}`
    }
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next || '/dashboard')}` },
    })
  }

  return (
    <main className="min-h-screen relative overflow-hidden bg-[#06070A]">

      {/* ── Ambient layers ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Deep blue radial */}
        <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[800px] h-[600px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(ellipse, rgba(15,22,36,0.8) 0%, transparent 70%)' }} />
        {/* Gold accent - very subtle */}
        <div className="absolute top-[15%] left-[50%] -translate-x-1/2 w-[400px] h-[300px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #B8A472 0%, transparent 60%)' }} />
        {/* Grain texture */}
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")' }} />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-16">

        {/* Logo - breathing room */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16"
        >
          <Link href="/" className="block">
            <img
              src={s('login_header_image') || s('logo_url') || '/images/logo-shine.png'}
              alt="SOS Shine"
              className="h-14 mx-auto object-contain opacity-90"
            />
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[400px]"
        >
          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="font-display text-[2.5rem] font-light leading-[1.1] tracking-[-0.02em] text-[#F5F0E8] mb-3">
              {s('login_title')}
            </h1>
            <p className="text-[15px] font-light text-[#9B9590]">
              {s('login_subtitle')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className={`block text-[11px] font-medium uppercase tracking-[0.1em] mb-2.5 transition-colors duration-300 ${focused === 'email' ? 'text-[#C4B080]' : 'text-[#9B9590]'}`}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                required
                placeholder="votre@email.com"
                className="w-full px-5 py-4 rounded-2xl text-[15px] font-light bg-[#111827] border border-[rgba(184,164,114,0.10)] text-[#F5F0E8] outline-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] placeholder:text-[#8A857F] focus:border-[rgba(184,164,114,0.2)] focus:bg-[#0F1320] focus:shadow-[0_0_0_4px_rgba(184,164,114,0.04)]"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label
                  htmlFor="password"
                  className={`block text-[11px] font-medium uppercase tracking-[0.1em] transition-colors duration-300 ${focused === 'password' ? 'text-[#C4B080]' : 'text-[#9B9590]'}`}
                >
                  {t('auth.password_label')}
                </label>
                <Link href="/forgot-password" className="text-[11px] text-[#9B9590] hover:text-[#B8A472] transition-colors duration-300">
                  {t('auth.forgot_password')}
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                required
                placeholder="••••••••"
                className="w-full px-5 py-4 rounded-2xl text-[15px] font-light bg-[#111827] border border-[rgba(184,164,114,0.10)] text-[#F5F0E8] outline-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] placeholder:text-[#8A857F] focus:border-[rgba(184,164,114,0.2)] focus:bg-[#0F1320] focus:shadow-[0_0_0_4px_rgba(184,164,114,0.04)]"
              />
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                className="px-5 py-3.5 rounded-2xl text-[13px] font-light bg-[rgba(212,106,106,0.06)] border border-[rgba(212,106,106,0.1)] text-[#D46A6A]"
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="group w-full relative py-4 rounded-2xl text-[14px] font-medium tracking-[0.03em] cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden bg-[#B8A472] text-[#08090A] hover:bg-[#C4B080] active:scale-[0.985]"
              >
                {/* Glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{ boxShadow: '0 0 40px rgba(184,164,114,0.15), 0 0 80px rgba(184,164,114,0.05)' }} />
                <span className="relative z-10">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2" />
                        <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Connexion...
                    </span>
                  ) : s('login_button_text')}
                </span>
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-5 my-8">
            <span className="flex-1 h-px bg-[rgba(184,164,114,0.06)]" />
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#8A857F]">{t('auth.or')}</span>
            <span className="flex-1 h-px bg-[rgba(184,164,114,0.06)]" />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-3.5 rounded-2xl text-[13px] font-light flex items-center justify-center gap-3 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border border-[rgba(255,255,255,0.04)] text-[#9B9590] hover:border-[rgba(184,164,114,0.12)] hover:text-[#A8A29E] hover:bg-[rgba(15,22,36,0.5)] cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continuer avec Google
          </button>

          {/* SOS Shine Kids */}
          <div className="mt-6 text-center">
            <a
              href="https://sosshine.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] text-[#8A857F] hover:text-[#9B9590] transition-colors duration-300"
            >
              <span>Acc&egrave;s SOS Shine&reg; Kids</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </a>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center text-[13px] text-[#8A857F]"
        >
          {s('login_signup_text')}{' '}
          <Link href="/signup" className="text-[#B8A472] hover:text-[#D4C99A] transition-colors duration-300">
            {s('login_signup_link_text')}
          </Link>
        </motion.p>
      </div>
    </main>
  )
}
