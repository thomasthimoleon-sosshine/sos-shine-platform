/**
 * SOS Meet Couple, numérologie.
 * Arithmétique pure et déterministe : cette couche est entièrement exacte,
 * elle ne dépend d'aucune éphéméride et ne demande que la date de naissance.
 * Convention retenue : les nombres maîtres 11, 22 et 33 ne sont pas réduits.
 */

function reduire(n: number, garderMaitres = true): number {
  while (n > 9) {
    if (garderMaitres && (n === 11 || n === 22 || n === 33)) return n
    n = String(n).split('').reduce((s, c) => s + Number(c), 0)
  }
  return n
}

/** Chemin de vie : la somme réduite de la date de naissance entière. */
export function cheminDeVie(iso: string): number {
  const digits = iso.slice(0, 10).replace(/\D/g, '')
  return reduire(digits.split('').reduce((s, c) => s + Number(c), 0))
}

/** Année personnelle : jour + mois + année en cours, réduits. */
export function anneePersonnelle(iso: string, annee: number): number {
  const [, m, j] = iso.slice(0, 10).split('-').map(Number)
  const somme = reduire(j, false) + reduire(m, false) + reduire(annee, false)
  return reduire(somme, false)
}

export const CHEMIN_LABEL: Record<number, string> = {
  1: 'l’élan et l’initiative', 2: 'le lien et la sensibilité', 3: 'l’expression et la joie',
  4: 'la construction et la solidité', 5: 'le mouvement et la liberté', 6: 'le soin et la responsabilité',
  7: 'l’intériorité et l’analyse', 8: 'la puissance et le concret', 9: 'le don et le recul',
  11: 'l’intuition, en tension permanente', 22: 'le bâtisseur à grande échelle', 33: 'le soin porté au collectif',
}

export type NumerologieCouple = {
  cheminA: number
  cheminB: number
  labelA: string
  labelB: string
  /** Nombre du couple : les deux chemins additionnés puis réduits. */
  nombreCouple: number
  labelCouple: string
  /** Lecture de la rencontre des deux chemins. */
  lecture: string
  anneeA: number
  anneeB: number
  memeAnnee: boolean
}

const COUPLE_LABEL: Record<number, string> = {
  1: 'un couple qui avance en ouvrant la route', 2: 'un couple dont la matière première est le lien lui-même',
  3: 'un couple qui a besoin de s’exprimer et de créer', 4: 'un couple qui construit du durable',
  5: 'un couple qui étouffe s’il ne bouge pas', 6: 'un couple qui se réalise en prenant soin',
  7: 'un couple qui a besoin de profondeur et de silence', 8: 'un couple qui se mesure à ce qu’il bâtit concrètement',
  9: 'un couple tourné vers plus grand que lui', 11: 'un couple à forte intensité, brillant et exigeant',
  22: 'un couple capable de projets qui dépassent le foyer', 33: 'un couple qui donne beaucoup au dehors',
}

export function numerologieCouple(isoA: string, isoB: string, annee: number): NumerologieCouple {
  const a = cheminDeVie(isoA), b = cheminDeVie(isoB)
  const nombreCouple = reduire(reduire(a, false) + reduire(b, false))
  const anneeA = anneePersonnelle(isoA, annee), anneeB = anneePersonnelle(isoB, annee)

  const ecart = Math.abs(reduire(a, false) - reduire(b, false))
  const lecture =
    a === b
      ? 'Vous suivez le même chemin. C’est une évidence entre vous, et le risque est de vous renforcer dans les mêmes angles morts.'
      : ecart <= 2
        ? 'Vos chemins sont voisins : vous vous comprenez vite, et vous vous confrontez peu.'
        : ecart >= 5
          ? 'Vos chemins sont très différents. C’est ce qui vous a attirés et c’est aussi ce qui fatigue, quand chacun demande à l’autre d’avancer à son rythme.'
          : 'Vos chemins se croisent sans se confondre. Il y a assez d’écart pour apprendre l’un de l’autre.'

  return {
    cheminA: a, cheminB: b,
    labelA: CHEMIN_LABEL[a] || '', labelB: CHEMIN_LABEL[b] || '',
    nombreCouple, labelCouple: COUPLE_LABEL[nombreCouple] || '',
    lecture, anneeA, anneeB, memeAnnee: anneeA === anneeB,
  }
}
