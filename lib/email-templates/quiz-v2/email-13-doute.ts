/**
 * Email 13 - Il m'arrive de douter, moi aussi (J+11)
 */
import { wrapEmail, p, testimonialBlock, ctaButton, ctaLink, signature, spacer } from './wrapper'

const URL_SERENITE  = 'https://buy.stripe.com/4gM6oz4XGdRx4AV3Oi5ZC0r'
const URL_PROTOCOLE = 'https://buy.stripe.com/9B600b2PycNtd7r98C5ZC0q'

type Vars = { firstName: string; email: string }

export function generateEmail13(vars: Vars): { subject: string; html: string } {
  const { firstName, email } = vars
  const subject = `Il m'arrive de douter, moi aussi.`

  const content = [
    p(`Je vais te dire quelque chose d'important aujourd'hui. Parfois, je doute aussi. Pas de la psychologie. Pas du cerveau. Pas du fait qu'une vie puisse réellement être transformée. Je doute surtout de nous. Les humains. Avec tout ce que je vois, je me demande parfois si les gens vont réellement se choisir. S'ils vont vraiment appliquer ce qu'ils savent. Ou s'ils vont continuer à attendre encore des années avant d'oser vivre pleinement.`),
    p(`Parce que la vérité, c'est que changer fait peur. Même quand on souffre. Même quand on étouffe. Même quand chaque cellule du corps demande autre chose. La peur du changement est souvent plus forte que la douleur de rester là où on est.`),
    p(`Et puis parfois, je reçois un message qui me rappelle exactement pourquoi SOS Shine existe.`),
    p(`L'année dernière, pendant les bêta-tests privés de la plateforme en 2025, une femme qui faisait partie des toutes premières personnes à entrer dans SOS Shine m'a écrit après plusieurs semaines de protocoles.`),
    p(`Elle m'a dit :`),
    spacer(8),
    testimonialBlock(
      `Julia, aujourd'hui pour la première fois depuis des années, j'ai réussi à dire non sans culpabiliser. Sans me justifier. Sans me sentir mauvaise. Sans angoisser pendant des heures après.<br><br>Juste un non calme et normal.<br><br>Je ne pensais pas que c'était possible pour moi.`,
      'Bêta-test SOS Shine, 2025'
    ),
    spacer(16),
    p(`J'ai relu ce message plusieurs fois. Parce qu'au fond, ce qui change vraiment une vie, ce n'est pas la lenteur ou la rapidité du changement. C'est la décision. La décision peut être fulgurante. Instantanée. Tranchante. Moi, le jour où j'ai décidé de divorcer, ça a été net. Sans appel. Une décision qui s'est imposée d'un seul coup et qui n'a plus jamais bougé. C'est ce passage à l'action immédiat qui m'a permis de me choisir et de tout changer.`),
    p(`Mais le chemin qui suit, lui, se construit petit à petit. Un non posé calmement, là où il y avait toujours eu un oui de peur. Une respiration plus ample en se réveillant le matin. Une réaction qui ne part plus en pilote automatique. Un silence qu'on s'autorise enfin, au lieu de remplir le vide à toute vitesse.`),
    p(`Chaque petit pas compte. Pas parce qu'il est spectaculaire, mais parce qu'il découle d'une décision claire prise à un moment précis. La décision de ne plus continuer comme avant.`),
    p(`Voilà ce que c'est, vraiment, recommencer à se respecter. D'abord, décider. Puis avancer, un pas après l'autre, sur le chemin qu'on a enfin osé prendre. Et c'est exactement pour ça qu'on continue à construire SOS Shine, avec William, Thomas et toute l'équipe. Pour accompagner ce moment de décision, et tous les pas qui suivent.`),
    p(`Peut-être que si tu lis encore mes mails aujourd'hui, ce n'est pas un hasard non plus.`),
    p(`Peut-être qu'une décision est en train de mûrir en toi.`),
    ctaButton('Rejoindre SOS Shine - 49,90€/mois', URL_SERENITE, { email }),
    ctaLink('Accéder à mon protocole uniquement - 33€ →', `${URL_PROTOCOLE}?prefilled_email=${encodeURIComponent(email)}`),
    p(`À demain.`),
    signature(),
    p(`<br><em style="font-size:12px;color:#737373;">P.S. : Cette femme dont je viens de te parler, elle continue son chemin sur la plateforme. Elle n'a pas guéri en six semaines. Elle n'est pas devenue une autre personne. Elle est juste, doucement, en train de redevenir elle-même. C'est tout ce qu'on cherche à offrir. Pas une métamorphose. Une reconnexion.</em>`),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
