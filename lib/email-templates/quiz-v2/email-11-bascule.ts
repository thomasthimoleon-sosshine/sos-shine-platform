/**
 * Email 11 - Le cerveau adore attendre (J+9)
 */
import { wrapEmail, p, ctaButton, ctaLink, signature } from './wrapper'

const URL_SERENITE  = 'https://buy.stripe.com/14AbIT89ScNtffz84y5ZC0t'
const URL_PROTOCOLE = 'https://buy.stripe.com/9B600b2PycNtd7r98C5ZC0q'

type Vars = { firstName: string; email: string }

export function generateEmail11(vars: Vars): { subject: string; html: string } {
  const { firstName, email } = vars
  const subject = `Le cerveau adore attendre.`

  const content = [
    p(`Je vais être honnête avec toi.`),
    p(`Ça fait maintenant plusieurs jours que tu as découvert ta Signature Émotionnelle.`),
    p(`Et je sais qu'il y a de fortes chances que certaines phrases continuent encore de tourner dans ta tête. Que tu y repenses dans les transports. Que tu y reviennes en faisant la vaisselle. Que tu te dises parfois "tiens, c'est exactement ça" en observant une réaction qui t'a échappé.`),
    p(`Parce qu'une fois qu'on met enfin des mots sur certains mécanismes, on ne peut plus vraiment faire semblant de ne pas les voir.`),
    p(`Mais je sais aussi quelque chose d'autre.`),
    p(`Le cerveau adore attendre.`),
    p(`<em>"Je commencerai plus tard."</em><br><em>"Quand j'aurai un peu plus de temps."</em><br><em>"Quand ça ira mieux."</em><br><em>"Quand je serai vraiment prêt·e."</em><br><em>"Après les vacances."</em><br><em>"À la rentrée."</em><br><em>"En janvier."</em>`),
    p(`Le problème, c'est que ce "plus tard" peut parfois durer des années entières. Des décennies, même. J'ai accompagné des personnes qui attendaient depuis 20 ans le bon moment.`),
    p(`Je le sais aussi parce que moi-même, j'ai attendu longtemps avant de vraiment me choisir. J'ai accumulé des prises de conscience, des lectures, des bonnes résolutions, sans jamais oser passer à l'action concrètement. Jusqu'au jour où j'ai compris que la version de moi qui attendait ne deviendrait jamais celle qui agirait. Ce sont deux femmes différentes.`),
    p(`Alors aujourd'hui, j'ai juste envie de te dire une chose :`),
    p(`Tu n'as pas besoin d'être prêt(e) parfaitement pour commencer.`),
    p(`Tu as juste besoin de décider une chose, ce soir, dans le calme :`),
    p(`Est-ce que tu veux continuer exactement comme aujourd'hui ? Avec les mêmes pensées au réveil. Les mêmes réactions automatiques. Les mêmes fatigues qui reviennent en boucle. Les mêmes scénarios qui se rejouent dans ta vie.`),
    p(`Ou est-ce que tu veux commencer, doucement, à créer autre chose ? Pas tout révolutionner. Pas tout abandonner. Juste poser une première pierre dans un autre sol.`),
    p(`Dans quelques jours, cette séquence d'emails se terminera et tu passeras dans ma newsletter classique. Tu recevras encore de mes nouvelles, mais sans cette proximité, sans ce fil quotidien.`),
    p(`Là, maintenant, tu es dans une vraie fenêtre de changement.`),
    p(`Et peut-être que ce n'est pas un hasard si tu lis encore ces mots aujourd'hui.`),
    p(`Tu peux rejoindre SOS Shine sans aucun engagement de durée. Sans pression. Tu pars quand tu veux, en un clic.`),
    p(`Juste pour voir ce que ça déclenche en toi.`),
    ctaButton('Rejoindre SOS Shine - 49,90€/mois', URL_SERENITE, { email }),
    ctaLink('Accéder à mon protocole uniquement - 33€ →', `${URL_PROTOCOLE}?prefilled_email=${encodeURIComponent(email)}`),
    p(`À demain.`),
    signature(),
    p(`<br><em style="font-size:12px;color:#737373;">P.S. : Si tu choisis d'attendre, ce n'est pas grave. Vraiment. Mais fais-moi une promesse : ne laisse pas ce "plus tard" devenir un "jamais". Pose-toi simplement une question dans 6 mois : "Est-ce que la vie que je vis aujourd'hui est différente de celle que je vivais en lisant ce mail ?" Et écoute honnêtement ta réponse.</em>`),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
