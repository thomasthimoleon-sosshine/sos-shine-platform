export type ProfileKey = 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'P6' | 'P7' | 'P8' | 'P9' | 'P10';

export interface Answer {
  text: string;
  scores: Partial<Record<ProfileKey, number>>;
}

export interface Question {
  id: number;
  question: string;
  answers: Answer[];
}

export interface Profile {
  key: ProfileKey;
  title: string;
  archetype: string;
  subtitle: string;
  essence: string;
  lumiere: string;
  ombre: string;
  protocole: string;
  color: string;
  icon: string;
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Quand quelque chose te fait vraiment mal — et que tu continues à faire semblant que tout va bien — ce qui se passe en toi en premier :",
    answers: [
      { text: "Je tourne ça dans ma tête en boucle, parfois pendant des jours — tout en donnant l'impression à l'extérieur que j'ai digéré", scores: { P1: 3, P7: 1 } },
      { text: "Je me jette dans quelque chose — n'importe quoi — pour ne pas rester face à ce que je ressens", scores: { P2: 3, P10: 1 } },
      { text: "Je vérifie comment vont les gens que j'aime avant même de m'occuper de ma propre douleur", scores: { P3: 3, P9: 1 } },
      { text: "Je ferme tout, je dis \"ça va\" — et j'absorbe seul(e) dans un silence que personne autour de moi ne voit", scores: { P4: 3, P5: 1 } },
    ]
  },
  {
    id: 2,
    question: "Quand quelqu'un que tu aimes entre en conflit avec toi — même si tu n'es pas fier(e) de ta réaction — ce qui monte vraiment en toi, avant même que tu réagisses :",
    answers: [
      { text: "Je me réfugie dans la logique — pas pour vraiment comprendre, mais pour éviter de ressentir à quel point ça fait mal", scores: { P1: 3, P5: 1 } },
      { text: "Une panique intérieure que je déguise en douceur — je répare l'autre pour faire taire ce malaise en moi", scores: { P9: 3, P6: 1 } },
      { text: "Je cède, je m'adapte — et je ravale ma colère en souriant, en me disant que c'est pour le bien de la relation", scores: { P6: 3, P3: 1 } },
      { text: "Une rage ou une douleur intense que je n'arrive pas à taire — même quand je sais que ça va empirer les choses", scores: { P10: 3, P8: 1 } },
    ]
  },
  {
    id: 3,
    question: "Si tu t'arrêtais vraiment — pas ce que tu racontes aux autres, mais ce que tu ressens au fond — ce qui te vide vraiment de ton énergie, souvent en silence :",
    answers: [
      { text: "Rejouer les mêmes questions en boucle — chercher un sens qui ne vient jamais, même si ça fait des années que je cherche", scores: { P1: 3, P7: 1 } },
      { text: "Avoir l'impression de stagner — même quand objectivement je \"réussis\", le calme me donne le sentiment que je disparais", scores: { P2: 3, P10: 1 } },
      { text: "Absorber les émotions des autres comme si c'était les miennes — me vider pour eux sans qu'ils le sachent, ni moi parfois", scores: { P3: 3, P8: 1 } },
      { text: "Faire seul(e) ce que je pourrais déléguer — parce que dépendre de quelqu'un me met dans une vulnérabilité que je ne supporte pas", scores: { P4: 3, P5: 1 } },
    ]
  },
  {
    id: 4,
    question: "Quand tu n'as aucun contrôle sur ce qui va se passer — même si tu gardes une façade calme — ce qui se passe vraiment en toi :",
    answers: [
      { text: "Je planifie sans m'arrêter, parfois jusqu'à l'épuisement — comme si anticiper le pire pouvait m'en protéger", scores: { P7: 3, P5: 1 } },
      { text: "Je me coule dans la situation, je m'adapte en temps réel — la résistance me semble plus dangereuse que l'incertitude", scores: { P6: 3, P2: 1 } },
      { text: "Je cherche un sens à tout — et si je n'en trouve pas, j'invente un récit pour rendre l'incertitude supportable", scores: { P8: 3, P1: 1 } },
      { text: "Je provoque parfois le changement moi-même — plutôt qu'attendre qu'il arrive, ce qui me donne l'illusion du contrôle", scores: { P10: 3, P4: 1 } },
    ]
  },
  {
    id: 5,
    question: "Dans tes relations, il y a un rôle que tu endosses presque automatiquement — souvent sans l'avoir choisi, parfois même quand il t'épuise :",
    answers: [
      { text: "Le conseiller — celui ou celle qui aide tout le monde à y voir clair… et qui rentre chez lui/elle sans que personne ne lui ait demandé comment il/elle allait", scores: { P1: 3, P9: 1 } },
      { text: "Le pilier — je tiens tout le monde, j'absorbe tout, et je dis \"ça va\" alors que je suis parfois en train de m'effondrer à l'intérieur", scores: { P3: 3, P5: 1 } },
      { text: "Le médiateur — celui ou celle qui s'oublie pour que les autres ne se déchirent pas, même si personne ne fait la même chose pour lui/elle", scores: { P9: 3, P6: 1 } },
      { text: "Le moteur — je génère de l'énergie pour tout le monde, et quand je tombe, je tombe souvent seul(e), sans filet", scores: { P2: 3, P10: 1 } },
    ]
  },
  {
    id: 6,
    question: "Au fond de toi — même si tu ne veux pas toujours le voir — la peur qui pilote réellement tes décisions depuis des années :",
    answers: [
      { text: "Que si je lâche le contrôle une seule fois, quelque chose se brise — et que je ne sois plus jamais la même personne qu'avant", scores: { P5: 3, P7: 1 } },
      { text: "Que le jour où tu cesses d'être utile, les gens partent — et que leur amour était conditionné à ce que tu faisais pour eux", scores: { P3: 3, P6: 1 } },
      { text: "Que tu es fondamentalement différent(e) — et que si tu te montrais vraiment, les gens prendraient de la distance", scores: { P8: 3, P4: 1 } },
      { text: "Que faire confiance finira toujours par te coûter quelque chose — alors tu restes en retrait, même quand une partie de toi voudrait avancer", scores: { P4: 3, P7: 1 } },
    ]
  },
  {
    id: 7,
    question: "Quand une émotion te déborde vraiment — celle que tu aurais préféré ne pas ressentir — ce qui se passe en toi (même si en surface tu sembles tenir) :",
    answers: [
      { text: "Je la dissèque mentalement jusqu'à ne plus la ressentir — une façon de m'assurer qu'elle ne prend pas le contrôle", scores: { P1: 3, P7: 1 } },
      { text: "Je me jette dans l'action ou le mouvement pour ne plus avoir à la regarder en face — et souvent ça marche, jusqu'au prochain craquage", scores: { P2: 3, P10: 1 } },
      { text: "Je la verrouille tellement bien que même moi je finis par douter qu'elle existe — jusqu'au jour où elle explose", scores: { P4: 3, P9: 1 } },
      { text: "Je m'y noie parfois volontairement — comme si ressentir intensément était la seule preuve que je suis vraiment vivant(e)", scores: { P8: 3, P10: 1 } },
    ]
  },
  {
    id: 8,
    question: "Quand tu es au fond du creux — pas la fatigue du soir, la vraie — ce qui te recharge réellement (pas ce que tu dirais à quelqu'un, ce que tu fais vraiment) :",
    answers: [
      { text: "Un nouveau départ, une nouvelle direction — comme si repartir à zéro était ma façon de guérir de tout", scores: { P2: 3, P10: 2 } },
      { text: "Être enfin vu(e) sans avoir à performer — sans devoir être fort(e) ni expliquer — même si je me l'autorise rarement", scores: { P8: 3, P3: 1 } },
      { text: "M'isoler complètement, sans avoir à justifier pourquoi — juste disparaître quelques heures du monde et de ses attentes", scores: { P5: 3, P4: 1 } },
      { text: "M'assurer que les gens que j'aime vont bien — parce que ça me donne une raison valable de me sentir utile, et donc d'exister un peu", scores: { P3: 3, P9: 1 } },
    ]
  },
  {
    id: 9,
    question: "Quand quelqu'un en qui tu avais vraiment confiance te déçoit — la réaction que tu n'avouerais pas facilement, mais qui est là :",
    answers: [
      { text: "Je coupe net, parfois sans un mot — et même si une partie de moi voudrait expliquer, l'autre a déjà fermé la porte à clé", scores: { P4: 3, P10: 1 } },
      { text: "Je cherche à comprendre pour ne pas avoir à ressentir — si j'explique son comportement, je n'ai pas à admettre à quel point ça m'a fait mal", scores: { P1: 2, P9: 2 } },
      { text: "Je souris, je dis que tout va bien — et je digère seul(e) une blessure que l'autre ne saura probablement jamais", scores: { P6: 3, P9: 1 } },
      { text: "Je me rejoue la scène en cherchant le signe que j'aurais dû voir — pour me dire que c'est de ma faute d'avoir fait confiance", scores: { P8: 3, P3: 1 } },
    ]
  },
  {
    id: 10,
    question: "Dans un groupe que tu connais peu — observe ton comportement automatique, pas celui que tu voudrais avoir — ce qui se passe vraiment en toi :",
    answers: [
      { text: "Je scanne l'environnement sans le montrer — je repère où sont les risques avant de décider qui je vais être dans ce groupe", scores: { P7: 3, P1: 1 } },
      { text: "Je prends automatiquement la couleur du groupe — parfois tellement que je ne sais plus très bien qui j'étais avant d'entrer dans la pièce", scores: { P6: 3, P9: 1 } },
      { text: "Je prends le leadership même quand personne ne me le demande — pas toujours par désir de diriger, mais parce que le flou me stresse", scores: { P5: 3, P2: 1 } },
      { text: "Je reste en marge, cherchant la seule personne qui semble vraiment intéressante — et je rentre épuisé(e) par tout ce que j'ai dû simuler", scores: { P8: 3, P4: 1 } },
    ]
  },
  {
    id: 11,
    question: "Il y a un type de silence qui te dérange plus que les autres — souvent parce qu'il réveille quelque chose en toi que tu préfères ne pas regarder. Lequel ?",
    answers: [
      { text: "Le silence après un conflit — où tu es prêt(e) à tout pour que ça reprenne normalement, même si tu avais raison", scores: { P9: 3, P3: 1 } },
      { text: "Le silence de l'inaction — où tes propres pensées deviennent trop bruyantes et où tu ferais n'importe quoi pour les faire taire", scores: { P2: 3, P10: 1 } },
      { text: "Ce silence intérieur épuisant où les mêmes questions reviennent depuis des années — sans réponse, sans fond", scores: { P1: 3, P8: 1 } },
      { text: "Le silence de quelqu'un qui d'habitude te parle — quand tu n'arrives plus à lire ses intentions et que ton esprit invente des scénarios", scores: { P7: 3, P6: 1 } },
    ]
  },
  {
    id: 12,
    question: "Face à ta vulnérabilité — cette partie que tu montres rarement, même à ceux qui t'aiment — ce qui se passe vraiment en toi :",
    answers: [
      { text: "Je la vois comme une force chez les autres — mais quand c'est moi qui en aurais besoin, j'ai peur de perdre quelque chose d'essentiel en me montrant fragile", scores: { P4: 3, P8: 1 } },
      { text: "J'aspire à la légèreté — mais je garde le contrôle parce qu'une partie de moi croit que c'est la seule chose qui me tient debout", scores: { P5: 3, P1: 1 } },
      { text: "Je l'encourage chez les autres, je l'accueille avec chaleur — et pour moi-même, je fais comme si elle n'existait pas, ou pas maintenant", scores: { P3: 3, P6: 1 } },
      { text: "Dès que je sens que je pourrais craquer, je trouve quelque chose à faire — une urgence, un projet — n'importe quoi pour ne pas rester là avec ça", scores: { P2: 3, P10: 1 } },
    ]
  },
  {
    id: 13,
    question: "Quand un changement que tu n'as pas choisi s'impose à toi — comme il l'a probablement fait plusieurs fois dans ta vie — ce qui se déclenche automatiquement :",
    answers: [
      { text: "Je planifie avec une précision presque anxieuse — pas parce que j'aime ça, mais parce que l'incertitude me fait ressentir quelque chose que je préfère éviter", scores: { P7: 3, P5: 2 } },
      { text: "Je me convaincs que c'est une opportunité — parfois parce que c'est vrai, parfois parce que c'est ma façon de ne pas m'effondrer", scores: { P10: 3, P2: 1 } },
      { text: "Je deviens le roc pour les autres — en intégrant le choc tellement vite en apparence que personne ne voit que j'ai mis ma propre douleur en attente", scores: { P6: 2, P3: 2 } },
      { text: "Je disparais — pas vraiment par choix, mais parce que digérer devant les autres me semble impossible et presque dangereux", scores: { P4: 3, P1: 1 } },
    ]
  },
  {
    id: 14,
    question: "Parmi ces phrases, laquelle te touche là, maintenant — comme si elle avait été écrite pour toi, sans que tu saches vraiment pourquoi ?",
    answers: [
      { text: "\"Si je comprends pourquoi, je peux tout supporter\"", scores: { P1: 3, P7: 1 } },
      { text: "\"Je préfère plier que de demander de l'aide\"", scores: { P4: 2, P5: 2 } },
      { text: "\"Si les gens autour de moi vont bien, alors je vais bien\"", scores: { P3: 3, P6: 1 } },
      { text: "\"La vie est trop courte pour la médiocrité\"", scores: { P8: 3, P10: 1 } },
    ]
  },
  {
    id: 15,
    question: "Si tu étais vraiment honnête — avec toi-même, pas avec les autres — le mécanisme que tu utilises depuis des années pour survivre aux moments les plus durs :",
    answers: [
      { text: "Comprendre — parce que tant que tu as une explication, tu n'as pas à vraiment ressentir ce que ça fait", scores: { P1: 3, P7: 1 } },
      { text: "T'oublier pour t'assurer que les autres vont bien — et appeler ça de l'amour, alors que c'est parfois de la peur", scores: { P9: 3, P3: 1 } },
      { text: "Courir — te perdre dans l'action, les projets, le mouvement — pour ne jamais avoir à t'asseoir avec ce que tu ressens vraiment", scores: { P2: 3, P10: 1 } },
      { text: "Te fondre dans ce que les autres veulent voir — jusqu'à ne plus très bien savoir qui tu étais avant de commencer à t'adapter", scores: { P6: 3, P9: 1 } },
    ]
  },
];

