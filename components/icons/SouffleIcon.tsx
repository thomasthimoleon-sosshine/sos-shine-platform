'use client'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  LES SOUFFLES — second jeu d'icônes SOS Shine (proposition)
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Contre-proposition au jeu « Les Éclats ». Là où Les Éclats sont cristallins
 *  et géométriques — tirés du losange du logo — Les Souffles sont organiques :
 *  chaque signe est tracé d'un geste continu, comme une respiration à l'encre.
 *
 *  Deux primitives, deux seulement :
 *
 *    · L'ARC     — la courbe ouverte. Le souffle, le geste, ce qui traverse.
 *    · LA GOUTTE — la forme fermée en larme. Le vivant, la trace, ce qui reste.
 *
 *  Aucune forme fermée en dehors de la goutte. Aucun angle droit. Rien de
 *  symétrique au pixel : les signes respirent parce qu'ils sont légèrement
 *  désaxés, comme une main les aurait posés.
 *
 *  Palette : celle d'Incarnat (chair → sang → or mat), pas l'arc doré du
 *  premier jeu. C'est ce qui rend les deux propositions vraiment distinctes,
 *  et pas un simple changement de couleur.
 */

export type SouffleIconName =
  | 'temoignage'
  | 'partage'
  | 'question'
  | 'remerciements'
  | 'gratitude'
  | 'citation'
  | 'texte'
  | 'image'
  | 'video'
  | 'audio'
  | 'eclat'
  | 'parole'
  | 'rayon'
  | 'garder'
  | 'diffuser'

type Props = {
  name: SouffleIconName
  className?: string
  color?: string
  strokeWidth?: number
  title?: string
  filled?: boolean
}

/** La goutte, réutilisée partout. Centrée sur (cx, cy), hauteur h. */
function drop(cx: number, cy: number, w: number, h: number) {
  return `M${cx} ${cy + h / 2} c ${-w / 2} 0 ${-w / 2} ${-h / 2} ${-w / 2} ${-h / 2} c 0 ${-h / 2} ${w / 2} ${-h / 2} ${w / 2} ${-h} c 0 ${h / 2} ${w / 2} ${h / 2} ${w / 2} ${h} c 0 ${h / 2} ${-w / 2} ${h / 2} ${-w / 2} ${h / 2} z`
}

