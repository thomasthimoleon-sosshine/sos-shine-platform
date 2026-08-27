/**
 * FILE B — Achat protocole 33€ + 30 jours de plateforme offerts
 * 7 emails sur 30 jours. Le protocole est acheté (à vie) ; la plateforme est offerte 30 jours.
 * Au 31e jour la plateforme s'arrête, le protocole reste. L'abo 49,90€ est une invitation (J+21, J+28).
 * Texte : doc « Le Meilleur Derrière Les 14 » — voix Julia.
 */
import { wrapEmail, p, signature, ctaButton, ctaLink, ps, URLS, type LifecycleSequence, type StepVars } from './shared'

const B1 = (v: StepVars) => ({
  subject: `Ton protocole est à toi. Point.`,
  html: wrapEmail([
    p(`Coucou Shiner. C'est fait. Merci.`),
    p(`Je déteste les petites lignes, alors les voici en grand.`),
    p(`<strong style="color:#e0e0e0;">1.</strong> Ton protocole. À toi. Même si tu ne t'abonnes jamais.<br><strong style="color:#e0e0e0;">2.</strong> 30 jours offerts sur toute la plateforme. Le vrai cadre. Pas un aperçu.<br><strong style="color:#e0e0e0;">3.</strong> Au bout de 30 jours, la plateforme s'arrête. Automatiquement. Sans carte débitée. Le protocole ne s'en va pas.`),
    p(`Ce soir : étape 1 du protocole. C'est pour ça que tu as payé 33€. Le mois autour est un cadeau. Pas l'inverse.`),
    ctaButton('Commencer mon protocole', URLS.protocole, { email: v.email }),
    ctaLink('Explorer la plateforme 30 jours', URLS.espace),
    signature(),
    ps(`Si dans 30 jours tu veux tout garder, c'est 49,90€/mois, sans engagement. On en reparle à temps. Pas ce soir.`),
  ].join(''), { email: v.email }),
})

const B2 = (v: StepVars) => ({
  subject: `N'utilise pas tes 30 jours comme un buffet`,
  html: wrapEmail([
    p(`La tentation, c'est de tout ouvrir pour « rentabiliser ». Ne fais pas ça. Tu vas t'épuiser et tu n'auras rien intégré.`),
    p(`<strong style="color:#e0e0e0;">Règle : protocole d'abord.</strong> Tous les jours, ou presque. Le reste, seulement s'il reste du souffle.`),
    p(`Les 30 jours ne sont pas là pour te faire consommer. Ils sont là pour que ton corps comprenne ce que ça fait d'avoir un cadre. C'est ça, la puissance. Pas le nombre d'onglets.`),
    ctaButton('Étape suivante', URLS.protocole, { email: v.email }),
    signature(),
    ps(`Si tu n'as fait que l'étape 1, c'est déjà mieux que ceux qui achètent « pour plus tard ». Plus tard, c'est maintenant.`),
  ].join(''), { email: v.email }),
})

const B3 = (v: StepVars) => ({
  subject: `7 jours. Ton protocole a commencé à parler.`,
  html: wrapEmail([
    p(`Peut-être que tu as tout suivi. Peut-être que ça attend encore. Les deux existent.`),
    p(`Un protocole ne change une vie que s'il est vécu. Dans une cuisine. Dans une voiture. Un soir où tu n'en peux plus.`),
    p(`Il te reste 23 jours de plateforme. C'est large. Ce n'est pas éternel. Contrat minuscule : 10 minutes, 5 jours sur 7. Ton protocole seulement.`),
    ctaButton('Reprendre mon protocole', URLS.protocole, { email: v.email }),
    signature(),
    ps(`Si ça remonte fort, ce n'est souvent pas que « ça ne marche pas ». C'est que ça commence. Ralentis.`),
  ].join(''), { email: v.email }),
})

const B4 = (v: StepVars) => ({
  subject: `Il te reste 16 jours de plateforme`,
  html: wrapEmail([
    p(`Je te le dis sans dramatiser. Pour que le temps existe.`),
    p(`Deux questions : est-ce que le protocole t'a déjà donné un vrai moment, même petit ? Est-ce que le cadre de la plateforme t'a aidée, pouvoir ouvrir une voix, une méditation, la communauté ?`),
    p(`Si oui à la deuxième, retiens-le. Dans deux semaines tu choisiras : garder seulement le protocole, ou tout SOS Shine à 49,90€/mois.`),
    p(`Aujourd'hui tu n'as pas à choisir. Tu as à continuer.`),
    ctaButton('Continuer mon protocole', URLS.protocole, { email: v.email }),
    signature(),
    ps(`Ce que tu gardes dans tous les cas : le protocole. Payé. À toi. Personne ne le reprend.`),
  ].join(''), { email: v.email }),
})

