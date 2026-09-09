/**
 * SOS Shine — Séquences de cycle de vie (Files A / B / C + Lettre)
 * Source de vérité : les deux documents de Julia
 *  — « Version Cadeaux » (séquence Signature) et « Le Meilleur Derrière Les 14 » (files A/B/C + Lettre).
 *
 * Ces files se branchent APRÈS la séquence Signature (16 mails). Règle absolue :
 * une personne n'est jamais dans deux files à la fois (voir lib/crm/lifecycle-router.ts).
 *
 * On réutilise le wrapper premium de la séquence quiz-v2 pour garder un rendu identique.
 */
import { wrapEmail, p, signature, ctaButton, ctaLink } from '@/lib/email-templates/quiz-v2/wrapper'

export const APP = 'https://sosshine.com'
export const URLS = {
  espace: `${APP}/dashboard`,
  protocole: `${APP}/dashboard`,
  abonnement: `${APP}/dashboard/profil`,
  rejoindre: `${APP}/rejoindre`,
  cadeaux: `${APP}/dashboard`,
  encyclopedie: `${APP}/dashboard/encyclopedie`,
}

export type StepVars = { firstName: string; email: string }

/** Un P.S. au style maison (petit, discret, voix Julia). */
export function ps(text: string): string {
  return p(`<br><em style="font-size:12px;color:#737373;">P.S. : ${text}</em>`)
}

/** Ligne d'accroche personnalisée « Coucou Shiner » qui tombe bien avec ou sans prénom. */
export function shinerHello(firstName: string, rest: string): string {
  return p(firstName ? `Coucou Shiner, ${rest}` : `Coucou Shiner, ${rest}`)
}

/**
 * Un pas de séquence : sujet + corps HTML prêt à envoyer.
 * `delay` = jours après l'entrée dans la file. `order` = position (1..n).
 */
export type LifecycleStep = {
  order: number
  delay: number
  label: string
  build: (v: StepVars) => { subject: string; html: string }
}

export type LifecycleSequence = {
  triggerType: string
  name: string
  steps: LifecycleStep[]
}

// Ré-exports pratiques pour les fichiers de file.
export { wrapEmail, p, signature, ctaButton, ctaLink }
