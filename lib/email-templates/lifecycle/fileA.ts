/**
 * FILE A — Nouveau membre (abonnement 49,90€/mois)
 * 7 emails sur 30 jours. Transformer un paiement en habitude de 10 minutes.
 * Texte : doc « Le Meilleur Derrière Les 14 » — voix Julia, objets courts, un job par mail.
 */
import { wrapEmail, p, signature, ctaButton, ctaLink, ps, URLS, type LifecycleSequence, type StepVars } from './shared'

const A1 = (v: StepVars) => ({
  subject: `Tu viens de te choisir.`,
  html: wrapEmail([
    p(`Coucou Shiner,`),
    p(`Avant les onglets, avant le mode d'emploi : merci. Tu viens de faire le geste que la plupart des gens remettent à janvier, à lundi, à « quand ça ira mieux ».`),
    p(`Tu n'as pas acheté une plateforme. Tu t'es donné un endroit. Disponible à 2h du matin. Sans avoir à tout expliquer.`),
    p(`Ce soir, une seule chose. Ouvre ton espace. Trouve ton protocole. Fais l'étape 1. Dix minutes. Puis ferme.`),
    p(`Le système nerveux n'aime pas les inaugurations. Il aime les petits commencements.`),
    ctaButton('Entrer dans mon espace', URLS.espace, { email: v.email }),
    signature(),
    ps(`Si tu te sens perdue, réponds juste « par où ». Je lis. Demain je t'envoie le chemin le plus étroit.`),
  ].join(''), { email: v.email }),
})

const A2 = (v: StepVars) => ({
  subject: `Ne commence pas par tout.`,
  html: wrapEmail([
    p(`La plateforme est vaste. Si tu veux tout faire aujourd'hui, tu vas sortir plus fatiguée qu'hier. Ce n'est pas le but.`),
    p(`<strong style="color:#e0e0e0;">Sept jours. Un seul fil.</strong>`),
    p(`• Jours 1 à 3 : ton protocole. Une étape. Rien d'autre.<br>• Jour 4 : une méditation. Celle de l'enfant intérieur si elle est encore intacte.<br>• Jour 5 : une vidéo courte.<br>• Jour 6 : la communauté. Lis. Tu n'es pas obligée d'écrire.<br>• Jour 7 : relis ta Signature. Un mot en bas de page.`),
    p(`Dix minutes. Sept si tu n'en as que sept. Le corps enregistre la régularité, pas la performance.`),
    ctaButton('Ouvrir mon protocole du jour', URLS.protocole, { email: v.email }),
    signature(),
    ps(`Si tu n'as rien fait hier, ce mail n'est pas un rappel scolaire. C'est une deuxième première fois.`),
  ].join(''), { email: v.email }),
})

const A3 = (v: StepVars) => ({
  subject: `Le jour où ça semble « rien »`,
  html: wrapEmail([
    p(`Souvent le troisième jour, le mental dit : « Bon. Et alors ? » Pas de miracle. Un exercice. L'impression que ça ne suffit pas.`),
    p(`<strong style="color:#e0e0e0;">C'est exactement là que ça commence.</strong>`),
    p(`Le conditionnement ne lâche pas parce qu'on a été brillante un mardi. Il lâche parce qu'on revient mercredi. Même quand « ça n'a l'air de rien ».`),
    p(`Ce que tu cherches n'est pas une émotion forte. C'est un système nerveux qui apprend qu'il n'est plus en danger.`),
    p(`Si quelque chose remonte — larmes, fatigue, colère — souvent, c'est bon signe. Le corps parle parce qu'il se sent un peu plus en sécurité.`),
    ctaButton('Reprendre mon protocole', URLS.protocole, { email: v.email }),
    signature(),
    ps(`Ce soir. Une main sur le cœur. Trois respirations. « J'ai le droit d'y aller lentement. »`),
  ].join(''), { email: v.email }),
})

