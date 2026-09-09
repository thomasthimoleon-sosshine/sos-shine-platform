/**
 * SOS Meet, L'AMORCE DE CONVERSATION consciente.
 * ---------------------------------------------------------------------------
 * Au match, la photo se dévoile, mais le premier mot compte encore plus. On
 * génère un point commun réel (depuis les deux questionnaires) et une question
 * ouverte, profonde, pour démarrer autrement que par « slt ça va ».
 * Déterministe, aucune donnée sensible exposée : on ne renvoie que le texte.
 */
import type { Answers } from './matching'

export type Icebreaker = { commonGround: string | null; question: string }

const QUESTIONS_SPIRIT = [
  'Qu’est-ce qui t’a le plus fait grandir sur ton chemin intérieur, cette année ?',
  'C’est quoi, pour toi, un lien qui rend plus libre plutôt que plus petit ?',
]
const QUESTIONS_ENGAGE = [
  'Qu’est-ce que tu n’es plus prêt·e à accepter en amour ?',
  'À quoi tu reconnais que c’est du vrai, et pas juste une belle histoire ?',
]
const QUESTIONS_TENDRE = [
  'Qu’est-ce qui te fait te sentir vraiment en sécurité avec quelqu’un ?',
  'De quoi tu as le plus besoin quand tu tiens à une personne ?',
]
const QUESTIONS_DEFAULT = [
  'Qu’est-ce qui te touche vraiment chez quelqu’un, au-delà de l’apparence ?',
  'Raconte-moi un moment où tu t’es senti·e pleinement toi-même.',
]

function pickStable(list: string[], seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return list[Math.abs(h) % list.length]
}

export function buildIcebreaker(mine: Answers, theirs: Answers, seed = ''): Icebreaker {
  const both = (qid: string, pred: (v: number) => boolean) =>
    mine[qid] != null && theirs[qid] != null && pred(mine[qid]) && pred(theirs[qid])

  // ── Un point commun réel ──
  let commonGround: string | null = null
  let bucket = QUESTIONS_DEFAULT
  if (both('q166', (v) => v <= 1)) { commonGround = 'Vous partagez tous les deux un vrai chemin intérieur.'; bucket = QUESTIONS_SPIRIT }
  else if (both('q104', (v) => v === 0)) { commonGround = 'Vous avez la même vision de l’exclusivité.'; bucket = QUESTIONS_ENGAGE }
  else if (both('q140', (v) => v >= 3)) { commonGround = 'Vous vous sentez prêts, tous les deux.'; bucket = QUESTIONS_ENGAGE }
  else if (both('q131', (v) => v === 0)) { commonGround = 'L’envie de fonder une famille vous rapproche.'; bucket = QUESTIONS_ENGAGE }
  else if (both('q83', (v) => v === 0)) { commonGround = 'Vous abordez le lien depuis une base sécure.'; bucket = QUESTIONS_TENDRE }
  else if (both('q168', (v) => v === 1)) { commonGround = 'Vous êtes tous les deux en quête de transformation.'; bucket = QUESTIONS_SPIRIT }

  return { commonGround, question: pickStable(bucket, seed || 'sosmeet') }
}
