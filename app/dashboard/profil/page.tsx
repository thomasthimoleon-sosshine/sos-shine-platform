'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadFile } from '@/lib/supabase/storage'
import type { Profile, Subscription } from '@/types/database'
import type { PlanId } from '@/lib/stripe/config'
import { PLAN_ORDER, PLAN_NAMES, PLAN_COLORS, PLAN_PRICES_EUR } from '@/lib/stripe/config'
import { useTranslation } from '@/lib/i18n/useTranslation'

export default function ProfilPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [upgrading, setUpgrading] = useState(false)
  const [upgradeSuccess, setUpgradeSuccess] = useState<string | null>(null)
  const [upgradeError, setUpgradeError] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [confirmDowngrade, setConfirmDowngrade] = useState<PlanId | null>(null)
  const avatarRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)

  // Editable fields
  const [prenom, setPrenom] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [bio, setBio] = useState('')

  // Email & password
  const [editingEmail, setEditingEmail] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [editingPassword, setEditingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

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
          avatar_url: null, bio: null, video_url: null, plan: null, created_at: user.created_at, is_bot: false,
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
    setUploadError(null)
    try {
      const url = await uploadFile(file, 'avatars')
      const supabase = createClient()
      const { error } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', profile.id)
      if (error) throw new Error(error.message)
      setProfile({ ...profile, avatar_url: url })
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erreur lors de l'envoi de la photo")
    }
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
    setUploadError(null)
    try {
      const url = await uploadFile(file, 'videos')
      const supabase = createClient()
      const { error } = await supabase.from('profiles').update({ video_url: url }).eq('id', profile.id)
      if (error) throw new Error(error.message)
      setProfile({ ...profile, video_url: url })
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erreur lors de l'envoi de la vidéo")
    }
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

  async function handleEmailChange() {
    if (!newEmail.trim() || emailSaving) return
    setEmailSaving(true)
    setEmailError(null)
    setEmailSuccess(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() })
      if (error) throw error
      setEmailSuccess('Un e-mail de confirmation a été envoyé à votre nouvelle adresse. Veuillez cliquer sur le lien pour valider le changement.')
      setEditingEmail(false)
      setNewEmail('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors du changement d'e-mail"
      setEmailError(message)
    }
    setEmailSaving(false)
  }

  async function handlePasswordChange() {
    if (!newPassword || !confirmPassword || passwordSaving) return
    setPasswordError(null)
    setPasswordSuccess(null)
    if (newPassword.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas.')
      return
    }
    setPasswordSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setPasswordSuccess('Mot de passe modifié avec succès.')
      setEditingPassword(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe'
      setPasswordError(message)
    }
    setPasswordSaving(false)
  }

  async function handleChangePlan(newPlan: PlanId) {
    if (!profile || upgrading) return

    const currentPlan = subscription?.plan as PlanId | undefined
    const isDowngrade = currentPlan && PLAN_ORDER[newPlan] < PLAN_ORDER[currentPlan]

    // For downgrades, ask for confirmation first
    if (isDowngrade && confirmDowngrade !== newPlan) {
      setConfirmDowngrade(newPlan)
      return
    }
    setConfirmDowngrade(null)

    // If no Stripe subscription exists, redirect to checkout
    if (!subscription?.stripe_subscription_id) {
      router.push(`/dashboard/tarifs?plan=${newPlan}`)
      return
    }
    setUpgrading(true)
    setUpgradeError(null)
    setUpgradeSuccess(null)
    try {
      const res = await fetch('/api/stripe/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: profile.id, new_plan: newPlan }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setUpgradeSuccess(data.message)
        setSubscription(prev => prev ? { ...prev, plan: newPlan } : prev)
        setProfile(prev => prev ? { ...prev, plan: newPlan } : prev)
      } else {
        // If Stripe subscription not found, redirect to checkout
        if (res.status === 400 && data.error?.includes('Aucun abonnement Stripe')) {
          router.push(`/dashboard/tarifs?plan=${newPlan}`)
          return
        }
        setUpgradeError(data.error || 'Erreur lors du changement de plan')
      }
    } catch {
      setUpgradeError('Erreur de connexion')
    }
    setUpgrading(false)
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  function getStatusLabel(status: string) {
    const map: Record<string, { label: string; color: string }> = {
      trialing: { label: t('dashboard.trial_status'), color: '#55EFC4' },
      active: { label: t('dashboard.active_status'), color: '#55EFC4' },
      inactive: { label: t('dashboard.inactive_status'), color: 'var(--text-muted)' },
      canceled: { label: t('dashboard.canceled_status'), color: '#FF6B6B' },
      past_due: { label: t('dashboard.past_due_status'), color: '#FF6B6B' },
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
        <h1 className="font-display text-3xl sm:text-4xl font-semibold" style={{ color: 'var(--text-primary)' }}>{t('dashboard.profile_title')}</h1>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>{t('dashboard.profile_subtitle')}</p>
      </div>

      {/* Photo de profil */}
      <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
        <h3 className="font-semibold text-base mb-4" style={{ color: 'var(--text-primary)' }}>{t('dashboard.profile_photo')}</h3>
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
              {uploadingAvatar ? t('dashboard.sending') : profile?.avatar_url ? t('dashboard.change_photo') : t('dashboard.add_photo')}
            </button>
            {profile?.avatar_url && (
              <button onClick={handleRemoveAvatar} className="block text-xs cursor-pointer" style={{ color: '#FF6B6B' }}>
                {t('dashboard.remove_photo')}
              </button>
            )}
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('dashboard.photo_hint')}</p>
          </div>
        </div>
        {uploadError && (
          <p className="mt-3 text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(255,107,107,0.1)', color: '#FF6B6B' }}>
            {uploadError}
          </p>
        )}
      </div>

      {/* Informations */}
      <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>{t('dashboard.information')}</h3>
          {!editing && (
            <button onClick={() => setEditing(true)} className="text-xs font-medium cursor-pointer" style={{ color: 'var(--gold)' }}>
              {t('common.edit')}
            </button>
          )}
          {saved && <span className="text-xs" style={{ color: '#55EFC4' }}>{t('dashboard.saved')}</span>}
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>{t('dashboard.firstname')}</label>
              <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                {t('dashboard.pseudo')} <span className="font-normal">({t('dashboard.pseudo_desc')})</span>
              </label>
              <input type="text" value={pseudo} onChange={(e) => setPseudo(e.target.value)}
                placeholder={t('dashboard.pseudo_placeholder')}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-muted)' }}>
                {t('dashboard.bio')} <span className="font-normal">({t('dashboard.bio_desc')})</span>
              </label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                placeholder={t('dashboard.bio_placeholder')}
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none resize-y" style={inputStyle} maxLength={500} />
              <p className="text-xs mt-1 text-right" style={{ color: 'var(--text-muted)' }}>{bio.length}/500</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving || !prenom.trim()}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
                style={{ background: 'var(--gold)', color: 'var(--dark)' }}>
                {saving ? t('dashboard.saving') : t('common.save')}
              </button>
              <button onClick={() => { setEditing(false); setPrenom(profile?.prenom || ''); setPseudo(profile?.pseudo || ''); setBio(profile?.bio || '') }}
                className="px-4 py-2 rounded-xl text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                {t('common.cancel')}
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
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold)' }}>{t('dashboard.founder')}</span>
              )}
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{profile?.email}</p>
            {profile?.bio && (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{profile.bio}</p>
            )}
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('dashboard.member_since', { date: formatDate(profile?.created_at || '') })}</p>
          </div>
        )}
      </div>

      {/* Vidéo de présentation */}
      <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
        <h3 className="font-semibold text-base mb-4" style={{ color: 'var(--text-primary)' }}>{t('dashboard.presentation_video')}</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{t('dashboard.presentation_video_desc')}</p>
        {profile?.video_url ? (
          <div className="space-y-3">
            <video src={profile.video_url} controls className="w-full max-h-64 rounded-xl bg-black" />
            <div className="flex items-center gap-3">
              <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
              <button onClick={() => videoRef.current?.click()} disabled={uploadingVideo}
                className="text-xs font-medium cursor-pointer disabled:opacity-50" style={{ color: 'var(--gold)' }}>
                {uploadingVideo ? t('dashboard.sending') : t('dashboard.change_video')}
              </button>
              <button onClick={handleRemoveVideo} className="text-xs cursor-pointer" style={{ color: '#FF6B6B' }}>
                {t('dashboard.remove_video')}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
            <button onClick={() => videoRef.current?.click()} disabled={uploadingVideo}
              className="px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)', color: 'var(--text-secondary)' }}>
              {uploadingVideo ? t('dashboard.sending_video') : t('dashboard.add_video')}
            </button>
          </div>
        )}
      </div>

      {/* Subscription */}
      <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
        <h3 className="font-semibold text-base mb-4" style={{ color: 'var(--text-primary)' }}>{t('dashboard.subscription')}</h3>
        {subscription ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('dashboard.status')}</span>
              <span className="text-sm font-medium px-3 py-1 rounded-full"
                style={{ background: `${getStatusLabel(subscription.status).color}15`, color: getStatusLabel(subscription.status).color }}>
                {getStatusLabel(subscription.status).label}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('dashboard.plan_label')}</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {subscription.plan === 'serenite' ? 'Sérénité — 49,90€/mois' : 'Essentielle — 9,90€/mois'}
                {subscription.waitlist_discount && (
                  <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37' }}>
                    -10€ fondateur
                  </span>
                )}
              </span>
            </div>
            {subscription.current_period_end && (
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('dashboard.next_renewal')}</span>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{formatDate(subscription.current_period_end)}</span>
              </div>
            )}
            {subscription.cancel_at_period_end && (
              <div className="rounded-lg p-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <p className="text-xs" style={{ color: '#ef4444' }}>
                  Votre abonnement sera annul&eacute; &agrave; la fin de la p&eacute;riode en cours.
                </p>
              </div>
            )}
            {/* Change plan (upgrade or downgrade) */}
            {(subscription.status === 'active' || subscription.status === 'trialing') && (
              <div className="rounded-xl p-4" style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.12)' }}>
                <p className="text-xs font-medium mb-3" style={{ color: '#D4AF37' }}>Changer de forfait</p>
                <div className="flex flex-col gap-2">
                  {(['essential', 'serenite'] as PlanId[])
                    .filter(p => p !== subscription.plan)
                    .map(plan => {
                      const isUpgrade = PLAN_ORDER[plan] > PLAN_ORDER[subscription.plan as PlanId]
                      const color = PLAN_COLORS[plan]
                      return (
                        <div key={plan}>
                          <button
                            onClick={() => handleChangePlan(plan)}
                            disabled={upgrading}
                            className="w-full py-2.5 rounded-lg text-xs font-medium cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            style={{ background: `${color}12`, color, border: `1px solid ${color}33` }}
                          >
                            {upgrading ? 'En cours...' : (
                              <>
                                {isUpgrade ? '↑' : '↓'} {PLAN_NAMES[plan]} — {PLAN_PRICES_EUR[plan].toFixed(2).replace('.', ',')}€/mois
                              </>
                            )}
                          </button>
                          {/* Downgrade confirmation */}
                          {confirmDowngrade === plan && (
                            <div className="mt-2 rounded-lg p-3" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                              <p className="text-xs mb-2" style={{ color: '#ef4444' }}>
                                En passant à {PLAN_NAMES[plan]}, vous perdrez l&apos;accès à certaines fonctionnalités de votre forfait actuel. Le changement prendra effet à la fin de votre période en cours.
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleChangePlan(plan)}
                                  disabled={upgrading}
                                  className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer disabled:opacity-50"
                                  style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                                >
                                  {upgrading ? 'En cours...' : 'Confirmer le changement'}
                                </button>
                                <button
                                  onClick={() => setConfirmDowngrade(null)}
                                  className="px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                                  style={{ color: 'var(--text-secondary)' }}
                                >
                                  Annuler
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>
                {upgradeSuccess && (
                  <p className="text-xs mt-2" style={{ color: '#55EFC4' }}>{upgradeSuccess}</p>
                )}
                {upgradeError && (
                  <p className="text-xs mt-2" style={{ color: '#ef4444' }}>{upgradeError}</p>
                )}
              </div>
            )}
            {/* Manage subscription button */}
            {subscription.stripe_customer_id && (
              <button
                onClick={async () => {
                  if (portalLoading) return
                  setPortalLoading(true)
                  try {
                    const res = await fetch('/api/stripe/portal', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ user_id: profile?.id }),
                    })
                    const data = await res.json()
                    if (res.ok && data.url) {
                      window.location.href = data.url
                    } else {
                      setUpgradeError(data.error || 'Impossible d\'ouvrir le portail de gestion')
                    }
                  } catch {
                    setUpgradeError('Erreur de connexion au portail')
                  }
                  setPortalLoading(false)
                }}
                disabled={portalLoading}
                className="block w-full mt-2 py-3 rounded-xl text-sm font-medium text-center transition-colors cursor-pointer disabled:opacity-50"
                style={{ background: 'rgba(212,175,55,0.08)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.15)' }}
              >
                {portalLoading ? 'Chargement...' : 'Gérer mon abonnement'}
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-xl p-5 space-y-4" style={{ background: 'rgba(85,239,196,0.04)', border: '1px solid rgba(85,239,196,0.15)' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Votre plan actuel</span>
              <span className="text-sm font-medium flex items-center gap-2" style={{ color: '#55EFC4' }}>
                <span className="w-2 h-2 rounded-full" style={{ background: '#55EFC4' }} />
                Plan Gratuit — 0€/mois
              </span>
            </div>
            <div className="text-xs space-y-1.5 pt-3" style={{ color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Inclus dans votre plan :</p>
              <p>• Communauté (mur + chat général)</p>
              <p>• Shine Audible complet</p>
            </div>
            <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                Débloquez plus de contenu avec un abonnement :
              </p>
              <div className="space-y-2">
                <a href="/dashboard/tarifs?plan=essential" className="flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer"
                  style={{ background: 'rgba(116,192,252,0.05)', border: '1px solid rgba(116,192,252,0.2)' }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#74C0FC' }}>Essentielle</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>+ Encyclopédie complète + chats par douleur</p>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#74C0FC' }}>9,90€/mois</span>
                </a>
                <a href="/dashboard/tarifs?plan=serenite" className="flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer"
                  style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)' }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#D4AF37' }}>Sérénité</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>+ Shine TV, Shorts, Librairie, lives</p>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#D4AF37' }}>49,90€/mois</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* E-mail & Sécurité */}
      <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
        <h3 className="font-semibold text-base mb-5" style={{ color: 'var(--text-primary)' }}>E-mail & Sécurité</h3>

        {/* Changement d'e-mail */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Adresse e-mail</label>
            {!editingEmail && (
              <button onClick={() => { setEditingEmail(true); setNewEmail(profile?.email || ''); setEmailSuccess(null); setEmailError(null) }}
                className="text-xs font-medium cursor-pointer" style={{ color: 'var(--gold)' }}>
                Modifier
              </button>
            )}
          </div>
          {editingEmail ? (
            <div className="space-y-3">
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                placeholder="nouvelle@adresse.com"
                className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inputStyle} />
              <div className="flex gap-2">
                <button onClick={handleEmailChange} disabled={emailSaving || !newEmail.trim()}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
                  style={{ background: 'var(--gold)', color: 'var(--dark)' }}>
                  {emailSaving ? 'Envoi...' : 'Confirmer'}
                </button>
                <button onClick={() => { setEditingEmail(false); setNewEmail(''); setEmailError(null) }}
                  className="px-4 py-2 rounded-xl text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{profile?.email}</p>
          )}
          {emailSuccess && (
            <p className="mt-2 text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(85,239,196,0.1)', color: '#55EFC4' }}>
              {emailSuccess}
            </p>
          )}
          {emailError && (
            <p className="mt-2 text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(255,107,107,0.1)', color: '#FF6B6B' }}>
              {emailError}
            </p>
          )}
        </div>

        {/* Changement de mot de passe */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Mot de passe</label>
            {!editingPassword && (
              <button onClick={() => { setEditingPassword(true); setPasswordSuccess(null); setPasswordError(null) }}
                className="text-xs font-medium cursor-pointer" style={{ color: 'var(--gold)' }}>
                Modifier
              </button>
            )}
          </div>
          {editingPassword ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>Nouveau mot de passe</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="6 caractères minimum"
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>Confirmer le mot de passe</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Retapez le mot de passe"
                  className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" style={inputStyle} />
              </div>
              <div className="flex gap-2">
                <button onClick={handlePasswordChange} disabled={passwordSaving || !newPassword || !confirmPassword}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
                  style={{ background: 'var(--gold)', color: 'var(--dark)' }}>
                  {passwordSaving ? 'Enregistrement...' : 'Changer le mot de passe'}
                </button>
                <button onClick={() => { setEditingPassword(false); setNewPassword(''); setConfirmPassword(''); setPasswordError(null) }}
                  className="px-4 py-2 rounded-xl text-sm cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>••••••••</p>
          )}
          {passwordSuccess && (
            <p className="mt-2 text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(85,239,196,0.1)', color: '#55EFC4' }}>
              {passwordSuccess}
            </p>
          )}
          {passwordError && (
            <p className="mt-2 text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(255,107,107,0.1)', color: '#FF6B6B' }}>
              {passwordError}
            </p>
          )}
        </div>
      </div>

      {/* Account */}
      <div className="rounded-2xl p-6" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
        <button onClick={handleSignOut}
          className="w-full text-left px-4 py-3 rounded-xl text-sm flex items-center gap-3 transition-colors cursor-pointer"
          style={{ color: 'var(--text-secondary)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          {t('dashboard.sign_out')}
        </button>
      </div>
    </div>
  )
}
