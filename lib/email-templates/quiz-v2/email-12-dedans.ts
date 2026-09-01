/**
 * Email 12 - Voilà ce qui va se passer concrètement (J+10)
 */
import { wrapEmail, p, h3, ctaButton, ctaLink, signature, goldDivider } from './wrapper'

const URL_SERENITE  = 'https://buy.stripe.com/14AbIT89ScNtffz84y5ZC0t'
const URL_PROTOCOLE = 'https://buy.stripe.com/9B600b2PycNtd7r98C5ZC0q'

type Vars = { firstName: string; email: string }

export function generateEmail12(vars: Vars): { subject: string; html: string } {
  const { firstName, email } = vars
  const subject = `Voilà ce qui va se passer concrètement.`

  const content = [
    p(`Si aujourd'hui tu décides de rejoindre SOS Shine, voilà concrètement ce qu'il va se passer.`),
    p(`Pas une promesse vague. Pas un "tu vas voir, tu seras transformé·e". Du concret.`),
    goldDivider(),
    h3(`Minute 1`),
    p(`Tu entres dans ton espace membre. Tu y retrouves ta Signature Émotionnelle, ton profil personnalisé, et les premiers outils adaptés à ce que tu traverses en ce moment précis.`),
    h3(`Minute 5`),
    p(`Tu découvres ton premier protocole.`),
    p(`Pas quelque chose de compliqué. Pas une montagne de vidéos théoriques que tu ne regarderas jamais. Pas un PDF de 80 pages à imprimer.`),
    p(`Quelque chose de simple. Concret. Pensé pour être vraiment applicable dans une vraie vie. Une vie qui continue à courir pendant que tu commences à te poser.`),
    h3(`Jour 1`),
    p(`Tu commences doucement à te reconnecter à toi.`),
    p(`10 à 15 minutes. Une vidéo. Un exercice. Une réflexion. Une respiration. Un petit déplacement intérieur que tu n'avais pas senti depuis longtemps.`),
    h3(`Jour 3`),
    p(`Tu commences souvent à ressentir les premiers changements. Pas quelque chose de spectaculaire. Pas un avant/après Instagram.`),
    p(`Quelque chose de réel. Un peu plus de calme dans la poitrine. Une réaction qui ne part pas comme d'habitude. Une pensée automatique qui ne se déclenche plus tout à fait pareil. Une respiration qui descend un peu plus bas. Ce sont ces signaux subtils qui annoncent qu'un système nerveux commence à apprendre autre chose.`),
    h3(`Jour 5`),
    p(`Tu commences à te déplacer dans la plateforme avec aisance. Tu connais ton protocole. Tu sais où aller quand une émotion monte. Tu peux ouvrir l'application à 2h du matin si tu en as besoin, et trouver une réponse, une voix, un exercice. C'est ce moment où SOS Shine cesse d'être "un truc qu'on essaie" pour devenir un compagnon de quotidien.`),
    h3(`Jour 7`),
    p(`Soit tu sens que cet espace te fait du bien et tu continues, à ton rythme.`),
    p(`Soit tu décides que ce n'est pas pour toi à ce moment de ta vie, et tu annules en un clic.`),
    p(`Sans piège. Sans engagement caché. Sans relance insistante. Sans pression.`),
    p(`Juste l'occasion d'avoir enfin essayé quelque chose de différent. De savoir, par toi-même, si c'est l'endroit qui peut t'accompagner.`),
    goldDivider(),
    p(`C'est tout.`),
    p(`Pas de promesse de miracle. Pas de transformation instantanée. Pas de "ta vie va changer en une semaine".`),
    p(`Mais une première semaine, c'est largement assez pour sentir si un endroit te fait du bien. Si la voix qu'on y entend te parle. Si la méthode te correspond. Si ton corps, ton mental et ton cœur ont envie de continuer.`),
    p(`Et si la réponse est oui, alors un vrai chemin peut commencer.`),
    ctaButton('Rejoindre SOS Shine - 49,90€/mois', URL_SERENITE, { email }),
    ctaLink('Accéder à mon protocole uniquement - 33€ →', `${URL_PROTOCOLE}?prefilled_email=${encodeURIComponent(email)}`),
    p(`À demain.`),
    signature(),
    p(`<br><em style="font-size:12px;color:#737373;">P.S. : Une chose que je veux que tu saches. Il n'y a aucun engagement de durée, et c'est moi qui ai voulu cette formule dès le début. Je trouve normal qu'on reste parce que ça fait du bien, pas parce qu'on est retenu par un contrat. On ne te demande pas de croire sur parole. On te demande juste de venir voir.</em>`),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
