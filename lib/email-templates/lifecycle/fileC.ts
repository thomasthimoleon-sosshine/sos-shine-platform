/**
 * FILE C — Silence (ni abo ni achat 33€ au soir du 14e jour)
 * 7 emails de plus en plus espacés, jusqu'à J+180. On ne refait pas Pékin, on ne redonne pas les cadeaux.
 * Sortie immédiate vers File A ou B dès qu'il y a un paiement.
 * Texte : doc « Le Meilleur Derrière Les 14 » — voix Julia.
 *
 * NB : les délais sont comptés depuis l'entrée dans la file (soir du J+14 de la séquence Signature).
 * C1 = +2 j (≈ J+16 après le test), etc.
 */
import { wrapEmail, p, signature, ctaButton, ctaLink, ps, URLS, type LifecycleSequence, type StepVars } from './shared'

const C1 = (v: StepVars) => ({
  subject: `Je ne vais pas te relancer tous les jours`,
  html: wrapEmail([
    p(`La séquence est finie depuis deux jours. Tu n'as pas rejoint SOS Shine. Je ne t'en veux pas.`),
    p(`Je t'écris une file beaucoup plus espacée. Pas pour te convaincre. Pour ne pas disparaître comme si de rien n'était.`),
    p(`Tu as encore tes quatre cadeaux. Ta Signature. Si le moment n'est pas maintenant, c'est maintenant que ce n'est pas maintenant.`),
    ctaButton('Revoir mes 4 cadeaux', URLS.cadeaux, { email: v.email }),
    ctaLink('Rejoindre · 49,90€/mois', URLS.rejoindre),
    ctaLink('Protocole 33€ · 1 mois plateforme', URLS.protocole),
    signature(),
    ps(`Le prochain n'est pas demain. C'est dans cinq jours. Tu as le droit d'oublier un peu.`),
  ].join(''), { email: v.email }),
})

const C2 = (v: StepVars) => ({
  subject: `Si 49,90€ c'est trop`,
  html: wrapEmail([
    p(`Parfois on ne s'abonne pas parce que « toute une plateforme » fait trop. Trop d'onglets. Trop de « je vais encore abandonner un truc ». Alors l'abonnement n'est pas la bonne porte.`),
    p(`La plus petite : 33€. Un protocole. Le tien. Plus un mois offert pour sentir le cadre. Au bout de 30 jours, la plateforme s'arrête. Le protocole reste.`),
    p(`Si même 33€ ce n'est pas possible, garde les cadeaux. Je préfère ça à un achat que tu regretteras.`),
    ctaButton('Prendre un protocole · 33€', URLS.protocole, { email: v.email }),
    ctaLink('L\'abonnement · 49,90€/mois', URLS.rejoindre),
    signature(),
    ps(`Relis ta Signature. Pas le site. Si une phrase te serre encore la gorge, elle n'a pas fini.`),
  ].join(''), { email: v.email }),
})

const C3 = (v: StepVars) => ({
  subject: `Ça fait un mois que tu as vu ça`,
  html: wrapEmail([
    p(`La question, sans attendre une réponse parfaite : est-ce que quelque chose a changé depuis le test ? Ou la vie a repris exactement la même forme ?`),
    p(`Si ça a bougé : tant mieux. Tu n'avais peut-être pas besoin de moi plus que ça.`),
    p(`Si ça n'a pas bougé : ce n'est pas une accusation. C'est une information. Les mécanismes ne cèdent presque jamais tout seuls.`),
    p(`Même porte. 49,90€. 33€. Ou tes cadeaux.`),
    ctaButton('Rejoindre · 49,90€/mois', URLS.rejoindre, { email: v.email }),
    ctaLink('Un protocole · 33€', URLS.protocole),
    signature(),
    ps(`Si tu as simplement oublié. Cet oubli-là, souvent, c'est encore le mécanisme. Pas de la paresse.`),
  ].join(''), { email: v.email }),
})

