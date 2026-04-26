/**
 * Email 7 — Une pratique gratuite (J+5 9h)
 */
import { wrapEmail, p, h2, quoteBlock, signature, spacer } from './wrapper'

type Vars = { firstName: string; email: string; topProtocol: string }

export function generateEmail07(vars: Vars): { subject: string; html: string } {
  const { firstName, email, topProtocol } = vars
  const subject = `${firstName ? firstName + ', e' : 'E'}ssaie ça pendant 3 minutes`

  const content = [
    firstName ? p(`${firstName},`) : '',
    p(`Je vais te donner quelque chose de concret.`),
    p(`Une micro-pratique que j'utilise avec tous nos membres, tirée du protocole <strong style="color:#e0e0e0;">${topProtocol}</strong>.`),
    p(`Ça prend 3 minutes. Tu peux la faire maintenant.`),
    spacer(8),
    quoteBlock(`1. Assieds-toi. Ferme les yeux.<br><br>2. Pose ta main sur ta poitrine.<br><br>3. Respire. Lentement. Cinq respirations.<br><br>4. Dis intérieurement : "Je vois ce que je porte. Je n'ai plus besoin de le porter seul(e)."<br><br>5. Reste avec cette phrase. Sens ce qui bouge.`),
    spacer(16),
    p(`Essaie. Puis dis-moi ce qui s'est passé.`),
    p(`(Vraiment. Tu peux répondre à cet email. C'est moi qui le lis.)`),
    signature(),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
