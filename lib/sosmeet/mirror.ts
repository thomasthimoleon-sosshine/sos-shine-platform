/**
 * SOS Meet, LE MIROIR DE SOI.
 * ---------------------------------------------------------------------------
 * Ce que le portrait fait pour les autres, le miroir le fait pour SOI : une
 * lecture intérieure, générée depuis les réponses, qui grandit à chaque palier.
 * Elle donne de la valeur à SOS Meet dès le premier jour, même sans match, et
 * relie chaque schéma repéré au protocole SOS Shine qui aide à le traverser.
 *
 * Voix de Julia : chaleureuse, lucide, jamais un jugement. On parle en « tu ».
 * 100 % déterministe, aucune saisie libre.
 */
import type { Answers } from './matching'

export type MirrorSchema = { title: string; body: string; protocol?: string }
export type Mirror = {
  intro: string
  forces: string[]
  schemas: MirrorSchema[]
  edge: string | null
}

function has(a: Answers, qid: string) { return a[qid] != null }

export function buildMirror(answers: Answers): Mirror {
  const a = answers

  // ── Tes forces (ce qui est déjà là) ──
  const forces: string[] = []
  if (a.q83 === 0) forces.push('Tu abordes le lien depuis une base sécure, c’est un socle rare et précieux.')
  if (a.q120 === 0) forces.push('Tu as fait le deuil de ton passé : tu arrives disponible, sans traîner d’ombre.')
  if (a.q116 === 2) forces.push('Tu as fait un vrai travail sur tes blessures, et ça se sent.')
  if (a.q95 != null && a.q95 >= 2) forces.push('Tu as appris à desserrer le contrôle, à laisser de la place à l’imprévu.')
  if (a.q125 != null && a.q125 <= 1) forces.push('La loyauté est un socle chez toi, pas une promesse en l’air.')
  if (a.q140 != null && a.q140 >= 3) forces.push('Tu te sens prêt·e pour du vrai, et ça change tout.')

  // ── Tes schémas (repérés avec douceur) + pont vers le protocole ──
  const schemas: MirrorSchema[] = []
  if (a.q87 === 0 || a.q87 === 1) schemas.push({
    title: 'La peur de l’abandon',
    body: 'Quand un lien devient sérieux, une peur d’être quitté·e peut s’activer, et te pousser à trop donner, ou à te crisper au moindre silence. La reconnaître, c’est déjà lui retirer du pouvoir.',
    protocol: 'la peur de l’abandon',
  })
  if (a.q88 === 0 || a.q80 === 0) schemas.push({
    title: 'La peur de perdre ta liberté',
    body: 'L’engagement peut réveiller la crainte d’être envahi·e. Tu protèges ton espace, parfois au prix de la proximité que tu désires pourtant.',
    protocol: 'le besoin de liberté dans le couple',
  })
  if (a.q95 != null && a.q95 <= 1) schemas.push({
    title: 'Le besoin de contrôle',
    body: 'Tu aimes maîtriser ce qui t’entoure. Dans le lien, lâcher prise et faire confiance à l’autre demande un effort conscient, mais c’est là que la vraie intimité commence.',
    protocol: 'le besoin de contrôle',
  })
  if (a.q83 === 1) schemas.push({
    title: 'Un attachement plutôt anxieux',
    body: 'Tu peux avoir besoin de réassurance ; les silences de l’autre pèsent plus lourd qu’ils ne le devraient. Ce n’est pas un défaut, c’est une sensibilité à apprivoiser.',
    protocol: 'l’attachement anxieux',
  })
  if (a.q83 === 2) schemas.push({
    title: 'Un attachement plutôt évitant',
    body: 'Quand ça se rapproche trop, une part de toi peut vouloir reprendre de la distance. Comprendre ce réflexe, c’est pouvoir choisir la proximité au lieu de la fuir.',
    protocol: 'l’attachement évitant',
  })
  if (a.q120 === 2) schemas.push({
    title: 'Un passé encore ouvert',
    body: 'Une histoire précédente n’est pas tout à fait refermée ; elle peut colorer tes prochaines rencontres sans que tu t’en rendes compte.',
    protocol: 'le deuil amoureux',
  })
  if (a.q116 === 0) schemas.push({
    title: 'Des blessures encore vives',
    body: 'Certaines blessures influencent encore ta façon d’entrer en lien. Les reconnaître, ici, c’est le premier pas pour ne plus les rejouer.',
    protocol: 'les blessures relationnelles',
  })

  const top = schemas.slice(0, 3)

  // ── Le point de vigilance (une invitation, pas un verdict) ──
  let edge: string | null = null
  if (top[0]) edge = `En ce moment, ton chemin passe surtout par là : ${top[0].title.toLowerCase()}. Ce n’est pas un obstacle à la rencontre, c’est l’endroit où elle peut te faire grandir.`
  else if (has(a, 'q83')) edge = 'Peu de schémas actifs se dégagent : tu arrives dans le lien avec une belle disponibilité. Continue à te dévoiler pour affiner ce reflet.'

  const intro = 'Voici ton miroir. Pas un jugement, un reflet, tissé à partir de ce que tu as répondu. Il s’affinera à mesure que tu te dévoiles.'

  return { intro, forces: forces.slice(0, 3), schemas: top, edge }
}
