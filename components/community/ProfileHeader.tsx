'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ShineIcon from '@/components/icons/ShineIcon'
import type { Profile } from '@/types/database'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  EN-TÊTE DE PROFIL — la vue « mon profil » de l'onglet Communauté
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Reprend la construction d'un profil Instagram : la photo à gauche, le nom,
 *  les trois compteurs, la bio, les actions. On arrive et on se reconnaît.
 *
 *  La bio est modifiable ici, en place, sans passer par Mon compte : c'est ici
 *  qu'on pense à l'écrire, parce que c'est ici qu'on voit ce que les autres
 *  voient. Les deux endroits écrivent dans la même colonne profiles.bio.
 */

type Stats = { posts: number; rayons: number; shines: number }

export default function ProfileHeader() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<Stats>({ posts: 0, rayons: 0, shines: 0 })
  const [loading, setLoading] = useState(true)

  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: p } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (p) { setProfile(p as Profile); setBio((p as Profile).bio || '') }

    // Publications de l'utilisateur — on récupère les identifiants, ils
    // servent aussi à compter les Shines reçus juste après.
    const { data: myPosts } = await supabase
      .from('posts')
      .select('id')
      .eq('author_id', user.id)

    const postIds = (myPosts || []).map((r: { id: string }) => r.id)

    let shines = 0
    if (postIds.length > 0) {
      const { count } = await supabase
        .from('post_likes')
        .select('*', { count: 'exact', head: true })
        .in('post_id', postIds)
      shines = count || 0
    }

    /**
     * La table des proches peut être absente selon les environnements — c'est
     * déjà arrivé en production. On affiche zéro plutôt que de faire planter
     * tout l'en-tête pour un compteur.
     */
    let rayons = 0
    try {
      const { count } = await supabase
        .from('shine_connections')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'accepted')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      rayons = count || 0
    } catch { /* table absente : on laisse zéro */ }

    setStats({ posts: postIds.length, rayons, shines })
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function saveBio() {
    if (!profile) return
    setSaving(true)
    const supabase = createClient()
    const value = bio.trim() || null
    const { error } = await supabase.from('profiles').update({ bio: value }).eq('id', profile.id)
    if (!error) {
      setProfile({ ...profile, bio: value })
      setEditing(false)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="rounded-2xl p-6 mb-6 animate-pulse"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-6">
          <div className="w-[88px] h-[88px] rounded-full bg-white/[0.05] shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-40 rounded bg-white/[0.05]" />
            <div className="h-3 w-64 rounded bg-white/[0.04]" />
          </div>
        </div>
      </div>
    )
  }

  if (!profile) return null

  const initial = (profile.prenom || 'M').charAt(0).toUpperCase()

  return (
    <div className="rounded-2xl p-6 sm:p-7 mb-6"
      style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>

      <div className="flex flex-col sm:flex-row sm:items-start gap-6">

        {/* ── Photo ── */}
        <div className="shrink-0">
          <div className="w-[88px] h-[88px] rounded-full p-[2px]"
            style={{ background: 'linear-gradient(135deg, #E3C77E, #C9A961 40%, #7E1027)' }}>
            <div className="w-full h-full rounded-full overflow-hidden bg-[var(--surface-card)] flex items-center justify-center">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="font-display text-2xl text-[#C9A961]">{initial}</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Identité, compteurs, bio ── */}
        <div className="flex-1 min-w-0">

          <div className="flex items-center gap-2.5 flex-wrap mb-4">
            <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">
              {profile.prenom}
            </h2>
            {profile.pseudo && (
              <span className="text-sm text-[var(--text-secondary)]">@{profile.pseudo}</span>
            )}
            {profile.role === 'founder' && (
              <span className="text-[10px] uppercase tracking-[0.14em] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(201,169,97,0.15)', color: '#C9A961' }}>
                Fondateur
              </span>
            )}
          </div>

          {/* ── Les trois compteurs ── */}
          <div className="flex items-center gap-7 sm:gap-9 mb-4">
            {([
              { n: stats.posts, l: stats.posts > 1 ? 'publications' : 'publication' },
              { n: stats.rayons, l: stats.rayons > 1 ? 'proches' : 'proche' },
              { n: stats.shines, l: stats.shines > 1 ? 'Shines reçus' : 'Shine reçu' },
            ]).map(s => (
              <div key={s.l}>
                <p className="font-semibold text-[17px] tabular-nums text-[var(--text-primary)]">{s.n}</p>
                <p className="text-[11.5px] text-[var(--text-muted)]">{s.l}</p>
              </div>
            ))}
          </div>

          {/* ── Bio ── */}
          {editing ? (
            <div className="space-y-2">
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                maxLength={500}
                autoFocus
                placeholder="Quelques mots sur vous — ce que vous traversez, ce que vous cherchez, ce que vous offrez."
                className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-y"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={saveBio}
                  disabled={saving}
                  className="px-4 py-2 rounded-full text-[13px] font-semibold cursor-pointer disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#E3C77E,#C9A961)', color: '#0A0806' }}
                >
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button
                  onClick={() => { setEditing(false); setBio(profile.bio || '') }}
                  className="px-4 py-2 rounded-full text-[13px] cursor-pointer text-[var(--text-secondary)]"
                >
                  Annuler
                </button>
                <span className="ml-auto text-[11px] text-[var(--text-muted)]">{bio.length}/500</span>
              </div>
            </div>
          ) : (
            <>
              {profile.bio ? (
                <p className="text-[13.5px] leading-relaxed whitespace-pre-line mb-4 text-[var(--text-secondary)]">
                  {profile.bio}
                </p>
              ) : (
                <p className="text-[13.5px] leading-relaxed mb-4 text-[var(--text-muted)] italic">
                  Vous n&apos;avez pas encore de bio. C&apos;est la première chose que les autres
                  membres lisent de vous.
                </p>
              )}

              <div className="flex items-center gap-2.5 flex-wrap">
                <button
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium cursor-pointer transition-colors hover:bg-white/[0.07]"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                >
                  <ShineIcon name="parole" className="w-4 h-4" />
                  {profile.bio ? 'Modifier ma bio' : 'Écrire ma bio'}
                </button>

                <Link
                  href="/dashboard/profil"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium transition-colors hover:bg-white/[0.07]"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  Mon compte
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
