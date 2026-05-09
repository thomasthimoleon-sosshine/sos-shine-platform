/**
 * SOS Shine — Quiz V2 Archetype Layer
 *
 * 25 emotional archetypes displayed on top of the existing 10-dimension scoring engine.
 * Dimensions are NOT replaced — archetypes are a memorable identity layer added above them.
 *
 * Mapping: (dominant_dimension, secondary_dimension) → archetype key
 */

export type Blessure = 'Rejet' | 'Abandon' | 'Humiliation' | 'Trahison' | 'Injustice'

export type Archetype = {
  key: string
  name: string
  blessure: Blessure
  emotion: string
  mode: string
  zone: string
  signes: string[]
  explication: string
}

export const ARCHETYPES: Record<string, Archetype> = {
  gardien_epuise: {
    key: 'gardien_epuise',
    name: 'LE GARDIEN ÉPUISÉ',
    blessure: 'Injustice',
    emotion: 'Colère rentrée',
    mode: 'Contrôle',
    zone: 'Famille',
    signes: [
      'Tu portes tout le monde sur tes épaules, même ceux qui ne te l\'ont pas demandé',
      'Tu te sens responsable de l\'équilibre autour de toi, au point d\'oublier le tien',
      'Tu as du mal à déléguer parce que "personne ne fait aussi bien que toi"',
      'Au fond, tu es épuisé(e) mais tu n\'oses pas t\'arrêter',
    ],
    explication: `Enfant, tu as appris que pour être aimé(e), il fallait être utile. Être fort(e). Être celui ou celle qui tient. Ton système nerveux a mémorisé que le contrôle = la sécurité, et le lâcher-prise = le danger.

Ce n'est pas ta faute : c'est une stratégie de survie brillante qui a fonctionné. Mais aujourd'hui, elle te coûte ton énergie vitale.`,
  },

  hyper_vigilant: {
    key: 'hyper_vigilant',
    name: 'L\'HYPER-VIGILANT(E)',
    blessure: 'Abandon',
    emotion: 'Anxiété',
    mode: 'Contrôle',
    zone: 'Couple',
    signes: [
      'Tu scannes en permanence les émotions de l\'autre pour anticiper un éventuel rejet',
      'Un message sans réponse déclenche un vertige intérieur disproportionné',
      'Tu as besoin de savoir où l\'autre est, ce qu\'il pense, ce qu\'il ressent',
      'Tu sais que c\'est "trop" mais tu n\'arrives pas à couper l\'alerte',
    ],
    explication: `Ton système nerveux a appris très tôt que l'amour pouvait disparaître d'une seconde à l'autre. Alors il reste en veille. Toujours.

Ce n'est pas de la jalousie ni du contrôle : c'est une alarme d'enfant qui n'a jamais été désactivée. Ton corps continue à chercher la sécurité là où, enfant, elle a manqué.`,
  },

  invisible_lumineux: {
    key: 'invisible_lumineux',
    name: 'L\'INVISIBLE LUMINEUX(SE)',
    blessure: 'Rejet',
    emotion: 'Honte',
    mode: 'Effacement',
    zone: 'Identité',
    signes: [
      'Tu as l\'impression que ta présence dérange, même quand on t\'invite',
      'Tu t\'excuses d\'exister avant même d\'avoir parlé',
      'Tu brilles en coulisses mais tu te fais petit(e) dès qu\'on te regarde',
      'Tu rêves d\'être vu(e) mais tu as appris à disparaître',
    ],
    explication: `Un jour, quelqu'un t'a fait comprendre — peut-être sans mot, peut-être d'un regard — que tu étais "en trop". Ton être profond a entendu "je ne suis pas légitime".

Tu n'es pas timide : tu es blessé(e) de rejet. Et la lumière que tu portes cherche juste la permission de sortir.`,
  },

  volcan_contenu: {
    key: 'volcan_contenu',
    name: 'LE VOLCAN CONTENU',
    blessure: 'Humiliation',
    emotion: 'Colère rentrée',
    mode: 'Somatisation',
    zone: 'Corps',
    signes: [
      'Tu as des tensions chroniques — mâchoire, épaules, dos, ventre',
      'Des migraines ou des maux qui "sortent de nulle part"',
      'Tu ne te mets jamais en colère, mais ton corps dit non pour toi',
      'Il y a quelque chose qui pousse de l\'intérieur, sans sortir',
    ],
    explication: `Enfant, on t'a appris que la colère était dangereuse, sale, interdite. Alors tu l'as avalée. Mais l'énergie d'une émotion ne disparaît jamais : elle se loge dans les tissus.

Ton corps porte ce que ta voix n'a pas eu le droit de dire. Ce n'est pas une maladie : c'est une mémoire.`,
  },

  explorateur_perdu: {
    key: 'explorateur_perdu',
    name: 'L\'EXPLORATEUR(RICE) PERDU(E)',
    blessure: 'Trahison',
    emotion: 'Vide',
    mode: 'Fuite',
    zone: 'Sens',
    signes: [
      'Tu changes de projet, de ville, de relation dès que ça devient "stable"',
      'Tu cherches un sens, une mission, un appel — sans jamais le trouver',
      'Tu as un besoin viscéral de nouveauté pour sentir que tu existes',
      'Quand tout est calme, un vide immense apparaît et tu fuis à nouveau',
    ],
    explication: `Quelqu'un a trahi la confiance de l'enfant que tu étais. Depuis, rester = risquer d'être trahi(e) à nouveau. Alors tu pars avant.

Ce que tu cherches dehors, ce n'est pas un sens : c'est un endroit où tu pourrais enfin poser ta confiance sans qu'on te la brise.`,
  },

  loup_solitaire: {
    key: 'loup_solitaire',
    name: 'LA LOUVE / LE LOUP SOLITAIRE',
    blessure: 'Abandon',
    emotion: 'Tristesse',
    mode: 'Retrait',
    zone: 'Couple',
    signes: [
      'Tu préfères être seul(e) que mal accompagné(e) — et c\'est devenu une règle',
      'Tu attires des gens, puis tu prends peur et tu t\'éloignes',
      'Tu as une force tranquille, mais une tristesse de fond qui ne te quitte pas',
      'Au fond, tu aimerais être rejoint(e), mais tu ne sais plus comment',
    ],
    explication: `Tu as appris que compter sur quelqu'un, c'est risquer d'être laissé(e). Alors tu as transformé ta blessure en philosophie : "je me suffis".

Mais ton corps, lui, sait que l'humain n'est pas fait pour être seul. Ce n'est pas de l'indépendance : c'est une prudence qui t'a sauvé(e), et qui aujourd'hui t'isole.`,
  },

  chevalier_masque: {
    key: 'chevalier_masque',
    name: 'LE CHEVALIER / LA GUERRIÈRE MASQUÉ(E)',
    blessure: 'Humiliation',
    emotion: 'Peur',
    mode: 'Contrôle',
    zone: 'Travail',
    signes: [
      'Tu performes, tu brilles, tu es irréprochable — au prix de ta santé',
      'Personne ne te voit fragile, et tu préfères que ça reste comme ça',
      'Tu as peur qu\'on découvre que tu n\'es "pas à la hauteur"',
      'Tu confonds valeur personnelle et performance professionnelle',
    ],
    explication: `On t'a humilié(e) quand tu étais vulnérable. Alors plus jamais. Ton armure, c'est la compétence. Ton bouclier, c'est l'excellence.

Mais derrière, il y a un(e) enfant qui continue à trembler à l'idée d'être rabaissé(e). Ta réussite n'est pas ton problème : c'est la peur qui l'alimente qui t'épuise.`,
  },

  accordeur_perpetuel: {
    key: 'accordeur_perpetuel',
    name: 'L\'ACCORDEUR(SE) PERPÉTUEL(LE)',
    blessure: 'Rejet',
    emotion: 'Culpabilité',
    mode: 'Sacrifice',
    zone: 'Couple',
    signes: [
      'Tu dis oui avant même d\'avoir écouté ton envie',
      'Tu te sens coupable de poser une limite, même quand c\'est légitime',
      'Tu adaptes ta personnalité à chaque personne — et tu ne sais plus qui tu es',
      'Dans tes relations, tu portes 80% de l\'effort émotionnel',
    ],
    explication: `Tu as appris que tu étais aimé(e) quand tu étais "gentil(le)", arrangeant(e), pratique. Ton "non" a été puni ou ignoré. Alors il a disparu.

Ce que tu appelles "être gentil(le)" est en réalité une stratégie de survie : plaire pour ne pas être rejeté(e). Et ça te coûte ton identité.`,
  },

  scientifique_glace: {
    key: 'scientifique_glace',
    name: 'LE/LA SCIENTIFIQUE GLACÉ(E)',
    blessure: 'Trahison',
    emotion: 'Peur',
    mode: 'Évitement',
    zone: 'Couple',
    signes: [
      'Tu analyses tout, y compris tes émotions — et celles des autres',
      'Tu es en relation mais émotionnellement "à côté", comme sous cloche',
      'Tu as des raisonnements brillants pour ne pas ressentir',
      'Tu te demandes parfois si tu es "cassé(e)" au niveau affectif',
    ],
    explication: `On t'a trahi(e) alors que tu étais ouvert(e). Ton cerveau a conclu : "ressentir = danger". Il a construit une paroi de verre entre toi et tes émotions pour te protéger.

Ce n'est pas une froideur naturelle : c'est une anesthésie très sophistiquée. Sous la glace, tout est encore là — intact.`,
  },

  enfant_perdu: {
    key: 'enfant_perdu',
    name: 'L\'ENFANT PERDU(E)',
    blessure: 'Abandon',
    emotion: 'Tristesse',
    mode: 'Gel',
    zone: 'Sens',
    signes: [
      'Tu as une sensation de flottement, comme si tu n\'étais jamais vraiment là',
      'Tu ne sais pas ce que tu veux, ce qui te plaît, ce que tu ressens',
      'Tu regardes les autres vivre et tu as l\'impression d\'être spectateur(rice)',
      'Une tristesse ancienne est présente, sans raison claire',
    ],
    explication: `Quand on est abandonné(e) émotionnellement enfant, une partie de soi "sort" du corps pour ne pas sentir. C'est un mécanisme de dissociation — brillant, protecteur, normal.

Mais cette partie-là ne revient pas toute seule. Elle attend qu'on aille la chercher avec douceur. Tu n'es pas perdu(e) : tu es en attente de retour.`,
  },

  architecte_obsessionnel: {
    key: 'architecte_obsessionnel',
    name: 'L\'ARCHITECTE OBSESSIONNEL(LE)',
    blessure: 'Injustice',
    emotion: 'Anxiété',
    mode: 'Contrôle',
    zone: 'Travail',
    signes: [
      'Tu planifies, anticipes, vérifies — et ça ne suffit jamais',
      'Une tâche imprévue déclenche un pic d\'angoisse disproportionné',
      'Tu ne t\'endors pas sans avoir mentalement "rangé" la journée du lendemain',
      'Tu as honte de ta rigidité mais tu n\'arrives pas à lâcher',
    ],
    explication: `Tu as vécu, jeune, un environnement injuste où tout pouvait basculer sans prévenir. Ton cerveau a tiré une conclusion : "si je prévois tout, rien ne peut me surprendre."

Le contrôle est devenu ton oxygène. Ce n'est pas de la maniaquerie : c'est une anxiété de survie qui s'est professionnalisée.`,
  },

  rebelle_blesse: {
    key: 'rebelle_blesse',
    name: 'LE/LA REBELLE BLESSÉ(E)',
    blessure: 'Injustice',
    emotion: 'Colère',
    mode: 'Agression',
    zone: 'Famille',
    signes: [
      'Tu exploses sur des détails et tu le regrettes ensuite',
      'Tu as une rage intérieure qui te fatigue autant qu\'elle te défend',
      'Tu es en conflit chronique avec ta famille ou tes figures d\'autorité',
      'Au fond, tu voudrais juste qu\'on reconnaisse que c\'était injuste',
    ],
    explication: `Ta colère n'est pas un défaut : c'est la trace d'une injustice qui n'a jamais été réparée. Personne n'a jamais dit "ce qui t'est arrivé n'était pas juste, et je suis désolé(e)."

Alors la colère monte la garde pour toi. Elle protège un(e) enfant qui attend encore sa reconnaissance.`,
  },

  donneur_sans_retour: {
    key: 'donneur_sans_retour',
    name: 'LE/LA DONNEUR(SE) SANS RETOUR',
    blessure: 'Rejet',
    emotion: 'Épuisement',
    mode: 'Sacrifice',
    zone: 'Couple',
    signes: [
      'Tu donnes beaucoup, tout le temps, à tout le monde',
      'Tu as peur que si tu arrêtais de donner, on ne t\'aimerait plus',
      'Tu es entouré(e) mais tu te sens seul(e) sur l\'essentiel',
      'Recevoir te met mal à l\'aise, ça te fait presque honte',
    ],
    explication: `Tu as appris que ta valeur se mesurait à ce que tu pouvais offrir. Pas à ce que tu es. Alors donner est devenu une monnaie d'existence.

Le problème, c'est que personne ne peut remplir un puits qui n'a jamais été rempli à la base. Tu ne donnes pas par amour : tu donnes par peur d'être abandonné(e) si tu arrêtes.`,
  },

  cherchant_fatigue: {
    key: 'cherchant_fatigue',
    name: 'LE CHERCHANT / LA CHERCHANTE FATIGUÉ(E)',
    blessure: 'Trahison',
    emotion: 'Mélancolie',
    mode: 'Fuite',
    zone: 'Sens',
    signes: [
      'Tu cumules les formations, les livres, les thérapies, les retraites',
      'Tu sais beaucoup de choses, mais rien ne te transforme en profondeur',
      'Tu sens qu\'il te manque quelque chose, sans pouvoir le nommer',
      'Une mélancolie douce t\'accompagne, surtout la nuit',
    ],
    explication: `Quelqu'un en qui tu avais confiance a trahi quelque chose d'important. Depuis, tu cherches une vérité qui ne te décevra pas. Mais tu la cherches dehors — alors qu'elle est dedans.

Tu n'as pas besoin d'un nouveau savoir : tu as besoin qu'on te dise "arrête de chercher, tout est déjà là". Ta fatigue est une invitation à rentrer.`,
  },

  emotionnel_noye: {
    key: 'emotionnel_noye',
    name: 'L\'ÉMOTIONNEL(LE) NOYÉ(E)',
    blessure: 'Humiliation',
    emotion: 'Honte',
    mode: 'Somatisation',
    zone: 'Corps',
    signes: [
      'Tu es traversé(e) par des vagues émotionnelles qui te submergent',
      'Tu pleures facilement et ça te met mal à l\'aise',
      'Ton corps réagit avant ta pensée : boule au ventre, larmes, rougissement',
      'Tu as honte d\'être "trop sensible" et tu aimerais être "normal(e)"',
    ],
    explication: `Tu n'es pas trop sensible. Tu es sensible, point. Et on t'a humilié(e) pour ça. Ton système nerveux a appris que ressentir = être moqué(e).

Mais il continue à ressentir, parce que c'est sa nature. Ce que tu vis comme un défaut est en réalité un don mal accueilli. La honte n'est pas la tienne : elle appartient à ceux qui t'ont rabaissé(e).`,
  },

  guerrier_fatigue: {
    key: 'guerrier_fatigue',
    name: 'LE/LA GUERRIER(ÈRE) FATIGUÉ(E)',
    blessure: 'Injustice',
    emotion: 'Épuisement',
    mode: 'Contrôle',
    zone: 'Travail',
    signes: [
      'Tu te bats depuis si longtemps que tu ne sais plus ce que "se reposer" veut dire',
      'Tu prends sur toi, encore et encore, jusqu\'à l\'os',
      'Tu rêves d\'arrêter mais tu as peur que tout s\'écroule si tu le fais',
      'Ton corps te lâche par moments — vertiges, palpitations, insomnies',
    ],
    explication: `Tu as porté, jeune, une charge qui n'était pas la tienne. Tu as tenu parce qu'il fallait tenir. Et aujourd'hui, ton corps te supplie d'arrêter — mais ton système de survie n'a pas appris le mode "pause."

Tu ne manques pas de volonté : tu es en dette chronique de repos, et ton réservoir est vide.`,
  },

  amoureux_vide: {
    key: 'amoureux_vide',
    name: 'L\'AMOUREUX(SE) VIDE',
    blessure: 'Abandon',
    emotion: 'Vide',
    mode: 'Fusion',
    zone: 'Couple',
    signes: [
      'Tu tombes amoureux(se) très vite et très fort',
      'Sans l\'autre, tu as un vide immense qui te terrifie',
      'Tu te perds dans la relation, au point de ne plus savoir qui tu es',
      'Tu sais que c\'est "trop" mais tu n\'arrives pas à être seul(e)',
    ],
    explication: `Un grand vide s'est creusé en toi quand tu étais petit(e), à un moment où tu avais besoin d'une présence constante et où elle a manqué. Depuis, ton système cherche à combler ce trou avec l'autre.

Mais aucun partenaire ne peut remplir un vide d'enfant — seule une partie de toi peut y aller. Ce n'est pas de la dépendance honteuse : c'est un appel très ancien.`,
  },

  gardien_secrets: {
    key: 'gardien_secrets',
    name: 'LE/LA GARDIEN(NE) DES SECRETS',
    blessure: 'Trahison',
    emotion: 'Méfiance',
    mode: 'Gel',
    zone: 'Couple',
    signes: [
      'Tu ne dis jamais tout, même aux personnes les plus proches',
      'Tu observes les autres longtemps avant de t\'ouvrir — et tu ne t\'ouvres jamais complètement',
      'Tu as un "jardin secret" où personne n\'entre',
      'Parfois, tu te sens seul(e) même entouré(e) de gens qui t\'aiment',
    ],
    explication: `On t'a trahi(e) sur quelque chose d'intime. Depuis, ta vulnérabilité est verrouillée à double tour. Ta méfiance n'est pas de la paranoïa : c'est de la mémoire.

Et cette mémoire est précieuse — elle t'a protégé(e). Mais elle peut aussi apprendre à reconnaître les gens qui, aujourd'hui, sont dignes de confiance.`,
  },

  ombre_silencieuse: {
    key: 'ombre_silencieuse',
    name: 'L\'OMBRE SILENCIEUSE',
    blessure: 'Rejet',
    emotion: 'Tristesse',
    mode: 'Retrait',
    zone: 'Identité',
    signes: [
      'Tu es discret(ète), on t\'oublie facilement, et ça te convient — presque',
      'Tu as une vie intérieure riche que personne ne voit',
      'Tu évites les groupes, les confrontations, la visibilité',
      'Une tristesse calme t\'accompagne, comme une musique de fond',
    ],
    explication: `Tu as compris très tôt qu'être vu(e), c'était risquer d'être rejeté(e). Alors tu as choisi l'ombre. Cette stratégie t'a protégé(e) de beaucoup de blessures, mais elle t'a aussi coupé(e) d'une partie de ta vie.

Tu n'es pas introverti(e) par nature : tu l'es devenu(e) par blessure. La différence est immense.`,
  },

  funambule_anxieux: {
    key: 'funambule_anxieux',
    name: 'LE/LA FUNAMBULE ANXIEUX(SE)',
    blessure: 'Abandon',
    emotion: 'Anxiété',
    mode: 'Hypervigilance',
    zone: 'Travail',
    signes: [
      'Tu as l\'impression de marcher sur un fil en permanence',
      'Une critique te donne l\'impression de tout perdre',
      'Tu anticipes les catastrophes pour ne pas être pris(e) au dépourvu',
      'Ton système nerveux est en alerte même quand tout va bien',
    ],
    explication: `Tu as appris tôt que la stabilité pouvait disparaître. Alors tu vis en équilibre, toujours prêt(e) à rattraper la chute. Ce n'est pas de la fragilité : c'est une forme d'intelligence de survie très avancée.

Mais ton corps ne peut pas tenir le funambule à vie. Il lui faut un filet — pas de la volonté.`,
  },

  exile_du_soi: {
    key: 'exile_du_soi',
    name: 'L\'EXILÉ(E) DU SOI',
    blessure: 'Humiliation',
    emotion: 'Vide',
    mode: 'Gel',
    zone: 'Identité',
    signes: [
      'Tu ne sais plus qui tu es vraiment, derrière les rôles',
      'Tu as l\'impression d\'avoir perdu le contact avec quelque chose d\'essentiel',
      'Tu fonctionnes, mais tu ne vis pas vraiment',
      'Un sentiment d\'étrangeté à toi-même est présent, par vagues',
    ],
    explication: `Tu as été humilié(e) sur ce que tu étais, profondément. Alors une partie de toi est partie — pas en fuite, en exil. Elle a préféré s'absenter plutôt que d'être attaquée à nouveau.

Ta tâche aujourd'hui n'est pas de "devenir quelqu'un d'autre" : c'est de rappeler cette partie exilée, qui t'attend.`,
  },

  gardien_clan: {
    key: 'gardien_clan',
    name: 'LE/LA GARDIEN(NE) DU CLAN',
    blessure: 'Injustice',
    emotion: 'Colère',
    mode: 'Sacrifice',
    zone: 'Famille',
    signes: [
      'Tu portes l\'histoire de ta famille comme une mission secrète',
      'Tu défends tes proches même quand ils te blessent',
      'Tu as une colère contre tout ce qui écrase les tiens',
      'Tu te sacrifies "pour que ça n\'arrive plus"',
    ],
    explication: `Tu portes une transmission transgénérationnelle : une injustice vécue par les tiens que personne n'a réparée. Ta loyauté inconsciente est magnifique et épuisante.

Tu essaies de réparer quelque chose qui n'est pas à toi. Ce n'est pas ta mission de vie : c'est une charge que tu as le droit de déposer.`,
  },

  saboteur_lumineux: {
    key: 'saboteur_lumineux',
    name: 'LE/LA SABOTEUR(SE) LUMINEUX(SE)',
    blessure: 'Rejet',
    emotion: 'Peur',
    mode: 'Fuite',
    zone: 'Travail',
    signes: [
      'Tu as un talent évident, mais tu te freines dès que ça prend forme',
      'À chaque fois que ça va marcher, quelque chose "tombe" et tu recommences à zéro',
      'Tu as peur du succès autant que de l\'échec',
      'Tu sais que tu as quelque chose à donner — et ça te terrifie',
    ],
    explication: `Enfant, briller = être rejeté(e) ou puni(e). Alors briller est devenu dangereux. Ton talent est là, intact, mais une partie de toi l'éteint à chaque fois qu'il risque de t'exposer.

Ce n'est pas du syndrome de l'imposteur : c'est une peur d'enfant d'être abandonné(e) si tu prends trop de place.`,
  },

  hyperactif_epuise: {
    key: 'hyperactif_epuise',
    name: 'L\'HYPERACTIF(VE) ÉPUISÉ(E)',
    blessure: 'Abandon',
    emotion: 'Anxiété',
    mode: 'Fuite en avant',
    zone: 'Corps',
    signes: [
      'Tu ne t\'arrêtes jamais : sport, travail, sorties, projets — tout à la fois',
      'Le silence t\'angoisse, tu as besoin de remplir',
      'Ton corps t\'envoie des signaux que tu ignores systématiquement',
      'Tu tombes en miettes dès que tu ralentis — maladies dès les vacances',
    ],
    explication: `Le mouvement est ton anesthésie. Tant que tu cours, tu ne sens pas le vide d'abandon de ton enfance. Mais ton corps, lui, accumule tout ce que ton rythme ne veut pas voir.

Tu n'es pas dynamique : tu es en fuite. Et ta fuite a un coût — ton corps paye la facture.`,
  },

  pelerin: {
    key: 'pelerin',
    name: 'LE/LA PÈLERIN(E)',
    blessure: 'Trahison',
    emotion: 'Mélancolie',
    mode: 'Retrait',
    zone: 'Sens',
    signes: [
      'Tu as l\'impression d\'être "en chemin" depuis toujours, sans jamais arriver',
      'Tu vis à distance du monde, comme en observateur(rice) bienveillant(e)',
      'Tu portes une sagesse que les autres viennent chercher, mais tu te sens seul(e) sur ta route',
      'Une mélancolie profonde t\'accompagne, presque belle',
    ],
    explication: `Une trahison ancienne t'a fait perdre la confiance dans le monde. Alors tu as choisi le retrait sage — ni fuite ni combat, une sorte de marche parallèle.

Ta mélancolie n'est pas une dépression : c'est le deuil d'un monde qui aurait dû t'accueillir et qui ne l'a pas fait. Tu n'as pas besoin d'arriver quelque part. Tu as besoin d'être accompagné(e) sur la route.`,
  },
}

