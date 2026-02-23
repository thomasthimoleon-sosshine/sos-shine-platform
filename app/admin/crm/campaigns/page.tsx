'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Campaign {
  id: string
  name: string
  subject: string
  html_content: string
  status: string
  segment: string
  sent_count: number
  open_count: number
  click_count: number
  created_at: string
  sent_at: string | null
  scheduled_at: string | null
}

export default function CRMCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState<string | null>(null)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)

  async function loadCampaigns() {
    setLoading(true)
    try {
      const res = await fetch('/api/crm/campaigns')
      const data = await res.json()
      setCampaigns(data.campaigns || [])
    } catch (e) {
      console.error('Load campaigns error:', e)
    }
    setLoading(false)
  }

  useEffect(() => { loadCampaigns() }, [])

  async function handleSend(campaignId: string) {
    if (!confirm('Êtes-vous sûr de vouloir envoyer cette campagne ? Cette action est irréversible.')) return
    setSending(campaignId)
    try {
      const res = await fetch('/api/crm/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId }),
      })
      const data = await res.json()
      if (data.error) {
        alert(`Erreur : ${data.error}`)
      } else {
        alert(`Campagne envoyée avec succès à ${data.sentCount} contacts !`)
        loadCampaigns()
      }
    } catch {
      alert('Erreur lors de l\'envoi')
    }
    setSending(null)
  }

  async function handleDelete(campaignId: string) {
    if (!confirm('Supprimer cette campagne ?')) return
    try {
      await fetch(`/api/crm/campaigns?id=${campaignId}`, { method: 'DELETE' })
      loadCampaigns()
    } catch {
      alert('Erreur lors de la suppression')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-light" style={{ color: 'var(--gold)' }}>
            Campagnes Email
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Créez, envoyez et suivez vos campagnes email.
          </p>
        </div>
        <Link
          href="/admin/crm/campaigns/new"
          className="px-6 py-3 rounded-full text-sm font-semibold transition-all"
          style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))', color: '#050505' }}
        >
          + Nouvelle campagne
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--text-muted)]">Chargement...</div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📧</div>
          <p className="text-[var(--text-muted)] mb-4">Aucune campagne créée pour le moment.</p>
          <Link
            href="/admin/crm/campaigns/new"
            className="inline-block px-6 py-3 rounded-full text-sm font-semibold"
            style={{ background: 'var(--gold)', color: '#050505' }}
          >
            Créer ma première campagne
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((camp) => {
            const openRate = camp.sent_count > 0 ? Math.round((camp.open_count / camp.sent_count) * 100) : 0
            const clickRate = camp.sent_count > 0 ? Math.round((camp.click_count / camp.sent_count) * 100) : 0

            return (
              <div
                key={camp.id}
                className="p-5 rounded-xl"
                style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-display text-lg" style={{ color: 'var(--text-primary)' }}>
                        {camp.name}
                      </h3>
                      <span
                        className="px-3 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          background: camp.status === 'sent' ? 'rgba(80,200,120,0.15)' : camp.status === 'scheduled' ? 'rgba(74,144,217,0.15)' : 'rgba(212,175,55,0.15)',
                          color: camp.status === 'sent' ? '#50C878' : camp.status === 'scheduled' ? '#4A90D9' : 'var(--gold)',
                        }}
                      >
                        {camp.status === 'sent' ? '✓ Envoyée' : camp.status === 'scheduled' ? '⏰ Planifiée' : '✎ Brouillon'}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">Objet : {camp.subject}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Segment : {camp.segment === 'all' ? 'Tous les contacts' : camp.segment}
                      {' · '}
                      Créée le {new Date(camp.created_at).toLocaleDateString('fr-FR')}
                      {camp.scheduled_at && camp.status === 'scheduled' && ` · Planifiée le ${new Date(camp.scheduled_at).toLocaleString('fr-FR')}`}
                      {camp.sent_at && ` · Envoyée le ${new Date(camp.sent_at).toLocaleDateString('fr-FR')}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {(camp.status === 'draft' || camp.status === 'scheduled') && (
                      <>
                        {camp.status === 'draft' && (
                          <button
                            onClick={() => handleSend(camp.id)}
                            disabled={sending === camp.id}
                            className="px-4 py-2 rounded-full text-xs font-semibold transition-all disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-deep))', color: '#050505' }}
                          >
                            {sending === camp.id ? '⏳ Envoi...' : '🚀 Envoyer'}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(camp.id)}
                          className="px-3 py-2 rounded-full text-xs text-red-400 hover:bg-red-400/10 transition-all"
                        >
                          🗑
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setSelectedCampaign(selectedCampaign?.id === camp.id ? null : camp)}
                      className="px-3 py-2 rounded-full text-xs text-[var(--text-muted)] hover:text-[var(--gold)] transition-all"
                    >
                      {selectedCampaign?.id === camp.id ? '▲ Fermer' : '▼ Détails'}
                    </button>
                  </div>
                </div>

                {camp.status === 'sent' && (
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-3 rounded-lg text-center" style={{ background: 'rgba(80,200,120,0.08)' }}>
                      <div className="text-xl font-display" style={{ color: '#50C878' }}>{camp.sent_count}</div>
                      <div className="text-xs text-[var(--text-muted)]">Envoyés</div>
                    </div>
                    <div className="p-3 rounded-lg text-center" style={{ background: 'rgba(74,144,217,0.08)' }}>
                      <div className="text-xl font-display" style={{ color: '#4A90D9' }}>
                        {camp.open_count} <span className="text-xs">({openRate}%)</span>
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">Ouvertures</div>
                    </div>
                    <div className="p-3 rounded-lg text-center" style={{ background: 'rgba(232,168,124,0.08)' }}>
                      <div className="text-xl font-display" style={{ color: '#E8A87C' }}>
                        {camp.click_count} <span className="text-xs">({clickRate}%)</span>
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">Clics</div>
                    </div>
                  </div>
                )}

                {selectedCampaign?.id === camp.id && (
                  <div
                    className="mt-4 p-4 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--dark-border)' }}
                  >
                    <h4 className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-3">Aperçu du contenu</h4>
                    <div
                      className="prose prose-sm max-w-none text-[var(--text-secondary)]"
                      dangerouslySetInnerHTML={{ __html: camp.html_content }}
                      style={{ maxHeight: '300px', overflow: 'auto' }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
