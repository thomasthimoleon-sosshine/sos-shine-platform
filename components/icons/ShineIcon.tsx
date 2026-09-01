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
  // Thèmes Shine TV
  | 'healing'
  | 'meditation'
  | 'confidence'
  | 'relationships'
  | 'resilience'
  | 'sleep'
  | 'masterclass'
  | 'children'
  // Familles Shine Audible
  | 'podcast'
  | 'audiobook'
  | 'histoire'
  | 'hypnose'
  | 'ambiance'
  // Actions
  | 'eclat'
  | 'parole'
  | 'rayon'
  | 'garder'
  | 'diffuser'
  // Concepts de contenu & thèmes (bibliothèque, shorts, audible)
  | 'livre'
  | 'guide'
  | 'journal'
  | 'protocole'
  | 'deuil'
  | 'amourpropre'
  | 'anxiete'
  | 'cours'
  | 'astuce'
  | 'respiration'
  | 'defi'
  | 'calendrier'
  // Emblèmes de niveaux (Étincelle → Diamant)
  | 'niveau1'
  | 'niveau2'
  | 'niveau3'
  | 'niveau4'
  | 'niveau5'
  | 'niveau6'
  | 'niveau7'
  | 'niveau8'
  | 'niveau9'
  | 'niveau10'

  // Back-office — les notions propres à l’administration
  | 'tableau'
  | 'courbe'
  | 'boussole'
  | 'palette'
  | 'maison'
  | 'laboratoire'
  | 'envol'
  | 'membres'
  | 'carte'
  | 'automate'
  | 'enveloppe'
  | 'dossier'
  | 'virement'
  | 'cible'
  | 'plume'
  | 'couronne'
  | 'coeur'
  | 'tente'
  | 'chapiteau'
  | 'entree'
  | 'cle'
  | 'balance'
  | 'cadenas'
  | 'reglages'
  | 'monnaie'
  | 'alerte'
  | 'oeil'
  | 'globe'
  | 'horloge'
  | 'bouclier'
  | 'sante'
  | 'institution'
  | 'chantier'
  | 'valide'
  | 'epingle'
  | 'corbeille'

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

  /* ══════════════ THÈMES SHINE TV ══════════════
     Mêmes primitives : la facette et le rai. Rien d'emprunté à un clavier. */

  /* ── Guérison intérieure — CE QUI SE REFERME. La forme extérieure est
       encore ouverte ; le cœur, lui, est intact. ── */
  healing: (
    <>
      <path d="M12 3.6 L20.4 12 L12 20.4" />
      <path d="M12 3.6 L4.8 10.8" />
      <path d="M12 20.4 L4.8 13.2" />
      <path d="M12 9.4 L14.6 12 L12 14.6 L9.4 12 Z" />
    </>
  ),

  /* ── Méditations guidées — CE QUI SE POSE. Une facette au repos, et le
       souffle qui passe au-dessus. ── */
  meditation: (
    <>
      <path d="M4.6 19.6 h14.8" />
      <path d="M12 11 L15.6 15.3 L12 19.6 L8.4 15.3 Z" />
      <path d="M7.4 7.8 a5.8 5.8 0 0 1 9.2 0" />
    </>
  ),

  /* ── Confiance en soi — CE QUI SE TIENT DEBOUT. Une facette portée par
       son propre axe, sur une base large. ── */
  confidence: (
    <>
      <path d="M12 3.2 L16.2 8.4 L12 13.6 L7.8 8.4 Z" />
      <path d="M12 13.6 v6.2" />
      <path d="M6.4 19.8 h11.2" />
    </>
  ),

  /* ── Relations saines — DEUX QUI TIENNENT ENSEMBLE. Deux facettes qui
       partagent une arête, sans se confondre. ── */
  relationships: (
    <>
      <path d="M8.8 5.4 L13.2 12 L8.8 18.6 L4.4 12 Z" />
      <path d="M15.2 5.4 L19.6 12 L15.2 18.6 L10.8 12 Z" />
    </>
  ),

  /* ── Résilience — CE QUI PLIE SANS ROMPRE. Le choc traverse la facette
       et ne l'ouvre pas. ── */
  resilience: (
    <>
      <path d="M12 3.4 L19.6 12 L12 20.6 L4.4 12 Z" />
      <path d="M13.8 7.2 L10.2 11.6 h3.4 L10.2 16.6" />
    </>
  ),

  /* ── Sommeil & Détente — LE REPOS. Le croissant, et une facette pour
       veiller à côté. ── */
  sleep: (
    <>
      <path d="M16.2 4 a8.4 8.4 0 1 0 3.6 11.6 a6.6 6.6 0 0 1 -3.6 -11.6 Z" />
      <path d="M19.4 5.2 L20.9 6.7 L19.4 8.2 L17.9 6.7 Z" />
    </>
  ),

  /* ── Masterclass — CE QUI SE TRANSMET. Une facette en hauteur, et ce
       qu'elle envoie de part et d'autre. ── */
  masterclass: (
    <>
      <path d="M12 3.6 L16.4 9 L12 14.4 L7.6 9 Z" />
      <path d="M4.6 19.8 h14.8" />
      <path d="M6.6 16.8 L9.2 14.2" />
      <path d="M17.4 16.8 L14.8 14.2" />
    </>
  ),

  /* ── Enfants — LE PETIT ET LE GRAND. Deux facettes de tailles
       différentes, reliées. ── */
  children: (
    <>
      <path d="M8.2 8.4 L12.4 14.2 L8.2 20 L4 14.2 Z" />
      <path d="M17.2 4.2 L19.9 7.8 L17.2 11.4 L14.5 7.8 Z" />
      <path d="M11.6 11.6 L14.8 8.8" />
    </>
  ),

  /* ══════════════ FAMILLES SHINE AUDIBLE ══════════════ */

  /* ── Podcast — LA VOIX QUI PORTE. Une facette suspendue, tenue par son
       arc, posée sur son pied. ── */
  podcast: (
    <>
      <path d="M12 2.8 L14.9 8.4 L12 14 L9.1 8.4 Z" />
      <path d="M6.6 10.2 a5.4 5.4 0 0 0 10.8 0" />
      <path d="M12 15.6 v3.8" />
      <path d="M8.6 19.4 h6.8" />
    </>
  ),

  /* ── Livre audio — LE LIVRE QUI PARLE. Le livre ouvert, et ce qu'il
       émet au-dessus. ── */
  audiobook: (
    <>
      <path d="M3.4 7.4 L11.5 8.8 L11.5 19.2 L3.4 17.8 Z" />
      <path d="M20.6 7.4 L12.5 8.8 L12.5 19.2 L20.6 17.8 Z" />
      <path d="M12 2 L13.5 3.8 L12 5.6 L10.5 3.8 Z" />
    </>
  ),

  /* ── Histoire — LE LIVRE OUVERT. Le même signe, sans la voix : ce qui
       se lit et non ce qui s'entend. ── */
  histoire: (
    <>
      <path d="M3.4 5.8 L11.5 7.2 L11.5 18.6 L3.4 17.2 Z" />
      <path d="M20.6 5.8 L12.5 7.2 L12.5 18.6 L20.6 17.2 Z" />
    </>
  ),

  /* ── Hypnose — CE QUI ENROULE. Une spirale taillée à angles droits,
       pas une volute décorative. ── */
  hypnose: (
    <>
      <path d="M12 12.6 L14.6 12.6 L14.6 9 L9 9 L9 16.2 L17.6 16.2 L17.6 5.6 L5.6 5.6" />
    </>
  ),

  /* ── Ambiance — CE QUI EMPLIT L'ESPACE. Pas de source : le son vient
       de partout. C'est ce qui la distingue d'« Audio ». ── */
  ambiance: (
    <>
      <path d="M12 9.9 L13.5 12 L12 14.1 L10.5 12 Z" />
      <path d="M9.2 9 a4.2 4.2 0 0 0 0 6" />
      <path d="M14.8 9 a4.2 4.2 0 0 1 0 6" />
      <path d="M6.2 6.6 a7.6 7.6 0 0 0 0 10.8" />
      <path d="M17.8 6.6 a7.6 7.6 0 0 1 0 10.8" />
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

  /* ── Livre — un ouvrage ouvert. ── */
  livre: (
    <>
      <path d="M12 6 C 9 4.5, 5 4.5, 3.5 5.5 V18 C 5 17, 9 17, 12 18.5 C 15 17, 19 17, 20.5 18 V5.5 C 19 4.5, 15 4.5, 12 6 Z" />
      <path d="M12 6 V18.5" />
    </>
  ),

  /* ── Guide — un document qui montre le chemin. ── */
  guide: (
    <>
      <path d="M6 3.5 h9 l4 4 V20.5 H6 Z" />
      <path d="M15 3.5 V7.5 H19" />
      <path d="M9 12 h7" /><path d="M9 15 h7" />
    </>
  ),

  /* ── Journal — le carnet que l'on tient. ── */
  journal: (
    <>
      <path d="M7 4 h11 v16 H7 Z" />
      <path d="M7 4 v16" />
      <path d="M4.5 6 h3" /><path d="M4.5 10 h3" /><path d="M4.5 14 h3" /><path d="M4.5 18 h3" />
    </>
  ),

  /* ── Protocole — les étapes cochées, une à une. ── */
  protocole: (
    <>
      <path d="M4.5 6.5 L6 8 L9 5" /><path d="M4.5 12 L6 13.5 L9 10.5" /><path d="M4.5 17.5 L6 19 L9 16" />
      <path d="M12 6.5 h7.5" /><path d="M12 12 h7.5" /><path d="M12 17.5 h7.5" />
    </>
  ),

  /* ── Deuil — la colombe qui s'apaise. ── */
  deuil: (
    <>
      <path d="M5 15 C 5 9, 11 5, 19 5 C 19 12, 14 17, 8 17 C 8 17, 6.5 16.5 5 15 Z" />
      <path d="M9.5 12.5 C 12 11, 14.5 9.5, 17 8" />
    </>
  ),

  /* ── Amour de soi — le cœur et sa facette. ── */
  amourpropre: (
    <>
      <path d="M12 20 C 4 14.5, 4 8, 8 7 C 10 6.5, 11.5 8, 12 9 C 12.5 8, 14 6.5, 16 7 C 20 8, 20 14.5, 12 20 Z" />
      <path d="M12 12 L13.4 14 L12 16 L10.6 14 Z" />
    </>
  ),

  /* ── Anxiété — l'esprit que l'on apaise. ── */
  anxiete: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M7.5 13 C 9 10.5, 10.5 15.5, 12 13 C 13.5 10.5, 15 15.5, 16.5 13" />
    </>
  ),

  /* ── Cours — apprendre, la toque. ── */
  cours: (
    <>
      <path d="M12 5 L21 9 L12 13 L3 9 Z" />
      <path d="M6.5 10.6 V15 C 6.5 15, 9 17 12 17 C 15 17, 17.5 15 17.5 15 V10.6" />
      <path d="M21 9 V13.5" />
    </>
  ),

  /* ── Astuce — l'idée qui s'allume. ── */
  astuce: (
    <>
      <path d="M9 15 C 6.5 13.5, 6 9, 9 7 C 11 5.7, 13 5.7, 15 7 C 18 9, 17.5 13.5 15 15 Z" />
      <path d="M9.5 15 v2 h5 v-2" />
      <path d="M10.5 19.5 h3" />
    </>
  ),

  /* ── Respiration — le souffle qui va et vient. ── */
  respiration: (
    <>
      <path d="M3.5 9 C 8 9, 8 6, 12 6 C 15.5 6, 15.5 9.5 18.5 9.5 A 2.5 2.5 0 1 0 16 7" />
      <path d="M3.5 15 C 9 15, 9 18, 13 18 A 2.3 2.3 0 1 0 10.7 15.7" />
    </>
  ),

  /* ── Défi — la cible, au centre une facette. ── */
  defi: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8 L14 12 L12 16 L10 12 Z" />
    </>
  ),

  /* ── Calendrier — la date, un jour marqué d'une facette. ── */
  calendrier: (
    <>
      <path d="M4.5 6 h15 v14 h-15 Z" />
      <path d="M4.5 10 h15" />
      <path d="M8 3.5 v4" /><path d="M16 3.5 v4" />
      <path d="M12 13 L13.4 15 L12 17 L10.6 15 Z" />
    </>
  ),

  /* ── Niveau 1 · Étincelle — une étincelle à quatre rais. ── */
  niveau1: (
    <path d="M12 4 L13.4 10.6 L20 12 L13.4 13.4 L12 20 L10.6 13.4 L4 12 L10.6 10.6 Z" />
  ),

  /* ── Niveau 2 · Lueur — l'étincelle et son halo. ── */
  niveau2: (
    <>
      <path d="M12 6.6 L13 11 L17.4 12 L13 13 L12 17.4 L11 13 L6.6 12 L11 11 Z" />
      <circle cx="12" cy="12" r="9.4" />
    </>
  ),

  /* ── Niveau 3 · Flamme — le feu qui prend. ── */
  niveau3: (
    <>
      <path d="M12 3.4 C 15 8, 16.6 10.6, 15.6 14 A 3.6 3.6 0 1 1 8.4 14 C 8 11.4, 10 9, 12 3.4 Z" />
      <path d="M12 11.8 C 12.9 13.4, 11.7 15.6, 12 17.2" />
    </>
  ),

  /* ── Niveau 4 · Rayon — la facette et ses rais. ── */
  niveau4: (
    <>
      <path d="M12 8.4 L14 12 L12 15.6 L10 12 Z" />
      <path d="M12 2.6 V5" /><path d="M12 19 V21.4" /><path d="M2.6 12 H5" /><path d="M19 12 H21.4" />
      <path d="M5.4 5.4 l1.7 1.7" /><path d="M16.9 16.9 l1.7 1.7" /><path d="M18.6 5.4 l-1.7 1.7" /><path d="M7.1 16.9 l-1.7 1.7" />
    </>
  ),

  /* ── Niveau 5 · Éclat — le brillant taillé. ── */
  niveau5: (
    <>
      <path d="M7 5 H17 L21 9 L12 20.5 L3 9 Z" />
      <path d="M3 9 H21" />
      <path d="M7 5 L9.5 9 L12 20.5" />
      <path d="M17 5 L14.5 9 L12 20.5" />
    </>
  ),

  /* ── Niveau 6 · Lumière — le rayonnement plein. ── */
  niveau6: (
    <>
      <path d="M12 9.4 L13.5 12 L12 14.6 L10.5 12 Z" />
      <path d="M12 2.4 V4.4" /><path d="M12 19.6 V21.6" /><path d="M2.4 12 H4.4" /><path d="M19.6 12 H21.6" />
      <path d="M4.9 4.9 l1.4 1.4" /><path d="M17.7 17.7 l1.4 1.4" /><path d="M19.1 4.9 l-1.4 1.4" /><path d="M6.3 17.7 l-1.4 1.4" />
      <path d="M7.8 3.4 l0.8 1.8" /><path d="M15.4 18.8 l0.8 1.8" /><path d="M3.4 16.2 l1.8-0.8" /><path d="M18.8 8.6 l1.8-0.8" />
    </>
  ),

  /* ── Niveau 7 · Aura — la couronne de facettes. ── */
  niveau7: (
    <>
      <path d="M4 16.5 L6 8.5 L9.5 13.5 L12 6.5 L14.5 13.5 L18 8.5 L20 16.5 Z" />
      <path d="M4.6 19.4 H19.4" />
    </>
  ),

  /* ── Niveau 8 · Prisme — la lumière qui se sépare. ── */
  niveau8: (
    <>
      <path d="M12 3.6 L20.4 18.4 H3.6 Z" />
      <path d="M12 3.6 V18.4" />
      <path d="M8 18.4 L14 11" />
    </>
  ),

  /* ── Niveau 9 · Constellation — les points reliés. ── */
  niveau9: (
    <>
      <path d="M5 7 L11 11 L17 6 L19 13 L13 17 L7 15 Z" />
      <circle cx="5" cy="7" r="1.1" /><circle cx="11" cy="11" r="1.1" /><circle cx="17" cy="6" r="1.1" />
      <circle cx="19" cy="13" r="1.1" /><circle cx="13" cy="17" r="1.1" /><circle cx="7" cy="15" r="1.1" />
    </>
  ),

  /* ── Niveau 10 · Diamant — le brillant achevé. ── */
  niveau10: (
    <>
      <path d="M6 4 H18 L22 10 L12 21 L2 10 Z" />
      <path d="M2 10 H22" />
      <path d="M6 4 L9 10 L12 21" />
      <path d="M18 4 L15 10 L12 21" />
      <path d="M9 10 H15" />
    </>
  ),

  /* ═══════════════════════════════════════════════════════════════
     BACK-OFFICE — même grammaire : facette taillée, rai droit.
     Le back-office était le seul écran encore en émojis système.
     ═══════════════════════════════════════════════════════════════ */

  /* ── Tableau de bord — CE QU'ON MESURE. Trois colonnes, une facette au sommet. ── */
  tableau: (
    <>
      <path d="M3.4 4.4 h7 v6.2 h-7 Z" />
      <path d="M13.6 4.4 h7 v6.2 h-7 Z" />
      <path d="M3.4 13.4 h7 v6.2 h-7 Z" />
      <path d="M13.6 13.4 h7 v6.2 h-7 Z" />
      <path d="M17.1 15.2 L18.7 16.5 L17.1 17.8 L15.5 16.5 Z" />
    </>
  ),

  /* ── Analytique — LA PENTE. Le trait monte, la facette marque où il arrive. ── */
  courbe: (
    <>
      <path d="M3.4 20.4 h17.2" />
      <path d="M4.6 16.8 L9 12.4 L12.4 15 L16.6 9.8" />
      <path d="M19 4.6 L21 7.4 L19 10.2 L17 7.4 Z" />
    </>
  ),

  /* ── Parcours — L'AIGUILLE. Elle cherche le nord dans un cercle fermé. ── */
  boussole: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M15.6 8.4 L13.4 13.4 L8.4 15.6 L10.6 10.6 Z" />
    </>
  ),

  /* ── Mise en forme — LA PALETTE. Deux facettes posées, comme deux teintes. ── */
  palette: (
    <>
      <path d="M12 3.6 a8.4 8.4 0 1 0 0 16.8 c1.3 0 2-.8 2-1.8 0-1.4 1-2.1 2.1-2.1 h1.5 a2.8 2.8 0 0 0 2.8-2.8 C20.4 7.5 16.6 3.6 12 3.6 Z" />
      <path d="M8.4 9.2 L9.7 11 L8.4 12.8 L7.1 11 Z" />
      <path d="M13.2 7.4 L14.5 9.2 L13.2 11 L11.9 9.2 Z" />
    </>
  ),

  /* ── Page d'accueil — LE TOIT. Ce qu'on montre d'abord. ── */
  maison: (
    <>
      <path d="M3.6 10.6 L12 3.8 L20.4 10.6 V20.4 H3.6 Z" />
      <path d="M12 12.2 L13.8 14.6 L12 17 L10.2 14.6 Z" />
    </>
  ),

  /* ── Essai comparé — L'ÉPROUVETTE. On verse, on regarde, on tranche. ── */
  laboratoire: (
    <>
      <path d="M9.6 3.8 v5.2 L5 18.2 a1.7 1.7 0 0 0 1.5 2.4 h11 a1.7 1.7 0 0 0 1.5 -2.4 L14.4 9 V3.8 Z" />
      <path d="M8.6 3.8 h6.8" />
      <path d="M7.2 14.6 h9.6" />
    </>
  ),

  /* ── Lancement — L'ENVOL. La facette part, deux rais restent au sol. ── */
  envol: (
    <>
      <path d="M12 2.8 L15.3 9.6 L12 13.2 L8.7 9.6 Z" />
      <path d="M12 13.2 v4.2" />
      <path d="M8.9 20.4 L10.5 16.8" />
      <path d="M15.1 20.4 L13.5 16.8" />
    </>
  ),

  /* ── Membres — LES PRÉSENCES. Deux facettes, deux arcs qui les portent. ── */
  membres: (
    <>
      <path d="M8.8 4.4 L11.2 7.6 L8.8 10.8 L6.4 7.6 Z" />
      <path d="M16.8 6.6 L18.8 9.2 L16.8 11.8 L14.8 9.2 Z" />
      <path d="M2.8 20 a6 6 0 0 1 12 0" />
      <path d="M16.6 15 a4.6 4.6 0 0 1 4.6 5" />
    </>
  ),

  /* ── Abonnement — LA CARTE. Une bande, une facette pour la signature. ── */
  carte: (
    <>
      <path d="M3.6 6.4 h16.8 a1.5 1.5 0 0 1 1.5 1.5 v8.2 a1.5 1.5 0 0 1 -1.5 1.5 h-16.8 a1.5 1.5 0 0 1 -1.5 -1.5 v-8.2 a1.5 1.5 0 0 1 1.5 -1.5 Z" />
      <path d="M2.1 10.4 h19.8" />
      <path d="M17 13.4 L18.5 15 L17 16.6 L15.5 15 Z" />
    </>
  ),

  /* ── Automate — CE QUI PARLE SANS PERSONNE. Une facette en guise d'antenne. ── */
  automate: (
    <>
      <path d="M6.6 8.2 h10.8 a1.6 1.6 0 0 1 1.6 1.6 v6.8 a1.6 1.6 0 0 1 -1.6 1.6 h-10.8 a1.6 1.6 0 0 1 -1.6 -1.6 v-6.8 a1.6 1.6 0 0 1 1.6 -1.6 Z" />
      <path d="M12 2.8 L13.2 4.6 L12 6.4 L10.8 4.6 Z" />
      <path d="M12 6.4 v1.8" />
      <path d="M9.6 12 v1.6" />
      <path d="M14.4 12 v1.6" />
      <path d="M3.4 11.6 v3.2" />
      <path d="M20.6 11.6 v3.2" />
    </>
  ),

  /* ── Courrier — LE PLI. Ce qui arrive fermé. ── */
  enveloppe: (
    <>
      <path d="M3 6 h18 v12 H3 Z" />
      <path d="M3 6 L12 13.2 L21 6" />
    </>
  ),

  /* ── Candidature — LE DOSSIER. Ce qu'on dépose et qu'on relit. ── */
  dossier: (
    <>
      <path d="M3.2 6.4 h6 l1.8 2.4 h9.8 v11.2 H3.2 Z" />
      <path d="M9 13.6 h6" />
      <path d="M9 16.4 h6" />
    </>
  ),

  /* ── Retrait — CE QUI SORT. La facette descend et quitte le plateau. ── */
  virement: (
    <>
      <path d="M12 3.4 L14 6.4 L12 9.4 L10 6.4 Z" />
      <path d="M12 9.4 v6" />
      <path d="M8.8 12.4 L12 15.6 L15.2 12.4" />
      <path d="M4.4 19.6 h15.2" />
    </>
  ),

  /* ── Objectif — LA CIBLE. Deux cercles, la facette au centre. ── */
  cible: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 10.1 L13.5 12 L12 13.9 L10.5 12 Z" />
    </>
  ),

  /* ── Écrire — LA PLUME. Le trait d'un seul geste. ── */
  plume: (
    <>
      <path d="M4.2 19.8 C 4.2 12.2, 10 5.4, 19.8 4.2 C 18.6 14, 11.8 19.8, 4.2 19.8 Z" />
      <path d="M4.2 19.8 L12.4 11.6" />
    </>
  ),

  /* ── Fondation — LA COURONNE. Trois pointes, dont une facette. ── */
  couronne: (
    <>
      <path d="M3.4 17.6 L5.4 7.4 L9.4 12 L12 5.8 L14.6 12 L18.6 7.4 L20.6 17.6 Z" />
      <path d="M6.2 20.4 h11.6" />
    </>
  ),

  /* ── Lien humain — LE CŒUR. Une facette battante à l'intérieur. ── */
  coeur: (
    <>
      <path d="M12 20.2 C 4.6 15.4, 3.4 10.8, 5.7 8.2 C 7.6 6, 10.6 6.6, 12 9.1 C 13.4 6.6, 16.4 6, 18.3 8.2 C 20.6 10.8, 19.4 15.4, 12 20.2 Z" />
      <path d="M12 11.6 L13.5 13.6 L12 15.6 L10.5 13.6 Z" />
    </>
  ),

  /* ── Rassemblement — LA TENTE. On s'abrite ensemble, autour du même feu. ── */
  tente: (
    <>
      <path d="M12 3.8 L20.6 19.8 H3.4 Z" />
      <path d="M12 3.8 V19.8" />
      <path d="M9 19.8 L12 13.4 L15 19.8" />
    </>
  ),

  /* ── Rencontre réelle — LE CHAPITEAU. Ce qui se monte pour un jour. ── */
  chapiteau: (
    <>
      <path d="M3.4 11.2 C 3.4 6.6, 7.2 3.6, 12 3.6 C 16.8 3.6, 20.6 6.6, 20.6 11.2 Z" />
      <path d="M3.4 11.2 V20.4 H20.6 V11.2" />
      <path d="M12 3.6 V11.2" />
      <path d="M9.4 20.4 L12 14.2 L14.6 20.4" />
    </>
  ),

  /* ── Ce qui entre — LA CORBEILLE D'ARRIVÉE. La facette tombe dedans. ── */
  entree: (
    <>
      <path d="M3.4 13.4 h4.6 l1.4 2.4 h5.2 l1.4 -2.4 h4.6 v6.4 H3.4 Z" />
      <path d="M12 3.6 v6.8" />
      <path d="M9 7.6 L12 10.6 L15 7.6" />
    </>
  ),

  /* ── Accès — LA CLÉ. Elle ouvre, elle ne force pas. ── */
  cle: (
    <>
      <circle cx="15.4" cy="8.6" r="4.2" />
      <path d="M12.4 11.6 L3.6 20.4" />
      <path d="M6.2 17.8 L8.4 20" />
      <path d="M8.6 15.4 L10.8 17.6" />
    </>
  ),

  /* ── Mentions légales — LA BALANCE. Deux plateaux, un axe. ── */
  balance: (
    <>
      <path d="M12 4.4 v15.2" />
      <path d="M5.4 7 h13.2" />
      <path d="M8.4 19.8 h7.2" />
      <path d="M5.4 7 L2.8 13 h5.2 Z" />
      <path d="M18.6 7 L16 13 h5.2 Z" />
    </>
  ),

  /* ── Confidentialité — LE CADENAS. Ce qui reste à l'intérieur. ── */
  cadenas: (
    <>
      <path d="M5.6 10.4 h12.8 v9.8 H5.6 Z" />
      <path d="M8.4 10.4 V7.6 a3.6 3.6 0 0 1 7.2 0 v2.8" />
      <path d="M12 13.6 L13.4 15.3 L12 17 L10.6 15.3 Z" />
    </>
  ),

  /* ── Réglages — LES CURSEURS. Trois rais, trois facettes qu'on déplace. ── */
  reglages: (
    <>
      <path d="M3.6 7.4 h16.8" />
      <path d="M3.6 12 h16.8" />
      <path d="M3.6 16.6 h16.8" />
      <path d="M8.6 5.6 L10.4 7.4 L8.6 9.2 L6.8 7.4 Z" />
      <path d="M15.4 10.2 L17.2 12 L15.4 13.8 L13.6 12 Z" />
      <path d="M10.6 14.8 L12.4 16.6 L10.6 18.4 L8.8 16.6 Z" />
    </>
  ),

  /* ── Recette — LA PIÈCE. Ce qui entre vraiment. ── */
  monnaie: (
    <>
      <path d="M12 4.4 c 4.2 0 6.6 1.1 6.6 2.4 s -2.4 2.4 -6.6 2.4 s -6.6 -1.1 -6.6 -2.4 s 2.4 -2.4 6.6 -2.4 Z" />
      <path d="M5.4 6.8 v4.4 c 0 1.3 2.4 2.4 6.6 2.4 s 6.6 -1.1 6.6 -2.4 V6.8" />
      <path d="M5.4 11.2 v4.4 c 0 1.3 2.4 2.4 6.6 2.4 s 6.6 -1.1 6.6 -2.4 v-4.4" />
    </>
  ),

  /* ── Alerte — CE QUI NE PEUT PAS ATTENDRE. ── */
  alerte: (
    <>
      <path d="M12 3.6 L21.4 20 H2.6 Z" />
      <path d="M12 9.6 v4.4" />
      <path d="M12 16.2 L12.9 17.2 L12 18.2 L11.1 17.2 Z" />
    </>
  ),

  /* ── Suivi — L'ŒIL. Une facette pour pupille : on regarde, on ne surveille pas. ── */
  oeil: (
    <>
      <path d="M2.4 12 C 5.4 7.2, 8.8 5.4, 12 5.4 C 15.2 5.4, 18.6 7.2, 21.6 12 C 18.6 16.8, 15.2 18.6, 12 18.6 C 8.8 18.6, 5.4 16.8, 2.4 12 Z" />
      <path d="M12 9 L14.2 12 L12 15 L9.8 12 Z" />
    </>
  ),

  /* ── Portée — LE GLOBE. Jusqu'où ça va. ── */
  globe: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M3.6 12 h16.8" />
      <path d="M12 3.6 C 14.9 6.4, 14.9 17.6, 12 20.4 C 9.1 17.6, 9.1 6.4, 12 3.6 Z" />
    </>
  ),

  /* ── Durée — L'HORLOGE. Le temps passé, pas le temps qui presse. ── */
  horloge: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 7.2 V12 l3.4 2.4" />
    </>
  ),

  /* ── Protection — LE BOUCLIER. Une facette gardée au centre. ── */
  bouclier: (
    <>
      <path d="M12 3.4 L19.6 6.2 v6 C 19.6 16.6, 16.2 19.6, 12 20.6 C 7.8 19.6, 4.4 16.6, 4.4 12.2 v-6 Z" />
      <path d="M12 9.4 L13.8 12 L12 14.6 L10.2 12 Z" />
    </>
  ),

  /* ── Santé — LA CROIX. Deux rais qui se croisent, rien de plus. ── */
  sante: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 7.8 v8.4" />
      <path d="M7.8 12 h8.4" />
    </>
  ),

  /* ── Institution — LE FRONTON. Ce qui est dû à la collectivité. ── */
  institution: (
    <>
      <path d="M3.4 9.4 L12 4.4 L20.6 9.4 Z" />
      <path d="M5.8 9.4 v8.2" />
      <path d="M10 9.4 v8.2" />
      <path d="M14 9.4 v8.2" />
      <path d="M18.2 9.4 v8.2" />
      <path d="M3.4 20.4 h17.2" />
    </>
  ),

  /* ── Charges — CE QU'ON BÂTIT. Deux volumes, une facette posée. ── */
  chantier: (
    <>
      <path d="M3.4 20.4 h17.2" />
      <path d="M5.8 20.4 V11 h5.4 v9.4" />
      <path d="M11.2 20.4 V6.6 h6.8 v13.8" />
      <path d="M14.6 10.4 L15.9 12 L14.6 13.6 L13.3 12 Z" />
    </>
  ),

  /* ── Acquis — LA MARQUE. Ce qui est fait ne se rediscute pas. ── */
  valide: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M8.2 12.2 L10.9 14.9 L15.8 9.6" />
    </>
  ),

  /* ── Épinglé — CE QU'ON GARDE EN HAUT. ── */
  epingle: (
    <>
      <path d="M9.4 3.6 h5.2 v6 l2.6 3.4 H6.8 l2.6 -3.4 Z" />
      <path d="M12 13 v7.4" />
    </>
  ),

  /* ── Supprimer — CE QU'ON RETIRE. Jamais dessiné en rouge : la couleur vient du contexte. ── */
  corbeille: (
    <>
      <path d="M4.4 6.6 h15.2" />
      <path d="M9.4 6.6 V4.2 h5.2 v2.4" />
      <path d="M6.6 6.6 L7.6 20.4 h8.8 L17.4 6.6" />
      <path d="M10.4 10.2 v6.2" />
      <path d="M13.6 10.2 v6.2" />
    </>
  ),
}

/**
 * Tous les signes disponibles, dans l'ordre où ils sont dessinés.
 * Sert à valider un nom qui vient de la base : le back-office peut y ranger
 * un nom de signe maison, jamais un émoji système.
 */
export const NOMS_SIGNES = Object.keys(PATHS) as ShineIconName[]

/** Vrai si `nom` désigne un signe maison existant. */
export function estSigneShine(nom: string | null | undefined): nom is ShineIconName {
  return typeof nom === 'string' && Object.prototype.hasOwnProperty.call(PATHS, nom)
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
