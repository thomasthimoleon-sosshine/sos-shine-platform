/**
 * LA LETTRE — newsletter hebdomadaire de Julia (« parler très longtemps »)
 * 12 lettres, une par mois, dans la voix de Julia. Objet = une phrase, pas un titre.
 * Vente ~1 fois sur 4 : seules les lettres « invitation » portent un bouton.
 * Fils rouges & formats : doc « Le Meilleur Derrière Les 14 ».
 *
 * Formats de dimanche (rotation) :
 *  - scene       : scène de vie, aucune vente
 *  - mecanisme   : un mécanisme nommé + un geste de 3 minutes
 *  - temoignage  : la voix d'une Shiner
 *  - invitation  : une invitation claire, un bouton
 */
import { wrapEmail, p, signature, ctaButton } from '@/lib/email-templates/quiz-v2/wrapper'
import { ps, URLS, type StepVars } from '@/lib/email-templates/lifecycle/shared'

export type LetterFormat = 'scene' | 'mecanisme' | 'temoignage' | 'invitation'
export type Letter = {
  month: number // 1 = janvier
  theme: string
  format: LetterFormat
  build: (v: StepVars) => { subject: string; html: string }
}

const L1 = (v: StepVars) => ({
  subject: `On ne « se reprend pas en main ».`,
  html: wrapEmail([
    p(`Coucou Shiner,`),
    p(`Chaque premier janvier, des millions de personnes se promettent de « se reprendre en main ». Et chaque février, la même culpabilité revient, un peu plus lourde qu'avant.`),
    p(`Je vais te dire ce que j'ai fini par comprendre : on ne se reprend pas en main. On arrête, doucement, de se mentir. Ce n'est pas une résolution. C'est une honnêteté.`),
    p(`Cette année, ne te promets rien de spectaculaire. Choisis une seule chose vraie que tu ne veux plus porter en silence. Et laisse-la exister, là, sans plan sur douze mois.`),
    p(`Le reste suivra. Il suit toujours ce qu'on a osé nommer.`),
    signature(),
    ps(`Si tu devais écrire une seule phrase honnête sur cette année qui commence, ce serait laquelle ? Garde-la pour toi. Elle t'attendra.`),
  ].join(''), { email: v.email }),
})

const L2 = (v: StepVars) => ({
  subject: `Cette fatigue n'est pas la météo.`,
  html: wrapEmail([
    p(`En février, on met tout sur le dos de l'hiver. Le manque de lumière, le froid, les jours courts. Et parfois c'est vrai.`),
    p(`Mais souvent, cette fatigue-là n'est pas dehors. Elle est dans un système nerveux qui n'a pas eu un vrai moment de sécurité depuis longtemps. Un corps qui tient, qui gère, qui avance — et qui n'a jamais le droit de se poser.`),
    p(`<strong style="color:#e0e0e0;">Un geste, ce soir.</strong> Avant de dormir, allonge-toi. Une main sur le ventre. Respire lentement pour que ce soit la main qui se soulève, pas la poitrine. Cinq respirations. C'est le signal le plus simple qu'on puisse envoyer au corps : « tu peux relâcher, je suis là. »`),
    p(`Le sommeil ne se force pas. Il vient quand le corps arrête de monter la garde.`),
    signature(),
    ps(`Si tu dors mal en ce moment, ce n'est pas un défaut de volonté. C'est une information. Écoute-la avec douceur.`),
  ].join(''), { email: v.email }),
})

const L3 = (v: StepVars) => ({
  subject: `L'amour propre, ce n'est pas se trouver géniale.`,
  html: wrapEmail([
    p(`On croit souvent que l'amour de soi, c'est se regarder dans le miroir et se trouver formidable. Ce n'est pas ça. Pas pour moi, en tout cas.`),
    p(`L'amour propre, c'est arrêter de se traiter comme la seule personne au monde à qui on ne doit rien. Celle qu'on fait passer en dernier. Celle à qui on parle plus durement qu'à n'importe qui d'autre.`),
    p(`<strong style="color:#e0e0e0;">Un geste, aujourd'hui.</strong> La prochaine fois qu'une phrase intérieure te tombe dessus — « tu es nulle », « tu n'y arriveras jamais » — demande-toi juste : est-ce que je dirais ça à quelqu'un que j'aime ? Si non, ce n'est pas la vérité. C'est un vieux disque.`),
    p(`On n'éteint pas ce disque en un jour. On apprend juste à ne plus le prendre pour sa propre voix.`),
    signature(),
    ps(`Une trace se travaille autrement qu'avec des affirmations devant un miroir. Elle se travaille en se traitant, une fois, avec la douceur qu'on n'a pas reçue.`),
  ].join(''), { email: v.email }),
})

