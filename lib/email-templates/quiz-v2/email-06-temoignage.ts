/**
 * Email 6 — Le témoignage qui parle (J+4 14h)
 */
import { wrapEmail, p, testimonialBlock, ctaButton, signature, spacer } from './wrapper'

const URL_SERENITE = 'https://buy.stripe.com/3cI5kvai06p51oJbgK5ZC0f'

type Vars = { firstName: string; email: string }

export function generateEmail06(vars: Vars): { subject: string; html: string } {
  const { firstName, email } = vars
  const subject = `"J'ai pleuré en lisant ma Signature"`

  const content = [
    firstName ? p(`${firstName},`) : '',
    p(`Il y a quelques mois, j'ai reçu ce message d'une membre :`),
    spacer(8),
    testimonialBlock(
      `J'ai fait votre test. J'ai pleuré en lisant ma Signature.<br><br>Pas de tristesse. De soulagement.<br><br>Pour la première fois depuis 15 ans, quelqu'un mettait des mots sur ce que je portais sans pouvoir le dire.<br><br>J'ai commencé mon protocole le lendemain. Aujourd'hui, trois mois plus tard, je ne suis plus la même femme.`,
      'Camille, 41 ans'
    ),
    spacer(16),
    p(`Je te raconte ça parce que Camille avait le même profil que toi.`),
    p(`Elle portait les mêmes choses. Ressentait la même fatigue.`),
    p(`Aujourd'hui, elle a un protocole qui l'accompagne chaque matin. Une communauté qui la voit vraiment. Des lives où elle vient juste "respirer".`),
    p(`Tu peux avoir exactement ça.`),
    ctaButton('Rejoindre SOS Shine — 7 jours gratuits', URL_SERENITE),
    signature(),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
