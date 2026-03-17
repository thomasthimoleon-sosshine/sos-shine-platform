'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { getNextRotatingQuote, type Quote } from '@/lib/quotes'
import { greetingsData, GREETINGS_PER_SLOT, type TimeSlot } from '@/data/greetingsData'
import { getDailyForecast, resolveZodiacSign, ZODIAC_INFO, type ZodiacSign } from '@/data/energyWeather'
import AudioPlayer from '@/components/AudioPlayer'
import XPBadge from '@/components/XPBadge'

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

function VedettesWidget() {
  const [tvVideos, setTvVideos] = useState<Array<{ id: string; title: string; thumbnail_url: string | null; category: string; duration_minutes: number | null }>>([])
  const [shortsVedettes, setShortsVedettes] = useState<Array<{ id: string; title: string; thumbnail_url: string | null; category: string }>>([])
  const [audios, setAudios] = useState<Array<{ id: string; title: string; cover_url: string | null; narrator: string | null; category: string }>>([])
  const [books, setBooks] = useState<Array<{ id: string; title: string; cover_url: string | null; author: string | null; category: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadVedettes() {
      const supabase = createClient()
      const [tvRes, shortsRes, audioRes, bookRes] = await Promise.all([
        supabase.from('shine_tv_videos').select('id, title, thumbnail_url, category, duration_minutes').eq('is_published', true).order('created_at', { ascending: false }).limit(4),
        supabase.from('shine_shorts').select('id, title, thumbnail_url, category').eq('is_published', true).order('created_at', { ascending: false }).limit(4),
        supabase.from('shine_audible_tracks').select('id, title, cover_url, narrator, category').eq('is_published', true).order('created_at', { ascending: false }).limit(4),
        supabase.from('shine_library_books').select('id, title, cover_url, author, category').eq('is_published', true).order('created_at', { ascending: false }).limit(4),
      ])
      setTvVideos(tvRes.data || [])
      setShortsVedettes(shortsRes.data || [])
      setAudios(audioRes.data || [])
      setBooks(bookRes.data || [])
      setLoading(false)
    }
    loadVedettes()
  }, [])

  const sections = [
    {
      title: 'Shine TV',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-2.625 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
        </svg>
      ),
      accent: '#E17055',
      href: '/dashboard/shine-tv',
      items: tvVideos.map(v => ({
        id: v.id,
        title: v.title,
        image: v.thumbnail_url,
        subtitle: v.category,
      })),
    },
    {
      title: 'Shine Shorts',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
        </svg>
      ),
      accent: '#A29BFE',
      href: '/dashboard/shine-shorts',
      items: shortsVedettes.map(s => ({
        id: s.id,
        title: s.title,
        image: s.thumbnail_url,
        subtitle: s.category,
      })),
    },
    {
      title: 'Shine Audible',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
        </svg>
      ),
      accent: '#74C0FC',
      href: '/dashboard/shine-audible',
      items: audios.map(a => ({
        id: a.id,
        title: a.title,
        image: a.cover_url,
        subtitle: a.narrator || a.category,
      })),
    },
    {
      title: 'Shine Librairie',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      ),
      accent: '#55EFC4',
      href: '/dashboard/shine-librairie',
      items: books.map(b => ({
        id: b.id,
        title: b.title,
        image: b.cover_url,
        subtitle: b.author || 'SOS Shine',
      })),
    },
  ]

  if (loading) {
    return (
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
          Vedettes du moment
        </h2>
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-[11px] font-semibold uppercase tracking-widest mb-6" style={{ color: 'var(--text-muted)' }}>
        Vedettes du moment
      </h2>
      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${section.accent}15`, color: section.accent }}
                >
                  {section.icon}
                </div>
                <h3 className="font-display font-semibold text-[16px]" style={{ color: section.accent }}>
                  {section.title}
                </h3>
              </div>
              <Link
                href={section.href}
                className="text-[12px] font-medium flex items-center gap-1 transition-colors hover:opacity-80"
                style={{ color: section.accent }}
              >
                Voir tout
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>

            {section.items.length === 0 ? (
              <div className="glass p-6 text-center">
                <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Aucun contenu pour le moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {section.items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                  >
                    <Link
                      href={section.href}
                      className="glass glass-hover group block overflow-hidden transition-all duration-300"
                      style={{ borderColor: `${section.accent}10` }}
                    >
                      {/* Thumbnail / Cover */}
                      <div className="relative aspect-[3/4] overflow-hidden bg-black/20">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ background: `${section.accent}08` }}>
                            <div style={{ color: section.accent, opacity: 0.3 }}>{section.icon}</div>
                          </div>
                        )}
                        {/* Hover overlay */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                          style={{ background: `${section.accent}20` }}>
                          <div className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md"
                            style={{ background: 'rgba(0,0,0,0.5)' }}>
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: '#fff' }}>
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      {/* Info */}
                      <div className="p-3">
                        <h4 className="font-semibold text-[13px] leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
                          {item.title}
                        </h4>
                        <p className="text-[11px] mt-1 truncate" style={{ color: 'var(--text-muted)' }}>
                          {item.subtitle}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ))}
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
                  style={{ color: 'var(--text-muted)', background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}
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

function EnergyWeatherWidget({ profile }: { profile: Profile | null }) {
  const sign = profile ? resolveZodiacSign(profile.prenom, (profile as Profile & { zodiac_sign?: string | null }).zodiac_sign) : null
  if (!sign) return null

  const forecast = getDailyForecast(sign)
  const info = ZODIAC_INFO[sign]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="glass relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${forecast.color}08, var(--dark-card))`,
        borderColor: `${forecast.color}20`,
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute -top-16 -left-16 w-48 h-48 rounded-full opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${forecast.color}30, transparent 70%)` }}
      />
      <div className="p-5 sm:p-6 relative">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">{info.symbol}</span>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Météo Énergétique du jour
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Left: sign + energy level */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: `${forecast.color}15` }}
            >
              {forecast.element}
            </div>
            <div>
              <p className="font-display text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {info.label}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className="inline-block w-2 h-2 rounded-full animate-pulse"
                  style={{ background: forecast.color }}
                />
                <span className="text-[13px] font-medium" style={{ color: forecast.color }}>
                  Énergie {forecast.energy}
                </span>
              </div>
            </div>
          </div>

          {/* Right: details */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Ambiance</span>
              <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{forecast.mood}</span>
            </div>
            <p className="text-[14px] leading-relaxed italic" style={{ color: 'var(--text-secondary)' }}>
              &ldquo;{forecast.advice}&rdquo;
            </p>
            <div className="flex items-center gap-4 pt-1">
              <span className="text-[11px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Heure favorable : <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{forecast.luckyHour}</span>
              </span>
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {info.dates}
              </span>
            </div>
          </div>
        </div>
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
                    style={{ color: post.user_has_liked ? '#D4AF37' : 'var(--text-muted)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
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

function getTimeSlot(): TimeSlot {
  const hour = new Date().getHours()
  if (hour < 5) return 'night'
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

export default function DashboardHome() {
  const { t } = useTranslation()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [greeting, setGreeting] = useState('')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({})

  useEffect(() => {
    setQuote(getNextRotatingQuote())

    const supabase = createClient()
    const currentSlot = getTimeSlot()

    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data as Profile)

        // Rotating greeting logic
        const progress = (data as Profile).greetings_progress || { night: 0, morning: 0, afternoon: 0, evening: 0 }
        const currentIndex = progress[currentSlot] ?? 0
        const message = greetingsData[currentSlot][currentIndex % GREETINGS_PER_SLOT]
        setGreeting(message)

        // Increment index for next visit (async, non-blocking)
        const nextIndex = (currentIndex + 1) % GREETINGS_PER_SLOT
        const updatedProgress = { ...progress, [currentSlot]: nextIndex }
        supabase.from('profiles').update({ greetings_progress: updatedProgress }).eq('id', user.id).then()
      } else {
        setProfile({
          id: user.id, prenom: user.user_metadata?.prenom || 'Membre',
          email: user.email || '', role: 'member', avatar_url: null, plan: null, created_at: user.created_at,
          pseudo: null, bio: null, video_url: null, is_bot: false,
        })
        // First visit: show first greeting for current slot
        setGreeting(greetingsData[currentSlot][0])
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
        <p className="text-[13px] font-medium tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
          {greeting}
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {siteSettings.dash_welcome || t('dashboard.welcome')} <span style={{ color: 'var(--gold)' }}>{profile?.prenom || 'Membre'}</span>
          </h1>
          <XPBadge size="sm" />
        </div>
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
          background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05), var(--dark-card))',
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

      {/* ── Météo Énergétique ── */}
      <EnergyWeatherWidget profile={profile} />

      {/* ── Vedettes du moment ── */}
      <VedettesWidget />

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
