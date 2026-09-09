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
  | 'shorts'
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

  /* ── Texte — repris tel quel des Éclats (choix de Julia) : trois rais
       posés, le dernier taillé en facette. ── */
  texte: (
    <>
      <path d="M4 7.5 h16" />
      <path d="M4 12 h11" />
      <path d="M4 16.5 h6" />
      <path d="M16.6 16.5 L18.6 14.5 L20.6 16.5 L18.6 18.5 Z" />
    </>
  ),

  /* ── Image — CE QUI EST TENU. Une goutte dans un cadre large et adouci. ── */
  image: (
    <>
      <path d="M1.4 9.4 C 1.4 7.4, 2.6 6.6, 4.6 6.6 L 19.4 6.6 C 21.4 6.6, 22.6 7.4, 22.6 9.4 L 22.6 14.6 C 22.6 16.6, 21.4 17.4, 19.4 17.4 L 4.6 17.4 C 2.6 17.4, 1.4 16.6, 1.4 14.6 Z" />
      <path d={drop(9.6, 13, 3.4, 3.4)} />
      <path d="M17 9.8 C 17.6 9.8, 17.9 10.1, 17.9 10.7" />
    </>
  ),

  /* ── Vidéo — CE QUI AVANCE. Le cadre disparaît, la traîne apparaît. ── */
  video: (
    <>
      <path d="M9.6 5.4 C 14 7.6, 19 10.4, 20.8 12 C 19 13.6, 14 16.4, 9.6 18.6 C 11 15.6, 11 8.4, 9.6 5.4 Z" />
      <path d="M6.4 8.8 C 7 8.8, 7.4 8.8, 7.8 8.8" />
      <path d="M3 12 C 4.2 12, 5.4 12, 6.6 12" />
      <path d="M6.4 15.2 C 7 15.2, 7.4 15.2, 7.8 15.2" />
    </>
  ),

  /* ── Shorts — LE FIL VERTICAL. Un écran debout et le geste qui le fait
       défiler, au-dessus et en dessous. ── */
  shorts: (
    <>
      <path d="M6 7.4 C 6 5.4, 7 4.6, 9 4.6 L 15 4.6 C 17 4.6, 18 5.4, 18 7.4 L 18 16.6 C 18 18.6, 17 19.4, 15 19.4 L 9 19.4 C 7 19.4, 6 18.6, 6 16.6 Z" />
      <path d="M10.4 9.2 C 12.4 10.2, 14.2 11.4, 14.8 12 C 14.2 12.6, 12.4 13.8, 10.4 14.8 C 11 13.2, 11 10.8, 10.4 9.2 Z" />
      <path d="M9.4 2.2 C 10.6 1.9, 13.4 1.9, 14.6 2.2" />
      <path d="M9.4 21.8 C 10.6 22.1, 13.4 22.1, 14.6 21.8" />
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

  /* ── Rayon — repris tel quel des Éclats (choix de Julia) : un rai lancé
       depuis la facette. ── */
  rayon: (
    <>
      <path d="M5.4 8.6 L8.4 12 L5.4 15.4 L2.4 12 Z" />
      <path d="M9.2 12 h11" />
      <path d="M16.4 8.2 L20.6 12 L16.4 15.8" />
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
