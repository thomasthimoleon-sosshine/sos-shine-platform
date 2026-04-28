'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { createClient } from '@/lib/supabase/client'
import type { Douleur } from '@/types/database'
import FavoriteButton, { getFavorites } from '@/components/FavoriteButton'

const defaultDouleurs: Pick<Douleur, 'title' | 'slug' | 'description' | 'image_url'>[] = [
  { title: 'Abus', slug: 'abus', description: "Identifiez les mécanismes de l'abus, reconstruisez vos limites et retrouvez votre pouvoir personnel.", image_url: null },
  { title: 'Amour propre', slug: 'amour-propre', description: "Reconnectez-vous à votre valeur intérieure et cultivez un amour de soi authentique et durable.", image_url: null },
  { title: 'Burn-out', slug: 'burn-out', description: "Récupérez votre énergie vitale étape par étape.", image_url: null },
  { title: 'Confiance en soi', slug: 'confiance-en-soi', description: "Rebâtissez une confiance solide en vous.", image_url: null },
  { title: 'Dépendance affective', slug: 'dependance-affective', description: "Comprenez les mécanismes et libérez-vous.", image_url: null },
  { title: 'Deuil', slug: 'deuil', description: "Accompagnement doux pour traverser la perte.", image_url: null },
  { title: 'Rupture', slug: 'rupture', description: "Traversez la tempête d'une séparation.", image_url: null },
]

export default function FavorisPage() {
  const { t } = useTranslation()
  const [favorites, setFavorites] = useState<string[]>([])
  const [allDouleurs, setAllDouleurs] = useState<(Douleur | Pick<Douleur, 'title' | 'slug' | 'description' | 'image_url'>)[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setFavorites(getFavorites())
    
    function onUpdate() {
      setFavorites(getFavorites())
    }
    window.addEventListener('favorites-changed', onUpdate)
    return () => window.removeEventListener('favorites-changed', onUpdate)
  }, [])

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('douleurs')
        .select('*')
        .eq('is_published', true)
        .order('title', { ascending: true })

      if (data && data.length > 0) {
        setAllDouleurs(data as Douleur[])
      } else {
        setAllDouleurs(defaultDouleurs)
      }
      setLoading(false)
    }
    load()
  }, [])

  const favoriteDouleurs = allDouleurs.filter(d => favorites.includes(d.slug))

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--text-primary)]">
          {t('favorites.title')}
        </h1>
        <p className="mt-2 text-[var(--text-secondary)]">
          {t('favorites.subtitle')}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : favoriteDouleurs.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl">
          <svg className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1} >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <p className="text-lg text-[var(--text-secondary)]">{t('favorites.empty')}</p>
          <p className="text-sm mt-2 text-[var(--text-muted)]">
            {t('favorites.empty_desc')}
          </p>
          <Link
            href="/dashboard/encyclopedie"
            className="inline-block mt-6 px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'rgba(201,169,97,0.1)', color: 'var(--brand)', border: '1px solid rgba(201,169,97,0.2)' }}
          >
            {t('favorites.explore')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {favoriteDouleurs.map((d, i) => {
            const hasId = 'id' in d
            return (
              <motion.div
                key={d.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <Link
                  href={hasId ? `/dashboard/encyclopedie/${d.slug}` : '#'}
                  className="group block rounded-xl p-5 transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: 'var(--surface-card)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base mb-1 group-hover:text-[var(--brand)] transition-colors text-[var(--text-primary)]">
                        {d.title}
                      </h3>
                      <p className="text-sm leading-relaxed line-clamp-2 text-[var(--text-secondary)]">
                        {d.description}
                      </p>
                    </div>
                    <FavoriteButton slug={d.slug} size="sm" />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
