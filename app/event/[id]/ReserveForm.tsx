'use client'

import { useState, useRef } from 'react'

export default function ReserveForm({ ctaLabel, stripeUrl, isFree }: { ctaLabel: string; stripeUrl: string | null; isFree?: boolean }) {
  const [open, setOpen] = useState(false)
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [hp, setHp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const startedAt = useRef(Date.now())

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (Date.now() - startedAt.current < 2000) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/ceremonie/reserve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prenom, nom, email, _hp: hp }),
    })
    const data = await res.json() as { url?: string; error?: string }

    if (!res.ok) {
      setError(data.error || 'Erreur lors de la réservation.')
      setLoading(false)
      return
    }

    if (isFree) {
      window.location.href = '/event/confirmation'
    } else {
      window.location.href = data.url!
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-block',
          padding: '16px 40px',
          borderRadius: '999px',
          background: 'linear-gradient(135deg, #C9A961, #B8960F)',
          color: '#000',
          fontWeight: '700',
          fontSize: '15px',
          letterSpacing: '0.04em',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {ctaLabel || 'Réserver ma place'}
      </button>
    )
  }

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
        {/* Honeypot */}
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }} aria-hidden="true">
          <input tabIndex={-1} value={hp} onChange={e => setHp(e.target.value)} autoComplete="off" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(245,241,232,0.4)', marginBottom: '8px' }}>Prénom</label>
              <input
                type="text"
                value={prenom}
                onChange={e => setPrenom(e.target.value)}
                required
                autoComplete="given-name"
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,169,97,0.2)', borderRadius: '12px', padding: '12px 16px', color: '#F5F1E8', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(245,241,232,0.4)', marginBottom: '8px' }}>Nom</label>
              <input
                type="text"
                value={nom}
                onChange={e => setNom(e.target.value)}
                required
                autoComplete="family-name"
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,169,97,0.2)', borderRadius: '12px', padding: '12px 16px', color: '#F5F1E8', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(245,241,232,0.4)', marginBottom: '8px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,169,97,0.2)', borderRadius: '12px', padding: '12px 16px', color: '#F5F1E8', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {error && (
            <p style={{ fontSize: '13px', color: '#ef4444', margin: 0 }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '14px 32px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #C9A961, #B8960F)',
                color: '#000',
                fontWeight: '700',
                fontSize: '14px',
                border: 'none',
                cursor: loading ? 'default' : 'pointer',
                opacity: loading ? 0.7 : 1,
                letterSpacing: '0.03em',
              }}
            >
              {loading ? (isFree ? 'Inscription...' : 'Redirection...') : (isFree ? 'Confirmer ma présence' : 'Confirmer et payer')}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ padding: '14px 20px', borderRadius: '999px', background: 'transparent', color: 'rgba(245,241,232,0.4)', fontSize: '14px', border: '1px solid rgba(245,241,232,0.1)', cursor: 'pointer' }}
            >
              Annuler
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
