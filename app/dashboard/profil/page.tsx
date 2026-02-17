'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadFile } from '@/lib/supabase/storage'
import type { Profile, Subscription } from '@/types/database'

export default function ProfilPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const avatarRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)

  // Editable fields
  const [prenom, setPrenom] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profileData) {
        const p = profileData as Profile
        setProfile(p)
        setPrenom(p.prenom)
        setPseudo(p.pseudo || '')
        setBio(p.bio || '')
      } else {
        const fallback: Profile = {
          id: user.id, prenom: user.user_metadata?.prenom || 'Membre',
          pseudo: null, email: user.email || '', role: 'member',
          avatar_url: null, bio: null, video_url: null, plan: null, created_at: user.created_at,
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
    const { error } = await supabase.from('profiles').update({
      prenom: prenom.trim(),
      pseudo: pseudo.trim() || null,
      bio: bio.trim() || null,
    }).eq('id', profile.id)
    if (!error) {
      setProfile({ ...profile, prenom: prenom.trim(), pseudo: pseudo.trim() || null, bio: bio.trim() || null })
      setEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploadingAvatar(true)
    try {
      const url = await uploadFile(file, 'avatars')
      const supabase = createClient()
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', profile.id)
      setProfile({ ...profile, avatar_url: url })
    } catch { /* silently fail */ }
    setUploadingAvatar(false)
    if (avatarRef.current) avatarRef.current.value = ''
  }

  async function handleRemoveAvatar() {
    if (!profile) return
    const supabase = createClient()
    await supabase.from('profiles').update({ avatar_url: null }).eq('id', profile.id)
    setProfile({ ...profile, avatar_url: null })
  }

  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploadingVideo(true)
    try {
      const url = await uploadFile(file, 'avatars')
      const supabase = createClient()
      await supabase.from('profiles').update({ video_url: url }).eq('id', profile.id)
      setProfile({ ...profile, video_url: url })
    } catch { /* silently fail */ }
    setUploadingVideo(false)
    if (videoRef.current) videoRef.current.value = ''
  }

  async function handleRemoveVideo() {
    if (!profile) return
    const supabase = createClient()
    await supabase.from('profiles').update({ video_url: null }).eq('id', profile.id)
    setProfile({ ...profile, video_url: null })
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

  const inputStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', color: 'var(--text-primary)' }

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

      {/* Photo de profil */}
      <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
        <h3 className="font-semibold text-base mb-4" style={{ color: 'var(--text-primary)' }}>Photo de profil</h3>
        <div className="flex items-center gap-5">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-display font-semibold flex-shrink-0"
              style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--gold)' }}>
              {profile?.prenom?.charAt(0).toUpperCase() || 'M'}
            </div>
          )}
          <div className="space-y-2">
            <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            <button onClick={() => avatarRef.current?.click()} disabled={uploadingAvatar}
              className="block px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer disabled:opacity-50"
              style={{ background: 'var(--gold)', color: 'var(--dark)' }}>
              {uploadingAvatar ? 'Envoi...' : profile?.avatar_url ? 'Changer la photo' : 'Ajouter une photo'}
            </button>
            {profile?.avatar_url && (
              <button onClick={handleRemoveAvatar} className="block text-xs cursor-pointer" style={{ color: '#FF6B6B' }}>
                Supprimer la photo
              </button>
            )}
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>JPG, PNG. Max 10 Mo.</p>
          </div>
        </div>
      </div>

      {/* Informations */}
      <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>Informations</h3>
          {!editing && (
            <button onClick={() => setEditing(true)} className="text-xs font-medium cursor-pointer" style={{ color: 'var(--gold)' }}>
              Modifier
            </button>
          )}
          {saved && <span className="text-xs" style={{ color: '#55EFC4' }}>Sauvegardé !</span>}
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>Prénom</label>
              <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Pseudo <span className="font-normal">(affiché dans les chats à la place du prénom)</span>
              </label>
              <input type="text" value={pseudo} onChange={(e) => setPseudo(e.target.value)}
                placeholder="Laissez vide pour utiliser votre prénom"
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Bio <span className="font-normal">(facultatif, visible par la communauté)</span>
              </label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                placeholder="Parlez un peu de vous..."
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-y" style={inputStyle} maxLength={500} />
              <p className="text-xs mt-1 text-right" style={{ color: 'var(--text-muted)' }}>{bio.length}/500</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving || !prenom.trim()}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
                style={{ background: 'var(--gold)', color: 'var(--dark)' }}>
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              <button onClick={() => { setEditing(false); setPrenom(profile?.prenom || ''); setPseudo(profile?.pseudo || ''); setBio(profile?.bio || '') }}
                className="px-4 py-2 rounded-xl text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                {profile?.prenom}
              </h2>
              {profile?.pseudo && (
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>({profile.pseudo})</span>
              )}
              {profile?.role === 'founder' && (
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold)' }}>Fondateur</span>
              )}
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{profile?.email}</p>
            {profile?.bio && (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{profile.bio}</p>
            )}
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Membre depuis {formatDate(profile?.created_at || '')}</p>
          </div>
        )}
      </div>

      {/* Vidéo de présentation */}
      <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
        <h3 className="font-semibold text-base mb-4" style={{ color: 'var(--text-primary)' }}>Vidéo de présentation</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Facultatif — présentez-vous à la communauté en vidéo.</p>
        {profile?.video_url ? (
          <div className="space-y-3">
            <video src={profile.video_url} controls className="w-full max-h-64 rounded-xl bg-black" />
            <div className="flex items-center gap-3">
              <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
              <button onClick={() => videoRef.current?.click()} disabled={uploadingVideo}
                className="text-xs font-medium cursor-pointer disabled:opacity-50" style={{ color: 'var(--gold)' }}>
                {uploadingVideo ? 'Envoi...' : 'Changer la vidéo'}
              </button>
              <button onClick={handleRemoveVideo} className="text-xs cursor-pointer" style={{ color: '#FF6B6B' }}>
                Supprimer
              </button>
            </div>
          </div>
        ) : (
          <div>
            <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
            <button onClick={() => videoRef.current?.click()} disabled={uploadingVideo}
              className="px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)' }}>
              {uploadingVideo ? 'Envoi en cours...' : 'Ajouter une vidéo de présentation'}
            </button>
          </div>
        )}
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
          <div className="rounded-xl p-5 text-center" style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.12)' }}>
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
