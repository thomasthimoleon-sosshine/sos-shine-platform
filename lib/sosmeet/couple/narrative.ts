/**
 * SOS Meet Couple — le texte du diagnostic.
 * ---------------------------------------------------------------------------
 * Transforme les chiffres du croisement en une lecture écrite, adressée au
 * couple. Trois règles de ton, tenues dans le code :
 *
 *  1. On ouvre TOUJOURS par ce qui tient. Un couple qui découvre son
 *     diagnostic par ses fractures referme la page.
 *  2. On ne juge pas et on ne prescrit pas. On décrit ce que les réponses
 *     disent, et on nomme ce qui se répare en premier.
 *  3. On ne cite jamais une réponse. Le texte ne contient que des
 *     formulations du catalogue ci-dessous (invariant I1).
 *
 * Le texte est déterministe : mêmes réponses, même lecture. C'est ce qui
 * permet de le relire, de le corriger, et de le refaire dans six semaines
 * pour comparer.
 */
import type { Crossing } from './crossing'
import { pointsDOr, leviers } from './crossing'
import type { Dimension, DimensionFinding } from './types'

type Copy = {
  /** Ce que la dimension recouvre, en une phrase. */
  quoi: string
  faille: string
  malentendu: string
  usure: string
  point_or: string
  levier: string
}

