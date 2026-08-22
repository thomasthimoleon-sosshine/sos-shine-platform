'use client'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  LES ÉCLATS — système d'icônes propriétaire SOS Shine
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Aucune icône générique, aucun émoji système. Chaque signe est construit à
 *  partir de deux primitives tirées du logo :
 *
 *    · LA FACETTE — le losange du diamant. Ce qui est travaillé, taillé, tenu.
 *    · LE RAI     — le trait droit de l'éclat. Ce qui part, traverse, revient.
 *
 *  Grammaire commune (ne pas dévier) :
 *    - grille 24×24, trait `currentColor`, épaisseur 1.5, extrémités rondes
 *    - jamais de remplissage décoratif : la couleur vient du contexte
 *    - une facette pleine = le sujet ; une facette ouverte = ce qui manque
 *    - le nombre et la direction des rais portent le sens
 *
 *  La couleur n'est jamais dans l'icône : elle est passée par `color` ou
 *  héritée du parent, pour qu'un même signe serve dans les six codes couleur.
 */

export type ShineIconName =
  // Catégories de publication
  | 'temoignage'
  | 'partage'
  | 'question'
  | 'remerciements'
  | 'gratitude'
  | 'citation'
  // Types de contenu
  | 'texte'
  | 'image'
  | 'video'
  | 'shorts'
  | 'audio'
  // Actions
  | 'eclat'
  | 'parole'
  | 'rayon'
  | 'garder'
  | 'diffuser'

type Props = {
  name: ShineIconName
  className?: string
  color?: string
  strokeWidth?: number
  title?: string
  /** Remplit le signe : sert aux états actifs (éclat donné, publication gardée). */
  filled?: boolean
}

/**
 * Chaque entrée est une liste de tracés. `d` = path, `c` = cercle plein
 * (utilisé uniquement pour les points en suspens, jamais en décoration).
 */
