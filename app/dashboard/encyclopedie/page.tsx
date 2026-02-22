'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Douleur } from '@/types/database'

const defaultDouleurs: Pick<Douleur, 'title' | 'slug' | 'description' | 'image_url'>[] = [
  { title: 'Abus', slug: 'abus', description: 'Identifiez les mécanismes de l\'abus, reconstruisez vos limites et retrouvez votre pouvoir personnel.', image_url: null },
  { title: 'Amour propre', slug: 'amour-propre', description: 'Reconnectez-vous à votre valeur intérieure et cultivez un amour de soi authentique et durable.', image_url: null },
  { title: 'Burn-out', slug: 'burn-out', description: 'Récupérez votre énergie vitale étape par étape. Corps, mental, reconstruction.', image_url: null },
  { title: 'Confiance en soi', slug: 'confiance-en-soi', description: 'Rebâtissez une confiance solide en vous, pas à pas.', image_url: null },
  { title: 'Dépendance affective', slug: 'dependance-affective', description: 'Comprenez les mécanismes et libérez-vous du besoin de l\'autre pour exister.', image_url: null },
  { title: 'Deuil', slug: 'deuil', description: 'Accompagnement doux pour traverser la perte d\'un être cher.', image_url: null },
  { title: 'Rupture', slug: 'rupture', description: 'Traversez la tempête d\'une séparation avec des outils concrets.', image_url: null },
]

export default function EncyclopediePage() {
  const [douleurs, setDouleurs] = useState<Douleur[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

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
          Encyclopédie des expériences de vie
        </h1>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
          Chaque challenge émotionnel a sa page dédiée. Trouvez le vôtre, accédez à votre protocole en 4 étapes.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--text-muted)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un challenge émotionnel..."
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
              background: activeLetters.has(letter) ? 'rgba(212,175,55,0.1)' : 'transparent',
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
            Aucun challenge émotionnel trouvé pour &quot;{search}&quot;
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            De nouveaux challenges émotionnels sont ajoutés régulièrement.
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
                  return (
                    <Link
                      key={slug}
                      href={hasId ? `/dashboard/encyclopedie/${slug}` : '#'}
                      className={`group rounded-xl p-5 transition-all duration-300 ${hasId ? 'hover:-translate-y-0.5' : ''}`}
                      style={{
                        background: 'var(--dark-card)',
                        border: '1px solid var(--dark-border)',
                        opacity: hasId ? 1 : 0.7,
                      }}
                      onClick={(e) => { if (!hasId) e.preventDefault() }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base mb-1 group-hover:text-[var(--gold)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                            {douleur.title}
                          </h3>
                          <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                            {douleur.description}
                          </p>
                        </div>
                        {hasId ? (
                          <svg className="w-5 h-5 flex-shrink-0 mt-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--text-muted)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-lg flex-shrink-0" style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold)' }}>
                            Bientôt
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
      <div className="rounded-xl p-5 text-center" style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.1)' }}>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Vous ne trouvez pas votre challenge émotionnel ? Nous ajoutons régulièrement de nouvelles pages.
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Contactez-nous à <span style={{ color: 'var(--gold)' }}>contact@sosshine.fr</span>
        </p>
      </div>
    </div>
  )
}
