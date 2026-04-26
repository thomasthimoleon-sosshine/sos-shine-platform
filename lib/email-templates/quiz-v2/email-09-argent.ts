/**
 * Email 9 — L'objection argent (J+7 14h)
 */
import { wrapEmail, p, ctaButton, signature, goldDivider } from './wrapper'

const URL_SERENITE = 'https://buy.stripe.com/3cI5kvai06p51oJbgK5ZC0f'

type Vars = { firstName: string; email: string }

export function generateEmail09(vars: Vars): { subject: string; html: string } {
  const { firstName, email } = vars
  const subject = `${firstName ? firstName + ', c' : 'C'}ombien vaut ta paix intérieure ?`

  const content = [
    firstName ? p(`${firstName},`) : '',
    p(`Je vais te dire un truc.`),
    p(`Une séance individuelle avec un thérapeute coûte entre 60€ et 120€. Tu en as besoin d'une par semaine pendant des mois pour commencer à voir un changement. Fais le calcul.`),
    p(`Un stage weekend de développement personnel coûte 300€ à 800€. Pour une transformation qui dure trois jours.`),
    p(`SOS Shine, c'est 49,90€ par mois (avec 7 jours gratuits).`),
    goldDivider(),
    p(`Pour avoir :`),
    p(`— Un protocole personnalisé chaque mois<br>— Une communauté qui te comprend<br>— Des lives avec Julia, William et Thomas<br>— Des soins collectifs mensuels<br>— Des méditations et hypnoses à la demande<br>— Une encyclopédie de 200+ schémas émotionnels`),
    goldDivider(),
    p(`Moins qu'une séance mensuelle chez un thérapeute. Infiniment plus qu'un stage weekend.`),
    p(`Et tu peux arrêter quand tu veux.`),
    ctaButton('Essayer 7 jours gratuits', URL_SERENITE),
    signature(),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