const B5 = (v: StepVars) => ({
  subject: `Encore 9 jours. Ensuite, deux chemins.`,
  html: wrapEmail([
    p(`Dans neuf jours, la plateforme s'arrête. Ton protocole reste. Je refuse de te surprendre le 30e jour.`),
    p(`<strong style="color:#e0e0e0;">Chemin 1.</strong> Tu continues avec ton protocole. Déjà payé. Propre. Honnête.`),
    p(`<strong style="color:#e0e0e0;">Chemin 2.</strong> Le cadre entier te tenait. Lives, autres protocoles, 2h du matin. Alors 49,90€/mois. Sans engagement.`),
    p(`Aucun n'est « le bon ». Le bon, c'est celui que tu peux tenir. Ces 9 jours, use-les. Pas en panique. En présence.`),
    ctaButton('Rester sur la plateforme · 49,90€/mois', URLS.rejoindre, { email: v.email }),
    ctaLink('Je garde seulement mon protocole', URLS.protocole),
    signature(),
    ps(`Si tu hésites à cause de l'argent, je le respecte. La question n'est pas « est-ce que je le mérite ». C'est « est-ce que ce cadre me coûte moins que de continuer comme avant ».`),
  ].join(''), { email: v.email }),
})

const B6 = (v: StepVars) => ({
  subject: `Encore 2 jours. Ensuite c'est fini.`,
  html: wrapEmail([
    p(`Plus que deux jours. Tu sais déjà.`),
    p(`Rester dans tout SOS Shine : deux minutes. 49,90€/mois. Annulable. Ton protocole déjà acheté reste inclus.`),
    p(`Ne pas le faire : rien de grave. Après-demain tu ouvriras encore ton protocole. Juste lui. Ce sera déjà un endroit.`),
    p(`Merci d'avoir pris ces 33€ au sérieux.`),
    ctaButton('Continuer avec tout SOS Shine · 49,90€/mois', URLS.rejoindre, { email: v.email }),
    ctaLink('Ouvrir mon protocole (que je garde)', URLS.protocole),
    signature(),
    ps(`Demain je t'écris une dernière fois. Pour te dire au revoir proprement. Ou bienvenue pour de vrai.`),
  ].join(''), { email: v.email }),
})

const B7 = (v: StepVars) => ({
  subject: `Aujourd'hui la plateforme s'arrête. Pas le protocole.`,
  html: wrapEmail([
    p(`L'accès plateforme se ferme. Comme annoncé. Sans prélèvement. Sans mauvaise surprise.`),
    p(`Ce qui reste : ton protocole. Tes cadeaux. Ta Signature.`),
    p(`Si tu t'es abonnée entre-temps, ignore ce mail. Tu es déjà de l'autre côté.`),
    p(`Sinon : la porte n'est pas fermée à clé. Elle est redevenue une porte. 49,90€/mois, quand tu veux.`),
    ctaButton('Rouvrir la plateforme · 49,90€/mois', URLS.rejoindre, { email: v.email }),
    ctaLink('Continuer seulement avec mon protocole', URLS.protocole),
    signature(),
    ps(`Ensuite, la newsletter. Plus de relance quotidienne.`),
  ].join(''), { email: v.email }),
})

export const SEQUENCE_B: LifecycleSequence = {
  triggerType: 'protocol_33',
  name: 'File B · Achat protocole 33€',
  steps: [
    { order: 1, delay: 0,  label: 'Clarté',        build: B1 },
    { order: 2, delay: 1,  label: 'Usage',         build: B2 },
    { order: 3, delay: 7,  label: '7 jours',       build: B3 },
    { order: 4, delay: 14, label: 'Mi-parcours',   build: B4 },
    { order: 5, delay: 21, label: 'Deux chemins',  build: B5 },
    { order: 6, delay: 28, label: 'Presque la fin', build: B6 },
    { order: 7, delay: 30, label: 'Fermeture',     build: B7 },
  ],
}
