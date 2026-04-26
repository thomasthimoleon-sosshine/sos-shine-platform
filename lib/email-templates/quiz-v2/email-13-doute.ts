/**
 * Email 13 — Le doute (J+11 14h)
 */
import { wrapEmail, p, testimonialBlock, ctaButton, signature, spacer } from './wrapper'

const URL_SERENITE = 'https://buy.stripe.com/3cI5kvai06p51oJbgK5ZC0f'

type Vars = { firstName: string; email: string }

export function generateEmail13(vars: Vars): { subject: string; html: string } {
  const { firstName, email } = vars
  const subject = `${firstName ? firstName + ', j' : 'J'}e doute aussi parfois`

  const content = [
    firstName ? p(`${firstName},`) : '',
    p(`Je vais te dire quelque chose que personne ne dit dans le développement personnel.`),
    p(`Parfois, je doute.`),
    p(`Parfois, je me demande si ce qu'on fait sert vraiment à quelque chose. Si les gens vont vraiment appliquer les protocoles. Si on n'est pas juste en train de vendre un rêve de plus.`),
    p(`Et puis je reçois un message comme celui d'hier soir :`),
    spacer(8),
    testimonialBlock(
      `Julia, je voulais te remercier. Hier pour la première fois en 10 ans, j'ai dit non à quelqu'un sans me sentir coupable.<br><br>Sans culpabilité. Sans re-justification. Juste un non tranquille.<br><br>Je ne pensais pas que c'était possible pour moi.`,
      'Marie, membre depuis 4 mois'
    ),
    spacer(16),
    p(`Et là, je me dis : c'est pour ça qu'on continue.`),
    p(`C'est peut-être pour toi aussi que ça existe.`),
    ctaButton('Rejoindre SOS Shine', URL_SERENITE),
    signature(),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
