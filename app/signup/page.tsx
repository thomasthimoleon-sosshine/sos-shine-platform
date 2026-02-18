'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const DEFAULTS: Record<string, string> = {
  signup_title: 'Créer mon compte',
  signup_subtitle: 'Rejoignez le sanctuaire',
  signup_button_text: 'Créer mon compte',
  signup_login_text: 'Déjà membre ?',
  signup_login_link_text: 'Se connecter',
  signup_trial_text: '7 jours gratuits — Puis 29,90€/mois — Sans engagement',
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
  'Cormorant Garamond': "'Cormorant Garamond', serif",
  'DM Sans': "'DM Sans', sans-serif",
  'Georgia': 'Georgia, serif',
  'Arial': 'Arial, sans-serif',
  'Times New Roman': "'Times New Roman', serif",
}
const sizeMap: Record<string, string> = {
  sm: '1.875rem', md: '2.25rem', lg: '3rem', xl: '3.75rem', '2xl': '4.5rem',
}

export default function SignupPage() {
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [settings, setSettings] = useState<Record<string, string>>(DEFAULTS)

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
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { prenom },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch {
      setError('Impossible de créer le compte. Vérifiez votre connexion internet.')
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const titleStyle: React.CSSProperties = {
    fontFamily: fontMap[s('signup_title_font')] || undefined,
    fontSize: sizeMap[s('signup_title_size')] || undefined,
    textAlign: (s('signup_title_align') as 'left' | 'center' | 'right') || 'center',
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6" style={{
        backgroundImage: s('signup_bg_image') ? `url(${s('signup_bg_image')})` : undefined,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            {s('signup_header_image') ? (
              <Link href="/"><img src={s('signup_header_image')} alt="SOS Shine" className="h-16 mx-auto mb-3 object-contain" /></Link>
            ) : s('logo_url') ? (
              <Link href="/"><img src={s('logo_url')} alt="SOS Shine" className="h-12 mx-auto mb-3 rounded-xl object-cover" /></Link>
            ) : (
              <Link href="/" className="font-display text-2xl text-[var(--gold)] font-medium">SOS Shine</Link>
            )}
          </div>

          <div className="p-10 rounded-2xl" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
            <div className="w-16 h-16 rounded-full bg-[rgba(212,175,55,0.1)] flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[var(--gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h1 className="font-display text-2xl text-[var(--text-primary)] mb-3" style={titleStyle}>
              {s('signup_confirm_title')}
            </h1>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              {s('signup_confirm_text').replace('envoyé.', `envoyé à `)}
              {s('signup_confirm_text').includes('envoyé.') && <span className="text-[var(--gold)]"> {email}</span>}
              {!s('signup_confirm_text').includes('envoyé.') && (
                <>
                  {' '}<span className="text-[var(--gold)]">{email}</span>.
                </>
              )}
            </p>
          </div>

          <p className="text-xs text-[var(--text-muted)] mt-6">
            Vous n&apos;avez rien reçu ?{' '}
            <button onClick={() => setSuccess(false)} className="text-[var(--gold)] hover:underline">
              Réessayer
            </button>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6" style={{
      backgroundImage: s('signup_bg_image') ? `url(${s('signup_bg_image')})` : undefined,
      backgroundSize: 'cover', backgroundPosition: 'center',
    }}>
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-10">
          {s('signup_header_image') ? (
            <Link href="/"><img src={s('signup_header_image')} alt="SOS Shine" className="h-16 mx-auto mb-3 object-contain" /></Link>
          ) : s('logo_url') ? (
            <Link href="/"><img src={s('logo_url')} alt="SOS Shine" className="h-12 mx-auto mb-3 rounded-xl object-cover" /></Link>
          ) : (
            <Link href="/" className="font-display text-2xl text-[var(--gold)] font-medium">SOS Shine</Link>
          )}
          <p className="text-[var(--text-muted)] text-sm mt-2">{s('signup_subtitle')}</p>
        </div>

        {/* Card */}
        <div className="p-8 md:p-10 rounded-2xl" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
          <h1 className="font-display text-[var(--text-primary)] mb-8" style={titleStyle}>
            {s('signup_title')}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="prenom" className="block text-sm text-[var(--text-secondary)] mb-2">Prénom</label>
              <input id="prenom" type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} required
                placeholder="Votre prénom"
                className="w-full px-4 py-3 rounded-lg bg-[var(--dark)] border border-[var(--dark-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm text-[var(--text-secondary)] mb-2">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                placeholder="votre@email.com"
                className="w-full px-4 py-3 rounded-lg bg-[var(--dark)] border border-[var(--dark-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm text-[var(--text-secondary)] mb-2">Mot de passe</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                minLength={6} placeholder="Minimum 6 caractères"
                className="w-full px-4 py-3 rounded-lg bg-[var(--dark)] border border-[var(--dark-border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)] transition-colors text-sm" />
            </div>
            {error && <p className="text-sm text-red-400 bg-red-400/10 px-4 py-3 rounded-lg">{error}</p>}
            <button type="submit" disabled={loading}
              className="cta-glow w-full py-3.5 bg-[var(--button-bg)] text-[var(--dark)] rounded-full font-medium tracking-wide hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm">
              {loading ? 'Création en cours...' : s('signup_button_text')}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <span className="flex-1 h-px bg-[var(--dark-border)]" />
            <span className="text-xs text-[var(--text-muted)]">ou</span>
            <span className="flex-1 h-px bg-[var(--dark-border)]" />
          </div>

          <button onClick={handleGoogleSignIn}
            className="w-full py-3.5 rounded-full border border-[var(--dark-border)] text-[var(--text-secondary)] hover:border-[var(--gold)] hover:text-[var(--text-primary)] transition-all text-sm flex items-center justify-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continuer avec Google
          </button>
        </div>

        <p className="text-center text-sm text-[var(--text-muted)] mt-8">
          {s('signup_login_text')}{' '}
          <Link href="/login" className="text-[var(--gold)] hover:text-[var(--gold-light)] transition-colors">
            {s('signup_login_link_text')}
          </Link>
        </p>

        <p className="text-center text-xs text-[var(--text-muted)] mt-4 italic">
          {s('signup_trial_text')}
        </p>
      </div>
    </main>
  )
}
