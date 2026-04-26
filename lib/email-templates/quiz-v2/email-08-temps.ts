/**
 * Email 8 — L'objection temps (J+6 14h)
 */
import { wrapEmail, p, ctaButton, signature } from './wrapper'

const URL_SERENITE = 'https://buy.stripe.com/3cI5kvai06p51oJbgK5ZC0f'

type Vars = { firstName: string; email: string }

export function generateEmail08(vars: Vars): { subject: string; html: string } {
  const { firstName, email } = vars
  const subject = `${firstName ? firstName + ', ' : ''}"je n'ai pas le temps"`

  const content = [
    firstName ? p(`${firstName},`) : '',
    p(`La première chose que les gens me disent quand je leur parle de SOS Shine :`),
    p(`<em>"Je n'ai pas le temps."</em>`),
    p(`Je comprends. Je te l'ai dit au début : je suis passée par là.`),
    p(`Alors je veux te rassurer sur deux choses.`),
    p(`<strong style="color:#e0e0e0;">Un</strong> : les protocoles SOS Shine durent 10 à 15 minutes par jour. C'est le temps de ton café du matin.`),
    p(`<strong style="color:#e0e0e0;">Deux</strong> : si tu n'as pas 10 minutes pour toi, ce n'est pas un problème d'agenda. C'est un schéma. Et c'est exactement ce qu'on va traiter ensemble.`),
    p(`Les gens qui "n'ont pas le temps" sont souvent ceux qui en ont le plus besoin.`),
    p(`Est-ce que tu es de ceux-là ?`),
    ctaButton('Commencer mes 7 jours gratuits', URL_SERENITE),
    signature(),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