/**
 * Lookup table: dominant_secondary → archetype key
 * Primary key is dominant dimension. Secondary dimension refines the result.
 * Falls back to 'default' when secondary not found.
 */
const ARCHETYPE_LOOKUP: Record<string, Record<string, string>> = {
  '1': { // Analyse mentale → primarily Trahison/Injustice
    default: 'scientifique_glace',
    '2': 'cherchant_fatigue',
    '5': 'architecte_obsessionnel',
    '7': 'architecte_obsessionnel',
    '8': 'cherchant_fatigue',
    '4': 'cherchant_fatigue',
    '6': 'scientifique_glace',
    '9': 'scientifique_glace',
    '10': 'rebelle_blesse',
    '3': 'gardien_epuise',
  },
  '2': { // Fuite en action → primarily Rejet/Abandon
    default: 'hyperactif_epuise',
    '4': 'hyperactif_epuise',
    '8': 'hyperactif_epuise',
    '6': 'saboteur_lumineux',
    '3': 'saboteur_lumineux',
    '9': 'saboteur_lumineux',
    '10': 'explorateur_perdu',
    '1': 'explorateur_perdu',
    '7': 'funambule_anxieux',
    '5': 'guerrier_fatigue',
  },
  '3': { // Care-taking → primarily Rejet/Humiliation
    default: 'donneur_sans_retour',
    '6': 'accordeur_perpetuel',
    '9': 'accordeur_perpetuel',
    '5': 'gardien_epuise',
    '1': 'gardien_epuise',
    '2': 'donneur_sans_retour',
    '7': 'donneur_sans_retour',
    '4': 'donneur_sans_retour',
    '10': 'gardien_clan',
    '8': 'amoureux_vide',
  },
  '4': { // Autonomie forcée → primarily Abandon
    default: 'loup_solitaire',
    '7': 'loup_solitaire',
    '9': 'loup_solitaire',
    '1': 'scientifique_glace',
    '5': 'loup_solitaire',
    '8': 'enfant_perdu',
    '2': 'hyperactif_epuise',
    '10': 'loup_solitaire',
    '6': 'ombre_silencieuse',
    '3': 'amoureux_vide',
  },
  '5': { // Contrôle → primarily Injustice
    default: 'architecte_obsessionnel',
    '1': 'architecte_obsessionnel',
    '7': 'architecte_obsessionnel',
    '3': 'gardien_epuise',
    '9': 'gardien_epuise',
    '2': 'guerrier_fatigue',
    '10': 'guerrier_fatigue',
    '4': 'loup_solitaire',
    '6': 'chevalier_masque',
    '8': 'cherchant_fatigue',
  },
  '6': { // Adaptation/Masking → primarily Rejet
    default: 'accordeur_perpetuel',
    '3': 'accordeur_perpetuel',
    '9': 'invisible_lumineux',
    '4': 'ombre_silencieuse',
    '7': 'ombre_silencieuse',
    '2': 'saboteur_lumineux',
    '10': 'saboteur_lumineux',
    '5': 'chevalier_masque',
    '1': 'scientifique_glace',
    '8': 'amoureux_vide',
  },
  '7': { // Hypervigilance → primarily Abandon/Trahison
    default: 'hyper_vigilant',
    '6': 'hyper_vigilant',
    '3': 'hyper_vigilant',
    '5': 'funambule_anxieux',
    '8': 'funambule_anxieux',
    '4': 'gardien_secrets',
    '1': 'gardien_secrets',
    '9': 'gardien_secrets',
    '2': 'funambule_anxieux',
    '10': 'rebelle_blesse',
  },
  '8': { // Idéalisation → primarily Abandon/Trahison
    default: 'pelerin',
    '2': 'explorateur_perdu',
    '10': 'explorateur_perdu',
    '6': 'amoureux_vide',
    '3': 'amoureux_vide',
    '1': 'cherchant_fatigue',
    '4': 'enfant_perdu',
    '9': 'pelerin',
    '7': 'pelerin',
    '5': 'cherchant_fatigue',
  },
  '9': { // Évitement du conflit → primarily Humiliation
    default: 'volcan_contenu',
    '10': 'volcan_contenu',
    '3': 'volcan_contenu',
    '6': 'exile_du_soi',
    '4': 'exile_du_soi',
    '5': 'chevalier_masque',
    '1': 'chevalier_masque',
    '7': 'emotionnel_noye',
    '2': 'emotionnel_noye',
    '8': 'emotionnel_noye',
  },
  '10': { // Intensité/Drame → primarily Trahison/Injustice
    default: 'rebelle_blesse',
    '9': 'volcan_contenu',
    '4': 'volcan_contenu',
    '7': 'rebelle_blesse',
    '5': 'rebelle_blesse',
    '3': 'gardien_clan',
    '6': 'gardien_clan',
    '1': 'explorateur_perdu',
    '2': 'explorateur_perdu',
    '8': 'amoureux_vide',
  },
}

