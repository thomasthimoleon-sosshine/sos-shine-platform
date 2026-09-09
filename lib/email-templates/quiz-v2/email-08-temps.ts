/**
 * Email 8 - "Je n'ai pas le temps." (J+6)
 */
import { wrapEmail, p, ctaButton, ctaLink, signature } from './wrapper'
import { resumeCadeaux } from './cadeaux'

const URL_SERENITE  = 'https://buy.stripe.com/14AbIT89ScNtffz84y5ZC0t'
const URL_PROTOCOLE = 'https://buy.stripe.com/9B600b2PycNtd7r98C5ZC0q'

type Vars = { firstName: string; email: string }

export function generateEmail08(vars: Vars): { subject: string; html: string } {
  const { firstName, email } = vars
  const subject = `"Je n'ai pas le temps."`

  const content = [
    p(`La phrase que j'entends le plus souvent quand je parle de SOS Shine, c'est :`),
    p(`<em>"Je n'ai pas le temps."</em>`),
    p(`Et honnêtement, je comprends profondément cette phrase.`),
    p(`Quand je suis rentrée en France après mon divorce, avec mes trois enfants, j'avais l'impression de porter une vie entière sur les épaules. Le travail. Les enfants. La maison. Les courses. Les papiers. Les rendez-vous. Les responsabilités. Et cette charge mentale invisible que tant de femmes connaissent.`),
    p(`À cette époque-là, la grand-mère paternelle de mes enfants qui est comme une deuxième maman, m'a dit cette phrase :`),
    p(`<em>"Julia, tu vas devoir apprendre à ne rien faire. Et tu vas devoir apprendre à prendre du temps pour toi. Sinon, tu ne tiendras pas."</em>`),
    p(`Sur le moment, je ne l'écoutais pas vraiment, avec le temps, j'ai compris qu'elle avait profondément raison. Prendre du temps pour soi, ce n'est pas un luxe. Ce n'est pas une coquetterie. Ce n'est pas un truc qu'on se permet « quand tout va mieux ». C'est exactement ce qui nous permet de tenir intérieurement quand tout autour exige qu'on continue.`),
    p(`C'est précisément pour cette raison que les protocoles SOS Shine durent 10 à 15 minutes par jour. Pas plus. Parce que je sais que tu n'as pas une heure. Tu n'as pas un week-end. Tu n'as pas une semaine pour partir te poser.`),
    p(`Mais 10 minutes, tu les as. Quelque part dans ta journée, tu les as. Et 10 minutes par jour, posées dans la bonne structure, avec le bon protocole, dans le bon ordre, peuvent commencer à changer profondément des choses qui semblaient pourtant figées depuis des années. Voilà ce que j'ai envie de te dire, et c'est peut-être ce qui te dérangera le plus dans ce mail :`),
    p(`Les personnes qui me disent "je n'ai pas le temps", ce sont presque toujours celles qui en ont le plus besoin.`),
    p(`Parce que ne pas avoir le temps pour soi, c'est déjà un symptôme. C'est déjà un mécanisme. C'est souvent ce vieux conditionnement qui dit qu'on doit faire passer tout le monde avant soi. Que se choisir, ce serait égoïste. Que mériter du repos, ça se gagne.`),
    p(`Rien de tout ça n'est vrai.`),
    p(`Tu mérites ce temps, simplement parce que tu existes.`),
    p(`Et si tu n'as ouvert aucun des cadeaux que je t'ai envoyés cette semaine, ce n'est pas de la négligence. C'est exactement le même mécanisme. Tu as ${resumeCadeaux()} qui t'attendent, ils sont à toi, ils ne périment pas. Commence par dix minutes. Aujourd'hui, pas à la rentrée.`),
    ctaButton('Rejoindre SOS Shine - 49,90€/mois', URL_SERENITE, { email }),
    ctaLink('Accéder à mon protocole uniquement - 33€ →', `${URL_PROTOCOLE}?prefilled_email=${encodeURIComponent(email)}`),
    p(`À demain.`),
    signature(),
    p(`<br><em style="font-size:12px;color:#737373;">P.S. : Quand on retire 10 minutes à une journée déjà pleine, on ne perd pas 10 minutes. On en gagne souvent une heure. Parce qu'un système nerveux apaisé est infiniment plus efficace qu'un système nerveux en alerte permanente. Essaie. Tu verras.</em>`),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