const C4 = (v: StepVars) => ({
  subject: `Juste une présence`,
  html: wrapEmail([
    p(`Pas de longue lettre.`),
    p(`Je passais. Ta Signature est toujours là. Les cadeaux aussi.`),
    p(`Si un jour ça devient urgent — une rupture, un burn-out, une nuit trop blanche, un oui de trop — tu sauras où revenir. SOS Shine n'est pas une promotion. C'est un endroit.`),
    ctaButton('Revenir quand c\'est le moment', URLS.rejoindre, { email: v.email }),
    signature(),
    ps(`Prochain dans deux semaines. Puis J+90. Puis un dernier à six mois.`),
  ].join(''), { email: v.email }),
})

const C5 = (v: StepVars) => ({
  subject: `Ce que j'aurais voulu qu'on me tende`,
  html: wrapEmail([
    p(`Je ne te raconte pas Pékin une deuxième fois. Tu la connais.`),
    p(`Le jour où j'ai basculé, je n'avais pas plus de temps. J'avais moins de mensonge.`),
    p(`Si tu es encore en train de bien fonctionner par-dessus quelque chose qui ne va pas : je te vois. Cette élégance-là épuise.`),
    p(`Si ce n'est pas pour toi, c'est vrai aussi. Si c'est pour toi et que tu attends d'être prête : tu ne le seras pas plus dans six mois. Tu seras juste plus fatiguée, ou plus habituée.`),
    ctaButton('Rejoindre · 49,90€/mois', URLS.rejoindre, { email: v.email }),
    ctaLink('Commencer petit · 33€', URLS.protocole),
    signature(),
    ps(`Encore deux mails. Ensuite je te laisse. Promis.`),
  ].join(''), { email: v.email }),
})

const C6 = (v: StepVars) => ({
  subject: `Je ferme cette file. Pas la porte.`,
  html: wrapEmail([
    p(`Dernier mail de cette file-là. Je ferme la file. Pas la porte.`),
    p(`Tu peux arriver dans six mois. Dans deux ans. Après une nuit. L'abonnement sera là. Le 33€ aussi.`),
    p(`Ce que je te souhaite n'est pas d'acheter SOS Shine. C'est de ne plus vivre en mode survie par habitude.`),
    ctaButton('Rejoindre · 49,90€/mois', URLS.rejoindre, { email: v.email }),
    ctaLink('Un protocole · 33€ + 1 mois', URLS.protocole),
    signature(),
    ps(`Un tout dernier dans trois mois. Puis uniquement la lettre.`),
  ].join(''), { email: v.email }),
})

const C7 = (v: StepVars) => ({
  subject: `Une question, six mois plus tard`,
  html: wrapEmail([
    p(`Six mois que tu as vu ta Signature.`),
    p(`Je ne relance pas une séquence. Je pose la seule question qui compte encore : la vie que tu vis aujourd'hui, est-elle différente de celle du jour du test ?`),
    p(`Si oui : je suis contente pour toi. Garde la lettre, ou pas.`),
    p(`Si non : tu n'as pas « raté ». Tu as attendu. On peut encore commencer petit. 33€. Ou tout. 49,90€.`),
    p(`Après ce mail, plus rien de cette file. La newsletter, si tu la gardes. Un dimanche sur deux, une voix. C'est tout.`),
    p(`Prends soin de toi.`),
    ctaButton('Rejoindre · 49,90€/mois', URLS.rejoindre, { email: v.email }),
    ctaLink('Un protocole · 33€', URLS.protocole),
    signature(),
  ].join(''), { email: v.email }),
})

export const SEQUENCE_C: LifecycleSequence = {
  triggerType: 'nurture_silence',
  name: 'File C · Silence après J+14',
  steps: [
    { order: 1, delay: 2,   label: 'Pacte',          build: C1 },
    { order: 2, delay: 7,   label: 'La petite porte', build: C2 },
    { order: 3, delay: 16,  label: 'Un mois',         build: C3 },
    { order: 4, delay: 31,  label: 'Présence',        build: C4 },
    { order: 5, delay: 46,  label: 'Ce que j\'aurais voulu', build: C5 },
    { order: 6, delay: 76,  label: 'Fermer la file',  build: C6 },
    { order: 7, delay: 166, label: 'Six mois',        build: C7 },
  ],
}