/**
 * Returns the archetype for a given dominant + secondary dimension combination.
 * Dimensions are strings '1'-'10'.
 */
export function getArchetype(dominant: string, secondary: string): Archetype {
  const dimMap = ARCHETYPE_LOOKUP[dominant]
  const key = dimMap?.[secondary] ?? dimMap?.['default'] ?? 'scientifique_glace'
  return ARCHETYPES[key] ?? ARCHETYPES['scientifique_glace']
}

/**
 * Maps old quiz ProfileKey (P1-P10) to dimension string ('1'-'10').
 * P1 = L'Analyste = Dim 1, P2 = L'Électron Libre = Dim 2, etc.
 */
const PROFILE_TO_DIM: Record<string, string> = {
  P1: '1', P2: '2', P3: '3', P4: '4', P5: '5',
  P6: '6', P7: '7', P8: '8', P9: '9', P10: '10',
}

/**
 * Returns the archetype for old quiz profile keys (P1-P10).
 */
export function getArchetypeForProfiles(dominant: string, secondary: string): Archetype {
  const d = PROFILE_TO_DIM[dominant] ?? dominant
  const s = PROFILE_TO_DIM[secondary] ?? secondary
  return getArchetype(d, s)
}

export const BLESSURE_COLORS: Record<Blessure, { bg: string; border: string; text: string }> = {
  Rejet:     { bg: 'rgba(139,92,246,0.08)',   border: 'rgba(139,92,246,0.25)',  text: '#a78bfa' },
  Abandon:   { bg: 'rgba(59,130,246,0.08)',   border: 'rgba(59,130,246,0.25)', text: '#60a5fa' },
  Humiliation: { bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.25)', text: '#f472b6' },
  Trahison:  { bg: 'rgba(245,158,11,0.08)',   border: 'rgba(245,158,11,0.25)', text: '#fbbf24' },
  Injustice: { bg: 'rgba(201,169,97,0.08)',   border: 'rgba(201,169,97,0.25)', text: '#C9A961' },
}