const COPY: Record<Dimension, Copy> = {
  responsivite: {
    quoi: 'le fait de se sentir vraiment entendu quand on parle de soi',
    faille: 'L’un de vous se sent écouté, l’autre parle dans le vide. Ce n’est pas un désaccord d’opinion, c’est deux expériences différentes de la même conversation.',
    malentendu: 'L’un de vous ne se sent pas entendu, et l’autre est persuadé du contraire. C’est le genre d’écart qui se comble en une soirée, à condition que quelqu’un le dise.',
    usure: 'Vous avez tous les deux cessé d’attendre d’être entendus. C’est confortable et c’est ce qui vide une relation le plus sûrement.',
    point_or: 'Vous vous écoutez encore vraiment. C’est la fondation de tout le reste, et elle tient.',
    levier: 'Chacun raconte à l’autre quelque chose d’important, sans être interrompu, sans conseil à la fin. L’autre reformule ce qu’il a compris avant de répondre.',
  },
  communication: {
    quoi: 'la façon de dire ce qui ne va pas',
    faille: 'L’un pense que les choses se disent, l’autre trouve qu’elles s’attaquent. Vos deux lectures d’une même conversation ne se recoupent pas.',
    malentendu: 'L’un de vous croit s’exprimer calmement, et ce n’est pas ainsi que ça arrive. La façon de commencer une phrase décide souvent de la dispute entière.',
    usure: 'Vous avez tous les deux renoncé à dire. Les sujets évités s’accumulent, et le silence prend la place de la paix.',
    point_or: 'Vous arrivez à vous dire les choses. C’est plus rare qu’on ne le croit.',
    levier: 'Une règle simple : on commence par ce qu’on ressent, jamais par ce que l’autre a fait. La première phrase donne le ton des trente minutes suivantes.',
  },
  conflit: {
    quoi: 'ce qui se passe pendant une dispute',
    faille: 'Vos façons de vous disputer ne s’accordent pas. L’un avance quand l’autre se retire, et chacun trouve la réaction de l’autre injuste.',
    malentendu: 'L’un se ferme et l’autre l’interprète comme du mépris. Le retrait est presque toujours de la submersion, pas de l’indifférence.',
    usure: 'Vos disputes tournent en rond et vous le savez tous les deux. Les mêmes sujets reviennent parce qu’ils n’ont jamais été traités, seulement suspendus.',
    point_or: 'Vous vous disputez sans vous abîmer. C’est ce que la recherche observe chez les couples qui durent : pas moins de conflits, des conflits qui ne détruisent rien.',
    levier: 'Quand le ton monte, on nomme la submersion et on prend vingt minutes. Puis on revient. La pause n’est pas une fuite si elle est annoncée.',
  },
  reparation: {
    quoi: 'la capacité à revenir vers l’autre après',
    faille: 'L’un tend la main, l’autre ne la voit pas ou ne la prend pas. Le geste existe et n’arrive pas à destination.',
    malentendu: 'L’un de vous croit faire des gestes de réconciliation que l’autre ne reçoit pas comme tels. Ce sont souvent les plus discrets qui passent inaperçus.',
    usure: 'Le froid dure trop longtemps, des deux côtés. C’est le signal le plus sérieux de cette lecture : ce n’est pas la dispute qui use un couple, c’est le temps qu’il met à revenir.',
    point_or: 'Vous savez revenir l’un vers l’autre. C’est ce qui distingue le plus nettement les couples qui traversent de ceux qui se défont.',
    levier: 'Convenez d’un geste minuscule qui veut dire « je reviens ». Une phrase, un contact. Il n’a pas besoin de régler la dispute, seulement de rouvrir la porte.',
  },
  admiration: {
    quoi: 'le regard que vous portez encore l’un sur l’autre',
    faille: 'L’un de vous admire encore, l’autre beaucoup moins. Cet écart est le plus lourd de tous, parce qu’il se voit sans qu’on en parle.',
    malentendu: 'L’un de vous ne se sent plus estimé, et l’autre ne s’en doute pas. Ce qui blesse ici passe souvent par des riens : un ton, un regard, une plaisanterie.',
    usure: 'Vous vous êtes mutuellement déçus, et vous le savez. C’est le point le plus grave de cette lecture, et aussi celui sur lequel un couple peut reprendre pied le plus vite quand il décide de le regarder.',
    point_or: 'Vous êtes encore fiers l’un de l’autre. C’est le meilleur signe que ce diagnostic pouvait donner.',
    levier: 'Chacun nomme trois choses précises qu’il admire chez l’autre. Précises : pas « tu es gentil », mais ce qu’il ou elle a fait mardi.',
  },
  intimite: {
    quoi: 'la proximité, ce qu’on se confie',
    faille: 'L’un de vous se livre, l’autre garde. Le déséquilibre finit par peser sur celui qui donne.',
    malentendu: 'L’un se croit proche, l’autre se sent seul. Vivre ensemble et être intime sont deux choses différentes.',
    usure: 'Vous ne vous racontez plus. La logistique a remplacé la confidence, sans que personne ne l’ait décidé.',
    point_or: 'Vous vous confiez encore l’un à l’autre. C’est ce qui rend le reste réparable.',
    levier: 'Vingt minutes, deux fois par semaine, sans écran et sans sujet pratique. La contrainte paraît artificielle et c’est précisément ce qui la rend efficace.',
  },
  desir: {
    quoi: 'le désir et la vie intime',
    faille: 'Vos désirs ne sont pas au même endroit, et le sujet ne se parle plus. L’écart de désir est un des motifs les plus fréquents de séparation, et un des plus rarement abordés.',
    malentendu: 'L’un de vous croit le désir éteint chez l’autre, alors qu’il est seulement devenu réactif : il vient en réponse, pas spontanément. Beaucoup de couples se séparent sur ce contresens.',
    usure: 'Le désir s’est retiré des deux côtés. Ce n’est ni une faute ni une fatalité, mais cela ne reviendra pas tout seul.',
    point_or: 'Le désir est encore là, et vous pouvez en parler. Cette combinaison est plus rare que chacun des deux séparément.',
    levier: 'Reparlez du désir hors du lit et hors du moment. Le plus difficile n’est pas de recommencer, c’est d’en dire un mot sans que ce soit un reproche.',
  },
  securite: {
    quoi: 'le sentiment que le lien tient',
    faille: 'L’un se sent en sécurité, l’autre guette. Celui qui guette épuise ses réserves sans que ça se voie.',
    malentendu: 'L’un de vous a peur que le lien se dérobe, et l’autre ne l’imagine pas. La demande de réassurance est presque toujours lue comme de la méfiance, alors que c’est l’inverse.',
    usure: 'Aucun de vous ne se sent tout à fait en sécurité. Vous avancez chacun en protégeant vos arrières.',
    point_or: 'Le lien vous paraît solide à tous les deux. C’est ce qui permet de regarder le reste sans avoir peur.',
    levier: 'Nommez ce qui rassure chacun, concrètement. Ce n’est presque jamais ce que l’autre suppose.',
  },
  equite: {
    quoi: 'la répartition du quotidien et de la charge mentale',
    faille: 'Vous n’avez pas la même vision de ce qui est juste. Ce n’est pas une question de tâches, c’est une question de qui y pense.',
    malentendu: 'L’un porte plus que l’autre ne le voit. La charge mentale est invisible par construction : elle ne se compte pas en heures.',
    usure: 'Vous vous sentez tous les deux lésés. C’est fréquent et cela s’aggrave en silence.',
    point_or: 'Vous trouvez tous les deux la répartition juste. C’est plus rare qu’on ne le dit.',
    levier: 'Listez séparément qui pense à quoi, pas qui fait quoi. Comparez. La conversation qui suit est souvent la plus utile de l’année.',
  },
  projet: {
    quoi: 'ce vers quoi vous allez',
    faille: 'L’un se projette encore, l’autre non. C’est l’écart le plus lourd de conséquences, parce qu’il ne se négocie pas.',
    malentendu: 'L’un de vous doute que l’autre se projette encore, à tort. Le doute sur l’avenir change la façon d’habiter le présent.',
    usure: 'Aucun de vous ne se projette vraiment. La relation dure sans direction.',
    point_or: 'Vous vous voyez encore ensemble. C’est ce qui donne un sens à tout le travail que vous ferez.',
    levier: 'Dites-vous où vous vous voyez dans cinq ans, chacun son tour, sans commenter celui de l’autre avant qu’il ait fini.',
  },
  autonomie: {
    quoi: 'l’espace propre à chacun',
    faille: 'L’un étouffe, l’autre a besoin de plus de présence. Le besoin d’espace est presque toujours pris pour un désamour.',
    malentendu: 'L’un croit l’autre satisfait de son espace, et il ne l’est pas.',
    usure: 'Vous manquez tous les deux d’air. Un couple a besoin de deux personnes entières.',
    point_or: 'Chacun a son espace, et cela ne menace pas le lien.',
    levier: 'Protégez chacun un temps régulier qui n’appartient qu’à vous, et dites-le à voix haute plutôt que de le prendre en douce.',
  },
  rancoeur: {
    quoi: 'ce qui s’est accumulé et n’a pas été refermé',
    faille: 'L’un garde des choses que l’autre croit réglées. Ce déséquilibre alimente les disputes dont on ne comprend pas la violence.',
    malentendu: 'L’un de vous porte une blessure que l’autre ignore. Tant qu’elle n’est pas nommée, elle ressort par des chemins détournés.',
    usure: 'Vous portez tous les deux des choses non refermées. Elles pèsent sur des disputes qui n’ont rien à voir.',
    point_or: 'Vous ne traînez pas de vieux comptes. C’est un luxe et c’est un choix que vous avez fait.',
    levier: 'Une blessure à la fois, nommée sans procès, écoutée sans défense. Une par semaine, pas plus.',
  },
  valeurs: {
    quoi: 'ce sur quoi vous ne transigez pas',
    faille: 'Vous n’êtes pas d’accord sur ce qui compte. Ce n’est pas grave en soi, cela le devient quand on ne le sait pas.',
    malentendu: 'L’un vous croit alignés davantage que vous ne l’êtes.',
    usure: 'Vous avez cessé de croire que vous voulez la même chose.',
    point_or: 'Vous voulez la même vie. C’est le socle sur lequel le reste peut se reconstruire.',
    levier: 'Chacun écrit ses trois non-négociables. Comparez. La surprise est souvent bonne.',
  },
  respect: {
    quoi: 'la considération, l’inverse du contrôle',
    faille: 'L’un se sent respecté dans ses choix, l’autre non.',
    malentendu: 'L’un de vous ne se sent pas respecté dans ses décisions, et l’autre ne s’en rend pas compte.',
    usure: 'Vous vous sentez tous les deux peu respectés. C’est un point à regarder en priorité, avant tout exercice de reconnexion.',
    point_or: 'Vous vous respectez, y compris quand vous n’êtes pas d’accord.',
    levier: 'Chacun nomme une décision qu’il veut pouvoir prendre seul. L’autre écoute sans négocier.',
  },
}

