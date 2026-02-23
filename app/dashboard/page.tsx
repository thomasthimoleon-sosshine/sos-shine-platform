'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { getRandomQuote, type Quote } from '@/lib/quotes'

const ease = [0.25, 0.46, 0.45, 0.94] as const

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: ease as unknown as [number, number, number, number] },
  }),
}

function ParcoursWidget() {
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
        {t('dashboard.my_journey')}
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
              {goalsCount} {t('dashboard.goals_active')}
            </p>
            <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{t('nav.goals')}</p>
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
              {journalCount} {t('dashboard.journal_entries')}
            </p>
            <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{t('nav.journal')}</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default function DashboardHome() {
  const { t, locale } = useTranslation()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [greeting, setGreeting] = useState('')
  const [quote, setQuote] = useState<Quote | null>(null)

  useEffect(() => {
    setQuote(getRandomQuote())
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('dashboard.morning')
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
    loadProfile()
  }, [])

  const quickAccess = [
    {
      href: '/dashboard/encyclopedie',
      title: t('nav.encyclopedia'),
      description: t('quick.encyclopedia_desc'),
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
      title: t('nav.chat'),
      description: t('quick.chat_desc'),
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
      title: t('nav.wall'),
      description: t('quick.wall_desc'),
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
      title: t('nav.events'),
      description: t('quick.events_desc'),
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
    { num: '01', title: t('steps.understand'), desc: t('steps.understand_desc'), accent: '#55EFC4' },
    { num: '02', title: t('steps.release'), desc: t('steps.release_desc'), accent: '#74C0FC' },
    { num: '03', title: t('steps.meditation'), desc: t('steps.meditation_desc'), accent: '#E17055' },
    { num: '04', title: t('steps.action'), desc: t('steps.action_desc'), accent: '#D4AF37' },
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
          {t(greeting)}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {t('dashboard.welcome')} <span style={{ color: 'var(--gold)' }}>{profile?.prenom || 'Membre'}</span>
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {t('dashboard.explore')}
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
          &ldquo;{quote ? quote.text[locale as keyof typeof quote.text] || quote.text.fr : t('quote.text')}&rdquo;
        </p>
        <p className="mt-4 text-[13px] font-medium relative" style={{ color: 'var(--gold)' }}>
          — {quote ? quote.author[locale as keyof typeof quote.author] || quote.author.fr : t('quote.author')}
        </p>
      </motion.div>

      {/* ── Bento Grid — Accès rapide ── */}
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
          {t('dashboard.quick_access')}
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
                  {t('encyclopedia.explore')}
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Mon parcours — summary ── */}
      <ParcoursWidget />

      {/* ── 4 Étapes — Bento row ── */}
      <div>
        <h2 className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
          {t('dashboard.protocol')}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
          {t('dashboard.help')}{' '}
          <a href="mailto:contact@sosshine.fr" className="gold-underline font-medium" style={{ color: 'var(--gold)' }}>
            contact@sosshine.fr
          </a>
        </p>
      </motion.div>
    </div>
  )
}
