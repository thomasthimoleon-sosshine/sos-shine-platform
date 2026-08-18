/**
 * Email 14 - Les 3 phrases qu'on se dit pour ne pas commencer (J+12)
 */
import { wrapEmail, p, h3, ctaButton, ctaLink, signature, goldDivider } from './wrapper'

const URL_SERENITE  = 'https://buy.stripe.com/4gM6oz4XGdRx4AV3Oi5ZC0r'
const URL_PROTOCOLE = 'https://buy.stripe.com/9B600b2PycNtd7r98C5ZC0q'

type Vars = { firstName: string; email: string }

export function generateEmail14(vars: Vars): { subject: string; html: string } {
  const { firstName, email } = vars
  const subject = `Les 3 phrases qu'on se dit pour ne pas commencer.`

  const content = [
    p(`Dans deux jours, cette séquence d'emails se terminera. Et honnêtement, je pense déjà connaître les raisons qui te font hésiter. Parce que ce sont presque toujours les mêmes.`),
    goldDivider(),
    h3(`1. "Je ne suis pas sûr·e que ça puisse vraiment marcher pour moi."`),
    p(`Je comprends.`),
    p(`Quand on a déjà essayé énormément de choses, des thérapies, des stages, des livres, des podcasts, on finit par se protéger pour éviter d'être encore déçu·e. C'est même une intelligence du système nerveux : il essaie de t'éviter une nouvelle frustration.`),
    p(`Mais cette protection peut aussi devenir une prison.`),
    p(`Parce qu'à force d'éviter d'être déçue, on finit par ne plus rien essayer du tout. On reste exactement là où on est, en se disant qu'on a "trop d'expérience pour y croire encore".`),
    p(`C'est justement pour ça qu'il y a 7 jours gratuits sur SOS Shine. Pour que tu ressentes par toi-même, sans pression, sans engagement, si cet endroit te parle vraiment. Si la voix qu'on y entend résonne avec ce que tu cherches. Si la méthode du déconditionnement parle à ton corps autant qu'à ton mental.`),
    goldDivider(),
    h3(`2. "Ce n'est pas le bon moment."`),
    p(`Je vais être honnête avec toi. Le cerveau trouve toujours une raison d'attendre.`),
    p(`Après les vacances. Après cette période compliquée au travail. Après ce projet qui prend du temps. Après les fêtes. Après janvier. Après le déménagement. Quand les enfants seront plus grands.`),
    p(`Mais souvent, le vrai problème n'est pas le timing. C'est la peur du changement.`),
    p(`Et la peur du changement ne disparaît pas avec le temps. Elle se déguise. Elle devient "je suis débordé·e". Elle devient "j'ai d'autres priorités". Elle devient "ce n'est pas le bon moment".`),
    p(`Le bon moment n'existe pas. Il y a juste un moment qu'on choisit. Ou un moment qu'on laisse passer.`),
    goldDivider(),
    h3(`3. "Je le ferai plus tard."`),
    p(`Celle-là, je la connais très bien.`),
    p(`Parce que moi aussi, pendant longtemps, j'ai repoussé certaines décisions qui auraient pu changer ma vie plus tôt. J'ai dit "plus tard" à des choses qui m'appelaient depuis des années.`),
    p(`Et puis un jour, j'ai compris quelque chose.`),
    p(`"Plus tard" est souvent une manière polie de dire "jamais".`),
    p(`Une manière élégante de rester dans une vie qui ne nous convient plus vraiment, tout en se rassurant en se disant qu'un jour, ça changera. Tout seul. Sans qu'on ait à prendre la décision difficile.`),
    p(`Mais la vie ne change pas toute seule. Elle change le jour où on décide, ou quand la vie le fera à ta place, ce jour là, tu n'auras plus le choix.`),
    goldDivider(),
    p(`Si tu es honnête avec toi-même, il y a probablement une de ces phrases qui résonne en toi en lisant ce mail. Et ce n'est pas grave. C'est même normal. Ces résistances font partie de tout chemin de changement. Mais peut-être qu'aujourd'hui, il est temps d'arrêter de laisser tes anciens schémas décider à ta place.`),
    p(`Tu n'as pas besoin d'être prêt(e) à 100%. Tu as juste besoin de faire un premier pas.`),
    ctaButton('Rejoindre SOS Shine - 49,90€/mois', URL_SERENITE, { email }),
    ctaLink('Accéder à mon protocole uniquement - 33€ →', `${URL_PROTOCOLE}?prefilled_email=${encodeURIComponent(email)}`),
    p(`À demain.`),
    signature(),
    p(`<br><em style="font-size:12px;color:#737373;">P.S. : Si tu hésites encore, fais juste un exercice ce soir. Relis ces 3 phrases. Et demande-toi : "Laquelle est-ce que je me dis le plus souvent ? Et qu'est-ce qu'elle protège, en moi ?" Souvent, c'est sous une de ces phrases que se cache la vraie peur. Et la nommer, c'est déjà commencer à la désamorcer.</em>`),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
