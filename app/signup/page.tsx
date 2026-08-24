'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/useTranslation'

const DEFAULTS: Record<string, string> = {
  signup_title: 'Créer mon compte',
  signup_subtitle: 'Rejoignez le sanctuaire',
  signup_button_text: 'Créer mon compte',
  signup_login_text: 'Déjà membre ?',
  signup_login_link_text: 'Se connecter',
  signup_trial_text: 'L\'étape 1 de ton protocole est offerte · sans carte bancaire',
  signup_confirm_title: 'Vérifiez votre email',
  signup_confirm_text: 'Un lien de confirmation a été envoyé. Cliquez dessus pour activer votre compte.',
  signup_title_font: 'Cormorant Garamond',
  signup_title_size: 'md',
  signup_title_align: 'center',
  signup_bg_image: '',
  signup_header_image: '',
  logo_url: '',
}

const fontMap: Record<string, string> = {
  'Cinzel': "'Cinzel', serif",
  'Montserrat': "'Montserrat', sans-serif",
  'Cormorant Garamond': "'Cormorant Garamond', serif",
  'DM Sans': "'DM Sans', sans-serif",
  'Georgia': 'Georgia, serif',
  'Arial': 'Arial, sans-serif',
  'Times New Roman': "'Times New Roman', serif",
}
const sizeMap: Record<string, string> = {
  sm: '1.875rem', md: '2.25rem', lg: '3rem', xl: '3.75rem', '2xl': '4.5rem',
}

const supabaseErrorMap: Record<string, string> = {
  'User already registered': 'Un compte existe déjà avec cet email. Essayez de vous connecter.',
  'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères.',
  'Unable to validate email address: invalid format': 'Format d\'email invalide. Vérifiez votre adresse.',
  'Signup requires a valid password': 'Veuillez entrer un mot de passe valide.',
  'Email rate limit exceeded': 'Trop de tentatives. Veuillez réessayer dans quelques minutes.',
  'For security purposes, you can only request this after': 'Pour des raisons de sécurité, veuillez patienter avant de réessayer.',
}

function translateError(message: string): string {
  for (const [key, value] of Object.entries(supabaseErrorMap)) {
    if (message.includes(key)) return value
  }
  return 'Une erreur est survenue. Veuillez réessayer.'
}

