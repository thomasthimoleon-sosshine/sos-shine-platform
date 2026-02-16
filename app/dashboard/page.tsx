'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

export default function DashboardHome() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Bonjour')
    else if (hour < 18) setGreeting('Bon après-midi')
    else setGreeting('Bonsoir')

    const supabase = createClient()
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data as Profile)
      } else {
        setProfile({
          id: user.id,
          prenom: user.user_metadata?.prenom || 'Membre',
          email: user.email || '',
          role: 'member',
          avatar_url: null,
          created_at: user.created_at,
        })
      }
    }
    loadProfile()
  }, [])

  const quickAccess = [
    {
      href: '/dashboard/apothicaire',
      title: "L'Apothicaire",
      description: 'Explorez les soins pour le corps, les émotions et la reconstruction.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      ),
      color: '#D4A843',
      bgColor: 'rgba(212, 168, 67, 0.08)',
    },
    {
      href: '/dashboard/communaute',
      title: 'Le Feu de Camp',
      description: 'Partagez, échangez et soutenez-vous entre membres.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
        </svg>
      ),
      color: '#FF6B35',
      bgColor: 'rgba(255, 107, 53, 0.08)',
    },
    {
      href: '/dashboard/evenements',
      title: 'Événements',
      description: 'Découvrez les Shine Walks et rencontres près de chez vous.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      color: '#55EFC4',
      bgColor: 'rgba(85, 239, 196, 0.08)',
    },
  ]

  const piliers = [
    {
      title: 'Apaiser',
      subtitle: 'Le corps',
      description: 'Yoga doux, respiration, acupression',
      by: 'William',
      color: '#55EFC4',
    },
    {
      title: 'Envelopper',
      subtitle: "L'émotion",
      description: 'Audio-réconfort, soins énergétiques',
      by: 'Julia',
      color: '#A29BFE',
    },
    {
      title: 'Reconstruire',
      subtitle: "L'action",
      description: 'Méthodes concrètes, pas-à-pas',
      by: 'Thomas',
      color: '#D4A843',
    },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {greeting}, <span style={{ color: 'var(--gold)' }}>{profile?.prenom || 'Membre'}</span>
        </h1>
        <p className="mt-2 text-base" style={{ color: 'var(--text-secondary)' }}>
          Bienvenue dans votre sanctuaire. Que souhaitez-vous explorer aujourd&apos;hui ?
        </p>
      </div>

      {/* Motivation quote */}
      <div
        className="rounded-2xl p-6 sm:p-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(212, 168, 67, 0.06), rgba(212, 168, 67, 0.02))',
          border: '1px solid rgba(212, 168, 67, 0.12)',
        }}
      >
        <div className="relative z-10">
          <p className="font-display text-xl sm:text-2xl italic leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            &ldquo;Vous n&apos;êtes pas ici pour survivre. Vous êtes ici pour reprendre le pouvoir sur votre histoire.&rdquo;
          </p>
          <p className="mt-3 text-sm font-medium" style={{ color: 'var(--gold)' }}>
            — L&apos;équipe SOS Shine
          </p>
        </div>
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl"
          style={{ background: 'rgba(212, 168, 67, 0.06)' }}
        />
      </div>

      {/* Quick access cards */}
      <div>
        <h2 className="font-display text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Accès rapide
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickAccess.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: item.bgColor,
                border: `1px solid ${item.color}15`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${item.color}40`
                e.currentTarget.style.boxShadow = `0 8px 32px ${item.color}10`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${item.color}15`
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${item.color}15`, color: item.color }}
              >
                {item.icon}
              </div>
              <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* 3 Pillars reminder */}
      <div>
        <h2 className="font-display text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Les 3 piliers de votre accompagnement
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {piliers.map((pilier) => (
            <div
              key={pilier.title}
              className="rounded-2xl p-5"
              style={{
                background: 'var(--dark-card)',
                border: '1px solid var(--dark-border)',
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: pilier.color }}
                />
                <h3 className="font-semibold text-sm" style={{ color: pilier.color }}>
                  {pilier.title}
                </h3>
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                {pilier.subtitle}
              </p>
              <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                {pilier.description}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                par {pilier.by}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Help section */}
      <div
        className="rounded-2xl p-6 text-center"
        style={{
          background: 'var(--dark-card)',
          border: '1px solid var(--dark-border)',
        }}
      >
        <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
          Besoin d&apos;aide ou une question ?
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Contactez-nous à <span style={{ color: 'var(--gold)' }}>contact@sosshine.fr</span>
        </p>
      </div>
    </div>
  )
}