const PATHS: Record<SouffleIconName, React.ReactNode> = {
  /* ── Gratitude — L'EXPIRATION QUI SE RÉPAND. Une graine, trois souffles. ── */
  gratitude: (
    <>
      <path d={drop(12, 19, 3.6, 3.6)} />
      <path d="M11.4 15.6 C 8.6 13.4, 5.6 11.4, 2.6 10.6" />
      <path d="M12 15.4 C 12 10.6, 12 6.2, 12 2.4" />
      <path d="M12.6 15.6 C 15.4 13.4, 18.4 11.4, 21.4 10.6" />
    </>
  ),

  /* ── Partage d'expériences — DEUX SOUFFLES QUI SE FRÔLENT. ── */
  partage: (
    <>
      <path d="M8.8 4.4 C 4.2 7.4, 4.2 16.6, 8.8 19.6" />
      <path d="M15.2 4.4 C 19.8 7.4, 19.8 16.6, 15.2 19.6" />
      <path d={drop(12, 12.6, 3, 3)} />
    </>
  ),

  /* ── Témoignage — LA VOIX QUI SE DÉPLOIE. Un point, puis tout s'ouvre. ── */
  temoignage: (
    <>
      <path d={drop(4.4, 12, 3.4, 3.4)} />
      <path d="M7.2 12 C 12 12, 15 8.6, 16.6 3.4" />
      <path d="M7.2 12 C 12.4 12, 16.4 12, 20.6 12" />
      <path d="M7.2 12 C 12 12, 15 15.4, 16.6 20.6" />
    </>
  ),

  /* ── Question — LE SOUFFLE QUI S'ENROULE ET S'ARRÊTE. ── */
  question: (
    <>
      <path d="M8 8.4 C 8 5.4, 10.4 3.6, 12.7 4.1 C 15.5 4.7, 16.7 7.5, 15.2 9.7 C 14.1 11.3, 12 11.9, 12 14.6" />
      <path d={drop(12, 18.6, 2.8, 2.8)} />
    </>
  ),

  /* ── Remerciements — LA PAUME OUVERTE. On remercie en recevant. ── */
  remerciements: (
    <>
      <path d="M4.4 12.4 C 4.4 17.8, 8.2 20.6, 12 20.6 C 15.8 20.6, 19.6 17.8, 19.6 12.4" />
      <path d={drop(12, 13, 4, 4)} />
      <path d="M12 6.4 C 12 4.8, 12 3.8, 12 2.8" />
    </>
  ),

  /* ── Citation — LA PAROLE D'UN AUTRE. Deux virgules, un vide au milieu. ── */
  citation: (
    <>
      <path d="M3.2 7.6 C 6.8 8.2, 7.6 12.6, 4.8 15.4" />
      <path d="M8.4 7.6 C 12 8.2, 12.8 12.6, 10 15.4" />
      <path d="M20.8 16.4 C 17.2 15.8, 16.4 11.4, 19.2 8.6" />
      <path d="M15.6 16.4 C 12 15.8, 11.2 11.4, 14 8.6" />
    </>
  ),

  /* ── Texte — trois souffles posés, le dernier retenu. ── */
  texte: (
    <>
      <path d="M4 7.6 C 8.6 7, 15.4 7, 20 7.6" />
      <path d="M4 12 C 7.6 11.5, 12.4 11.5, 15.6 12" />
      <path d="M4 16.4 C 6.4 16, 8.6 16, 10.4 16.4" />
      <path d={drop(17.4, 16.2, 2.6, 2.6)} />
    </>
  ),

  /* ── Image — une goutte sous la lumière. ── */
  image: (
    <>
      <path d="M2.8 8.4 C 2.8 6, 4 5, 6.4 5 L 17.6 5 C 20 5, 21.2 6, 21.2 8.4 L 21.2 15.6 C 21.2 18, 20 19, 17.6 19 L 6.4 19 C 4 19, 2.8 18, 2.8 15.6 Z" />
      <path d={drop(11.2, 13.2, 3.6, 3.6)} />
      <path d="M16.6 9.6 C 17.2 9.6, 17.4 9.9, 17.4 10.4" />
    </>
  ),

  /* ── Vidéo — le souffle qui avance. ── */
  video: (
    <>
      <path d="M2.8 8.4 C 2.8 6, 4 5, 6.4 5 L 17.6 5 C 20 5, 21.2 6, 21.2 8.4 L 21.2 15.6 C 21.2 18, 20 19, 17.6 19 L 6.4 19 C 4 19, 2.8 18, 2.8 15.6 Z" />
      <path d="M10.2 8.8 C 13 10, 15.2 11.2, 15.8 12 C 15.2 12.8, 13 14, 10.2 15.2 C 10.6 13.4, 10.6 10.6, 10.2 8.8 Z" />
    </>
  ),

  /* ── Audio — une goutte et ce qu'elle propage. ── */
  audio: (
    <>
      <path d={drop(7.6, 12, 5, 5)} />
      <path d="M13.4 8.6 C 15.4 10.6, 15.4 13.4, 13.4 15.4" />
      <path d="M16.8 6.4 C 20 9.4, 20 14.6, 16.8 17.6" />
    </>
  ),

  /* ── Éclat — le « j'aime » maison : une goutte qui s'ouvre en quatre. ── */
  eclat: (
    <>
      <path d="M12 3 C 12 8.4, 13.6 10.6, 20.4 12 C 13.6 13.4, 12 15.6, 12 21 C 12 15.6, 10.4 13.4, 3.6 12 C 10.4 10.6, 12 8.4, 12 3 Z" />
    </>
  ),

  /* ── Parole — répondre. Le souffle qui revient vers l'autre. ── */
  parole: (
    <>
      <path d="M20.4 11.6 C 20.4 16.2, 16.6 19, 12 19 C 10.6 19, 9.3 18.8, 8.2 18.4 L 4.4 20.2 L 5.6 16.4 C 4.2 15.1, 3.6 13.4, 3.6 11.6 C 3.6 7, 7.4 4.2, 12 4.2 C 16.6 4.2, 20.4 7, 20.4 11.6 Z" />
    </>
  ),

  /* ── Rayon — envoyer. Une goutte lancée le long d'un souffle. ── */
  rayon: (
    <>
      <path d="M2.6 18.6 C 8.4 18, 16 14, 21.2 4.4" />
      <path d="M21.2 4.4 C 18.2 5, 15.6 5.4, 13 5.4" />
      <path d="M21.2 4.4 C 20.4 7.4, 19.8 10, 19 12.4" />
    </>
  ),

  /* ── Garder — mettre de côté. Un souffle replié sur lui-même. ── */
  garder: (
    <>
      <path d="M6 5.6 C 6 4.4, 7 3.8, 8.4 3.8 L 15.6 3.8 C 17 3.8, 18 4.4, 18 5.6 L 18 20.2 C 15.4 17.6, 13.6 16.2, 12 16.2 C 10.4 16.2, 8.6 17.6, 6 20.2 Z" />
      <path d={drop(12, 9.6, 3, 3)} />
    </>
  ),

  /* ── Diffuser — porter au dehors. Trois gouttes, deux souffles. ── */
  diffuser: (
    <>
      <path d={drop(18.2, 5.6, 3.4, 3.4)} />
      <path d={drop(18.2, 18.4, 3.4, 3.4)} />
      <path d={drop(5.4, 12, 3.4, 3.4)} />
      <path d="M8 10.6 C 11.4 9.4, 13.6 8.4, 15.6 7" />
      <path d="M8 13.4 C 11.4 14.6, 13.6 15.6, 15.6 17" />
    </>
  ),
}

export default function SouffleIcon({
  name,
  className = 'w-4 h-4',
  color,
  strokeWidth = 1.6,
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
