'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Douleur } from '@/types/database'

// Default content shown when Supabase table is empty or not yet populated
const defaultDouleurs: Omit<Douleur, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    title: 'Rupture amoureuse',
    slug: 'rupture-amoureuse',
    description: 'Traversez la tempête émotionnelle d\'une séparation avec des outils concrets pour le corps, le cœur et l\'esprit.',
    video_url: null,
    audio_url: null,
    pdf_url: null,
    is_active: true,
    display_order: 1,
  },
  {
    title: 'Deuil',
    slug: 'deuil',
    description: 'Accompagnement doux pour traverser la perte d\'un être cher. Rituels, respiration, écriture guidée.',
    video_url: null,
    audio_url: null,
    pdf_url: null,
    is_active: true,
    display_order: 2,
  },
  {
    title: 'Burn-out',
    slug: 'burn-out',
    description: 'Récupérez votre énergie vitale étape par étape. Corps, mental, reconstruction professionnelle.',
    video_url: null,
    audio_url: null,
    pdf_url: null,
    is_active: true,
    display_order: 3,
  },
  {
    title: 'Trahison',
    slug: 'trahison',
    description: 'Reconstruisez la confiance en vous après une trahison. Protocoles émotionnels et méthodes d\'ancrage.',
    video_url: null,
    audio_url: null,
    pdf_url: null,
    is_active: true,
    display_order: 4,
  },
  {
    title: 'Perte de sens',
    slug: 'perte-de-sens',
    description: 'Retrouvez votre direction quand tout semble vide. Exercices de reconnexion à vos valeurs profondes.',
    video_url: null,
    audio_url: null,
    pdf_url: null,
    is_active: true,
    display_order: 5,
  },
  {
    title: 'Anxiété & crises',
    slug: 'anxiete-crises',
    description: 'Protocoles d\'urgence pour calmer les crises d\'angoisse. Respiration, acupression, audio-réconfort.',
    video_url: null,
    audio_url: null,
    pdf_url: null,
    is_active: true,
    display_order: 6,
  },
]

const pilierColors: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  apaiser: {
    color: '#55EFC4',
    label: 'Apaiser le corps',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
  envelopper: {
    color: '#A29BFE',
    label: "Envelopper l'émotion",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
      </svg>
    ),
  },
  reconstruire: {
    color: '#D4A843',
    label: "Reconstruire l'action",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
}

