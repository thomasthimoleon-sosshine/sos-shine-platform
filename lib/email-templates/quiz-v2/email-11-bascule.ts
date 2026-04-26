/**
 * Email 11 — La bascule commerciale (J+9 10h)
 */
import { wrapEmail, p, ctaButton, signature } from './wrapper'

const URL_SERENITE = 'https://buy.stripe.com/3cI5kvai06p51oJbgK5ZC0f'

type Vars = { firstName: string; email: string }

export function generateEmail11(vars: Vars): { subject: string; html: string } {
  const { firstName, email } = vars
  const subject = `${firstName ? firstName + ', 5' : '5'} jours pour décider`

  const content = [
    firstName ? p(`${firstName},`) : '',
    p(`Je vais être directe.`),
    p(`Ça fait 9 jours que tu as découvert ta Signature.`),
    p(`9 jours pendant lesquels ton schéma a continué de tourner.`),
    p(`9 jours où tu as peut-être relu ton résultat 3 ou 4 fois en te disant <em>"il faudrait que je fasse quelque chose"</em>.`),
    p(`Je ne te jugerai jamais pour ça. La plupart des gens font la même chose. C'est humain.`),
    p(`Mais je veux aussi te dire ça :`),
    p(`<strong style="color:#e0e0e0;">Dans 5 jours, je vais arrêter de t'écrire.</strong> Tu rentreras dans une newsletter classique (un email par semaine, moins intime).`),
    p(`C'est maintenant, dans cette fenêtre, que les choses peuvent vraiment commencer pour toi.`),
    p(`7 jours gratuits. Aucune carte bleue sauvegardée si tu annules. Aucune question posée.`),
    p(`Tu n'as rien à perdre. Tout à essayer.`),
    ctaButton('Commencer mes 7 jours gratuits', URL_SERENITE),
    signature(),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