const L4 = (v: StepVars) => ({
  subject: `Le non que j'ai mis sept ans à dire.`,
  html: wrapEmail([
    p(`Il y a une phrase qui revient chez presque toutes les femmes que j'accompagne : « je n'arrive pas à dire non ».`),
    p(`Moi non plus, longtemps. Je disais oui à tout. Oui par peur de décevoir, oui pour être aimée, oui pour éviter le conflit. Et chaque oui de trop me coûtait un petit morceau de moi.`),
    p(`Le care-taking, c'est ça : prendre soin de tout le monde, tout le temps, jusqu'à s'oublier complètement. Et se dire que c'est de la générosité, alors que c'est souvent de la survie.`),
    p(`Un non calme n'est pas une agression. C'est une frontière. Et une personne qui pose ses frontières n'est pas égoïste — elle est enfin disponible pour de vrai, parce qu'elle ne se sacrifie plus en secret.`),
    p(`C'est un travail. C'est même l'un des cœurs de la plateforme. Si tu sens que ce sujet-là est le tien, tu sais où me trouver.`),
    ctaButton('Découvrir SOS Shine · 49,90€/mois', URLS.rejoindre, { email: v.email }),
    signature(),
    ps(`Cette semaine, un seul petit non. Le plus petit possible. Juste pour sentir que le ciel ne te tombe pas dessus.`),
  ].join(''), { email: v.email }),
})

const L5 = (v: StepVars) => ({
  subject: `Un jeudi de mai, à 6h30.`,
  html: wrapEmail([
    p(`Il y a quelques années, un jeudi de mai, vers 6h30 du matin, j'ai pris la décision qui a tout changé. J'étais à Pékin. J'allais commencer une journée de plus dans une vie qui me tuait doucement.`),
    p(`Et ce matin-là, quelque chose a cédé. Pas dans la douleur. Dans la clarté. J'ai su que je partais. Que je divorçais. Que je rentrais en France avec mes trois enfants.`),
    p(`Ce qui m'a sauvée, ce n'est pas d'avoir compris. J'avais compris depuis longtemps. C'est d'avoir agi. La décision peut être fulgurante. Le chemin qui suit, lui, se construit petit à petit.`),
    p(`Mai, pour moi, c'est le mois de cet anniversaire silencieux. Celui d'une femme qui s'est enfin choisie.`),
    p(`Et toi ? Y a-t-il une décision qui t'attend depuis trop longtemps ?`),
    signature(),
    ps(`Se choisir, ce n'est pas tout casser. C'est parfois juste arrêter de se trahir sur une seule chose. Commence par celle-là.`),
  ].join(''), { email: v.email }),
})

const L6 = (v: StepVars) => ({
  subject: `Toujours le même genre de personnes ?`,
  html: wrapEmail([
    p(`Tu as peut-être déjà remarqué ça : les mêmes histoires qui se rejouent. Les mêmes types de personnes qui reviennent. Les mêmes fins qui se répètent, comme si tu attirais toujours le même scénario.`),
    p(`Ce n'est pas une malédiction. Ce n'est pas « pas de chance en amour » ou « en amitié ». C'est un pattern. Quelque chose qui s'est installé très tôt et qui cherche, encore et encore, à rejouer ce qu'il connaît — même quand ça fait mal.`),
    p(`<strong style="color:#e0e0e0;">Un geste, cette semaine.</strong> Repense à deux ou trois relations qui se sont mal finies de la même façon. Ne cherche pas le coupable. Cherche juste le point commun. Souvent, il n'est pas chez les autres. Il est dans ce que tu acceptais, toi, sans t'en rendre compte.`),
    p(`Voir le pattern, c'est déjà commencer à ne plus le subir.`),
    signature(),
    ps(`Un mécanisme nommé perd une grande partie de son pouvoir. C'est tout le travail du déconditionnement.`),
  ].join(''), { email: v.email }),
})

