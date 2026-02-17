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
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data as Profile)
      } else {
        setProfile({
          id: user.id, prenom: user.user_metadata?.prenom || 'Membre',
          email: user.email || '', role: 'member', avatar_url: null, plan: null, created_at: user.created_at,
        })
      }
    }
    loadProfile()
  }, [])

  const quickAccess = [
    {
      href: '/dashboard/encyclopedie', title: 'Encyclopédie',
      description: 'Explorez toutes les douleurs classées de A à Z. Chacune avec son protocole en 4 étapes.',
      icon: '📘', color: '#D4AF37', bgColor: 'rgba(212,175,55,0.08)',
    },
    {
      href: '/dashboard/chat', title: 'Chat Général',
      description: 'Échangez librement avec tous les membres de la communauté.',
      icon: '💬', color: '#55EFC4', bgColor: 'rgba(85,239,196,0.08)',
    },
    {
      href: '/dashboard/mur', title: 'Mur Communautaire',
      description: 'Annonces, nouvelles douleurs, événements et publications.',
      icon: '📋', color: '#74C0FC', bgColor: 'rgba(116,192,252,0.08)',
    },
    {
      href: '/dashboard/evenements', title: 'Événements',
      description: 'Soins collectifs, ateliers, lives et Shine Walks.',
      icon: '📅', color: '#E17055', bgColor: 'rgba(225,112,85,0.08)',
    },
  ]

  const steps = [
    { num: '01', title: 'Comprendre', desc: 'Vidéo de coaching immersive', color: '#55EFC4' },
    { num: '02', title: 'Libération', desc: 'Soin énergétique', color: '#74C0FC' },
    { num: '03', title: 'Méditation', desc: 'Intégration & reconnexion', color: '#E17055' },
    { num: '04', title: 'Action', desc: 'Exercices & reprogrammation', color: '#D4AF37' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {greeting}, <span style={{ color: 'var(--gold)' }}>{profile?.prenom || 'Membre'}</span>
        </h1>
        <p className="mt-2 text-base" style={{ color: 'var(--text-secondary)' }}>
          Bienvenue dans votre espace. Que souhaitez-vous explorer aujourd&apos;hui ?
        </p>
      </div>

      {/* Quote */}
      <div className="rounded-2xl p-6 sm:p-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.06), rgba(212,175,55,0.02))', border: '1px solid rgba(212,175,55,0.12)' }}>
        <p className="font-display text-xl sm:text-2xl italic leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          &ldquo;On ne change pas votre identité. On éteint la douleur pour libérer votre potentiel.&rdquo;
        </p>
        <p className="mt-3 text-sm font-medium" style={{ color: 'var(--gold)' }}>— L&apos;équipe SOS Shine</p>
      </div>

      {/* Quick access */}
      <div>
        <h2 className="font-display text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Accès rapide</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickAccess.map((item) => (
            <Link key={item.href} href={item.href}
              className="group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
              style={{ background: item.bgColor, border: `1px solid ${item.color}15` }}>
              <span className="text-2xl mb-3 block">{item.icon}</span>
              <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* 4 Steps */}
      <div>
        <h2 className="font-display text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Les 4 étapes de chaque douleur</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {steps.map((s) => (
            <div key={s.num} className="rounded-xl p-4 text-center" style={{ background: `${s.color}08`, border: `1px solid ${s.color}15` }}>
              <span className="font-display text-sm block mb-1" style={{ color: s.color, opacity: 0.6 }}>Étape {s.num}</span>
              <h3 className="font-semibold text-sm" style={{ color: s.color }}>{s.title}</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Help */}
      <div className="rounded-xl p-5 text-center" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Besoin d&apos;aide ? <span style={{ color: 'var(--gold)' }}>contact@sosshine.fr</span>
        </p>
      </div>
    </div>
  )
}