function getPasswordStrength(password: string): { level: number; label: string; color: string } {
  if (!password) return { level: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { level: 1, label: 'Faible', color: '#f87171' }
  if (score <= 2) return { level: 2, label: 'Moyen', color: '#fbbf24' }
  if (score <= 3) return { level: 3, label: 'Bon', color: '#60a5fa' }
  return { level: 4, label: 'Excellent', color: '#55EFC4' }
}

export default function SignupPage() {
  const signupRouter = useRouter()
  const { t } = useTranslation()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const source = params.get('source')
    const urlSlug = params.get('protocol')
    const urlEmail = params.get('email')

    // Persist protocol slug as soon as it arrives (used on signup submit + logged-in redirect)
    if (urlSlug) {
      try { sessionStorage.setItem('sos_protocol_slug', urlSlug) } catch {}
    }

    // Pre-fill email: sessionStorage first, URL param fallback
    try {
      const savedEmail = sessionStorage.getItem('sos_quiz_email')
      if (savedEmail) setEmail(savedEmail)
      else if (urlEmail) setEmail(urlEmail)
    } catch {
      if (urlEmail) setEmail(urlEmail)
    }

    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        // Already logged in → find protocol and redirect
        let protocolSlug: string | null = null
        try { protocolSlug = sessionStorage.getItem('sos_protocol_slug') } catch {}
        if (!protocolSlug && urlSlug) {
          protocolSlug = urlSlug
          try { sessionStorage.setItem('sos_protocol_slug', urlSlug) } catch {}
        }
        if (!protocolSlug && source === 'quiz') {
          signupRouter.replace('/signature-emotionnelle')
          return
        }
        signupRouter.replace(protocolSlug ? `/mon-chemin?protocol=${protocolSlug}` : '/dashboard')
      } else {
        // Not logged in → enforce quiz funnel
        let storedSlug: string | null = null
        try { storedSlug = sessionStorage.getItem('sos_protocol_slug') } catch {}
        if (source !== 'quiz' && source !== 'rejoindre' && !urlSlug && !storedSlug) {
          signupRouter.replace('/signature-emotionnelle')
        }
      }
    })
  }, [signupRouter])

  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptCgv, setAcceptCgv] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULTS)

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password])

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

    // Anti-spam checks
    const { validateAntiSpam } = await import('@/lib/anti-spam')
    const spamError = validateAntiSpam(email, prenom)
    if (spamError) {
      setError(spamError)
      return
    }

    // Honeypot: if filled, it's a bot (field hidden via CSS)
    const honeypot = (document.getElementById('_hp_name') as HTMLInputElement)?.value
    if (honeypot) return

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    if (!acceptCgv) {
      setError('Veuillez accepter les conditions générales de vente.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      let protocolSlug: string | null = null
      try { protocolSlug = sessionStorage.getItem('sos_protocol_slug') } catch {}
      const nextPath = protocolSlug
        ? `/mon-chemin?protocol=${protocolSlug}`
        : '/dashboard'

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { prenom },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      })

      if (signUpError) {
        setError(translateError(signUpError.message))
        setLoading(false)
        return
      }

      setSuccess(true)

    } catch {
      setError(t('auth.signup_error'))
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    if (!acceptCgv) {
      setError('Veuillez accepter les conditions générales de vente.')
      return
    }
    let protocolSlug: string | null = null
    try { protocolSlug = sessionStorage.getItem('sos_protocol_slug') } catch {}
    const nextPath = protocolSlug
      ? `/mon-chemin?protocol=${protocolSlug}`
      : '/dashboard'
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}` },
    })
  }

  const titleStyle: React.CSSProperties = {
    fontFamily: fontMap[s('signup_title_font')] || undefined,
    fontSize: sizeMap[s('signup_title_size')] || undefined,
    textAlign: (s('signup_title_align') as 'left' | 'center' | 'right') || 'center',
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 relative" style={{
        backgroundImage: s('signup_bg_image') ? `url(${s('signup_bg_image')})` : undefined,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 50% 40% at 50% 30%, rgba(201, 169, 97, 0.04), transparent)',
        }} />
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as unknown as [number, number, number, number] }}
          className="max-w-md w-full text-center relative z-10"
        >
          <div className="mb-8">
            <Link href="/"><img src={s('signup_header_image') || s('logo_url') || '/images/logo-shine.png'} alt="SOS Shine" className="h-16 mx-auto mb-3 object-contain" /></Link>
          </div>

          <div className="rounded-[var(--radius-2xl)] p-10 bg-[var(--surface-raised)] border border-[var(--border-subtle)] shadow-[var(--shadow-lg)]">
            <div className="w-14 h-14 rounded-[var(--radius-xl)] flex items-center justify-center mx-auto mb-6 bg-[var(--brand-alpha-weak)] border border-[var(--border-medium)]">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="var(--brand)" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h1 className="font-display text-2xl text-[var(--text-primary)] mb-3" style={titleStyle}>
              {s('signup_confirm_title')}
            </h1>
            <p className="text-[var(--text-secondary)] text-[13px] leading-relaxed">
              {s('signup_confirm_text').replace('envoyé.', `envoyé à `)}
              {s('signup_confirm_text').includes('envoyé.') && <span className="text-[var(--brand)]"> {email}</span>}
              {!s('signup_confirm_text').includes('envoyé.') && (
                <>
                  {' '}<span className="text-[var(--brand)]">{email}</span>.
                </>
              )}
            </p>
          </div>

          <p className="text-[11px] text-[var(--text-muted)] mt-6">
            {t('auth.email_not_received')}{' '}
            <button onClick={() => setSuccess(false)} className="font-medium text-[var(--brand)] hover:underline">
              {t('auth.retry')}
            </button>
          </p>
        </motion.div>
      </main>
    )
  }

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', outline: 'none',
  }
  const focusIn = (e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = 'rgba(201,169,97,0.4)'
  const focusOut = (e: React.FocusEvent<HTMLInputElement>) => e.currentTarget.style.borderColor = 'var(--border)'

  const EyeIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
  const EyeOffIcon = () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="var(--text-muted)" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  )

  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative" style={{
      backgroundImage: s('signup_bg_image') ? `url(${s('signup_bg_image')})` : undefined,
      backgroundSize: 'cover', backgroundPosition: 'center',
    }}>
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 50% 40% at 50% 30%, rgba(201, 169, 97, 0.04), transparent)',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as unknown as [number, number, number, number] }}
        className="max-w-md w-full relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/"><img src={s('signup_header_image') || s('logo_url') || '/images/logo-shine.png'} alt="SOS Shine" className="h-16 mx-auto mb-3 object-contain" /></Link>
          <p className="text-[var(--text-muted)] text-[13px] mt-2">{s('signup_subtitle')}</p>
        </div>

        {/* Card - glass */}
        <div className="rounded-[var(--radius-2xl)] p-8 md:p-10 bg-[var(--surface-raised)] border border-[var(--border-subtle)] shadow-[var(--shadow-lg)]">
          <h1 className="font-display text-[var(--text-primary)] mb-8" style={titleStyle}>
            {s('signup_title')}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Honeypot - invisible to users, catches bots */}
            <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true">
              <input id="_hp_name" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            <div>
              <label htmlFor="prenom" className="block text-[13px] text-[var(--text-secondary)] mb-2 font-medium">{t('auth.firstname_label')}</label>
              <input id="prenom" type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} required
                placeholder={t('auth.firstname_placeholder')}
                className="w-full px-4 py-3 rounded-[var(--radius-lg)] text-sm transition-all duration-[var(--transition-base)] bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:border-[var(--brand-alpha-strong)] focus:shadow-[0_0_0_3px_var(--brand-alpha-weak)] placeholder:text-[var(--text-muted)]"
                 />
            </div>
            <div>
              <label htmlFor="email" className="block text-[13px] text-[var(--text-secondary)] mb-2 font-medium">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder="votre@email.com"
                className="w-full px-4 py-3 rounded-[var(--radius-lg)] text-sm transition-all duration-[var(--transition-base)] bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:border-[var(--brand-alpha-strong)] focus:shadow-[0_0_0_3px_var(--brand-alpha-weak)] placeholder:text-[var(--text-muted)]"
                 />
            </div>
            <div>
              <label htmlFor="password" className="block text-[13px] text-[var(--text-secondary)] mb-2 font-medium">{t('auth.password_label')}</label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                  minLength={6} placeholder={t('auth.min_chars')}
                  className="w-full px-4 py-3 pr-12 rounded-[var(--radius-lg)] text-sm transition-all duration-[var(--transition-base)] bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:border-[var(--brand-alpha-strong)] focus:shadow-[0_0_0_3px_var(--brand-alpha-weak)] placeholder:text-[var(--text-muted)]"
                   />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors"
                  style={{ background: 'transparent' }}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {/* Password strength indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1.5 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div key={level} className="h-1 flex-1 rounded-full transition-all duration-300" style={{
                        background: level <= passwordStrength.level ? passwordStrength.color : 'rgba(255,255,255,0.08)',
                      }} />
                    ))}
                  </div>
                  <p className="text-[11px] transition-colors" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-[13px] text-[var(--text-secondary)] mb-2 font-medium">Confirmer le mot de passe</label>
              <div className="relative">
                <input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6}
                  placeholder="Retapez votre mot de passe"
                  className="w-full px-4 py-3 pr-12 rounded-[var(--radius-lg)] text-sm transition-all duration-[var(--transition-base)] bg-[var(--surface-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] outline-none focus:border-[var(--brand-alpha-strong)] focus:shadow-[0_0_0_3px_var(--brand-alpha-weak)] placeholder:text-[var(--text-muted)]"
                   />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors"
                  style={{ background: 'transparent' }}
                  aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-[11px] mt-1.5 text-[var(--danger)]">
                  Les mots de passe ne correspondent pas
                </p>
              )}
              {confirmPassword && password === confirmPassword && confirmPassword.length >= 6 && (
                <p className="text-[11px] mt-1.5 text-[var(--success)]">
                  Les mots de passe correspondent
                </p>
              )}
            </div>

            {/* CGV acceptance */}
            <div className="flex items-start gap-3">
              <input id="acceptCgv" type="checkbox" checked={acceptCgv} onChange={(e) => setAcceptCgv(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-2 cursor-pointer accent-[var(--brand)]"
                 />
              <label htmlFor="acceptCgv" className="text-[12px] text-[var(--text-muted)] leading-relaxed cursor-pointer">
                J&apos;accepte les{' '}
                <Link href="/cgv" target="_blank" className="font-medium text-[var(--brand)] hover:underline">
                  conditions générales de vente
                </Link>
                {' '}et la{' '}
                <Link href="/confidentialite" target="_blank" className="font-medium text-[var(--brand)] hover:underline">
                  politique de confidentialité
                </Link>
              </label>
            </div>

            {error && (
              <p className="text-[13px] px-4 py-3 rounded-[var(--radius-lg)] text-[var(--danger)] bg-[var(--danger-alpha-weak)] border border-[var(--danger-alpha-medium)]" >
                {error}
              </p>
            )}
            <button type="submit" disabled={loading || !acceptCgv}
              className="w-full py-3.5 rounded-full font-medium tracking-wide transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] disabled:opacity-40 disabled:cursor-not-allowed text-sm bg-[var(--brand)] text-[var(--text-inverse)] shadow-[var(--glow-gold)] hover:shadow-[var(--glow-gold-hover)] hover:brightness-110 active:scale-[0.98] cursor-pointer"
              >
              {loading ? t('auth.creating') : s('signup_button_text')}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <span className="flex-1 h-px bg-[var(--border-subtle)]" />
            <span className="text-[11px] text-[var(--text-muted)]">{t('auth.or')}</span>
            <span className="flex-1 h-px bg-[var(--border-subtle)]" />
          </div>

          <button onClick={handleGoogleSignIn}
            className="w-full py-3.5 rounded-full text-[13px] flex items-center justify-center gap-3 transition-all duration-[var(--transition-base)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-medium)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-card)] cursor-pointer"
            
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {t('auth.google')}
          </button>
        </div>

        <p className="text-center text-[13px] text-[var(--text-muted)] mt-8">
          {s('signup_login_text')}{' '}
          <Link href="/login" className="font-medium text-[var(--brand)] hover:underline">
            {s('signup_login_link_text')}
          </Link>
        </p>

      </motion.div>
    </main>
  )
}