const L7 = (v: StepVars) => ({
  subject: `10 minutes. Pas une heure.`,
  html: wrapEmail([
    p(`« Je n'ai pas le temps. » C'est la phrase que j'entends le plus. Et souvent, ce sont les personnes qui la disent qui en ont le plus besoin.`),
    p(`Prendre du temps pour soi, ce n'est pas un luxe qu'on s'offre quand tout va bien. C'est exactement ce qui permet de tenir quand tout autour exige qu'on continue.`),
    p(`<strong style="color:#e0e0e0;">Un geste, aujourd'hui.</strong> Pas une heure. Pas un week-end de retraite. Dix minutes. Assieds-toi quelque part, sans téléphone. Respire. Laisse le silence exister. C'est tout. Le corps enregistre la régularité, pas la performance.`),
    p(`Tu n'as pas besoin de plus de temps. Tu as besoin de dix minutes qui t'appartiennent vraiment.`),
    signature(),
    ps(`Quand on retire 10 minutes à une journée déjà pleine, on ne perd pas 10 minutes. Un système nerveux apaisé est bien plus efficace qu'un système en alerte.`),
  ].join(''), { email: v.email }),
})

const L8 = (v: StepVars) => ({
  subject: `La petite fille que tu étais.`,
  html: wrapEmail([
    p(`En août, tout ralentit un peu. C'est parfois là que remontent des choses qu'on n'a pas le temps de sentir le reste de l'année.`),
    p(`La plupart de nos automatismes se sont installés entre 0 et 7 ans. À un âge où on enregistrait tout sans filtre : les mots, les silences, les regards, l'amour qu'on recevait et la forme exacte sous laquelle on le recevait.`),
    p(`L'enfant intérieur, ce n'est pas du folklore. C'est très concret : c'est cette part de toi qui, aujourd'hui encore, réagit au monde avec les codes d'il y a trente ans.`),
    p(`Si tu ne l'as pas encore écoutée, la méditation de l'enfant intérieur t'attend dans tes cadeaux. Mets un casque, un moment au calme, et laisse-toi guider. Ce n'est pas une relaxation. C'est une rencontre.`),
    ctaButton('Retrouver mes cadeaux', URLS.cadeaux, { email: v.email }),
    signature(),
    ps(`Ce que tu peux offrir aujourd'hui à cette petite fille — ou ce petit garçon — c'est exactement ce que personne ne lui a donné à ce moment-là.`),
  ].join(''), { email: v.email }),
})

const L9 = (v: StepVars) => ({
  subject: `Ne reconstruis pas tout en une semaine.`,
  html: wrapEmail([
    p(`La rentrée. Les bonnes résolutions numéro deux de l'année. L'envie de tout reprendre, tout ranger, tout optimiser d'un coup.`),
    p(`Je vais te dire une chose : ton système nerveux déteste ça. Reconstruire toute une vie en une semaine, c'est le meilleur moyen de tout lâcher à la troisième.`),
    p(`<strong style="color:#e0e0e0;">Un geste, cette semaine.</strong> Choisis UN seul point d'appui pour ce mois. Un. Pas dix. Celui qui revient le plus souvent quand tu es honnête avec toi-même. Et tiens seulement celui-là.`),
    p(`La charge mentale ne se règle pas en ajoutant de la discipline. Elle se règle en enlevant ce qui n'a pas à être porté.`),
    signature(),
    ps(`Un chemin, ce n'est pas un buffet. Tu n'as pas à tout prendre. Tu as juste à avancer d'un pas, régulièrement.`),
  ].join(''), { email: v.email }),
})

const L10 = (v: StepVars) => ({
  subject: `Ce qu'on appelle « mauvais caractère ».`,
  html: wrapEmail([
    p(`Il y a une émotion qu'on apprend très tôt à ravaler : la colère. Surtout quand on est une femme. On nous a dit qu'il fallait être douce, arrangeante, compréhensive. Alors on avale.`),
    p(`Mais la colère qu'on n'exprime jamais ne disparaît pas. Elle se retourne. Elle devient fatigue, culpabilité, tristesse, ou ces explosions qui nous font honte parce qu'elles ne ressemblent pas à qui on croit être.`),
    p(`La colère n'est pas « du mauvais caractère ». C'est souvent une frontière qui a été franchie trop de fois sans qu'on ait eu le droit de le dire.`),
    p(`<strong style="color:#e0e0e0;">Un geste.</strong> La prochaine fois qu'elle monte, ne la juge pas tout de suite. Demande-lui : « qu'est-ce que tu protèges ? » Souvent, derrière la colère, il y a quelque chose de très ancien qu'on n'a jamais pu défendre.`),
    signature(),
    ps(`Une émotion qu'on écoute n'a plus besoin de crier. C'est quand on l'ignore qu'elle finit par prendre toute la place.`),
  ].join(''), { email: v.email }),
})

