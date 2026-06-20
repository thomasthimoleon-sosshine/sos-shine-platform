'use client'

import { useState } from 'react'
import Link from 'next/link'

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '16px 18px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(201,169,97,0.25)',
  borderRadius: '14px',
  color: '#F5F1E8',
  fontSize: '16px',
  fontFamily: 'Inter, -apple-system, sans-serif',
  outline: 'none',
  WebkitAppearance: 'none',
}

export default function CadeauPage() {
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [hp, setHp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/cadeau/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenom, email, consent, _hp: hp }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue.')
        setLoading(false)
        return
      }
      window.location.href = '/cadeau/merci'
    } catch {
      setError('Connexion impossible. Verifie ton reseau.')
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0A0A0A', color: '#F5F1E8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px 64px' }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'block', marginBottom: '52px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-shine.png" alt="SOS Shine" style={{ height: '52px', width: 'auto' }} />
      </Link>

      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Gold line */}
        <div style={{ width: '28px', height: '1px', background: '#C9A961', marginBottom: '28px' }} />

        {/* Tag */}
        <p style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#C9A961', marginBottom: '14px', fontFamily: 'Inter, sans-serif', fontWeight: '500' }}>
          Guide offert
        </p>

        {/* Title */}
        <h1 style={{ fontFamily: 'var(--font-cormorant), Georgia, serif', fontSize: 'clamp(3rem, 11vw, 4.2rem)', fontWeight: '300', lineHeight: '1.05', color: '#F5F1E8', marginBottom: '18px' }}>
          Le Couple<br />Vivant
        </h1>

        {/* Desc */}
        <p style={{ fontSize: '15px', lineHeight: '1.65', color: 'rgba(245,241,232,0.5)', marginBottom: '40px', fontFamily: 'Inter, -apple-system, sans-serif', fontWeight: '300' }}>
          Entre ton prenom et ton email pour recevoir le guide.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Honeypot */}
          <input
            type="text"
            name="_hp"
            value={hp}
            onChange={e => setHp(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
          />

          {/* Prenom */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,241,232,0.35)', marginBottom: '8px', fontFamily: 'Inter, sans-serif' }}>
              Prenom
            </label>
            <input
              type="text"
              value={prenom}
              onChange={e => setPrenom(e.target.value)}
              required
              autoComplete="given-name"
              placeholder="Camille"
              style={{ ...INPUT_STYLE, '::placeholder': 'rgba(245,241,232,0.2)' } as React.CSSProperties}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,241,232,0.35)', marginBottom: '8px', fontFamily: 'Inter, sans-serif' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              inputMode="email"
              placeholder="camille@email.com"
              style={INPUT_STYLE}
            />
          </div>

          {/* Consent */}
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', padding: '4px 0' }}>
            <input
              type="checkbox"
              checked={consent}
              onChange={e => setConsent(e.target.checked)}
              required
              style={{ width: '20px', height: '20px', flexShrink: 0, marginTop: '1px', accentColor: '#C9A961', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '12px', color: 'rgba(245,241,232,0.38)', lineHeight: '1.55', fontFamily: 'Inter, sans-serif' }}>
              J&apos;accepte de recevoir des communications de SOS Shine. Mes donnees sont traitees conformement a la politique de confidentialite.
            </span>
          </label>

          {/* Error */}
          {error && (
            <p style={{ fontSize: '13px', color: '#FF7070', fontFamily: 'Inter, sans-serif', padding: '0 2px' }}>
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !consent}
            style={{
              width: '100%',
              padding: '20px',
              marginTop: '6px',
              background: (!consent || loading) ? 'rgba(201,169,97,0.25)' : 'linear-gradient(135deg, #C9A961 0%, #B8960F 100%)',
              color: (!consent || loading) ? 'rgba(245,241,232,0.3)' : '#0A0A0A',
              border: 'none',
              borderRadius: '999px',
              fontSize: '15px',
              fontWeight: '600',
              letterSpacing: '0.06em',
              cursor: (!consent || loading) ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Envoi en cours...' : 'Recevoir le guide'}
          </button>
        </form>

        {/* RGPD note */}
        <p style={{ fontSize: '11px', color: 'rgba(245,241,232,0.18)', marginTop: '20px', lineHeight: '1.55', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
          Tes donnees ne seront jamais vendues ni partagees avec des tiers.
        </p>
      </div>

      {/* Footer mark */}
      <p style={{ marginTop: '56px', fontSize: '10px', color: 'rgba(245,241,232,0.12)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>
        SOS Shine
      </p>
    </main>
  )
}