const A4 = (v: StepVars) => ({
  subject: `Une semaine. Regarde.`,
  html: wrapEmail([
    p(`Sept jours. Je ne te demande pas si tu es transformée. Je te demande si une seule de ces lignes est vraie :`),
    p(`• Une réaction est partie un peu moins vite.<br>• Une phrase intérieure a été moins méchante.<br>• Un non, même petit.<br>• Une nuit un peu plus simple.`),
    p(`Une seule ligne = le chemin a commencé. Zéro = le système a besoin de répétition. On est faits pour ça. On ne change pas la recette. On continue.`),
    ctaButton('Continuer mon protocole', URLS.protocole, { email: v.email }),
    signature(),
    ps(`Relis ta Signature. Note un mot. C'est ton vrai point de départ. Pas celui du test.`),
  ].join(''), { email: v.email }),
})

const A5 = (v: StepVars) => ({
  subject: `Le moment où on n'a plus le temps`,
  html: wrapEmail([
    p(`Deux semaines. C'est souvent là que SOS Shine redevient « je le ferai ce week-end ». Je connais cette phrase. Elle a un coût.`),
    p(`Tu n'as pas besoin de l'élan du premier jour. Tu as besoin d'un minimum non négociable : dix minutes. Même bancales. Même dans la voiture, garée, avant de rentrer.`),
    p(`Si tu as décroché trois jours, tu ne « recommences pas le programme ». Tu ouvres l'étape suivante. Point. La plateforme n'expire pas parce que tu as manqué une séance.`),
    ctaButton('Reprendre aujourd\'hui, 10 minutes', URLS.protocole, { email: v.email }),
    signature(),
    ps(`Si c'est le chaos, réponds « c'est dur ». On ajuste le protocole. Pas ta valeur.`),
  ].join(''), { email: v.email }),
})

const A6 = (v: StepVars) => ({
  subject: `Dans 5 jours, un mois`,
  html: wrapEmail([
    p(`Deux choses, clairement.`),
    p(`<strong style="color:#e0e0e0;">La première.</strong> Ton abonnement se renouvelle tout seul, sauf si tu décides autrement. Pas pour te piéger. Pour que le chemin ne dépende pas d'un élan du 3 du mois.`),
    p(`<strong style="color:#e0e0e0;">La deuxième.</strong> Si ça ne te convient pas, tu pars. Sans débat. Sans mail de culpabilité. Tu auras essayé pour de vrai.`),
    p(`Le deuxième mois est souvent plus profond que le premier. Le mental a moins à prouver. Le corps commence à croire.`),
    ctaButton('Continuer mon chemin', URLS.protocole, { email: v.email }),
    ctaLink('Gérer mon abonnement', URLS.abonnement),
    signature(),
    ps(`49,90€/mois. Sans engagement. Je le rappelle pour que tu restes par choix, pas par oubli.`),
  ].join(''), { email: v.email }),
})

const A7 = (v: StepVars) => ({
  subject: `${v.firstName ? v.firstName + ', un' : 'Un'} mois. Et maintenant.`,
  html: wrapEmail([
    p(`Un mois. Certaines ont tout suivi. D'autres ont ouvert trois fois. Les deux ont le droit d'être ici.`),
    p(`Le mois qui vient n'est pas « plus ». C'est « plus juste ». Un seul axe. Celui qui revient dans ta Signature. Abandon. Charge. Amour propre. Colère rentrée. Peur du rejet. Un.`),
    p(`Le reste de la plateforme reste là. Ce n'est plus un buffet. C'est un chemin.`),
    p(`À partir de demain, tu recevras surtout ma lettre. Plus cette file-là.`),
    ctaButton('Choisir mon axe du mois', URLS.encyclopedie, { email: v.email }),
    signature(),
    ps(`Si tu veux me dire ce qui a bougé — ou pas — réponds. Les messages du premier mois, je les garde.`),
  ].join(''), { email: v.email }),
})

export const SEQUENCE_A: LifecycleSequence = {
  triggerType: 'member_onboarding',
  name: 'File A · Nouveau membre 49,90€',
  steps: [
    { order: 1, delay: 0,  label: 'Accueil',           build: A1 },
    { order: 2, delay: 1,  label: 'Activation',         build: A2 },
    { order: 3, delay: 3,  label: 'Le creux',           build: A3 },
    { order: 4, delay: 7,  label: 'Première semaine',   build: A4 },
    { order: 5, delay: 14, label: 'La vie reprend',     build: A5 },
    { order: 6, delay: 25, label: 'Avant le mois',      build: A6 },
    { order: 7, delay: 30, label: 'Un mois',            build: A7 },
  ],
}