export const PROFILES: Record<ProfileKey, Profile> = {
  P1: {
    key: 'P1',
    title: "L'Analyste — L'Architecture Mentale",
    archetype: "L'Analyste",
    subtitle: "L'Architecture Mentale",
    essence: "Face à la tempête, {firstName}, votre intelligence est votre premier bouclier. Votre système nerveux privilégie la compréhension : face à l'incertitude ou à l'épreuve, vous avez un besoin viscéral d'analyser, de décortiquer et de trouver du sens.",
    lumiere: "Cette architecture fait de vous une personne dotée d'une résilience intellectuelle hors norme. Vous êtes capable de lire entre les lignes et de structurer le chaos. On vient souvent chercher vos conseils pour votre clarté d'esprit et votre objectivité.",
    ombre: "Cependant, {firstName}, ce super-pouvoir a un coût énergétique massif. Lorsque la charge émotionnelle devient trop forte, votre machinerie analytique s'emballe. Vous refaites les conversations en boucle et essayez de \"penser\" vos émotions au lieu de les ressentir, ce qui crée un épuisement profond.",
    protocole: "Votre enjeu actuel n'est pas de comprendre davantage, mais d'apprendre à faire redescendre la pression vers votre corps. Sur SOS Shine, nous allons cibler les pratiques d'ancrage somatique (cohérence cardiaque, scans corporels) pour mettre votre cerveau sur pause, en toute sécurité.",
    color: '#74C0FC',
    icon: '🧠',
  },
  P2: {
    key: 'P2',
    title: "L'Électron Libre — L'Architecture en Mouvement",
    archetype: "L'Électron Libre",
    subtitle: "L'Architecture en Mouvement",
    essence: "Votre énergie vitale est tournée vers l'action, {firstName}. Quand l'inconfort s'installe, votre instinct de survie vous pousse vers le mouvement, les projets ou l'extérieur. L'immobilité vous est insupportable lorsque vous êtes sous tension.",
    lumiere: "C'est une force motrice impressionnante. Vous possédez une résilience active qui vous empêche de stagner ou de sombrer dans la complaisance. Vous êtes souvent le moteur de vos groupes, capable de rebondir à une vitesse fascinante.",
    ombre: "Le revers de cette médaille, {firstName}, c'est la fuite en avant. En saturant votre emploi du temps ou votre esprit pour ne pas ressentir le vide, vous risquez le burn-out émotionnel. Vous courez pour ne pas entendre ce qui fait mal.",
    protocole: "Votre véritable défi aujourd'hui n'est pas d'avancer plus vite, mais de vous autoriser de micro-pauses sans angoisser. Votre programme SOS Shine va se concentrer sur l'apprivoisement du silence et la micro-exposition émotionnelle pour apprendre à votre corps que s'arrêter n'est pas dangereux.",
    color: '#FF8C42',
    icon: '⚡',
  },
  P3: {
    key: 'P3',
    title: "Le Pilier — L'Architecture Symbiotique",
    archetype: "Le Pilier",
    subtitle: "L'Architecture Symbiotique",
    essence: "Vous possédez un cœur doté d'une antenne ultra-sensible, {firstName}. Face à l'incertitude, votre réflexe naturel est de chercher l'ancrage dans le soin à l'autre. Vous ressentez les variations d'humeur et cherchez instinctivement à harmoniser votre environnement.",
    lumiere: "Cette immense empathie fait de vous un repère incontournable. Vous savez créer des espaces de sécurité pour les autres et votre capacité de dévouement est d'une rare noblesse. Vous êtes le ciment de vos relations.",
    ombre: "Mais dans la tempête, cette hyper-vigilance tournée vers l'extérieur vous fait oublier vos propres limites. Vous avez tendance à endosser le rôle du \"sauveur\" pour vous assurer qu'on ne vous abandonnera pas, au point de vous vider de votre propre énergie.",
    protocole: "L'objectif pour vous, {firstName}, est d'apprendre à devenir votre propre point de gravité. Vos exercices SOS Shine cibleront la restauration de vos frontières personnelles et la réappropriation de votre propre valeur, indépendamment de ce que vous faites pour les autres.",
    color: '#E879A8',
    icon: '💗',
  },
  P4: {
    key: 'P4',
    title: "La Citadelle — L'Architecture Citadelle",
    archetype: "La Citadelle",
    subtitle: "L'Architecture Citadelle",
    essence: "Votre sanctuaire intérieur est extrêmement bien gardé, {firstName}. Face à la blessure, la trahison ou la déception, votre réflexe est l'autonomie absolue : vous relevez les ponts-levis et prenez de la distance.",
    lumiere: "Cette souveraineté vous dote d'une grande solidité apparente. Vous êtes capable de traverser des tempêtes redoutables en totale indépendance. Vous ne vous effondrez pas publiquement et savez protéger votre noyau dur.",
    ombre: "Cependant, à force de couper les vannes émotionnelles pour garantir votre sécurité, votre armure s'épaissit. Ce repli stratégique peut se transformer en isolement profond. La forteresse vous protège des ennemis, mais elle empêche aussi la chaleur d'entrer.",
    protocole: "Votre chemin, {firstName}, ne consiste pas à détruire vos murs d'un coup, mais à apprendre à en ouvrir la porte. Vos exercices SOS Shine se focaliseront sur l'autorisation de la vulnérabilité en milieu sécurisé, pour réapprendre à faire confiance.",
    color: '#8B9DC3',
    icon: '🏰',
  },
  P5: {
    key: 'P5',
    title: "Le Gardien du Cadre — L'Architecture du Contrôle",
    archetype: "Le Gardien du Cadre",
    subtitle: "L'Architecture du Contrôle",
    essence: "Pour vous, {firstName}, la sécurité réside dans la structure. Face au chaos émotionnel, relationnel ou professionnel, votre premier réflexe est de rétablir des règles, de l'ordre, et des processus clairs.",
    lumiere: "Cette exigence fait de vous une personne d'une immense fiabilité. Vous êtes le gardien du temple, celui ou celle qui maintient le cap quand tout vacille. Votre sens de la responsabilité et de l'organisation force le respect de votre entourage.",
    ombre: "Le prix à payer est une tension nerveuse constante. L'imprévu, l'échec ou le désordre (le vôtre ou celui des autres) vous sont intolérables. Ce besoin de tout maîtriser peut vous rendre rigide et vous empêcher de vivre la spontanéité des relations.",
    protocole: "Le travail sur SOS Shine ne consistera pas à vous faire perdre le contrôle, mais à vous enseigner la souplesse. Vos protocoles cibleront le relâchement de la pression de perfection, pour découvrir qu'on peut parfois plier sans se briser.",
    color: '#A3BE8C',
    icon: '🛡️',
  },
  P6: {
    key: 'P6',
    title: "Le Caméléon — L'Architecture Adaptative",
    archetype: "Le Caméléon",
    subtitle: "L'Architecture Adaptative",
    essence: "Votre mécanisme de survie est d'une fluidité fascinante, {firstName}. Face à l'inconnu ou au risque de conflit, vous avez développé la capacité d'adapter instantanément vos besoins, votre humeur et vos envies à ceux qui vous entourent.",
    lumiere: "Vous possédez une intelligence sociale et une agilité émotionnelle hors norme. Vous savez naviguer dans n'importe quel environnement en mettant les gens à l'aise. Vous êtes le maître de la synchronisation relationnelle.",
    ombre: "À force de fusionner avec les attentes des autres pour éviter le rejet, le risque est de perdre la trace de votre propre identité. Vous finissez par ne plus savoir ce que vous voulez vraiment, et cette sur-adaptation génère un épuisement silencieux.",
    protocole: "Votre parcours de guérison, {firstName}, consistera à réapprendre à dire \"je\". Vos exercices SOS Shine travailleront sur l'affirmation de soi, la tolérance à la déception de l'autre, et la reconnexion avec vos désirs authentiques.",
    color: '#C4A0E8',
    icon: '🦎',
  },
  P7: {
    key: 'P7',
    title: "La Vigie — L'Architecture d'Anticipation",
    archetype: "La Vigie",
    subtitle: "L'Architecture d'Anticipation",
    essence: "Votre esprit fonctionne comme un radar de pointe, {firstName}. Pour garantir votre sécurité émotionnelle, votre système nerveux scanne en permanence l'horizon pour anticiper le pire, afin de ne jamais être pris(e) au dépourvu.",
    lumiere: "Cette perspicacité fait de vous un stratège naturel. Vous avez toujours un temps d'avance et vos plans de secours sont infaillibles. Votre entourage bénéficie souvent de votre capacité à éviter les écueils invisibles pour la plupart des gens.",
    ombre: "Cette hyper-vigilance vous maintient dans un état d'alerte épuisant. En cherchant à contrôler le futur, vous vous coupez de la joie du présent. Vous traversez souvent les catastrophes émotionnellement avant même qu'elles n'arrivent dans le monde réel.",
    protocole: "L'enjeu de votre accompagnement sur SOS Shine sera de désarmer ce système d'alarme interne. Nous utiliserons des techniques de régulation du système nerveux central pour vous ramener dans l'ici et maintenant, là où vous êtes déjà en sécurité.",
    color: '#FFD93D',
    icon: '🔭',
  },
  P8: {
    key: 'P8',
    title: "L'Idéaliste — L'Architecture des Profondeurs",
    archetype: "L'Idéaliste",
    subtitle: "L'Architecture des Profondeurs",
    essence: "Vous évoluez dans un monde en très haute définition, {firstName}. Vous ne tolérez pas la superficialité. Votre quête est celle du sens, de l'authenticité absolue et de l'intensité, que ce soit dans vos relations ou vos projets.",
    lumiere: "Votre profondeur d'âme et votre capacité d'émerveillement sont magnifiques. Vous avez accès à un registre émotionnel et créatif d'une grande richesse, et vous êtes capable d'aimer et de vous engager avec une ferveur rare.",
    ombre: "Cette exigence d'absolu vous rend extrêmement vulnérable face aux déceptions du réel. Quand la vie ou les autres ne sont pas à la hauteur de vos idéaux, vous risquez de sombrer dans la mélancolie et de vous isoler dans un sentiment d'incompréhension.",
    protocole: "Sur SOS Shine, {firstName}, nous allons vous aider à ancrer cette intensité. Votre programme se concentrera sur l'acceptation de l'imperfection (le Kintsugi) et la transmutation de vos émotions fortes en force motrice, sans vous laisser submerger.",
    color: '#FF6B9D',
    icon: '✨',
  },
  P9: {
    key: 'P9',
    title: "Le Diplomate — L'Architecture de l'Harmonie",
    archetype: "Le Diplomate",
    subtitle: "L'Architecture de l'Harmonie",
    essence: "Votre priorité absolue est le maintien de la paix, {firstName}. Face à l'adversité ou aux tensions, vous avez appris à arrondir les angles et à neutraliser rapidement toute escalade agressive.",
    lumiere: "Vous êtes un médiateur né. Votre tolérance et votre douceur font de vous un espace de repos pour les autres. Vous savez désamorcer les bombes émotionnelles avec un tact exceptionnel, créant des ponts là où d'autres construisent des murs.",
    ombre: "En fuyant le conflit à tout prix, vous taisez souvent vos propres frustrations et limites. La colère non exprimée s'accumule à l'intérieur sous forme de ressentiment ou d'anxiété. En voulant protéger la relation, vous vous sacrifiez.",
    protocole: "Votre défi majeur, {firstName}, sera d'apprendre que le conflit sain n'est pas une menace. SOS Shine vous guidera à travers des exercices de communication assertive pour vous apprendre à prendre votre juste place, même si cela doit faire des vagues.",
    color: '#88D8B0',
    icon: '🕊️',
  },
  P10: {
    key: 'P10',
    title: "Le Catalyseur — L'Architecture de l'Intensité",
    archetype: "Le Catalyseur",
    subtitle: "L'Architecture de l'Intensité",
    essence: "Vous fonctionnez sur des cycles énergétiques puissants, {firstName}. Face à l'apathie ou à l'épreuve, votre réflexe est de chercher une décharge forte (changement radical, passion, nouveau défi) pour relancer la machine.",
    lumiere: "Votre capacité à renaître de vos cendres est fascinante. Vous êtes une force de transformation pure, capable de bouleverser les statu quo et de générer une énergie colossale pour surmonter les obstacles les plus massifs.",
    ombre: "Les montagnes russes épuisent votre système à long terme. Le tiède, la routine et le calme plat peuvent vous angoisser, vous poussant parfois à provoquer des micro-crises inconscientes juste pour vous sentir vivant(e) et ressentir l'adrénaline.",
    protocole: "Votre objectif n'est pas d'éteindre votre feu, {firstName}, mais d'apprendre à tolérer la paix. Vos exercices sur SOS Shine viseront à stabiliser vos pics d'énergie et à trouver de la satisfaction dans la constance, sans avoir l'impression de vous éteindre.",
    color: '#FF5E5B',
    icon: '🔥',
  },
};

export function calculateResult(answers: Record<number, number>): ProfileKey {
  const totals: Record<ProfileKey, number> = {
    P1: 0, P2: 0, P3: 0, P4: 0, P5: 0,
    P6: 0, P7: 0, P8: 0, P9: 0, P10: 0,
  };

  for (const [questionIdStr, answerIndex] of Object.entries(answers)) {
    const questionId = parseInt(questionIdStr, 10);
    const question = QUESTIONS.find(q => q.id === questionId);
    if (!question || answerIndex < 0 || answerIndex >= question.answers.length) continue;

    const selectedAnswer = question.answers[answerIndex];
    for (const [profileKey, score] of Object.entries(selectedAnswer.scores)) {
      totals[profileKey as ProfileKey] += score;
    }
  }

  let maxKey: ProfileKey = 'P1';
  let maxScore = -1;
  for (const [key, score] of Object.entries(totals)) {
    if (score > maxScore) {
      maxScore = score;
      maxKey = key as ProfileKey;
    }
  }

  return maxKey;
}