export default function ApothicairePage() {
  const [douleurs, setDouleurs] = useState<Douleur[]>([])
  const [selectedDouleur, setSelectedDouleur] = useState<Douleur | (typeof defaultDouleurs)[0] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDouleurs() {
      const supabase = createClient()
      const { data } = await supabase
        .from('douleurs')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })

      if (data && data.length > 0) {
        setDouleurs(data as Douleur[])
      }
      setLoading(false)
    }
    loadDouleurs()
  }, [])

  const displayDouleurs = douleurs.length > 0 ? douleurs : defaultDouleurs

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          L&apos;Apothicaire
        </h1>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
          Chaque douleur a son remède. Choisissez votre épreuve, accédez à vos soins.
        </p>
      </div>

      {/* 3 Pillars legend */}
      <div className="flex flex-wrap gap-4">
        {Object.entries(pilierColors).map(([key, pilier]) => (
          <div key={key} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: pilier.color }} />
            <span className="text-xs font-medium" style={{ color: pilier.color }}>
              {pilier.label}
            </span>
          </div>
        ))}
      </div>

      {/* Douleurs grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : selectedDouleur ? (
        /* Detail view */
        <div className="space-y-6">
          <button
            onClick={() => setSelectedDouleur(null)}
            className="flex items-center gap-2 text-sm cursor-pointer transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Retour aux douleurs
          </button>

          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{
              background: 'var(--dark-card)',
              border: '1px solid var(--dark-border)',
            }}
          >
            <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              {selectedDouleur.title}
            </h2>
            <p className="mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {selectedDouleur.description}
            </p>

            {/* 3 Piliers content */}
            <div className="space-y-4">
              {Object.entries(pilierColors).map(([key, pilier]) => (
                <div
                  key={key}
                  className="rounded-xl p-5 transition-all duration-200"
                  style={{
                    background: `${pilier.color}08`,
                    border: `1px solid ${pilier.color}20`,
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: `${pilier.color}15`, color: pilier.color }}
                    >
                      {pilier.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm" style={{ color: pilier.color }}>
                        {pilier.label}
                      </h3>
                    </div>
                  </div>

                  {/* Content placeholders */}
                  <div className="space-y-3 ml-13">
                    {key === 'apaiser' && (
                      <>
                        <ContentItem type="video" title="Séance de yoga doux" duration="20 min" color={pilier.color} />
                        <ContentItem type="audio" title="Respiration guidée" duration="10 min" color={pilier.color} />
                        <ContentItem type="pdf" title="Points d'acupression" color={pilier.color} />
                      </>
                    )}
                    {key === 'envelopper' && (
                      <>
                        <ContentItem type="audio" title="Audio-réconfort" duration="15 min" color={pilier.color} />
                        <ContentItem type="video" title="Méditation guidée" duration="12 min" color={pilier.color} />
                        <ContentItem type="pdf" title="Journal d'émotions" color={pilier.color} />
                      </>
                    )}
                    {key === 'reconstruire' && (
                      <>
                        <ContentItem type="video" title="Plan d'action pas-à-pas" duration="25 min" color={pilier.color} />
                        <ContentItem type="pdf" title="Fiche méthode" color={pilier.color} />
                        <ContentItem type="audio" title="Affirmations de reconstruction" duration="8 min" color={pilier.color} />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Grid view */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayDouleurs.map((douleur, index) => (
            <button
              key={'slug' in douleur ? douleur.slug : index}
              onClick={() => setSelectedDouleur(douleur)}
              className="text-left rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              style={{
                background: 'var(--dark-card)',
                border: '1px solid var(--dark-border)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212, 168, 67, 0.3)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(212, 168, 67, 0.08)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--dark-border)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: 'rgba(212, 168, 67, 0.1)', color: 'var(--gold)' }}
                >
                  {getEmojiForDouleur(douleur.slug)}
                </div>
                <svg
                  className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  style={{ color: 'var(--text-muted)' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </div>
              <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--text-primary)' }}>
                {douleur.title}
              </h3>
              <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                {douleur.description}
              </p>
              {/* Pillar dots */}
              <div className="flex gap-2 mt-4">
                <div className="w-2 h-2 rounded-full" style={{ background: '#55EFC4' }} />
                <div className="w-2 h-2 rounded-full" style={{ background: '#A29BFE' }} />
                <div className="w-2 h-2 rounded-full" style={{ background: '#D4A843' }} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function getEmojiForDouleur(slug: string): string {
  const map: Record<string, string> = {
    'rupture-amoureuse': '💔',
    'deuil': '🕊',
    'burn-out': '🔥',
    'trahison': '🗡',
    'perte-de-sens': '🧭',
    'anxiete-crises': '🌊',
  }
  return map[slug] || '✦'
}

function ContentItem({
  type,
  title,
  duration,
  color,
}: {
  type: 'video' | 'audio' | 'pdf'
  title: string
  duration?: string
  color: string
}) {
  const icons = {
    video: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
      </svg>
    ),
    audio: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
      </svg>
    ),
    pdf: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  }

  const labels = {
    video: 'Vidéo',
    audio: 'Audio',
    pdf: 'PDF',
  }

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer"
      style={{ background: 'rgba(255,255,255,0.02)' }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
    >
      <div style={{ color }}>{icons[type]}</div>
      <div className="flex-1">
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{title}</p>
      </div>
      <div className="flex items-center gap-2">
        {duration && (
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{duration}</span>
        )}
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: `${color}15`, color }}
        >
          {labels[type]}
        </span>
      </div>
    </div>
  )
}
