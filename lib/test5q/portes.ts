import type { Slug } from './data'

export type Porte = {
  slug: Slug
  nomCourant: string
  phrase: [string, string]
  antiCase: string
  lettre: string[]
  ceSoir: { geste: string; explication: string }
  offreSousTexte: string
  jours: [string, string, string, string]
  safetyText?: string
}

export const PORTES: Record<Slug, Porte> = {
  'dependance-affective': {
    slug: 'dependance-affective',
    nomCourant: 'la dépendance affective',
    phrase: [
      'Tu n’as pas peur d’aimer.',
      'Tu as peur qu’on parte dès que tu aimeras vraiment.',
    ],
    antiCase:
      'On appelle souvent ça la dépendance affective. Ce n’est pas qui tu es. C’est ce que tu fais dès que le silence arrive.',
    lettre: [
      'Tu n’as pas « un problème avec l’amour ». Tu as appris que tu existais quand quelqu’un te répondait. Alors maintenant tu surveilles le téléphone comme on surveille une porte.',
      'Le message arrive : tu redescends. Il n’arrive pas : le trou se rouvre. Ce n’est pas de l’amour, ça. C’est un manque qui a pris le visage de l’amour.',
      'Tu réorganises tes heures. Tu relis. Tu attends. Et tu te racontes que tu es « trop ». Tu n’es pas trop. Tu as juste déposé chez l’autre un truc qui devrait rester chez toi : le droit d’être là, même quand personne n’écrit.',
      'Si rien ne change, ce n’est pas que tu vas mal aimer. C’est que chaque silence va encore décider de ta valeur. Demain. Après-demain. Encore.',
      'Tu n’as pas à prévenir cette personne. Ce travail ne la concerne pas.',
    ],
    ceSoir: {
      geste: 'Pose le téléphone dans une autre pièce. Vingt minutes.',
      explication:
        'Pas pour le punir. Pour voir ce qui reste de toi quand il n’y a plus de preuve.',
    },
    offreSousTexte:
      'Pas une appli. Pas un profil. Une semaine sur ce point précis : exister sans attendre le message.',
    jours: [
      'Comprendre le trou, sans te juger',
      'Le corps, quand le téléphone se tait',
      'Reprendre ce que tu as déposé chez l’autre',
      'Une journée sans demander la preuve',
    ],
  },

  'amour-propre': {
    slug: 'amour-propre',
    nomCourant: 'le manque d’amour-propre',
    phrase: [
      'Tu n’as pas un manque de confiance.',
      'Tu t’es habituée à te parler comme on ne parlerait pas à une copine.',
    ],
    antiCase:
      'On appelle souvent ça le manque d’amour-propre. Ce n’est pas qui tu es. C’est la voix que tu allumes dès que tu te trompes.',
    lettre: [
      'Tu te rabaisse. Tu t’excuses pour des trucs que personne ne t’a reprochés. Tu te trouves nulle au moins trois fois par jour et tu ne t’en rends même plus compte.',
      'Ce n’est pas de l’humilité. C’est une vieille habitude. Une voix qui dit « tu n’es pas assez » tellement souvent que tu as fini par la croire. Tu la connais mieux que la tienne.',
      'Tu fais petit. Tu t’effaces dans une pièce. Tu te juges avant que les autres aient le temps de le faire. Tu te trahis un peu chaque jour pour rester acceptable. Et personne ne voit, parce que tu souris.',
      'Si rien ne change, chaque erreur va encore confirmer ce que tu crois déjà : que tu ne vaux pas grand-chose. Pas parce que c’est vrai. Parce que c’est le seul regard que tu t’autorises.',
      'Tu n’as pas besoin que quelqu’un te dise que tu es bien. Tu as besoin de te le dire toi-même, et de le croire un peu.',
    ],
    ceSoir: {
      geste:
        'Écris 3 phrases que tu t’es dites aujourd’hui. En face, écris ce que tu dirais à une copine dans la même situation.',
      explication:
        'Ne corrige pas. Lis-les à voix haute.',
    },
    offreSousTexte:
      'Pas un coaching. Pas un mantra. Une semaine à arrêter de se trahir pour rester acceptable.',
    jours: [
      'Se voir sans se juger',
      'La voix dans la tête',
      'Un geste de respect concret',
      'Une journée sans se rabaisser',
    ],
  },

  'confiance-en-soi': {
    slug: 'confiance-en-soi',
    nomCourant: 'le manque de confiance',
    phrase: [
      'Tu n’es pas « pas prête ».',
      'Tu attends une permission qui ne viendra pas.',
    ],
    antiCase:
      'On appelle souvent ça le manque de confiance. Ce n’est pas qui tu es. C’est ce que tu fais juste avant d’oser.',
    lettre: [
      'Tu sais ce que tu veux faire. Tu le sais depuis longtemps. Le dire, l’envoyer, le quitter, le commencer. Mais au moment d’agir, tu recules. Tu te dis « pas encore » ou « pas comme ça ».',
      'Ce n’est pas de la prudence. C’est la peur de mal faire qui a pris le pouvoir. Tu attends d’être parfaite pour avoir le droit de bouger. Alors tu ne bouges pas.',
      'Tu remets à demain. Demain tu te promets d’oser. Et demain, tu ne fais rien. Pas parce que tu es lâche. Parce que personne ne t’a jamais dit que tu avais le droit de te tromper.',
      'Si rien ne change, ce n’est pas que tu vas rater ta vie. C’est que tu vas la passer en version brouillon. Toujours presque prête. Jamais partie.',
      'Tu n’as pas à demander la permission. Le premier pas n’a pas besoin d’être parfait. Il a besoin d’être fait.',
    ],
    ceSoir: {
      geste:
        'Un seul pas, déjà prévu. L’envoyer, le dire, le poster. Pas le grand saut.',
      explication:
        'La confiance ne vient pas avant. Elle vient après.',
    },
    offreSousTexte:
      'Pas un stage de motivation. Une semaine à agir sans attendre d’être prête.',
    jours: [
      'Nommer le recul',
      'Le corps avant le geste',
      'Un pas par jour',
      'Faire la chose sans demander la permission',
    ],
  },

  'burn-out': {
    slug: 'burn-out',
    nomCourant: 'le burn-out',
    phrase: [
      'Tu n’es pas faible.',
      'Tu portes ce qui ne t’appartient pas, depuis trop longtemps.',
    ],
    antiCase:
      'On appelle souvent ça le burn-out. Ce n’est pas qui tu es. C’est ce qui reste quand tu as tout porté.',
    lettre: [
      'Tu dis oui. Tu tiens. Tu portes pour tout le monde. Tu es celle qui gère, celle qui reste, celle qui répond à minuit. Et personne ne te demande si tu vas bien, parce que tu as l’air de tenir.',
      'Ton corps a lâché. Ou il est sur le point. Le vide au réveil. La liste qui ne finit jamais. La machine qui tourne sans toi dedans. Ce n’est pas du dévouement. C’est une charge qui n’a pas de fin.',
      'Tu as appris que tenir, c’était une vertu. Que poser, c’était abandonner. Alors tu portes des trucs qui ne sont pas à toi. Et tu en veux aux gens que tu aides, sans oser le dire.',
      'Si rien ne change, ce n’est pas que tu vas craquer « un jour ». C’est que tu vis déjà dans le vide. Un vide déguisé en efficacité.',
      'Tu n’as pas à prévenir les gens que tu arrêtes de tout porter. Ce n’est pas un abandon. C’est un premier souffle.',
    ],
    ceSoir: {
      geste:
        'Une heure où tu ne portes rien. Téléphone en silence. Personne à sauver.',
      explication:
        'Si la culpabilité vient, tu la laisses passer sans te relever.',
    },
    offreSousTexte:
      'Pas un plan de productivité. Une semaine à poser ce qui n’est pas à toi.',
    jours: [
      'Voir la charge',
      'Le corps vidé',
      'Dire non une fois',
      'Une journée avec une seule priorité',
    ],
  },

  'traumatisme': {
    slug: 'traumatisme',
    nomCourant: 'un trauma',
    phrase: [
      'Tu n’es pas « trop sensible ».',
      'Ton corps a gardé ce que ta tête a voulu ranger.',
    ],
    antiCase:
      'On appelle souvent ça un trauma. Ce n’est pas qui tu es. C’est ce que ton corps refait dès qu’un bruit, un geste, ramène là-bas.',
    lettre: [
      'Quelque chose s’est passé. Tu le sais. Ta tête a compris. Elle a rangé, classé, expliqué. Mais ton corps, lui, n’a pas reçu le message.',
      'Il sursaute. Il se fige. Il part ailleurs sans prévenir. Certains bruits, certains gestes, te ramènent là-bas en une seconde. Et tu te dis que tu devrais aller mieux parce que « c’est fini ».',
      'Ce n’est pas de la faiblesse. C’est une mémoire. Elle vit dans le ventre, dans les épaules, dans la gorge. Elle ne se raisonne pas. Elle se traverse.',
      'Si rien ne change, ce n’est pas que tu vas « rester bloquée ». C’est que ton corps va continuer à réagir à ta place. Et tu vas continuer à te couper de lui pour tenir.',
      'Tu n’as rien à raconter ce soir. Personne ne force. Tu avances à ton rythme.',
    ],
    ceSoir: {
      geste:
        'Les pieds au sol, 10 minutes. Nomme 5 choses que tu vois dans la pièce.',
      explication:
        'Tu n’as pas à te raconter l’histoire ce soir.',
    },
    offreSousTexte:
      'Pas une thérapie. Une semaine pour habiter le corps sans avoir peur.',
    jours: [
      'Mettre des mots justes',
      'Le corps en sécurité',
      'Les déclencheurs',
      'Un moment dans le corps sans fuir',
    ],
    safetyText:
      'Ce travail est un compagnon. Il ne remplace pas un professionnel formé au trauma. France Victimes : 116 006. Détresse aiguë : 3114.',
  },

  'rupture': {
    slug: 'rupture',
    nomCourant: 'une rupture',
    phrase: [
      'Tu n’es pas incapable de tourner la page.',
      'Tu vis encore dans une histoire qui est finie.',
    ],
    antiCase:
      'On appelle souvent ça une rupture. Ce n’est pas qui tu es. C’est ce que tu fais dès que tu relis, dès que tu revois la scène.',
    lettre: [
      'C’est fini avec quelqu’un. Tu le sais. Tu l’as dit, ou on te l’a dit. Mais la nuit, tu tends la main de l’autre côté du lit. Et c’est vide.',
      'Tu relis les messages. Tu rejoues la dernière semaine. Tu vérifies si cette personne a vu ta story. Tu te dis que tu devrais avoir tourné la page. Et tu ne l’as pas fait.',
      'Ce n’est pas de l’amour qui reste. C’est une place encore occupée. Tu ne sais plus qui tu es sans cette personne. Pas parce qu’elle était tout. Parce que tu t’étais oubliée dedans.',
      'Si rien ne change, ce n’est pas que tu vas souffrir « encore un peu ». C’est que tu vas continuer à vivre dans une histoire finie. Et la prochaine commencera sur les restes de celle-là.',
      'Tu n’as pas à effacer. Tu n’as pas à oublier. Tu as à redevenir quelqu’un pour toi, pas pour deux.',
    ],
    ceSoir: {
      geste:
        'Tu ne rouvres pas la conversation. Tu ne relis pas. Une heure. Juste ça.',
      explication:
        'Pas pour oublier. Pour voir que tu tiens sans.',
    },
    offreSousTexte:
      'Pas un conseil d’amie. Une semaine à redevenir quelqu’un pour soi, plus pour deux.',
    jours: [
      'Dire que c’est fini pour de vrai',
      'Le manque dans le corps',
      'Couper les rituels d’attente',
      'Une journée sans relire',
    ],
  },

  'deuil': {
    slug: 'deuil',
    nomCourant: 'un deuil',
    phrase: [
      'Tu n’es pas « en retard » sur le deuil.',
      'Tu traverses une absence, et personne ne peut l’accélérer.',
    ],
    antiCase:
      'On appelle souvent ça un deuil. Ce n’est pas qui tu es. C’est ce qui reste quand quelqu’un, ou toute une vie, n’est plus là.',
    lettre: [
      'Quelqu’un n’est plus là. Ou une vie entière s’est arrêtée. Tu fais semblant que ça va. Tu souris pour les autres. Tu dis « ça va aller » parce que c’est ce qu’on attend.',
      'La nuit, tu parles à quelqu’un qui n’est plus là. Tu t’en veux d’avoir ri un jour. Tu portes une absence qui pèse dans chaque pièce, et personne ne la voit.',
      'Ce n’est pas un manque de courage. C’est une perte. Et une perte, ça ne se « gère » pas. Ça se traverse. Avec un cadre. Pas avec une injonction à aller mieux.',
      'Si rien ne change, ce n’est pas que tu vas « rester triste ». C’est que tu vas continuer à faire semblant. Et faire semblant, c’est épuisant.',
      'Tu n’as rien à accomplir ce soir. Tu n’as pas à guérir. Tu as à traverser.',
    ],
    ceSoir: {
      geste:
        'Dis le prénom à voix haute. Une fois. Allume une lumière.',
      explication:
        'Rien d’autre à accomplir.',
    },
    offreSousTexte:
      'Pas un livre sur les étapes du deuil. Une semaine avec un cadre pour traverser, pas un ordre d’oublier.',
    jours: [
      'Nommer la perte',
      'Le corps de l’absence',
      'Le masque pour les autres',
      'Une journée où tu n’as pas à faire semblant',
    ],
    safetyText:
      'Ce travail est un compagnon. Il ne remplace pas un professionnel. En détresse aiguë : 3114 (24h/24).',
  },
}

export function getPorte(slug: string): Porte | null {
  return (PORTES as Record<string, Porte>)[slug] ?? null
}