const L11 = (v: StepVars) => ({
  subject: `Combien ça coûte de continuer comme ça.`,
  html: wrapEmail([
    p(`En novembre, on commence à compter. Les cadeaux, les fins de mois, l'année qui coûte. Alors je vais te parler d'argent, sans théâtre.`),
    p(`Depuis mes 16 ans, j'ai investi l'équivalent de dizaines de milliers d'euros dans ma propre recherche : thérapies, formations, stages. Beaucoup de gens dépensent énormément pour aller mieux, et restent pourtant bloqués. Pas par manque de sérieux. Par manque d'une structure quotidienne.`),
    p(`SOS Shine, c'est 49,90€ par mois. Sans engagement. Volontairement accessible, parce que je ne voulais pas que quelqu'un reste dehors faute de moyens.`),
    p(`Mais la vraie question n'est pas « est-ce que ça coûte trop cher ». C'est : combien ça me coûte, chaque jour, de continuer exactement comme ça ?`),
    ctaButton('Rejoindre SOS Shine · 49,90€/mois', URLS.rejoindre, { email: v.email }),
    signature(),
    ps(`Si l'abonnement fait trop pour l'instant, il y a la plus petite porte : un protocole à 33€, avec un mois de plateforme offert. Le protocole reste à toi, à vie.`),
  ].join(''), { email: v.email }),
})

const L12 = (v: StepVars) => ({
  subject: `Dans 6 mois, à quoi ressemble ta vie ?`,
  html: wrapEmail([
    p(`On arrive au bout de l'année. Le moment des bilans qu'on s'invente pour se rassurer. Je ne vais pas te proposer ça.`),
    p(`Je vais juste te poser la question que je me suis posée, un matin, à Pékin : si absolument rien ne change, à quoi ressemble ta vie dans six mois ?`),
    p(`Pas la version qu'on raconte aux dîners. La vraie. Celle où tu te réveilles fatiguée sans comprendre pourquoi. Où tu dis encore oui à des choses que ton corps refuse. Où tu remets à « quand ce sera le bon moment ».`),
    p(`Si tu es honnête, tu sais déjà. Parce que cette vie-là ressemble à celle d'aujourd'hui. Et à celle d'il y a un an.`),
    p(`Cette vie n'est pas une fatalité. C'est l'expression de mécanismes qu'on peut identifier, comprendre et remplacer. Et le bon moment pour commencer, ce n'est pas janvier. C'est le jour où tu décides que cette version-là ne te suffit plus.`),
    ctaButton('Commencer maintenant · 49,90€/mois', URLS.rejoindre, { email: v.email }),
    signature(),
    ps(`Merci d'avoir lu mes lettres cette année. Que la prochaine soit un peu plus la tienne. Avec tout mon amour, Julia.`),
  ].join(''), { email: v.email }),
})

export const LETTERS: Letter[] = [
  { month: 1,  theme: 'Le recommencement sans mensonge', format: 'scene',      build: L1 },
  { month: 2,  theme: 'Le corps en hiver',              format: 'mecanisme',  build: L2 },
  { month: 3,  theme: "L'amour propre sans miroir",     format: 'mecanisme',  build: L3 },
  { month: 4,  theme: 'Les oui de trop',                format: 'invitation', build: L4 },
  { month: 5,  theme: 'Se choisir pour de vrai',        format: 'scene',      build: L5 },
  { month: 6,  theme: 'Les relations qui se rejouent',  format: 'mecanisme',  build: L6 },
  { month: 7,  theme: 'Le temps pour soi sans luxe',    format: 'mecanisme',  build: L7 },
  { month: 8,  theme: "L'enfant intérieur sans folklore", format: 'invitation', build: L8 },
  { month: 9,  theme: 'La rentrée du système nerveux',  format: 'mecanisme',  build: L9 },
  { month: 10, theme: "La colère qu'on avale",          format: 'mecanisme',  build: L10 },
  { month: 11, theme: 'L\'argent et la valeur',         format: 'invitation', build: L11 },
  { month: 12, theme: 'Finir l\'année sans se mentir',  format: 'invitation', build: L12 },
]

/** Renvoie la lettre du mois demandé (1-12). */
export function letterForMonth(month: number): Letter {
  return LETTERS.find(l => l.month === month) || LETTERS[0]
}
