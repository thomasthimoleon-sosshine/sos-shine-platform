/**
 * Email 16 — Le dernier mail. Avec un cadeau. (J+14)
 */
import { wrapEmail, p, ctaButton, goldDivider, signature } from './wrapper'

const URL_CADEAU = 'https://sosshine.com/api/download/5min-protocol'

type Vars = { firstName: string; email: string }

export function generateEmail16(vars: Vars): { subject: string; html: string } {
  const { firstName, email } = vars
  const subject = `Le dernier mail. Avec un cadeau.`

  const content = [
    p(`Voilà, c'est le dernier email de cette séquence, si tu n'as pas rejoint SOS Shine, je ne t'en veux absolument pas. Parce que ce que je veux pour toi, ce n'est pas que tu rejoignes une plateforme. C'est que tu te choisisses, peu importe la forme que ça prendra. Avant de terminer cette séquence, j'ai envie de te dire deux choses importantes.`),
    goldDivider(),
    p(`<strong style="color:#e0e0e0;">La première.</strong>`),
    p(`Garde précieusement ta Signature Émotionnelle.`),
    p(`Relis-la dans quelques semaines. Puis dans quelques mois. Parce qu'il y a de fortes chances que tu ne la comprennes pas encore totalement aujourd'hui.`),
    p(`Certaines prises de conscience ont besoin de temps pour descendre vraiment dans le corps. Ce que tu as lu il y a deux semaines peut prendre un sens complètement différent dans six mois, après une rupture, une discussion, une émotion qui remonte, un événement qui te bouscule.`),
    p(`Ce résultat n'a pas de date d'expiration. Il sera là le jour où tu seras prête à le voir vraiment.`),
    goldDivider(),
    p(`<strong style="color:#e0e0e0;">La deuxième.</strong>`),
    p(`Si un jour tu ressens l'envie de commencer ce travail plus profondément, la porte de SOS Shine restera ouverte. Parce que cette plateforme n'a pas été créée pour plaire à tout le monde. Elle a été créée pour les personnes qui sentent, au fond, qu'elles ne veulent plus continuer à vivre en mode survie toute leur vie. Et si un jour tu reconnais cette voix intérieure, tu sauras où me trouver.`),
    goldDivider(),
    p(`Avant de te laisser, j'ai envie de t'offrir quelque chose.`),
    p(`Pour te remercier d'avoir pris le temps de lire tous ces emails. D'avoir accepté de te poser certaines questions difficiles. D'être encore là aujourd'hui, malgré tout ce qui aurait pu te faire fermer cet onglet bien avant.`),
    p(`<strong style="color:#e0e0e0;">Un protocole offert : "5 minutes pour réaligner ta journée."</strong>`),
    p(`Quelque chose de simple. Concret. Réellement efficace quand on commence à l'intégrer au quotidien. Pas une théorie de plus. Un outil que tu peux utiliser dès demain matin, en sortant du lit, avant même d'avoir ouvert ton téléphone.`),
    ctaButton('Télécharger le protocole offert', URL_CADEAU, { email }),
    p(`Et si un jour nos chemins se recroisent sur SOS Shine, alors ce sera probablement au bon moment.`),
    p(`Prends soin de toi.`),
    p(`Avec tout, mon amour et ma bienveillance`),
    signature(),
    p(`<br><em style="font-size:12px;color:#737373;">P.S. : À partir de maintenant, tu recevras simplement ma newsletter hebdomadaire. Mes réflexions, des morceaux de vie, des clés pour mieux comprendre le fonctionnement humain. Pas de pression, pas de séquence intensive. Juste un rendez-vous régulier, si tu en as envie. Et si à un moment tu veux te désabonner, je ne le prendrai pas mal. Le tout, c'est qu'on ne reste pas dans un lien qui ne nous nourrit plus, des deux côtés.</em>`),
  ].join('')

  return { subject, html: wrapEmail(content, { email }) }
}
