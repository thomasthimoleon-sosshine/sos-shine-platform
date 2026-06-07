/**
 * SOS Shine — Quiz V2 Result Page Texts
 * Dynamic content for Actes 2, 3, 4 based on dominant dimension
 */

export type DimensionText = {
  acte2: string
  acte3: string
  acte4: { fatigue: string; situation: string; etat: string }
  costImmediate: [string, string, string]
  safetyNote?: string
}

export const DIMENSION_TEXTS: Record<string, DimensionText> = {
  '1': {
    acte2: `Chaque fois qu'on t'a demandé ce qui te traversait dans un moment difficile, tu es revenu(e) à un même endroit : celui où comprendre remplace sentir.

Tu vis tout par la tête. Parce que comprendre, c'est contrôler. Et contrôler, c'est ne plus avoir mal.

Mais à force de comprendre, tu es resté(e) à distance de toi-même.`,

    acte3: `Quelque part dans ton histoire, tu as appris que les émotions étaient trop grandes, trop intenses, trop dangereuses. Alors tu les as transformées en problèmes à résoudre.

Peut-être qu'on te demandait d'être "raisonnable" très tôt.
Peut-être que personne autour de toi ne savait accueillir tes émotions.
Peut-être que comprendre était le seul moyen d'exister dans ta famille.

Aujourd'hui, tu n'as plus besoin de cette stratégie. Mais elle est devenue toi.`,

    acte4: {
      fatigue: "analyse mentale qui tourne en boucle",
      situation: "distance émotionnelle avec tes proches",
      etat: "sentiment d'être spectateur/trice de ta propre vie",
    },

    costImmediate: [
      "les décisions que tu remets parce que tu ne fais pas confiance à ce que tu ressens",
      "les conversations où tu expliques au lieu de te laisser toucher",
      "la tête qui tourne en boucle la nuit alors que le corps, lui, attend",
    ],
  },

  '2': {
    acte2: `Chaque fois qu'on t'a demandé comment tu gérais un moment difficile, tu es revenu(e) à un même endroit : celui où bouger remplace s'arrêter.

Tu enchaînes les projets, les rendez-vous, les aventures. S'arrêter serait laisser la vague remonter.

Alors tu cours. Depuis si longtemps que tu ne sais plus ce que tu fuis.`,

    acte3: `Quelque part dans ton histoire, tu as appris que s'arrêter n'était pas sûr. Que le calme était dangereux. Que le silence laissait remonter trop de choses.

Peut-être parce que quand tu étais enfant, les moments calmes étaient en fait des moments de tension latente.
Peut-être parce que ne rien faire = ne pas exister dans ta famille.
Peut-être parce qu'à force de bouger, tu as tenu.

Tu es arrivé(e) là où tu es grâce à cette stratégie. Mais aujourd'hui, elle te coûte trop cher.`,

    acte4: {
      fatigue: "course sans jamais s'arrêter",
      situation: "impossibilité de te poser",
      etat: "vide que plus rien ne remplit",
    },

    costImmediate: [
      "les projets lancés à toute vitesse… puis abandonnés quand l'excitation retombe",
      "les relations que tu évites d'approfondir parce que ça obligerait à ralentir",
      "le vide qui revient dès que tu t'arrêtes enfin",
    ],
  },

  '3': {
    acte2: `Chaque fois qu'on t'a demandé ce qui comptait pour toi, tu es revenu(e) à un même endroit : celui où les autres passent avant toi.

Tu portes. Les enfants, les parents, l'équipe, le couple. Ta valeur vient de ce que tu fais pour les autres.

Et personne ne se demande jamais ce dont tu as besoin. Même pas toi.`,

    acte3: `Quelque part dans ton histoire, tu as appris que ta valeur venait de ce que tu faisais pour les autres.

Peut-être qu'un parent t'a eu(e) trop tôt et tu as dû être l'adulte.
Peut-être qu'un frère, une sœur, un parent avait besoin que tu portes.
Peut-être que l'amour autour de toi avait des conditions : il fallait être utile.

Tu as appris à exister par le don. Mais aujourd'hui, tu te perds dans les autres.`,

    acte4: {
      fatigue: "épuisement à donner sans recevoir",
      situation: "sentiment d'invisibilité",
      etat: "identité dissoute dans les besoins des autres",
    },

    costImmediate: [
      "l'énergie que tu donnes encore et encore, sans jamais en recevoir autant",
      "les besoins que tu tais pour ne pas paraître égoïste",
      "la sensation, au fond, de ne pas vraiment exister pour toi-même",
    ],
  },

  '4': {
    acte2: `Chaque fois qu'on t'a demandé ce que tu faisais quand ça n'allait pas, tu es revenu(e) à un même endroit : celui où tu portes ce que d'autres ne verront jamais.

Demander, pour toi, c'est t'exposer. Dépendre, c'est être en danger. Alors tu as construit des murs si solides qu'on ne voit même plus qu'ils existent.

Même toi.`,

    acte3: `Quelque part dans ton histoire — peut-être très tôt, peut-être récemment — tu as appris que demander de l'aide était dangereux.

Peut-être parce qu'on t'a répondu "tu es grand(e), tu peux gérer".
Peut-être parce que demander avait un coût (une punition, une déception, une dette).
Peut-être parce que la personne qui aurait dû t'entendre n'était pas disponible.

Le résultat est le même : tu as construit une autonomie si solide qu'elle est devenue une prison.`,

    acte4: {
      fatigue: "solitude pesante malgré les relations",
      situation: "impression de porter seul(e)",
      etat: "cœur fermé même à ceux qui t'aiment",
    },

    costImmediate: [
      "la fatigue silencieuse de tout porter sans jamais rien montrer",
      "la solitude au milieu des gens qui t'aiment — et qui ne le savent pas",
      "les mots que tu n'arrives pas à prononcer même quand tu en aurais besoin",
    ],
  },

  '5': {
    acte2: `Chaque fois qu'on t'a demandé ce qui t'épuisait, tu es revenu(e) à un même endroit : celui où tout doit être prévu, planifié, maîtrisé.

Le lâcher-prise te terrifie. Parce que la dernière fois que tu as lâché, quelque chose s'est cassé.

Depuis, tu tiens les rênes. De tout. Tout le temps.`,

    acte3: `Quelque part dans ton histoire, quelque chose s'est effondré sans que tu puisses rien faire.

Peut-être un événement brutal.
Peut-être le divorce de tes parents.
Peut-être un proche qui est parti.
Peut-être une accumulation de petites trahisons.

Depuis ce jour, tu as décidé qu'on ne t'y reprendrait plus. Tenir les rênes est devenu ta façon de survivre. Mais ça t'épuise.`,

    acte4: {
      fatigue: "tension permanente pour tout tenir",
      situation: "incapacité à te détendre vraiment",
      etat: "corps qui craque sous la pression du contrôle",
    },

    costImmediate: [
      "l'énergie gaspillée à anticiper des scénarios qui n'arrivent jamais",
      "les relations tendues par ton besoin de maîtriser ce que tu ne peux pas contrôler",
      "l'impossibilité de te détendre vraiment — même en vacances, même la nuit",
    ],
  },

  '6': {
    acte2: `Chaque fois qu'on t'a demandé qui tu étais vraiment, tu es revenu(e) à un même endroit : celui où tu n'es plus tout à fait sûr(e).

Tu es différent(e) avec chaque personne. Professionnel(le) au boulot. Drôle avec les amis. Fragile en couple.

À force de t'adapter, tu as oublié qui tu es quand personne ne regarde.`,

    acte3: `Quelque part dans ton histoire, tu as appris qu'être vraiment toi-même n'était pas sûr.

Peut-être parce qu'on te rejetait quand tu étais trop "quelque chose" (trop sensible, trop bruyant(e), trop différent(e)).
Peut-être parce qu'un parent avait une idée très précise de qui tu devais être.
Peut-être parce que s'adapter était le seul moyen de maintenir l'amour.

Tu es devenu(e) un caméléon pour survivre. Mais aujourd'hui, tu ne sais plus quelle couleur est vraiment la tienne.`,

    acte4: {
      fatigue: "fatigue de jouer un rôle",
      situation: "sensation de ne plus savoir qui tu es",
      etat: "identité floue, vie qui ne te ressemble pas",
    },

    costImmediate: [
      "l'énergie épuisante de calibrer ta personnalité selon les gens en face de toi",
      "le vide quand tu es enfin seul(e) et que tu ne sais plus quoi ressentir",
      "la sensation sourde de vivre une vie qui n'est pas vraiment la tienne",
    ],
  },

  '7': {
    acte2: `Chaque fois qu'on t'a demandé comment tu traversais tes journées, tu es revenu(e) à un même endroit : celui où tu scannes en permanence.

Les gens, les situations, les risques. Tu as été surpris(e) une fois de trop. Maintenant, tu anticipes.

Tu dors mal. Tu vis en alerte. Même quand tout va bien, quelque chose en toi reste tendu.`,

    acte3: `Quelque part dans ton histoire, tu as été surpris(e) d'une manière trop brutale.

Peut-être un événement traumatique.
Peut-être un environnement où l'imprévisible régnait (parent instable, violence, addictions).
Peut-être une trahison qui a cassé ta confiance dans le monde.

Depuis, ton système nerveux scanne en permanence. Ce n'est pas une faiblesse. C'est une adaptation. Mais elle te maintient dans un état d'épuisement silencieux.`,

    acte4: {
      fatigue: "épuisement d'être toujours en alerte",
      situation: "incapacité à te sentir en sécurité",
      etat: "corps qui ne dort jamais vraiment",
    },

    costImmediate: [
      "le sommeil fragmenté — ton corps ne sait plus quand il peut vraiment se reposer",
      "la méfiance qui s'infiltre même dans tes relations les plus proches",
      "l'épuisement silencieux d'un corps qui reste en alerte même quand tout va bien",
    ],

    safetyNote: "Tu n'as pas à porter ça seul(e).",
  },

  '8': {
    acte2: `Chaque fois qu'on t'a demandé ce qui te portait, tu es revenu(e) à un même endroit : celui de la promesse d'un futur meilleur.

Le présent est toujours décevant. Ce que tu as n'est jamais à la hauteur de ce que tu imagines.

Tu es nostalgique d'un monde qui n'existe pas encore. Ou qui n'existera jamais.`,

    acte3: `Quelque part dans ton histoire, le présent a été trop pauvre. Trop étroit. Trop décevant.

Peut-être parce que ta famille ne t'offrait pas ce dont tu avais besoin.
Peut-être parce qu'un rêve très grand te protégeait d'une réalité très petite.
Peut-être parce que tu as grandi avec la sensation que ta vraie vie commencerait "plus tard".

Vivre dans l'idéal était un refuge. Mais aujourd'hui, c'est une cage qui t'empêche d'habiter le présent.`,

    acte4: {
      fatigue: "déception face à un présent qui ne sera jamais à la hauteur",
      situation: "report permanent de ta vraie vie",
      etat: "nostalgie d'un futur qui n'arrive jamais",
    },

    costImmediate: [
      "les opportunités du présent que tu laisses filer en attendant mieux",
      "les relations que tu dévalorisent parce qu'elles ne sont pas à la hauteur de ce que tu imagines",
      "l'insatisfaction chronique qui te ronge — quoi que tu obtiennes",
    ],
  },

  '9': {
    acte2: `Chaque fois qu'on t'a demandé comment tu gérais les tensions, tu es revenu(e) à un même endroit : celui où apaiser les autres passe avant tout.

Tu lisses, tu arrondis, tu absorbes. Les conflits te paralysent.

Tu préfères renoncer à ce que tu veux plutôt que de déranger. Depuis si longtemps que tu ne sais plus vraiment ce que tu veux.`,

    acte3: `Quelque part dans ton histoire, tu as appris que les conflits avaient un coût trop grand.

Peut-être parce qu'un parent s'effondrait ou se mettait en colère au moindre désaccord.
Peut-être parce que dire non entraînait un retrait d'amour.
Peut-être parce que le silence était la paix dans ton foyer.

Tu as appris à lisser, à apaiser, à disparaître. Tu es devenu(e) le baume de la famille. Mais aujourd'hui, tu t'effaces même dans tes relations les plus importantes.`,

    acte4: {
      fatigue: "renoncement à ce que tu veux",
      situation: "invisibilité volontaire dans tes relations",
      etat: "sentiment de vivre la vie des autres",
    },

    costImmediate: [
      "les fois où tu dis oui alors que tout en toi voulait dire non",
      "les gens qui t'oublient ou te prennent pour acquis(e) — parce que tu ne demandes jamais",
      "ta propre voix, de plus en plus difficile à entendre",
    ],
  },

  '10': {
    acte2: `Chaque fois qu'on t'a demandé ce qui te faisait sentir vivant(e), tu es revenu(e) à un même endroit : celui où seule l'intensité suffit.

L'intensité, la passion, le drame. Tu préfères la tempête au plat. Le chaos à l'ennui.

Mais derrière la provocation, il y a un vide que tu essaies de remplir avec du bruit.`,

    acte3: `Quelque part dans ton histoire, le calme a été associé au vide. Au silence inquiétant. À l'absence.

Peut-être parce qu'on ne s'intéressait à toi que quand tu faisais des "scènes".
Peut-être parce que l'intensité était le seul moyen de sentir que tu existais.
Peut-être parce que les émotions fortes te rassurent : au moins, là, tu sens.

Tu as appris à provoquer pour vivre. Mais aujourd'hui, l'intensité elle-même est devenue un gouffre.`,

    acte4: {
      fatigue: "alternance épuisante entre hauts et bas",
      situation: "incapacité à trouver la paix",
      etat: "peur du calme devenue plus grande que tout",
    },

    costImmediate: [
      "les relations que tu sabotes dès qu'elles deviennent trop stables",
      "l'épuisement après chaque tempête — que tu as souvent déclenchée toi-même",
      "l'incapacité à te sentir bien dans le calme, même quand tu le veux",
    ],
  },
}

/**
 * Generate Acte 4 text from template + dimension variables
 */
export function generateActe4(dim: string): string {
  const texts = DIMENSION_TEXTS[dim]
  if (!texts) return ''
  const { fatigue, situation, etat } = texts.acte4

  return `Dans 6 mois, la même ${fatigue}.

Dans un an, la même ${situation}.

Dans 5 ans, le même ${etat}.


Et un matin, peut-être, cette question terrible :

"Qu'ai-je fait de ma vie ?"


Tu mérites mieux.`
}
