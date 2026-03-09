'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { getRandomQuote, type Quote } from '@/lib/quotes'
import AudioPlayer from '@/components/AudioPlayer'

const ease = [0.25, 0.46, 0.45, 0.94] as const

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: ease as unknown as [number, number, number, number] },
  }),
}

function ParcoursWidget({ siteSettings }: { siteSettings: Record<string, string> }) {
  const { t } = useTranslation()
  const [goalsCount, setGoalsCount] = useState(0)
  const [journalCount, setJournalCount] = useState(0)

  useEffect(() => {
    try {
      const goals = JSON.parse(localStorage.getItem('sos-shine-goals') || '[]')
      setGoalsCount(goals.filter((g: { status: string }) => g.status === 'active').length)
    } catch { /* empty */ }
    try {
      const journal = JSON.parse(localStorage.getItem('sos-shine-journal') || '[]')
      const now = new Date()
      const thisMonth = journal.filter((e: { created_at: string }) => {
        const d = new Date(e.created_at)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      setJournalCount(thisMonth.length)
    } catch { /* empty */ }
  }, [])

  return (
    <div>
      <h2 className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
        {siteSettings.dash_journey_title || t('dashboard.my_journey')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href="/dashboard/objectifs"
          className="glass glass-hover p-5 group flex items-center gap-4 transition-all duration-300"
          style={{ borderColor: 'rgba(212, 175, 55, 0.08)' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
            style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--gold)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>
              {goalsCount} {siteSettings.dash_goals_count_label || t('dashboard.goals_active')}
            </p>
            <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{siteSettings.dash_goals_label || t('nav.goals')}</p>
          </div>
        </Link>
        <Link
          href="/dashboard/journal"
          className="glass glass-hover p-5 group flex items-center gap-4 transition-all duration-300"
          style={{ borderColor: 'rgba(212, 175, 55, 0.08)' }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
            style={{ background: 'rgba(116, 192, 252, 0.1)', color: '#74C0FC' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-[15px]" style={{ color: 'var(--text-primary)' }}>
              {journalCount} {siteSettings.dash_journal_count_label || t('dashboard.journal_entries')}
            </p>
            <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{siteSettings.dash_journal_label || t('nav.journal')}</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

function PendingRayonsWidget() {
  const [pending, setPending] = useState<Array<{ id: string; sender_id: string; created_at: string }>>([])
  const [profiles, setProfiles] = useState<Record<string, { id: string; prenom: string; pseudo: string | null; avatar_url: string | null }>>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/rayons')
        if (res.ok) {
          const data = await res.json()
          setPending(data.pendingReceived || [])
          setProfiles(data.profiles || {})
        }
      } catch { /* empty */ }
    }
    load()
  }, [])

  async function handleAction(connectionId: string, action: 'accept' | 'decline') {
    setActionLoading(connectionId)
    const res = await fetch('/api/rayons', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connection_id: connectionId, action }),
    })
    if (res.ok) {
      setPending(prev => prev.filter(p => p.id !== connectionId))
    }
    setActionLoading(null)
  }

  if (pending.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <h2 className="text-[11px] font-semibold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
        Rayons en attente
        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold animate-pulse"
          style={{ background: '#EF4444', color: '#fff' }}>
          {pending.length}
        </span>
      </h2>
      <div className="space-y-2">
        {pending.map(req => {
          const p = profiles[req.sender_id]
          if (!p) return null
          const displayName = p.pseudo || p.prenom
          return (
            <div key={req.id} className="glass glass-hover p-4 flex items-center gap-3"
              style={{ borderColor: 'rgba(212,175,55,0.15)' }}>
              <Link href={`/dashboard/membre/${p.id}`} className="shrink-0">
                {p.avatar_url ? (
                  <img src={p.avatar_url} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-display font-semibold"
                    style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--gold)' }}>
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                  <Link href={`/dashboard/membre/${p.id}`} className="hover:underline">{displayName}</Link>
                  {' '}<span style={{ color: 'var(--text-muted)' }}>veut rayonner avec vous</span>
                </p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {new Date(req.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleAction(req.id, 'accept')}
                  disabled={actionLoading === req.id}
                  className="px-4 py-2 rounded-xl text-[13px] font-semibold cursor-pointer"
                  style={{ background: 'var(--gold)', color: 'var(--dark)' }}
                >
                  {actionLoading === req.id ? '...' : 'Accepter'}
                </button>
                <button
                  onClick={() => handleAction(req.id, 'decline')}
                  disabled={actionLoading === req.id}
                  className="px-3 py-2 rounded-xl text-[13px] cursor-pointer"
                  style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--dark-border)' }}
                >
                  Décliner
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

const ECLAT_CATEGORIES: Record<string, { label: string; icon: string; color: string }> = {
  temoignage: { label: 'Pensée', icon: '💭', color: '#D4AF37' },
  partage: { label: 'Partage', icon: '💫', color: '#74C0FC' },
  gratitude: { label: 'Gratitude', icon: '✨', color: '#FFEAA7' },
  citation: { label: 'Citation', icon: '💬', color: '#FD79A8' },
  remerciements: { label: 'Moment de joie', icon: '🌟', color: '#55EFC4' },
  question: { label: 'Réflexion', icon: '🔮', color: '#A29BFE' },
}

type FeedPost = {
  id: string
  author_id: string
  title: string
  content: string
  image_url: string | null
  video_url: string | null
  audio_url: string | null
  category: string
  created_at: string
  likes_count: number
  comments_count: number
  user_has_liked: boolean
}

type FeedProfile = {
  id: string
  prenom: string
  pseudo: string | null
  avatar_url: string | null
  role: string
}

function FeedWidget() {
  const { t } = useTranslation()
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [profiles, setProfiles] = useState<Record<string, FeedProfile>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFeed() {
      try {
        const res = await fetch('/api/feed')
        if (res.ok) {
          const data = await res.json()
          setPosts(data.posts)
          setProfiles(data.profiles)
        }
      } catch { /* empty */ }
      setLoading(false)
    }
    loadFeed()
  }, [])

  if (loading) {
    return (
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
          Fil d&apos;actualité de mes Rayons
        </h2>
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
          Fil d&apos;actualité de mes Rayons
        </h2>
        <div className="glass p-8 text-center">
          <div className="text-3xl mb-3">&#9728;</div>
          <h3 className="font-semibold text-[15px] mb-2" style={{ color: 'var(--text-primary)' }}>
            Votre fil d&apos;actualité est vide
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Envoyez des Rayons aux membres pour voir leurs publications ici.
          </p>
          <Link
            href="/dashboard/mur"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--gold)', color: 'var(--dark)' }}
          >
            {t('encyclopedia.explore')} la communauté
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Fil d&apos;actualité de mes Rayons
        </h2>
        <Link href="/dashboard/mes-rayons" className="text-[12px] font-medium" style={{ color: 'var(--gold)' }}>
          {t('rayons.tab_connections')} →
        </Link>
      </div>
      <div className="space-y-4">
        {posts.slice(0, 5).map(post => {
          const author = profiles[post.author_id]
          if (!author) return null
          const displayName = author.pseudo || author.prenom
          const cat = ECLAT_CATEGORIES[post.category] || ECLAT_CATEGORIES.partage

          return (
            <div key={post.id} className="glass glass-hover p-5 transition-all duration-300">
              {/* Author header */}
              <div className="flex items-center gap-3 mb-3">
                <Link href={`/dashboard/membre/${author.id}`} className="shrink-0">
                  {author.avatar_url ? (
                    <img src={author.avatar_url} alt={displayName} className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10" />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-display font-semibold"
                      style={{ background: 'rgba(212,175,55,0.12)', color: 'var(--gold)' }}>
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/dashboard/membre/${author.id}`} className="font-semibold text-[14px] hover:underline" style={{ color: 'var(--text-primary)' }}>
                    {displayName}
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {new Date(post.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${cat.color}15`, color: cat.color }}>
                      {cat.icon} {cat.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              {post.title && post.title !== cat.label && (
                <h4 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{post.title}</h4>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-line"
                style={{
                  color: post.category === 'citation' ? 'var(--gold)' : 'var(--text-secondary)',
                  fontStyle: post.category === 'citation' ? 'italic' : 'normal',
                }}>
                {post.content.length > 300 ? post.content.slice(0, 300) + '...' : post.content}
              </p>

              {/* Media */}
              {post.image_url && (
                <div className="mt-3 rounded-lg overflow-hidden">
                  <img src={post.image_url} alt="" className="w-full max-h-64 object-cover" />
                </div>
              )}
              {post.video_url && (
                <div className="mt-3 rounded-lg overflow-hidden">
                  <video src={post.video_url} controls className="w-full max-h-64" />
                </div>
              )}
              {post.audio_url && (
                <div className="mt-3">
                  <AudioPlayer src={post.audio_url} />
                </div>
              )}

              {/* Footer stats */}
              <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: '1px solid var(--dark-border)' }}>
                <span className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                  <svg className="w-4 h-4" fill={post.user_has_liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                    style={{ color: post.user_has_liked ? '#EF4444' : 'var(--text-muted)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                  {post.likes_count}
                </span>
                <span className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                  </svg>
                  {post.comments_count}
                </span>
                <Link href={`/dashboard/membre/${author.id}`} className="ml-auto text-[12px] font-medium" style={{ color: 'var(--gold)' }}>
                  Voir le profil →
                </Link>
              </div>
            </div>
          )
        })}

        {posts.length > 5 && (
          <div className="text-center">
            <Link href="/dashboard/mes-rayons" className="text-sm font-medium" style={{ color: 'var(--gold)' }}>
              Voir tous les posts de mes Rayons →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardHome() {
  const { t } = useTranslation()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [greeting, setGreeting] = useState('')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({})

  useEffect(() => {
    setQuote(getRandomQuote())
    const hour = new Date().getHours()
    if (hour < 5) setGreeting('dashboard.night')
    else if (hour < 12) setGreeting('dashboard.morning')
    else if (hour < 18) setGreeting('dashboard.afternoon')
    else setGreeting('dashboard.evening')

    const supabase = createClient()
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data as Profile)
      } else {
        setProfile({
          id: user.id, prenom: user.user_metadata?.prenom || 'Membre',
          email: user.email || '', role: 'member', avatar_url: null, plan: null, created_at: user.created_at,
          pseudo: null, bio: null, video_url: null, is_bot: false,
        })
      }
    }
    async function loadSettings() {
      try {
        const { data } = await supabase.from('site_settings').select('key, value')
        if (data) {
          const map: Record<string, string> = {}
          data.forEach((row: { key: string; value: string }) => { map[row.key] = row.value })
          setSiteSettings(map)
        }
      } catch {}
    }
    loadProfile()
    loadSettings()
  }, [])

  const quickAccess = [
    {
      href: '/dashboard/encyclopedie',
      title: siteSettings.dash_quick1_title || t('nav.encyclopedia'),
      description: siteSettings.dash_quick1_desc || t('quick.encyclopedia_desc'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      ),
      accent: '#D4AF37',
      span: 'sm:col-span-2',
    },
    {
      href: '/dashboard/chat',
      title: siteSettings.dash_quick2_title || t('nav.chat'),
      description: siteSettings.dash_quick2_desc || t('quick.chat_desc'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      ),
      accent: '#55EFC4',
      span: '',
    },
    {
      href: '/dashboard/mur',
      title: siteSettings.dash_quick3_title || t('nav.wall'),
      description: siteSettings.dash_quick3_desc || t('quick.wall_desc'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
        </svg>
      ),
      accent: '#74C0FC',
      span: '',
    },
    {
      href: '/dashboard/evenements',
      title: siteSettings.dash_quick4_title || t('nav.events'),
      description: siteSettings.dash_quick4_desc || t('quick.events_desc'),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      accent: '#E17055',
      span: 'sm:col-span-2',
    },
  ]

  const steps = [
    { num: '01', title: siteSettings.step1_title || t('steps.understand'), desc: siteSettings.step1_desc || t('steps.understand_desc'), accent: siteSettings.step1_color || '#55EFC4' },
    { num: '02', title: siteSettings.step2_title || t('steps.release'), desc: siteSettings.step2_desc || t('steps.release_desc'), accent: siteSettings.step2_color || '#74C0FC' },
    { num: '03', title: siteSettings.step3_title || t('steps.meditation'), desc: siteSettings.step3_desc || t('steps.meditation_desc'), accent: siteSettings.step3_color || '#E17055' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* ── Hero greeting ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <p className="text-[13px] font-medium tracking-wide uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
          {greeting === 'dashboard.night' ? (siteSettings.dash_greeting_night || 'Insomnie ? Qu\'est-ce qui te tracasse')
            : greeting === 'dashboard.morning' ? (siteSettings.dash_greeting_morning || t('dashboard.morning'))
            : greeting === 'dashboard.afternoon' ? (siteSettings.dash_greeting_afternoon || t('dashboard.afternoon'))
            : (siteSettings.dash_greeting_evening || t('dashboard.evening'))}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {siteSettings.dash_welcome || t('dashboard.welcome')} <span style={{ color: 'var(--gold)' }}>{profile?.prenom || 'Membre'}</span>
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {siteSettings.dash_subtitle || t('dashboard.explore')}
        </p>
      </motion.div>

      {/* ── Citation — glass card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="glass glass-hover relative overflow-hidden p-6 sm:p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05), rgba(255, 255, 255, 0.02))',
          borderColor: 'rgba(212, 175, 55, 0.1)',
        }}
      >
        {/* Subtle gold ambient */}
        <div
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08), transparent 70%)' }}
        />
        <p className="font-display text-xl sm:text-2xl italic leading-relaxed relative" style={{ color: 'var(--text-primary)' }}>
          &ldquo;{siteSettings.dash_custom_quote || (quote ? quote.text.fr : t('quote.text'))}&rdquo;
        </p>
        <p className="mt-4 text-[13px] font-medium relative" style={{ color: 'var(--gold)' }}>
          — {siteSettings.dash_custom_quote_author || (quote ? quote.author.fr : t('quote.author'))}
        </p>
      </motion.div>

      {/* ── Bento Grid — Accès rapide ── */}
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
          {siteSettings.dash_quick_title || t('dashboard.quick_access')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {quickAccess.map((item, i) => (
            <motion.div
              key={item.href}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className={item.span}
            >
              <Link
                href={item.href}
                className="glass glass-hover group block h-full p-5 sm:p-6 transition-all duration-300"
                style={{ borderColor: `${item.accent}10` }}
              >
                {/* Icon pill */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${item.accent}12`, color: item.accent }}
                >
                  {item.icon}
                </div>
                <h3 className="font-semibold text-[15px] mb-1 transition-colors duration-200" style={{ color: 'var(--text-primary)' }}>
                  {item.title}
                </h3>
                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {item.description}
                </p>
                {/* Arrow indicator */}
                <div
                  className="mt-4 flex items-center gap-1.5 text-[12px] font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-0 group-hover:translate-x-1"
                  style={{ color: item.accent }}
                >
                  {siteSettings.dash_explore_label || t('encyclopedia.explore')}
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Hero image (optional) ── */}
      {siteSettings.dash_hero_image && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="glass overflow-hidden rounded-2xl"
        >
          <img src={siteSettings.dash_hero_image} alt="" className="w-full h-48 sm:h-64 object-cover" />
        </motion.div>
      )}

      {/* ── Demandes de Rayons en attente ── */}
      <PendingRayonsWidget />

      {/* ── Fil d'actualité de mes Rayons ── */}
      <FeedWidget />

      {/* ── Mon parcours — summary ── */}
      <ParcoursWidget siteSettings={siteSettings} />

      {/* ── 3 Étapes — Bento row ── */}
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
          {siteSettings.steps_label || t('dashboard.protocol')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              custom={i + 4}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="glass glass-hover p-5 text-center group"
            >
              {/* Step number */}
              <span
                className="font-display text-2xl sm:text-3xl font-semibold block mb-2 transition-transform duration-300 group-hover:scale-110"
                style={{ color: s.accent, opacity: 0.25 }}
              >
                {s.num}
              </span>
              <h3 className="font-semibold text-[14px] mb-1" style={{ color: s.accent }}>
                {s.title}
              </h3>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Help footer ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="glass p-5 text-center"
      >
        <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
          {siteSettings.dash_help_text || t('dashboard.help')}{' '}
          <a href={`mailto:${siteSettings.dash_help_email || 'julialaureau@sosshine.com'}`} className="gold-underline font-medium" style={{ color: 'var(--gold)' }}>
            {siteSettings.dash_help_email || 'julialaureau@sosshine.com'}
          </a>
        </p>
      </motion.div>
    </div>
  )
}
