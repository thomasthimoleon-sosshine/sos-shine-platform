'use client'

/**
 *  METTRE UN ARTICLE DE CÔTÉ
 *  ─────────────────────────
 *
 *  Toutes les autres sections avaient leur bouton — les protocoles, les
 *  publications, les formats courts, Shine TV, Shine Audible, la librairie.
 *  Le blog était le seul à ne pas en avoir : on lisait un article, on voulait
 *  y revenir, et il n'y avait aucun moyen de le retrouver.
 *
 *  La page « Mes favoris » lisait pourtant déjà blog_favorites : elle attendait
 *  ce bouton depuis le début, et affichait zéro article faute d'écrivain.
 *
 *  On garde le slug plutôt qu'un identifiant : les articles existent en base
 *  ET en dur dans data/blog/articles.ts. Le slug est leur seule clé commune.
 */

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import ShineIcon from '@/components/icons/ShineIcon'

type Props = {
  slug: string
  /** `bouton` porte un libellé ; `pastille` se glisse sur une carte. */
  forme?: 'bouton' | 'pastille'
  className?: string
}

export default function BoutonFavoriBlog({ slug, forme = 'bouton', className = '' }: Props) {
  const [garde, setGarde] = React.useState(false)
  const [pret, setPret] = React.useState(false)
  const [enCours, setEnCours] = React.useState(false)
  const [souci, setSouci] = React.useState(false)

  React.useEffect(() => {
    let vivant = true
    ;(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { if (vivant) setPret(true); return }
      const { data } = await supabase
        .from('blog_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('article_slug', slug)
        .maybeSingle()
      if (vivant) { setGarde(!!data); setPret(true) }
    })()
    return () => { vivant = false }
  }, [slug])

  async function basculer(e: React.MouseEvent) {
    // La carte d'un article est elle-même cliquable : sans cela, mettre de
    // côté ouvrirait l'article dans la foulée.
    e.preventDefault()
    e.stopPropagation()
    if (enCours) return
    setEnCours(true)
    setSouci(false)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSouci(true); setEnCours(false); return }

    // On bascule tout de suite : l'attente d'un aller-retour réseau donne
    // l'impression que le bouton ne répond pas.
    const vise = !garde
    setGarde(vise)

    const { error } = vise
      ? await supabase.from('blog_favorites').insert({ user_id: user.id, article_slug: slug })
      : await supabase.from('blog_favorites').delete().eq('user_id', user.id).eq('article_slug', slug)

    if (error) {
      setGarde(!vise)
      setSouci(true)
    } else {
      // « Mes favoris » écoute cet événement et se rafraîchit.
      window.dispatchEvent(new Event('favorites-changed'))
    }
    setEnCours(false)
  }

  if (!pret) return null

  const titre = garde ? 'Retirer de mes favoris' : 'Garder cet article'

  if (forme === 'pastille') {
    return (
      <button
        type="button"
        onClick={basculer}
        title={titre}
        aria-label={titre}
        aria-pressed={garde}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${className}`}
        style={{
          background: garde ? 'rgba(201,169,97,0.12)' : 'var(--surface-card)',
          border: `1px solid ${garde ? 'rgba(201,169,97,0.35)' : 'var(--border)'}`,
          color: garde ? 'var(--brand)' : 'var(--text-muted)',
        }}
      >
        <ShineIcon name="garder" className="w-4 h-4" filled={garde} />
      </button>
    )
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={basculer}
        title={titre}
        aria-label={titre}
        aria-pressed={garde}
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${className}`}
        style={{
          background: garde ? 'rgba(201,169,97,0.12)' : 'var(--surface-card)',
          border: `1px solid ${garde ? 'rgba(201,169,97,0.35)' : 'var(--border)'}`,
          color: garde ? 'var(--brand)' : 'var(--text-secondary)',
        }}
      >
        <ShineIcon name="garder" className="w-4 h-4" filled={garde} />
        {garde ? 'Gardé' : 'Garder'}
      </button>
      {souci && (
        <span className="text-[10px]" style={{ color: '#FF6B6B' }}>
          Impossible d&apos;enregistrer pour le moment.
        </span>
      )}
    </span>
  )
}
