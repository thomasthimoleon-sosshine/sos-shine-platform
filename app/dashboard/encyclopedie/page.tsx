'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { Douleur, UserProgress } from '@/types/database'
import FavoriteButton from '@/components/FavoriteButton'
import { useTranslation } from '@/lib/i18n/useTranslation'

const defaultDouleurs: Pick<Douleur, 'title' | 'slug' | 'description' | 'image_url'>[] = [
  { title: 'Abus', slug: 'abus', description: 'Identifiez les mécanismes de l\'abus, reconstruisez vos limites et retrouvez votre pouvoir personnel.', image_url: null },
  { title: 'Amour propre', slug: 'amour-propre', description: 'Reconnectez-vous à votre valeur intérieure et cultivez un amour de soi authentique et durable.', image_url: null },
  { title: 'Burn-out', slug: 'burn-out', description: 'Récupérez votre énergie vitale étape par étape. Corps, mental, reconstruction.', image_url: null },
  { title: 'Confiance en soi', slug: 'confiance-en-soi', description: 'Rebâtissez une confiance solide en vous, pas à pas.', image_url: null },
  { title: 'Dépendance affective', slug: 'dependance-affective', description: 'Comprenez les mécanismes et libérez-vous du besoin de l\'autre pour exister.', image_url: null },
  { title: 'Deuil', slug: 'deuil', description: 'Accompagnement doux pour traverser la perte d\'un être cher.', image_url: null },
  { title: 'Rupture', slug: 'rupture', description: 'Traversez la tempête d\'une séparation avec des outils concrets.', image_url: null },
  { title: 'Séparation', slug: 'separation', description: 'Apprenez à traverser une séparation en douceur et à vous reconstruire.', image_url: null },
]

export default function EncyclopediePage() {
  const { t } = useTranslation()
  const [douleurs, setDouleurs] = useState<Douleur[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [progressMap, setProgressMap] = useState<Record<string, UserProgress>>({})
  const [totalCompleted, setTotalCompleted] = useState(0)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('douleurs')
        .select('*')
        .eq('is_published', true)
        .order('title', { ascending: true })

      if (data && data.length > 0) {
        setDouleurs(data as Douleur[])
      }

      // Load user progress
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)

        if (progressData) {
          const map: Record<string, UserProgress> = {}
          let completed = 0
          for (const p of progressData as UserProgress[]) {
            map[p.douleur_id] = p
            if (p.completed_at) completed++
          }
          setProgressMap(map)
          setTotalCompleted(completed)
        }
      }

      setLoading(false)
    }
    load()
  }, [])

  const displayDouleurs = douleurs.length > 0 ? douleurs : defaultDouleurs
  const filtered = displayDouleurs.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  )

  // Group by first letter
  const grouped: Record<string, typeof filtered> = {}
  filtered.forEach((d) => {
    const letter = d.title.charAt(0).toUpperCase()
    if (!grouped[letter]) grouped[letter] = []
    grouped[letter].push(d)
  })
  const letters = Object.keys(grouped).sort()

  // All letters for the alphabet bar
  const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
  const activeLetters = new Set(letters)

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          {t('dashboard.encyclopedia_title')}
        </h1>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
          {t('dashboard.encyclopedia_subtitle')}
        </p>
      </div>

      {/* Global progress widget */}
      {douleurs.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: 'rgba(201,169,97,0.04)', border: '1px solid rgba(201,169,97,0.12)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Votre progression globale
            </span>
            <span className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>
              {totalCompleted}/{douleurs.length} complétés
            </span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--dark-border)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--gold), var(--gold-light))' }}
              initial={{ width: 0 }}
              animate={{ width: `${douleurs.length > 0 ? (totalCompleted / douleurs.length) * 100 : 0}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          {totalCompleted > 0 && (
            <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
              {totalCompleted === douleurs.length
                ? 'Bravo ! Vous avez complété tous les challenges disponibles !'
                : `Continuez votre parcours, chaque étape compte.`}
            </p>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--text-muted)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('dashboard.search_challenge')}
          className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all"
          style={{
            background: 'var(--dark-card)',
            border: '1px solid var(--dark-border)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Alphabet bar */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {allLetters.map((letter) => (
          <button
            key={letter}
            onClick={() => {
              if (activeLetters.has(letter)) {
                document.getElementById(`letter-${letter}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            }}
            className="w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer"
            style={{
              background: activeLetters.has(letter) ? 'rgba(201,169,97,0.1)' : 'transparent',
              color: activeLetters.has(letter) ? 'var(--gold)' : 'var(--text-muted)',
              opacity: activeLetters.has(letter) ? 1 : 0.3,
            }}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Douleurs list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            {t('dashboard.no_challenge_found', { search })}
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            {t('dashboard.new_challenges_coming')}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {letters.map((letter) => (
            <div key={letter} id={`letter-${letter}`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="font-display text-2xl font-semibold" style={{ color: 'var(--gold)' }}>
                  {letter}
                </span>
                <div className="flex-1 h-px" style={{ background: 'var(--dark-border)' }} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {grouped[letter].map((douleur) => {
                  const slug = douleur.slug
                  const hasId = 'id' in douleur
                  const douleurId = hasId ? (douleur as Douleur).id : null
                  const prog = douleurId ? progressMap[douleurId] : null
                  const stepsCompleted = prog ? [prog.step1_completed, prog.step2_completed, prog.step3_completed].filter(Boolean).length : 0
                  return (
                    <Link
                      key={slug}
                      href={hasId ? `/dashboard/encyclopedie/${slug}` : '#'}
                      className={`group rounded-xl p-5 transition-all duration-300 ${hasId ? 'hover:-translate-y-0.5' : ''}`}
                      style={{
                        background: 'var(--dark-card)',
                        border: prog?.completed_at ? '1px solid rgba(85,239,196,0.2)' : '1px solid var(--dark-border)',
                        opacity: hasId ? 1 : 0.7,
                      }}
                      onClick={(e) => { if (!hasId) e.preventDefault() }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base group-hover:text-[var(--gold)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                              {douleur.title}
                            </h3>
                            {prog?.completed_at && (
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="#55EFC4" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                            {douleur.description}
                          </p>
                          {hasId && stepsCompleted > 0 && !prog?.completed_at && (
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--dark-border)' }}>
                                <div className="h-full rounded-full" style={{ width: `${(stepsCompleted / 3) * 100}%`, background: 'var(--gold)' }} />
                              </div>
                              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{stepsCompleted}/3</span>
                            </div>
                          )}
                        </div>
                        {hasId ? (
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <FavoriteButton slug={slug} size="sm" />
                            <svg className="w-5 h-5 mt-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--text-muted)' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                          </div>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-lg flex-shrink-0" style={{ background: 'rgba(201,169,97,0.1)', color: 'var(--gold)' }}>
                            {t('dashboard.coming_soon')}
                          </span>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="rounded-xl p-5 text-center" style={{ background: 'rgba(201,169,97,0.04)', border: '1px solid rgba(201,169,97,0.1)' }}>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {t('dashboard.not_found_info')}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {t('dashboard.contact_us')} <span style={{ color: 'var(--gold)' }}>julialaureau@sosshine.com</span>
        </p>
      </div>
    </div>
  )
}
