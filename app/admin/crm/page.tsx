'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Campaign {
  id: string
  name: string
  subject: string
  status: string
  segment: string
  sent_count: number
  open_count: number
  click_count: number
  created_at: string
  sent_at: string | null
}

interface Stats {
  totalContacts: number
  totalCampaigns: number
  totalSent: number
  avgOpenRate: number
}

export default function CRMDashboardPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [stats, setStats] = useState<Stats>({ totalContacts: 0, totalCampaigns: 0, totalSent: 0, avgOpenRate: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [campRes, contactsRes] = await Promise.all([
          fetch('/api/crm/campaigns'),
          fetch('/api/crm/contacts?page=1'),
        ])
        const campData = await campRes.json()
        const contactsData = await contactsRes.json()

        const camps = campData.campaigns || []
        setCampaigns(camps)

        const totalSent = camps.reduce((s: number, c: Campaign) => s + (c.sent_count || 0), 0)
        const totalOpens = camps.reduce((s: number, c: Campaign) => s + (c.open_count || 0), 0)
        const avgOpen = totalSent > 0 ? Math.round((totalOpens / totalSent) * 100) : 0

        setStats({
          totalContacts: contactsData.total || 0,
          totalCampaigns: camps.length,
          totalSent,
          avgOpenRate: avgOpen,
        })
      } catch (e) {
        console.error('CRM load error:', e)
      }
      setLoading(false)
    }
    load()
  }, [])

  const statCards = [
    { label: 'Contacts', value: stats.totalContacts, icon: '👥', color: '#C9A961' },
    { label: 'Campagnes', value: stats.totalCampaigns, icon: '📧', color: '#4A90D9' },
    { label: 'Emails envoyés', value: stats.totalSent, icon: '✉️', color: '#50C878' },
    { label: 'Taux d\'ouverture', value: `${stats.avgOpenRate}%`, icon: '📊', color: '#E8A87C' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-light" style={{ color: 'var(--gold)' }}>
            CRM & Campagnes Email
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Gérez vos contacts et campagnes email depuis votre back-office.
          </p>
        </div>
        <Link
          href="/admin/crm/campaigns/new"
          className="px-6 py-3 rounded-full text-sm font-semibold transition-all"
          style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))', color: '#000000' }}
        >
          + Nouvelle campagne
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Chargement...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="p-5 rounded-xl"
                style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}
              >
                <div className="text-2xl mb-2">{card.icon}</div>
                <div className="text-2xl font-display font-light" style={{ color: card.color }}>
                  {card.value}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-1 uppercase tracking-wider">
                  {card.label}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Link
              href="/admin/crm/contacts"
              className="p-6 rounded-xl text-center transition-all hover:scale-[1.02]"
              style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}
            >
              <div className="text-3xl mb-2">👥</div>
              <div className="font-display text-lg" style={{ color: 'var(--gold)' }}>Contacts</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">Voir et synchroniser vos contacts</div>
            </Link>
            <Link
              href="/admin/crm/campaigns"
              className="p-6 rounded-xl text-center transition-all hover:scale-[1.02]"
              style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}
            >
              <div className="text-3xl mb-2">📧</div>
              <div className="font-display text-lg" style={{ color: 'var(--gold)' }}>Campagnes</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">Créer et planifier vos campagnes</div>
            </Link>
            <Link
              href="/admin/crm/sequences"
              className="p-6 rounded-xl text-center transition-all hover:scale-[1.02]"
              style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}
            >
              <div className="text-3xl mb-2">🔄</div>
              <div className="font-display text-lg" style={{ color: 'var(--gold)' }}>Séquences</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">Emails automatiques par déclencheur</div>
            </Link>
          </div>

          {campaigns.length > 0 && (
            <div>
              <h2 className="font-display text-xl mb-4" style={{ color: 'var(--text-primary)' }}>
                Dernières campagnes
              </h2>
              <div className="space-y-3">
                {campaigns.slice(0, 5).map((camp) => (
                  <Link
                    key={camp.id}
                    href={`/admin/crm/campaigns?selected=${camp.id}`}
                    className="block p-4 rounded-xl transition-all hover:scale-[1.005]"
                    style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{camp.name}</div>
                        <div className="text-xs text-[var(--text-muted)]">{camp.subject}</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: camp.status === 'sent' ? 'rgba(80,200,120,0.15)' : camp.status === 'scheduled' ? 'rgba(74,144,217,0.15)' : 'rgba(201,169,97,0.15)',
                            color: camp.status === 'sent' ? '#50C878' : camp.status === 'scheduled' ? '#4A90D9' : 'var(--gold)',
                          }}
                        >
                          {camp.status === 'sent' ? 'Envoyée' : camp.status === 'scheduled' ? 'Planifiée' : 'Brouillon'}
                        </span>
                        {camp.status === 'sent' && (
                          <div className="text-xs text-[var(--text-muted)]">
                            {camp.sent_count} envoyés · {camp.open_count} ouverts · {camp.click_count} clics
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
