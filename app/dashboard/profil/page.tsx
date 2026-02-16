'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Subscription } from '@/types/database'

export default function ProfilPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [prenom, setPrenom] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profileData) {
        setProfile(profileData as Profile)
        setPrenom((profileData as Profile).prenom)
      } else {
        const fallback: Profile = {
          id: user.id, prenom: user.user_metadata?.prenom || 'Membre',
          email: user.email || '', role: 'member', avatar_url: null, plan: null, created_at: user.created_at,
        }
        setProfile(fallback)
        setPrenom(fallback.prenom)
      }

      const { data: subData } = await supabase.from('subscriptions').select('*').eq('user_id', user.id).single()
      if (subData) setSubscription(subData as Subscription)

      setLoading(false)
    }
    loadData()
  }, [])

  async function handleSave() {
    if (!profile || !prenom.trim() || saving) return
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ prenom: prenom.trim() }).eq('id', profile.id)
    if (!error) {
      setProfile({ ...profile, prenom: prenom.trim() })
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  function getStatusLabel(status: string) {
    const map: Record<string, { label: string; color: string }> = {
      trialing: { label: 'Essai gratuit', color: '#55EFC4' },
      active: { label: 'Actif', color: '#55EFC4' },
      inactive: { label: 'Inactif', color: 'var(--text-muted)' },
      canceled: { label: 'Annulé', color: '#FF6B6B' },
      past_due: { label: 'Paiement en retard', color: '#FF6B6B' },
    }
    return map[status] || { label: status, color: 'var(--text-muted)' }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold" style={{ color: 'var(--text-primary)' }}>Mon Profil</h1>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Gérez vos informations et votre abonnement.</p>
      </div>

      {/* Profile card */}
      <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-display font-semibold flex-shrink-0"
            style={{ background: 'rgba(212,168,67,0.12)', color: 'var(--gold)' }}>
            {profile?.prenom?.charAt(0).toUpperCase() || 'M'}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium block mb-1" style={{ color: 'var(--text-muted)' }}>Prénom</label>
                  <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }} />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSave} disabled={saving || !prenom.trim()}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
                    style={{ background: 'var(--gold)', color: 'var(--dark)' }}>
                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                  <button onClick={() => { setEditing(false); setPrenom(profile?.prenom || '') }}
                    className="px-4 py-2 rounded-xl text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{profile?.prenom}</h2>
                  {profile?.role === 'founder' && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,168,67,0.15)', color: 'var(--gold)' }}>Fondateur</span>
                  )}
                  {saved && <span className="text-xs" style={{ color: '#55EFC4' }}>Sauvegardé !</span>}
                </div>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{profile?.email}</p>
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Membre depuis {formatDate(profile?.created_at || '')}</p>
                <button onClick={() => setEditing(true)} className="mt-3 text-xs font-medium cursor-pointer" style={{ color: 'var(--gold)' }}>
                  Modifier le profil
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
        <h3 className="font-semibold text-base mb-4" style={{ color: 'var(--text-primary)' }}>Abonnement</h3>
        {subscription ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Statut</span>
              <span className="text-sm font-medium px-3 py-1 rounded-full"
                style={{ background: `${getStatusLabel(subscription.status).color}15`, color: getStatusLabel(subscription.status).color }}>
                {getStatusLabel(subscription.status).label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Plan</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {subscription.plan === 'premium' ? 'Premium — 99,90€/mois' : 'Essentiel — 29,90€/mois'}
              </span>
            </div>
            {subscription.current_period_end && (
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Prochain renouvellement</span>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{formatDate(subscription.current_period_end)}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl p-5 text-center" style={{ background: 'rgba(212,168,67,0.05)', border: '1px solid rgba(212,168,67,0.12)' }}>
            <p className="text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Essai gratuit de 7 jours</p>
            <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>Essentiel : 29,90€/mois · Premium : 99,90€/mois</p>
            <span className="text-xs font-medium" style={{ color: 'var(--gold)' }}>Le paiement Stripe sera bientôt activé</span>
          </div>
        )}
      </div>

      {/* Account */}
      <div className="rounded-2xl p-6" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
        <button onClick={handleSignOut}
          className="w-full text-left px-4 py-3 rounded-xl text-sm flex items-center gap-3 transition-colors cursor-pointer"
          style={{ color: 'var(--text-secondary)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          Se déconnecter
        </button>
      </div>
    </div>
  )
}