/**
 * Ouverture.
 * La moyenne seule mentirait : un couple peut aller bien sur douze dimensions
 * et très mal sur deux, et la moyenne dirait « tout va bien » juste avant que
 * le texte annonce trois blocages. On regarde donc AUSSI le pire point, et on
 * tempère quand l'écart entre l'ensemble et le pire est important.
 * Même logique pour la lucidité : une moyenne haute ne doit pas faire écrire
 * « vous vous connaissez bien » quand un malentendu grave existe quelque part.
 */
function ouverture(sante: number, lucidite: number, pire: number, pireMalentendu: number): string {
  const contraste = sante >= 65 && pire >= 55

  const base =
    contraste
      ? 'Vos réponses décrivent une relation qui tient sur l’essentiel. Et pourtant, un endroit précis ressort nettement, assez pour peser sur le reste si personne ne le regarde.'
    : sante >= 75 ? 'Vos réponses décrivent une relation qui tient. Ce qui suit n’est pas une réparation, c’est un réglage.'
    : sante >= 55 ? 'Vos réponses décrivent une relation vivante, avec des endroits qui se sont tendus. Rien de ce qui suit n’est irréversible.'
    : sante >= 35 ? 'Vos réponses décrivent une relation fatiguée. Plusieurs choses se sont installées sans que personne ne les décide, et elles se regardent encore.'
    : 'Vos réponses décrivent une relation qui souffre des deux côtés. Ce texte ne va pas l’adoucir, parce que vous avez répondu franchement et que vous méritez la même franchise.'

  const suite =
    pireMalentendu >= 45
      ? ' Sur la plupart des sujets, vous vous lisez juste. Sur un point, non, et c’est celui-là qui compte : l’un de vous vit quelque chose que l’autre ne soupçonne pas.'
    : lucidite >= 80 ? ' Vous vous connaissez bien : vos perceptions de l’autre sont proches de ce que l’autre vit réellement.'
    : lucidite >= 60 ? ' Sur plusieurs points, ce que l’un imagine de l’autre s’écarte de ce que l’autre vit. C’est là que se trouve le plus de marge.'
    : ' Vous vous êtes perdus de vue : sur beaucoup de points, ce que l’un croit de l’autre ne correspond plus à ce que l’autre vit.'

  return base + suite
}

