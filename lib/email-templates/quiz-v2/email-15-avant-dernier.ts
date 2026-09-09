/**
 * Email 15 - Dans 6 mois, à quoi ressemble ta vie ? (J+13)
 */
import { wrapEmail, p, ctaButton, ctaLink, signature } from './wrapper'

const URL_SERENITE  = 'https://buy.stripe.com/14AbIT89ScNtffz84y5ZC0t'
const URL_PROTOCOLE = 'https://buy.stripe.com/9B600b2PycNtd7r98C5ZC0q'

type Vars = { firstName: string; email: string }

export function generateEmail15(vars: Vars): { subject: string; html: string } {
  const { firstName, email } = vars
  const subject = `Dans 6 mois, à quoi ressemble ta vie ?`

  const content = [
    p(`Demain, tu recevras le dernier email de cette séquence.`),
    p(`Après ça, je continuerai à t'écrire de temps en temps, mais différemment. Plus comme une lettre hebdomadaire. Un espace où je partage des réflexions, des prises de conscience, des morceaux de vie plus personnels.`),
    p(`Mais avant ça, j'ai envie de te poser une dernière question.`),
    p(`Et je veux que tu y répondes vraiment. Pas par-dessus l'épaule. Pas en survolant. Pas en te disant "oui oui, je sais".`),
    p(`Honnêtement.`),
    p(`<strong style="color:#e0e0e0;">Si absolument rien ne change dans ta vie aujourd'hui, à quoi ressemble ta vie dans 6 mois ?</strong>`),
    p(`Pas la version Instagram. Pas la version qu'on raconte aux autres dans les dîners.`),
    p(`La vraie.`),
    p(`Celle où tu te réveilles encore fatigué(e) le matin sans comprendre pourquoi, alors que tu as dormi 8 heures.`),
    p(`Celle où tu continues à dire oui à des choses que ton corps refuse depuis des mois.`),
    p(`Celle où tu fais semblant d'aller bien devant tes enfants alors qu'à l'intérieur, quelque chose s'éteint.`),
    p(`Celle où tu reproduis exactement les mêmes scénarios dans tes relations, en te demandant pourquoi tu attires toujours le même genre de personnes.`),
    p(`Celle où tu repousses encore le projet qui te tient à cœur depuis des années parce que ce n'est jamais le bon moment.`),
    p(`Celle où, le soir, tu scrolles ton téléphone pendant deux heures pour ne pas avoir à ressentir ce que tu ressens vraiment.`),
    p(`Celle où, parfois, tu te regardes dans le miroir et tu ne te reconnais plus tout à fait.`),
    p(`Si tu es honnête, tu sais exactement à quoi ressemble cette vie dans 6 mois.`),
    p(`Parce qu'elle ressemble à celle d'aujourd'hui.`),
    p(`Et probablement aussi à celle d'il y a un an. Et à celle d'il y a deux ans.`),
    p(`C'est peut-être ça qui fait le plus mal, en réalité. Pas le fait que ce soit difficile. Le fait que ça ne change pas.`),
    p(`Que les années passent et que tu sois toujours au même endroit intérieur, malgré tout ce que tu sais, tout ce que tu as lu, tout ce que tu as compris.`),
    p(`Maintenant, je vais te dire la vérité.`),
    p(`Cette vie-là, ce n'est pas une fatalité. Ce n'est pas ton tempérament. Ce n'est pas "comme ça que tu es".`),
    p(`C'est l'expression directe de mécanismes qu'on peut identifier, comprendre, déconstruire et remplacer.`),
    p(`C'est exactement ce qu'on fait sur SOS Shine.`),
    p(`Pas en six mois. Pas en six ans. À partir du jour où tu décides que cette version de ta vie ne te suffit plus.`),
    p(`Et ce jour-là, c'est toi qui le choisis. Personne ne peut le décider à ta place. Pas moi. Pas ton entourage. Pas le temps qui passe.`),
    p(`Toi.`),
    p(`La porte est encore ouverte aujourd'hui.`),
    p(`Et peut-être que ce n'est vraiment pas un hasard si tu es encore là à lire ces mots, alors que tu aurais pu te désabonner il y a longtemps.`),
    ctaButton('Rejoindre SOS Shine - 49,90€/mois', URL_SERENITE, { email }),
    ctaLink('Accéder à mon protocole uniquement - 33€ →', `${URL_PROTOCOLE}?prefilled_email=${encodeURIComponent(email)}`),
    p(`À demain.`),
    signature(),
    p(`<br><em style="font-size:12px;color:#737373;">P.S. : Tu sais ce qui m'a fait basculer, moi, à l'époque ? Ce n'est pas une révélation lumineuse. C'est une question. Ce matin-là à Pékin je me suis demandée : "Tu veux vraiment vivre encore 30 ans comme ça ?" Et j'ai su, à l'intérieur, que la réponse était non. C'est peut-être la seule question qui compte vraiment ce soir. Pose-la-toi. Et écoute ta réponse.</em>`),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
