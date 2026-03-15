/**
 * ============================================================
 * SOS SHINE - QUIZ SIGNATURE EMOTIONNELLE
 * 10 PROFILS COMPLETS
 * ============================================================
 *
 * Chaque profil represente une "architecture emotionnelle" unique.
 * Le quiz de 15 questions permet de determiner le profil dominant.
 *
 * Structure de chaque profil :
 * - Archetype : Nom du profil
 * - Sous-titre : L'architecture emotionnelle associee
 * - Icone & Couleur : Identite visuelle
 * - Essence : Description fondamentale du mecanisme emotionnel
 * - Lumiere : Les forces et qualites de ce profil
 * - Ombre : Les zones de fragilite et pieges potentiels
 * - Protocole : Le parcours recommande sur SOS Shine
 */

export interface ProfilComplet {
  numero: number;
  cle: string;
  archetype: string;
  sousTitre: string;
  icone: string;
  couleur: string;
  essence: string;
  lumiere: string;
  ombre: string;
  protocole: string;
}

export const PROFILS_COMPLETS: ProfilComplet[] = [
  // ────────────────────────────────────────────
  // PROFIL 1 — L'ANALYSTE
  // ────────────────────────────────────────────
  {
    numero: 1,
    cle: "P1",
    archetype: "L'Analyste",
    sousTitre: "L'Architecture Mentale",
    icone: "🧠",
    couleur: "#74C0FC",
    essence:
      "Face a la tempete, votre intelligence est votre premier bouclier. " +
      "Votre systeme nerveux privilegie la comprehension : face a l'incertitude " +
      "ou a l'epreuve, vous avez un besoin visceral d'analyser, de decortiquer " +
      "et de trouver du sens.",
    lumiere:
      "Cette architecture fait de vous une personne dotee d'une resilience " +
      "intellectuelle hors norme. Vous etes capable de lire entre les lignes et " +
      "de structurer le chaos. On vient souvent chercher vos conseils pour votre " +
      "clarte d'esprit et votre objectivite.",
    ombre:
      "Cependant, ce super-pouvoir a un cout energetique massif. Lorsque la " +
      "charge emotionnelle devient trop forte, votre machinerie analytique s'emballe. " +
      "Vous refaites les conversations en boucle et essayez de \"penser\" vos emotions " +
      "au lieu de les ressentir, ce qui cree un epuisement profond.",
    protocole:
      "Votre enjeu actuel n'est pas de comprendre davantage, mais d'apprendre a " +
      "faire redescendre la pression vers votre corps. Sur SOS Shine, nous allons " +
      "cibler les pratiques d'ancrage somatique (coherence cardiaque, scans corporels) " +
      "pour mettre votre cerveau sur pause, en toute securite.",
  },

  // ────────────────────────────────────────────
  // PROFIL 2 — L'ELECTRON LIBRE
  // ────────────────────────────────────────────
  {
    numero: 2,
    cle: "P2",
    archetype: "L'Electron Libre",
    sousTitre: "L'Architecture en Mouvement",
    icone: "⚡",
    couleur: "#FF8C42",
    essence:
      "Votre energie vitale est tournee vers l'action. Quand l'inconfort s'installe, " +
      "votre instinct de survie vous pousse vers le mouvement, les projets ou l'exterieur. " +
      "L'immobilite vous est insupportable lorsque vous etes sous tension.",
    lumiere:
      "C'est une force motrice impressionnante. Vous possedez une resilience active qui " +
      "vous empeche de stagner ou de sombrer dans la complaisance. Vous etes souvent le " +
      "moteur de vos groupes, capable de rebondir a une vitesse fascinante.",
    ombre:
      "Le revers de cette medaille, c'est la fuite en avant. En saturant votre emploi du " +
      "temps ou votre esprit pour ne pas ressentir le vide, vous risquez le burn-out " +
      "emotionnel. Vous courez pour ne pas entendre ce qui fait mal.",
    protocole:
      "Votre veritable defi aujourd'hui n'est pas d'avancer plus vite, mais de vous " +
      "autoriser de micro-pauses sans angoisser. Votre programme SOS Shine va se concentrer " +
      "sur l'apprivoisement du silence et la micro-exposition emotionnelle pour apprendre a " +
      "votre corps que s'arreter n'est pas dangereux.",
  },

  // ────────────────────────────────────────────
  // PROFIL 3 — LE PILIER
  // ────────────────────────────────────────────
  {
    numero: 3,
    cle: "P3",
    archetype: "Le Pilier",
    sousTitre: "L'Architecture Symbiotique",
    icone: "💗",
    couleur: "#E879A8",
    essence:
      "Vous possedez un coeur dote d'une antenne ultra-sensible. Face a l'incertitude, " +
      "votre reflexe naturel est de chercher l'ancrage dans le soin a l'autre. Vous ressentez " +
      "les variations d'humeur et cherchez instinctivement a harmoniser votre environnement.",
    lumiere:
      "Cette immense empathie fait de vous un repere incontournable. Vous savez creer des " +
      "espaces de securite pour les autres et votre capacite de devouement est d'une rare " +
      "noblesse. Vous etes le ciment de vos relations.",
    ombre:
      "Mais dans la tempete, cette hyper-vigilance tournee vers l'exterieur vous fait oublier " +
      "vos propres limites. Vous avez tendance a endosser le role du \"sauveur\" pour vous " +
      "assurer qu'on ne vous abandonnera pas, au point de vous vider de votre propre energie.",
    protocole:
      "L'objectif pour vous est d'apprendre a devenir votre propre point de gravite. Vos " +
      "exercices SOS Shine cibleront la restauration de vos frontieres personnelles et la " +
      "reappropriation de votre propre valeur, independamment de ce que vous faites pour les autres.",
  },

  // ────────────────────────────────────────────
  // PROFIL 4 — LA CITADELLE
  // ────────────────────────────────────────────
  {
    numero: 4,
    cle: "P4",
    archetype: "La Citadelle",
    sousTitre: "L'Architecture Citadelle",
    icone: "🏰",
    couleur: "#8B9DC3",
    essence:
      "Votre sanctuaire interieur est extremement bien garde. Face a la blessure, " +
      "la trahison ou la deception, votre reflexe est l'autonomie absolue : vous relevez " +
      "les ponts-levis et prenez de la distance.",
    lumiere:
      "Cette souverainete vous dote d'une grande solidite apparente. Vous etes capable " +
      "de traverser des tempetes redoutables en totale independance. Vous ne vous effondrez " +
      "pas publiquement et savez proteger votre noyau dur.",
    ombre:
      "Cependant, a force de couper les vannes emotionnelles pour garantir votre securite, " +
      "votre armure s'epaissit. Ce repli strategique peut se transformer en isolement profond. " +
      "La forteresse vous protege des ennemis, mais elle empeche aussi la chaleur d'entrer.",
    protocole:
      "Votre chemin ne consiste pas a detruire vos murs d'un coup, mais a apprendre a en " +
      "ouvrir la porte. Vos exercices SOS Shine se focaliseront sur l'autorisation de la " +
      "vulnerabilite en milieu securise, pour reapprendre a faire confiance.",
  },

  // ────────────────────────────────────────────
  // PROFIL 5 — LE GARDIEN DU CADRE
  // ────────────────────────────────────────────
  {
    numero: 5,
    cle: "P5",
    archetype: "Le Gardien du Cadre",
    sousTitre: "L'Architecture du Controle",
    icone: "🛡️",
    couleur: "#A3BE8C",
    essence:
      "Pour vous, la securite reside dans la structure. Face au chaos emotionnel, " +
      "relationnel ou professionnel, votre premier reflexe est de retablir des regles, " +
      "de l'ordre, et des processus clairs.",
    lumiere:
      "Cette exigence fait de vous une personne d'une immense fiabilite. Vous etes le " +
      "gardien du temple, celui ou celle qui maintient le cap quand tout vacille. Votre sens " +
      "de la responsabilite et de l'organisation force le respect de votre entourage.",
    ombre:
      "Le prix a payer est une tension nerveuse constante. L'imprevu, l'echec ou le desordre " +
      "(le votre ou celui des autres) vous sont intolerables. Ce besoin de tout maitriser peut " +
      "vous rendre rigide et vous empecher de vivre la spontaneite des relations.",
    protocole:
      "Le travail sur SOS Shine ne consistera pas a vous faire perdre le controle, mais a vous " +
      "enseigner la souplesse. Vos protocoles cibleront le relachement de la pression de " +
      "perfection, pour decouvrir qu'on peut parfois plier sans se briser.",
  },

  // ────────────────────────────────────────────
  // PROFIL 6 — LE CAMELEON
  // ────────────────────────────────────────────
  {
    numero: 6,
    cle: "P6",
    archetype: "Le Cameleon",
    sousTitre: "L'Architecture Adaptative",
    icone: "🦎",
    couleur: "#C4A0E8",
    essence:
      "Votre mecanisme de survie est d'une fluidite fascinante. Face a l'inconnu ou au " +
      "risque de conflit, vous avez developpe la capacite d'adapter instantanement vos besoins, " +
      "votre humeur et vos envies a ceux qui vous entourent.",
    lumiere:
      "Vous possedez une intelligence sociale et une agilite emotionnelle hors norme. Vous " +
      "savez naviguer dans n'importe quel environnement en mettant les gens a l'aise. Vous etes " +
      "le maitre de la synchronisation relationnelle.",
    ombre:
      "A force de fusionner avec les attentes des autres pour eviter le rejet, le risque est de " +
      "perdre la trace de votre propre identite. Vous finissez par ne plus savoir ce que vous " +
      "voulez vraiment, et cette sur-adaptation genere un epuisement silencieux.",
    protocole:
      "Votre parcours de guerison consistera a reapprendre a dire \"je\". Vos exercices " +
      "SOS Shine travailleront sur l'affirmation de soi, la tolerance a la deception de l'autre, " +
      "et la reconnexion avec vos desirs authentiques.",
  },

  // ────────────────────────────────────────────
  // PROFIL 7 — LA VIGIE
  // ────────────────────────────────────────────
  {
    numero: 7,
    cle: "P7",
    archetype: "La Vigie",
    sousTitre: "L'Architecture d'Anticipation",
    icone: "🔭",
    couleur: "#FFD93D",
    essence:
      "Votre esprit fonctionne comme un radar de pointe. Pour garantir votre securite " +
      "emotionnelle, votre systeme nerveux scanne en permanence l'horizon pour anticiper le " +
      "pire, afin de ne jamais etre pris(e) au depourvu.",
    lumiere:
      "Cette perspicacite fait de vous un stratege naturel. Vous avez toujours un temps d'avance " +
      "et vos plans de secours sont infaillibles. Votre entourage beneficie souvent de votre " +
      "capacite a eviter les ecueils invisibles pour la plupart des gens.",
    ombre:
      "Cette hyper-vigilance vous maintient dans un etat d'alerte epuisant. En cherchant a " +
      "controler le futur, vous vous coupez de la joie du present. Vous traversez souvent les " +
      "catastrophes emotionnellement avant meme qu'elles n'arrivent dans le monde reel.",
    protocole:
      "L'enjeu de votre accompagnement sur SOS Shine sera de desarmer ce systeme d'alarme " +
      "interne. Nous utiliserons des techniques de regulation du systeme nerveux central pour " +
      "vous ramener dans l'ici et maintenant, la ou vous etes deja en securite.",
  },

  // ────────────────────────────────────────────
  // PROFIL 8 — L'IDEALISTE
  // ────────────────────────────────────────────
  {
    numero: 8,
    cle: "P8",
    archetype: "L'Idealiste",
    sousTitre: "L'Architecture des Profondeurs",
    icone: "✨",
    couleur: "#FF6B9D",
    essence:
      "Vous evoluez dans un monde en tres haute definition. Vous ne tolerez pas la " +
      "superficialite. Votre quete est celle du sens, de l'authenticite absolue et de " +
      "l'intensite, que ce soit dans vos relations ou vos projets.",
    lumiere:
      "Votre profondeur d'ame et votre capacite d'emerveillement sont magnifiques. Vous avez " +
      "acces a un registre emotionnel et creatif d'une grande richesse, et vous etes capable " +
      "d'aimer et de vous engager avec une ferveur rare.",
    ombre:
      "Cette exigence d'absolu vous rend extremement vulnerable face aux deceptions du reel. " +
      "Quand la vie ou les autres ne sont pas a la hauteur de vos ideaux, vous risquez de " +
      "sombrer dans la melancolie et de vous isoler dans un sentiment d'incomprehension.",
    protocole:
      "Sur SOS Shine, nous allons vous aider a ancrer cette intensite. Votre programme se " +
      "concentrera sur l'acceptation de l'imperfection (le Kintsugi) et la transmutation de " +
      "vos emotions fortes en force motrice, sans vous laisser submerger.",
  },

  // ────────────────────────────────────────────
  // PROFIL 9 — LE DIPLOMATE
  // ────────────────────────────────────────────
  {
    numero: 9,
    cle: "P9",
    archetype: "Le Diplomate",
    sousTitre: "L'Architecture de l'Harmonie",
    icone: "🕊️",
    couleur: "#88D8B0",
    essence:
      "Votre priorite absolue est le maintien de la paix. Face a l'adversite ou aux tensions, " +
      "vous avez appris a arrondir les angles et a neutraliser rapidement toute escalade aggressive.",
    lumiere:
      "Vous etes un mediateur ne. Votre tolerance et votre douceur font de vous un espace de " +
      "repos pour les autres. Vous savez desamorcer les bombes emotionnelles avec un tact " +
      "exceptionnel, creant des ponts la ou d'autres construisent des murs.",
    ombre:
      "En fuyant le conflit a tout prix, vous taisez souvent vos propres frustrations et limites. " +
      "La colere non exprimee s'accumule a l'interieur sous forme de ressentiment ou d'anxiete. " +
      "En voulant proteger la relation, vous vous sacrifiez.",
    protocole:
      "Votre defi majeur sera d'apprendre que le conflit sain n'est pas une menace. SOS Shine " +
      "vous guidera a travers des exercices de communication assertive pour vous apprendre a " +
      "prendre votre juste place, meme si cela doit faire des vagues.",
  },

  // ────────────────────────────────────────────
  // PROFIL 10 — LE CATALYSEUR
  // ────────────────────────────────────────────
  {
    numero: 10,
    cle: "P10",
    archetype: "Le Catalyseur",
    sousTitre: "L'Architecture de l'Intensite",
    icone: "🔥",
    couleur: "#FF5E5B",
    essence:
      "Vous fonctionnez sur des cycles energetiques puissants. Face a l'apathie ou a l'epreuve, " +
      "votre reflexe est de chercher une decharge forte (changement radical, passion, nouveau defi) " +
      "pour relancer la machine.",
    lumiere:
      "Votre capacite a renaitre de vos cendres est fascinante. Vous etes une force de " +
      "transformation pure, capable de bouleverser les statu quo et de generer une energie " +
      "colossale pour surmonter les obstacles les plus massifs.",
    ombre:
      "Les montagnes russes epuisent votre systeme a long terme. Le tiede, la routine et le " +
      "calme plat peuvent vous angoisser, vous poussant parfois a provoquer des micro-crises " +
      "inconscientes juste pour vous sentir vivant(e) et ressentir l'adrenaline.",
    protocole:
      "Votre objectif n'est pas d'eteindre votre feu, mais d'apprendre a tolerer la paix. Vos " +
      "exercices sur SOS Shine viseront a stabiliser vos pics d'energie et a trouver de la " +
      "satisfaction dans la constance, sans avoir l'impression de vous eteindre.",
  },
];