const PATHS: Record<ShineIconName, React.ReactNode> = {
  /* ── Témoignage — LA VOIX. Une facette, trois rais qui portent au loin. ── */
  temoignage: (
    <>
      <path d="M6.6 5.6 L10.6 12 L6.6 18.4 L2.6 12 Z" />
      <path d="M13.6 8.8 h2.9" />
      <path d="M13.6 12 h5.2" />
      <path d="M13.6 15.2 h2.9" />
    </>
  ),

  /* ── Partage d'expériences — LE PASSAGE. Ce que l'un traverse, l'autre le reçoit. ── */
  partage: (
    <>
      <path d="M5.8 7 L9.2 12 L5.8 17 L2.4 12 Z" />
      <path d="M18.2 7 L21.6 12 L18.2 17 L14.8 12 Z" />
      <path d="M9.6 12 C 10.9 9.4, 13.1 14.6, 14.4 12" />
    </>
  ),

  /* ── Question — CE QUI RESTE OUVERT. Le point d'interrogation retaillé :
       la courbe cherche, et le point posé dessous est une facette. ── */
  question: (
    <>
      <path d="M8.3 8.5 a3.7 3.7 0 1 1 3.7 3.7 v1.9" />
      <path d="M12 16.9 L13.5 18.7 L12 20.5 L10.5 18.7 Z" />
    </>
  ),

  /* ── Remerciements — CE QUI EST REÇU. Une facette tenue dans une paume
       ouverte : on ne remercie pas en donnant, on remercie en recevant. ── */
  remerciements: (
    <>
      <path d="M12 6.2 L15 10 L12 13.8 L9 10 Z" />
      <path d="M4.8 13.4 a7.2 7.2 0 0 0 14.4 0" />
      <path d="M12 2.4 v1.7" />
      <path d="M6.9 4.5 l1.2 1.4" />
      <path d="M17.1 4.5 l-1.2 1.4" />
    </>
  ),

  /* ── Gratitude — LE GRAND ÉCLAT. Le signe le plus proche du logo. ── */
  gratitude: (
    <>
      <path d="M12 9 L15 12 L12 15 L9 12 Z" />
      <path d="M12 2.2 v3.4" />
      <path d="M12 18.4 v3.4" />
      <path d="M2.2 12 h3.4" />
      <path d="M18.4 12 h3.4" />
      <path d="M5.6 5.6 l2 2" />
      <path d="M18.4 5.6 l-2 2" />
      <path d="M5.6 18.4 l2 -2" />
      <path d="M18.4 18.4 l-2 -2" />
    </>
  ),

  /* ── Citation — LA PAROLE GARDÉE. Une facette tenue entre deux rais. ── */
  citation: (
    <>
      <path d="M12 6.8 L15.4 12 L12 17.2 L8.6 12 Z" />
      <path d="M3.6 8.4 v2.8" />
      <path d="M5.9 8.4 v2.8" />
      <path d="M18.1 12.8 v2.8" />
      <path d="M20.4 12.8 v2.8" />
    </>
  ),

  /* ── Texte — trois rais posés, le dernier taillé en facette. ── */
  texte: (
    <>
      <path d="M4 7.5 h16" />
      <path d="M4 12 h11" />
      <path d="M4 16.5 h6" />
      <path d="M16.6 16.5 L18.6 14.5 L20.6 16.5 L18.6 18.5 Z" />
    </>
  ),

  /* ── Image — CE QUI EST TENU. Une facette sous verre, dans un cadre large. ── */
  image: (
    <>
      <path d="M2.2 7 h19.6 a1.5 1.5 0 0 1 1.5 1.5 v7 a1.5 1.5 0 0 1 -1.5 1.5 h-19.6 a1.5 1.5 0 0 1 -1.5 -1.5 v-7 a1.5 1.5 0 0 1 1.5 -1.5 Z" />
      <path d="M10.4 9.4 L13.2 12 L10.4 14.6 L7.6 12 Z" />
      <path d="M17.6 9.6 v1.6" />
    </>
  ),

  /* ── Vidéo — CE QUI AVANCE. Pas de cadre : une image seule est tenue,
       une vidéo se déplace. Deux rais de traîne disent le mouvement. ── */
  video: (
    <>
      <path d="M9.4 5.6 L20.6 12 L9.4 18.4 L12.4 12 Z" />
      <path d="M5.8 8.6 h2.2" />
      <path d="M3.2 12 h3.6" />
      <path d="M5.8 15.4 h2.2" />
    </>
  ),

  /* ── Shorts — LE FIL VERTICAL. Un écran debout, ce qui avance dedans, et
       les deux repères du défilement au-dessus et en dessous. ── */
  shorts: (
    <>
      <path d="M7.4 4.6 h9.2 a1.6 1.6 0 0 1 1.6 1.6 v11.6 a1.6 1.6 0 0 1 -1.6 1.6 h-9.2 a1.6 1.6 0 0 1 -1.6 -1.6 v-11.6 a1.6 1.6 0 0 1 1.6 -1.6 Z" />
      <path d="M10.6 9 L15 12 L10.6 15 L11.8 12 Z" />
      <path d="M9.6 2.2 h4.8" />
      <path d="M9.6 21.8 h4.8" />
    </>
  ),

  /* ── Audio — une facette et ce qu'elle propage. ── */
  audio: (
    <>
      <path d="M8.6 5.6 L12 12 L8.6 18.4 L5.2 12 Z" />
      <path d="M15.4 9.2 a4.2 4.2 0 0 1 0 5.6" />
      <path d="M18.4 6.8 a7.4 7.4 0 0 1 0 10.4" />
    </>
  ),

  /* ── Éclat — le « j'aime » maison. Une facette qui s'allume. ── */
  eclat: (
    <>
      <path d="M12 3.4 L14.6 9.4 L20.6 12 L14.6 14.6 L12 20.6 L9.4 14.6 L3.4 12 L9.4 9.4 Z" />
    </>
  ),

  /* ── Parole — répondre. La facette qui s'ouvre par en bas. ── */
  parole: (
    <>
      <path d="M12 4.4 L19.4 11.2 L12 18 L4.6 11.2 Z" />
      <path d="M9.2 18 L8 21.4 L12 18" />
    </>
  ),

  /* ── Rayon — envoyer à quelqu'un. Un rai lancé depuis la facette. ── */
  rayon: (
    <>
      <path d="M5.4 8.6 L8.4 12 L5.4 15.4 L2.4 12 Z" />
      <path d="M9.2 12 h11" />
      <path d="M16.4 8.2 L20.6 12 L16.4 15.8" />
    </>
  ),

  /* ── Garder — mettre de côté. Une facette repliée. ── */
  garder: (
    <>
      <path d="M5.6 4.4 h12.8 v16.2 L12 15.8 L5.6 20.6 Z" />
      <path d="M12 8 L14 10.6 L12 13.2 L10 10.6 Z" />
    </>
  ),

  /* ── Diffuser — porter au dehors. Trois facettes reliées. ── */
  diffuser: (
    <>
      <path d="M18.2 2.6 L21.4 5.6 L18.2 8.6 L15 5.6 Z" />
      <path d="M18.2 15.4 L21.4 18.4 L18.2 21.4 L15 18.4 Z" />
      <path d="M5 8.8 L8.2 12 L5 15.2 L1.8 12 Z" />
      <path d="M8.8 10.6 L14.6 7.6" />
      <path d="M8.8 13.4 L14.6 16.4" />
    </>
  ),
}

export default function ShineIcon({
  name,
  className = 'w-4 h-4',
  color,
  strokeWidth = 1.5,
  title,
  filled = false,
}: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? (color || 'currentColor') : 'none'}
      fillOpacity={filled ? 0.9 : undefined}
      stroke={color || 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      {PATHS[name]}
    </svg>
  )
}
