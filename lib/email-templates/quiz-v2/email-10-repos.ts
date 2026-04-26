/**
 * Email 10 — Jour de repos (J+8 18h)
 */
import { wrapEmail, p, quoteBlock, signature, spacer } from './wrapper'

type Vars = { firstName: string; email: string }

export function generateEmail10(vars: Vars): { subject: string; html: string } {
  const { firstName, email } = vars
  const subject = `${firstName ? firstName + ', u' : 'U'}ne pensée pour toi ce soir`

  const content = [
    firstName ? p(`${firstName},`) : '',
    p(`Pas de vente ce soir.`),
    p(`Juste une phrase que je te laisse :`),
    spacer(8),
    quoteBlock(`Tu n'es pas obligé(e) de tout comprendre pour commencer à changer. Tu dois juste commencer.`),
    spacer(16),
    p(`Bonne soirée.`),
    signature(),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
