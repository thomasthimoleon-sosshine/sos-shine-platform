'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

export default function CompteInactifPage() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [subStatus, setSubStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [hasSubscription, setHasSubscription] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      setUserEmail(user.email || null)
      setUserId(user.id)

      const { data: sub } = await supabase
        .from('subscriptions')
        .select('status, plan')
        .eq('user_id', user.id)
        .single()

      if (sub) {
        setSubStatus(sub.status)
        setHasSubscription(true)

        // If subscription is active, redirect to dashboard
        if (sub.status === 'active' || sub.status === 'trialing') {
          router.push('/dashboard')
        }
      }
    }
    loadData()
  }, [router])

  const handleResubscribe = async (plan: 'essential' | 'premium') => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, email: userEmail, user_id: userId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Erreur lors de la redirection')
      }
    } catch {
      alert('Erreur de connexion')
    }
    setLoading(false)
  }

  const handleManageSubscription = async () => {
    if (!userId) return
    setLoadingPortal(true)
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch {}
    setLoadingPortal(false)
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const statusLabels: Record<string, { label: string; color: string }> = {
    past_due: { label: 'Paiement en retard', color: '#E17055' },
    canceled: { label: 'Annul\u00e9', color: '#ef4444' },
    inactive: { label: 'Inactif', color: '#9A9080' },
  }

  const statusInfo = subStatus ? statusLabels[subStatus] || statusLabels.inactive : statusLabels.inactive

  return (
    <main className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--dark)' }}>
      <motion.div
        className="max-w-md w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8"
          style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}>
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="#D4AF37" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-light mb-4" style={{ color: 'var(--text-primary)' }}>
          Acc&egrave;s suspendu
        </h1>

        {subStatus && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ background: `${statusInfo.color}15`, border: `1px solid ${statusInfo.color}30` }}>
            <span className="w-2 h-2 rounded-full" style={{ background: statusInfo.color }} />
            <span className="text-sm font-medium" style={{ color: statusInfo.color }}>{statusInfo.label}</span>
          </div>
        )}

        <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
          {subStatus === 'past_due' ? (
            "Votre dernier paiement n\u2019a pas pu \u00eatre trait\u00e9. Veuillez mettre \u00e0 jour vos informations de paiement pour retrouver l\u2019acc\u00e8s \u00e0 la plateforme."
          ) : subStatus === 'canceled' ? (
            "Votre abonnement a \u00e9t\u00e9 annul\u00e9. R\u00e9abonnez-vous pour retrouver l\u2019acc\u00e8s \u00e0 tout votre contenu."
          ) : (
            "Votre compte n\u2019a pas d\u2019abonnement actif. Choisissez un plan pour acc\u00e9der \u00e0 la plateforme."
          )}
        </p>

        {/* Actions */}
        <div className="space-y-3 mb-8">
          {hasSubscription && subStatus === 'past_due' && (
            <button
              onClick={handleManageSubscription}
              disabled={loadingPortal}
              className="w-full py-4 rounded-full font-semibold tracking-wide transition-all text-sm disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #B8960F)', color: '#050505' }}
            >
              {loadingPortal ? 'Redirection...' : 'Mettre \u00e0 jour le paiement'}
            </button>
          )}

          <button
            onClick={() => handleResubscribe('essential')}
            disabled={loading}
            className="w-full py-4 rounded-full font-semibold tracking-wide transition-all text-sm disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #B8960F)', color: '#050505' }}
          >
            {loading ? 'Redirection...' : 'S\u2019abonner Essentiel \u2014 29,90\u20ac/mois'}
          </button>

          <button
            onClick={() => handleResubscribe('premium')}
            disabled={loading}
            className="w-full py-4 rounded-full font-medium tracking-wide transition-all text-sm disabled:opacity-50"
            style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.25)' }}
          >
            {loading ? 'Redirection...' : 'S\u2019abonner Premium \u2014 99,90\u20ac/mois'}
          </button>
        </div>

        <div className="flex items-center justify-center gap-6">
          <Link href="/" className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>
            Retour &agrave; l&apos;accueil
          </Link>
          <button onClick={handleSignOut} className="text-xs transition-colors cursor-pointer" style={{ color: 'var(--text-muted)' }}>
            Se d&eacute;connecter
          </button>
          <Link href="/contact" className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>
            Contacter le support
          </Link>
        </div>
      </motion.div>
    </main>
  )
}
