'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import ShineIcon, { type ShineIconName } from '@/components/icons/ShineIcon'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  BANDEAU DE BADGES — une seule ligne, le reste derrière « Autres »
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Les badges sont nommés en toutes lettres — « Pilier Communautaire » est une
 *  reconnaissance, pas une icône. Mais six noms longs ne tiennent pas sur une
 *  ligne, et le nombre de badges grandit avec le temps.
 *
 *  Plutôt que de figer un nombre (« on en montre 4 »), on MESURE la place
 *  réellement disponible et on affiche ce qui rentre. Sur un grand écran on
 *  en voit cinq, sur un téléphone deux — la hauteur, elle, ne bouge jamais.
 *  Le reste est derrière « Autres », qui déroule la liste complète.
 *
 *  La mesure se refait à chaque redimensionnement : passer en paysage ou
 *  ouvrir la fenêtre ne laisse pas un badge coupé au milieu.
 */

export type Badge = {
  id: string
  name: string
  icon: ShineIconName
  /** Optionnel : ce que le badge récompense, en infobulle. */
  description?: string
}

export default function BadgeStrip({
  badges,
  defaultExpanded = false,
}: {
  badges: Badge[]
  /** Ouvre la liste d'emblée. Sert aux aperçus et aux tests. */
  defaultExpanded?: boolean
}) {
  const rowRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLSpanElement | null)[]>([])
  const moreRef = useRef<HTMLButtonElement>(null)

  const [expanded, setExpanded] = useState(defaultExpanded)
  /** Nombre de badges qui tiennent. null = mesure pas encore faite. */
  const [visible, setVisible] = useState<number | null>(null)

  /**
   * On mesure en deux temps : un premier rendu où tout est présent mais
   * invisible, puis on coupe. Sans ça, on ne connaît pas la largeur des
   * pastilles — elle dépend de la police, donc du navigateur.
   */
  useLayoutEffect(() => {
    function measure() {
      const row = rowRef.current
      if (!row) return

      const available = row.clientWidth
      // On réserve la place du bouton « Autres » : sinon il déborde tout seul.
      const moreWidth = (moreRef.current?.offsetWidth || 84) + 8

      let used = 0
      let fits = 0
      for (let i = 0; i < badges.length; i++) {
        const el = itemRefs.current[i]
        if (!el) break
        const w = el.offsetWidth + (i > 0 ? 8 : 0)
        // Le dernier badge n'a pas besoin qu'on garde la place d'« Autres ».
        const budget = i === badges.length - 1 ? available : available - moreWidth
        if (used + w > budget) break
        used += w
        fits++
      }
      setVisible(Math.max(1, fits))
    }

    measure()
    const row = rowRef.current
    if (!row || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(row)
    return () => ro.disconnect()
  }, [badges])

  // Se replier quand la liste change, pour ne pas rester ouvert sans raison.
  // On saute le premier passage : sinon defaultExpanded serait annulé au montage.
  const firstRun = useRef(true)
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return }
    setExpanded(false)
  }, [badges])

  if (badges.length === 0) return null

  const count = visible ?? badges.length
  const hidden = badges.length - count
  const shown = expanded ? badges : badges.slice(0, count)

  return (
    <div
      ref={rowRef}
      className={`flex items-center gap-2 ${expanded ? 'flex-wrap' : 'flex-nowrap overflow-hidden'}`}
    >
      {shown.map((b, i) => (
        <span
          key={b.id}
          ref={el => { itemRefs.current[i] = el }}
          title={b.description || b.name}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] whitespace-nowrap shrink-0"
          style={{ background: 'rgba(201,169,97,0.08)', border: '1px solid rgba(201,169,97,0.22)', color: '#E3C77E' }}
        >
          <ShineIcon name={b.icon} className="w-3.5 h-3.5" />
          {b.name}
        </span>
      ))}

      {(hidden > 0 || expanded) && (
        <button
          ref={moreRef}
          onClick={() => setExpanded(e => !e)}
          aria-expanded={expanded}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11.5px] whitespace-nowrap shrink-0
                     cursor-pointer transition-colors hover:bg-white/[0.05]"
          style={{ color: '#C9A961' }}
        >
          {expanded ? 'Replier' : `Autres (${hidden})`}
          <svg
            className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      )}
    </div>
  )
}