function porteur(f: DimensionFinding, prenomA: string, prenomB: string): string | null {
  if (f.porte_par === 'a') return prenomA
  if (f.porte_par === 'b') return prenomB
  return null
}

export type Narrative = {
  ouverture: string
  ceQuiTient: { titre: string; texte: string }
  laOuCaBloque: { dimension: Dimension; titre: string; texte: string; porte: string | null }[]
  leMalentendu: { titre: string; texte: string } | null
  parQuoiCommencer: { titre: string; texte: string }[]
  motDeFin: string
}

/**
 * Écrit la lecture. `prenomA` et `prenomB` servent uniquement à désigner qui
 * porte une difficulté : aucune réponse n'est jamais citée.
 */
export function buildNarrative(c: Crossing, prenomA = 'L’un de vous', prenomB = 'L’autre'): Narrative {
  const or = pointsDOr(c)
  const top = leviers(c)

  // ── Ce qui tient ──
  const ceQuiTient = or.length
    ? {
        titre: 'Ce qui tient',
        texte: or.map(f => COPY[f.dimension].point_or).join(' ') +
          (or.length >= 3 ? ' Ce n’est pas rien : c’est là-dessus que le reste va s’appuyer.' : ''),
      }
    : {
        titre: 'Ce qui tient',
        texte: 'Cette lecture ne fait ressortir aucun point franchement solide, et c’est en soi une information. ' +
          'Cela ne veut pas dire qu’il n’y a rien : cela veut dire que ce qui vous tient encore ensemble n’est pas passé ' +
          'dans vos réponses. C’est souvent le signe d’une fatigue, pas d’une fin.',
      }

  // ── Là où ça bloque ──
  const laOuCaBloque = top.map(f => {
    const copy = COPY[f.dimension]
    const qui = porteur(f, prenomA, prenomB)
    let texte = copy[f.verdict === 'point_or' ? 'usure' : f.verdict]
    if (qui && (f.verdict === 'malentendu' || f.verdict === 'faille')) {
      texte += ` Dans votre cas, c’est ${qui} qui porte cette difficulté.`
    }
    return { dimension: f.dimension, titre: f.label, texte, porte: qui }
  })

  // ── Le malentendu principal, mis en avant parce qu'il se répare ──
  const m = c.findings.find(f => f.verdict === 'malentendu' && f.malentendu >= 35)
  const leMalentendu = m
    ? {
        titre: 'Le malentendu à lever en premier',
        texte:
          `S’il ne fallait retenir qu’une chose : sur ${COPY[m.dimension].quoi}, ` +
          `ce que l’un de vous croit de l’autre ne correspond pas à ce que l’autre vit. ` +
          `Ce n’est pas un désaccord, c’est une information qui n’est jamais passée. ` +
          `Une conversation suffit parfois, à condition qu’elle ait lieu.`,
      }
    : null

  // ── Par quoi commencer ──
  const parQuoiCommencer = top.map(f => ({ titre: f.label, texte: COPY[f.dimension].levier }))

  const motDeFin =
    c.sante >= 55
      ? 'Rien de ce qui précède ne se règle en une soirée, et rien n’exige non plus des mois. Prenez un seul point, le premier, et tenez-le trois semaines.'
      : 'Ce texte est dur parce que vos réponses l’étaient. Il ne dit pas que c’est fini : il dit où regarder. Prenez un seul point, le premier, et tenez-le trois semaines avant de juger quoi que ce soit.'

  const pire = top.length ? top[0].impact : 0
  const pireMalentendu = c.findings.reduce((m, f) => Math.max(m, f.malentendu), 0)

  return {
    ouverture: ouverture(c.sante, c.lucidite, pire, pireMalentendu),
    ceQuiTient, laOuCaBloque, leMalentendu, parQuoiCommencer, motDeFin,
  }
}

/** Version texte continu, pour un e-mail ou un PDF. */
export function narrativeToText(n: Narrative): string {
  const L: string[] = []
  L.push(n.ouverture, '')
  L.push(n.ceQuiTient.titre.toUpperCase(), n.ceQuiTient.texte, '')
  if (n.laOuCaBloque.length) {
    L.push('LÀ OÙ ÇA BLOQUE')
    for (const b of n.laOuCaBloque) L.push(`${b.titre}. ${b.texte}`, '')
  }
  if (n.leMalentendu) L.push(n.leMalentendu.titre.toUpperCase(), n.leMalentendu.texte, '')
  if (n.parQuoiCommencer.length) {
    L.push('PAR QUOI COMMENCER')
    n.parQuoiCommencer.forEach((p, i) => L.push(`${i + 1}. ${p.titre}. ${p.texte}`))
    L.push('')
  }
  L.push(n.motDeFin)
  return L.join('\n')
}
