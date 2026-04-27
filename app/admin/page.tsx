'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Stats {
  totalMembers: number
  newThisMonth: number
  totalDouleurs: number
  totalEvents: number
  totalMessages: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalMembers: 0, newThisMonth: 0, totalDouleurs: 0, totalEvents: 0, totalMessages: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const now = new Date()
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const [members, newMembers, douleurs, events, messages] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', firstOfMonth),
        supabase.from('douleurs').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
      ])

      setStats({
        totalMembers: members.count || 0,
        newThisMonth: newMembers.count || 0,
        totalDouleurs: douleurs.count || 0,
        totalEvents: events.count || 0,
        totalMessages: messages.count || 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  const cards = [
    { label: 'Membres total', value: stats.totalMembers, color: '#C9A961', icon: '👥' },
    { label: 'Nouveaux ce mois', value: stats.newThisMonth, color: '#55EFC4', icon: '📈' },
    { label: 'Challenges publiés', value: stats.totalDouleurs, color: '#74C0FC', icon: '📘' },
    { label: 'Événements', value: stats.totalEvents, color: '#E17055', icon: '📅' },
    { label: 'Messages chat', value: stats.totalMessages, color: '#FF6B35', icon: '💬' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Dashboard Admin
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
          Vue d&apos;ensemble de la plateforme SOS Shine.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#74C0FC] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {cards.map((card) => (
              <div key={card.label} className="rounded-xl p-5"
                style={{ background: `${card.color}08`, border: `1px solid ${card.color}20` }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl">{card.icon}</span>
                </div>
                <p className="font-display text-3xl font-semibold mb-1" style={{ color: card.color }}>
                  {card.value}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="font-semibold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Actions rapides</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { href: '/admin/douleurs', label: 'Créer un challenge émotionnel', desc: 'Ajouter une nouvelle page à l\'encyclopédie', icon: '📘', color: '#74C0FC' },
                { href: '/admin/evenements', label: 'Créer un événement', desc: 'Planifier un soin collectif ou une Shine Walk', icon: '📅', color: '#55EFC4' },
                { href: '/admin/publications', label: 'Publier sur le mur', desc: 'Annoncer une nouvelle à la communauté', icon: '📢', color: '#C9A961' },
              ].map((action) => (
                <a key={action.href} href={action.href}
                  className="rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5 block"
                  style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
                  <span className="text-2xl mb-3 block">{action.icon}</span>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: action.color }}>{action.label}</h3>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{action.desc}</p>
                </a>
              ))}
            </div>
          </div>

          {/* Revenue placeholder */}
          <div className="rounded-xl p-6" style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}>
            <h2 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>Chiffre d&apos;affaires</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Les données Stripe seront disponibles une fois l&apos;intégration paiement activée.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="rounded-lg p-4" style={{ background: 'rgba(201,169,97,0.05)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>CA ce mois</p>
                <p className="font-display text-2xl font-semibold" style={{ color: 'var(--gold)' }}>—</p>
              </div>
              <div className="rounded-lg p-4" style={{ background: 'rgba(85,239,196,0.05)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Abonnements actifs</p>
                <p className="font-display text-2xl font-semibold" style={{ color: '#55EFC4' }}>—</p>
              </div>
              <div className="rounded-lg p-4" style={{ background: 'rgba(255,107,107,0.05)' }}>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Désabonnements</p>
                <p className="font-display text-2xl font-semibold" style={{ color: '#FF6B6B' }}>—</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
