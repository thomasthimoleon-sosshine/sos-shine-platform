/* ─────────────────────────────────────────────
   Landing Page — Section defaults & types
   Source unique de vérité pour le contenu initial
───────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SectionContent = Record<string, any>
export type SectionStyles = Record<string, string>

export interface LandingSectionRow {
  id: string
  page_version: string
  section_key: string
  label: string
  position: number
  is_visible: boolean
  content: SectionContent
  styles: SectionStyles
  updated_by: string | null
  updated_at: string
}

export interface LandingSectionDefault {
  section_key: string
  label: string
  position: number
  is_visible: boolean
  content: SectionContent
  styles: SectionStyles
}

export const LANDING_DEFAULTS: LandingSectionDefault[] = [
  {
    section_key: '_global',
    label: 'Configuration globale',
    position: -1,
    is_visible: true,
    content: {
      site_name: 'SOS Shine',
      logo_url: '',
      trial_days: 7,
    },
    styles: {
      color_primary: '#D4AF37',
      color_secondary: '#74C0FC',
      color_bg: '#362038',
      color_card: '#442B40',
      color_border: '#5E3E52',
      color_text: '#F5EDF0',
      color_text_secondary: '#C8A8B8',
      color_text_muted: '#8E6E7E',
      color_button: '#D4AF37',
      font_display: 'Cormorant Garamond',
      font_body: 'DM Sans',
    },
  },
  {
    section_key: 'hero',
    label: 'Hero (en-tête)',
    position: 0,
    is_visible: true,
    content: {
      title: "L’encyclopédie des schémas\némotionnels et des\nexpériences de vie.",
      subtitle: "Un espace ouvert 24h/24, 7j/7, pour comprendre, apaiser et ne plus jamais être seul.",
      video_url: '',
      image_url: '',
      buttons: [
        { label: "Découvrir", href: '/encyclopedie', variant: 'outline' },
        { label: "Accès illimité", href: '/rejoindre', variant: 'primary' },
      ],
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: '2xl',
      title_align: 'left',
      title_color: '',
      text_font: 'DM Sans',
      text_align: 'left',
    },
  },
  {
    section_key: 'principe',
    label: 'Le Principe',
    position: 1,
    is_visible: true,
    content: {
      label: 'Le principe SOS Shine',
      title: "On ne change pas votre identit\u00e9.\nOn apaise le challenge \u00e9motionnel\npour lib\u00e9rer votre potentiel.",
      description: "Chaque exp\u00e9rience de vie \u2014 abandon, trahison, burn-out, deuil, peur \u2014 poss\u00e8de sa propre page dans notre encyclop\u00e9die, avec un protocole en 3 \u00e9tapes con\u00e7u pour vous accompagner de A \u00e0 Z.",
      image_url: '',
      video_url: '',
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'xl',
      title_align: 'center',
      title_color: '',
      text_font: 'DM Sans',
      text_align: 'center',
    },
  },
  {
    section_key: 'steps',
    label: 'Les \u00c9tapes',
    position: 2,
    is_visible: true,
    content: {
      label: 'Le parcours SOS Shine',
      title: '3 \u00e9tapes pour chaque challenge \u00e9motionnel',
      items: [
        { num: '01', title: 'Comprendre', description: "Vid\u00e9o de coaching immersive. Analyse \u00e9motionnelle. Explication de votre probl\u00e8me. Apaisement mental. Une approche humaine et directe.", color: '#55EFC4' },
        { num: '02', title: 'Lib\u00e9rer & Int\u00e9grer', description: "Vid\u00e9o de lib\u00e9ration \u00e9nerg\u00e9tique et d\u2019int\u00e9gration. Activation \u00e9motionnelle. D\u00e9charge des tensions. Nettoyage des empreintes qui vous bloquent. Stabilisation int\u00e9rieure et reconnexion \u00e0 soi.", color: '#74C0FC' },
        { num: '03', title: 'Agir', description: "PDF d\u2019exercices pratiques et audio guid\u00e9. Passez \u00e0 l\u2019action concr\u00e8te. Reprogrammation \u00e9motionnelle. Ancrez vos transformations dans le quotidien.", color: '#E17055' },
      ],
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'lg',
      title_align: 'center',
      text_font: 'DM Sans',
    },
  },
  {
    section_key: 'encyclopedie',
    label: "L\u2019Encyclop\u00e9die",
    position: 3,
    is_visible: true,
    content: {
      label: "L\u2019encyclop\u00e9die",
      title: "Chaque challenge \u00e9motionnel a sa page d\u00e9di\u00e9e",
      description: "Abus, amour propre, burn-out, confiance en soi, dépendance affective, deuil, rupture... Classées de A à Z, accessibles en un clic.",
      image_url: '',
      items: ['Abus', 'Amour propre', 'Burn-out', 'Confiance en soi', 'Dépendance affective', 'Deuil', 'Rupture'],
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'lg',
      title_align: 'center',
      text_align: 'center',
    },
  },
  {
    section_key: 'communaute',
    label: 'Communaut\u00e9',
    position: 4,
    is_visible: true,
    content: {
      title: "Vous n\u2019\u00eates plus jamais seul \u00e0 3h du matin.",
      description: "Chat d\u00e9di\u00e9 par challenge \u00e9motionnel, chat g\u00e9n\u00e9ral, mur communautaire, soins collectifs et \u00e9v\u00e9nements \u2014 une vraie famille.",
      image_url: '',
      blocks: [
        { title: 'Le Feu de Camp', description: "Chaque challenge \u00e9motionnel a son propre chat. \u00c9changez avec ceux qui comprennent vraiment. Un espace d\u2019entraide cibl\u00e9 et bienveillant." },
        { title: 'Le Mur Communautaire', description: "Publications, annonces, partages. Restez inform\u00e9 de chaque nouvelle exp\u00e9rience de vie, chaque \u00e9v\u00e9nement, chaque avanc\u00e9e collective." },
        { title: 'Les Rencontres R\u00e9elles', description: "Soins collectifs, ateliers, lives, Shine Walks \u2014 le digital pr\u00e9pare, le physique transforme." },
      ],
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'xl',
      title_align: 'center',
      text_align: 'center',
    },
  },
  {
    section_key: 'temoignages',
    label: 'T\u00e9moignages',
    position: 5,
    is_visible: true,
    content: {
      label: "Ils ont travers\u00e9 la temp\u00eate",
      items: [
        { quote: "Je ne savais m\u00eame pas que j\u2019avais le droit de ne pas aller bien. SOS Shine m\u2019a donn\u00e9 un espace o\u00f9 mon v\u00e9cu avait le droit d\u2019exister.", name: 'Marie, 34 ans', city: 'Lyon' },
        { quote: "La premi\u00e8re fois que quelqu\u2019un m\u2019a dit \u00ab je suis pass\u00e9 par l\u00e0, tiens bon \u00bb \u2014 c\u2019\u00e9tait dans le Feu de Camp. J\u2019ai pleur\u00e9. Des larmes de soulagement.", name: 'Karim, 41 ans', city: 'Bordeaux' },
        { quote: "J\u2019ai fait ma premi\u00e8re Shine Walk un samedi matin. En rentrant, j\u2019ai senti quelque chose que j\u2019avais oubli\u00e9 : je n\u2019\u00e9tais plus seule.", name: 'Sophie, 28 ans', city: 'Bruxelles' },
        { quote: "Gr\u00e2ce aux 3 \u00e9tapes, j\u2019ai compris mon challenge \u00e9motionnel au lieu de le fuir. Aujourd\u2019hui, je suis \u00c9claireur et j\u2019aide les autres.", name: 'Antoine, 37 ans', city: 'Gen\u00e8ve' },
      ],
    },
    styles: {
      title_font: 'DM Sans',
      title_align: 'center',
    },
  },
  {
    section_key: 'histoire',
    label: "L'Histoire / Le Livre",
    position: 6,
    is_visible: true,
    content: {
      label: "L'Histoire",
      title: "Né d'un livre, devenu une communauté",
      paragraph1: "Tout a commencé avec un livre. Julia Laureau, thérapeute holistique, a créé \"SOS Shine — Briller Comme un Diamant\" — bien plus qu'un ouvrage de développement personnel, une véritable bible de transformation qui combine coaching vidéo, méditations guidées et séances énergétiques.",
      paragraph2: "Ce programme interactif a déjà aidé des dizaines de personnes à se libérer de leurs blocages et à accéder à leur véritable potentiel. Face à cet élan, la plateforme SOS Shine est née — la continuité naturelle du livre, transformée en une communauté vivante d'accompagnement et de reconstruction.",
      quote: "Vous avez en vous le pouvoir de tout changer, de tout transmuter, et d'évoluer vers une nouvelle version de vous-même.",
      book_url: "https://www.amazon.fr/SOS-Shine-Briller-Comme-Diamant/dp/2959566807",
      book_image: "/images/book-cover.jpeg",
      button_label: "Découvrir le livre",
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'lg',
      title_align: 'center',
    },
  },
  {
    section_key: 'fondateurs',
    label: 'Les Fondateurs',
    position: 7,
    is_visible: true,
    content: {
      label: 'Les Fondateurs',
      title: "L'équipe derrière SOS Shine",
      description: "Trois passionnés unis par une vision commune : créer un espace où chacun peut traverser ses épreuves avec dignité et bienveillance.",
      members: [
        { name: 'Julia', role: 'Fondatrice', image: '/images/julia.jpeg' },
        { name: 'Wiliam', role: 'Co-fondateur', image: '/images/wiliam.png' },
        { name: 'Thomas', role: 'Co-fondateur', image: '/images/thomas.jpeg' },
      ],
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'lg',
      title_align: 'center',
    },
  },
  {
    section_key: 'pricing',
    label: 'Tarification',
    position: 8,
    is_visible: true,
    content: {
      title: "Choisissez votre accompagnement",
      subtitle: "Sans engagement \u2014 Annulable \u00e0 tout instant",
      footer: "Parce que si on doit vous retenir par un contrat, c\u2019est qu\u2019on n\u2019a pas fait notre travail.",
      plans: [
        {
          name: 'Essentielle',
          price: '9,90',
          period: '/mois',
          button_label: "Choisir l'Essentielle",
          button_href: '/rejoindre',
          highlight: false,
          badge: '',
          features: [
            'Encyclopédie complète (accès illimité)',
            'Tchats communautaires',
            'Accès immédiat, sans essai gratuit',
          ],
        },
        {
          name: 'Sérénité',
          price: '49,90',
          period: '/mois',
          button_label: 'Essayer — 7 jours gratuits',
          button_href: '/rejoindre',
          highlight: true,
          badge: 'Populaire',
          features: [
            "Tout le contenu de l'Essentielle",
            'Soin collectif mensuel',
            '7 jours d\'essai gratuit',
          ],
        },
        {
          name: 'Premium',
          price: '99,90',
          period: '/mois',
          button_label: 'Essayer — 7 jours gratuits',
          button_href: '/rejoindre',
          highlight: false,
          badge: 'VIP',
          features: [
            "Tout le contenu de la Sérénité",
            'Live thématique hebdomadaire',
            'Canal privé Telegram',
            'Accès aux événements',
            '7 jours d\'essai gratuit',
          ],
        },
      ],
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'lg',
      title_align: 'center',
    },
  },
  {
    section_key: 'cta_dark',
    label: 'CTA (fond sombre)',
    position: 9,
    is_visible: true,
    content: {
      title: "Rejoignez-nous.\nNe soyez plus jamais seul(e) face \u00e0 vos temp\u00eates.",
      image_url: '',
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'xl',
      title_align: 'center',
    },
  },
  {
    section_key: 'cta_light',
    label: 'CTA (fond clair)',
    position: 10,
    is_visible: true,
    content: {
      description: "Que vous cherchiez un challenge émotionnel ancien, une crise, ou simplement un espace où être compris(e) — SOS Shine est là, 24h/24, 7j/7. Vous n’avez pas à tout porter seul(e). On est là pour comprendre, accompagner et avancer ensemble.",
      button_label: 'Rejoindre SOS Shine',
      button_href: '/rejoindre',
      login_text: "Déjà membre ? Se connecter",
    },
    styles: {
      bg: '#ffffff',
      text_color: '#1a1a1a',
      muted_color: '#6b7280',
    },
  },
  {
    section_key: 'footer',
    label: 'Pied de page',
    position: 11,
    is_visible: true,
    content: {
      name: 'SOS Shine',
      copyright_year: '2026',
      links: [
        { label: 'Mentions l\u00e9gales', href: '/mentions-legales' },
        { label: 'CGV', href: '/cgv' },
        { label: 'Confidentialit\u00e9', href: '/confidentialite' },
        { label: 'Contact', href: '/contact' },
      ],
    },
    styles: {},
  },
  {
    section_key: 'ticker_1',
    label: 'Bandeau défilant 1',
    position: 12,
    is_visible: true,
    content: {
      items: ['Abus', 'Amour propre', 'Burn-out', 'Confiance en soi', 'Dépendance affective', 'Deuil', 'Rupture'],
      speed: 35,
    },
    styles: {},
  },
  {
    section_key: 'ticker_2',
    label: 'Bandeau défilant 2',
    position: 13,
    is_visible: true,
    content: {
      items: ['Soutien 24/7', 'Communauté bienveillante', 'Protocoles exclusifs', 'Soins collectifs', 'Chat dédié', 'Événements live', 'Méditation guidée', 'Coaching immersif'],
      speed: 40,
    },
    styles: {},
  },
  {
    section_key: 'legal_mentions',
    label: 'Page — Mentions légales',
    position: 14,
    is_visible: true,
    content: {
      title: 'Mentions légales',
      html_content: '',
    },
    styles: {},
  },
  {
    section_key: 'legal_cgv',
    label: 'Page — CGV',
    position: 15,
    is_visible: true,
    content: {
      title: 'Conditions Générales de Vente',
      html_content: '',
    },
    styles: {},
  },
  {
    section_key: 'legal_privacy',
    label: 'Page — Confidentialité',
    position: 16,
    is_visible: true,
    content: {
      title: 'Politique de confidentialité',
      html_content: '',
    },
    styles: {},
  },
  {
    section_key: 'legal_contact',
    label: 'Page — Contact',
    position: 17,
    is_visible: true,
    content: {
      title: 'Contact',
      email: 'julialaureau@sosshine.com',
      phone: '',
      address: '',
      html_content: '',
    },
    styles: {},
  },

  /* ═══════════════════════════════════════════
     NOUVELLES SECTIONS — Brief A/B Testing
  ═══════════════════════════════════════════ */

  {
    section_key: 'nav',
    label: 'Navigation',
    position: 18,
    is_visible: true,
    content: {
      login_label: 'Se connecter',
      login_href: '/login',
      cta_label: 'Commencer gratuitement',
      cta_href: '/rejoindre',
    },
    styles: {},
  },
  {
    section_key: 'hero_v2',
    label: 'Hero V2 — Déconditionnement',
    position: 19,
    is_visible: true,
    content: {
      badge: 'PLATEFORME DE DÉCONDITIONNEMENT ÉMOTIONNEL',
      title: "Ce que vous vivez a une explication.\nEt une sortie.",
      description: "SOS Shine décode les schémas émotionnels qui pilotent votre vie — et vous donne les outils pour reprendre les commandes. Pas du bien-être. De la transformation réelle.",
      image_url: '',
      video_url: '',
      buttons: [
        { label: 'Rejoindre SOS Shine — 7 jours gratuits', href: '/rejoindre', variant: 'primary' },
        { label: 'Découvrir comment ça fonctionne', href: '#parcours', variant: 'outline' },
      ],
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: '2xl',
      title_align: 'center',
      title_color: '',
      text_font: 'DM Sans',
      text_align: 'center',
    },
  },
  {
    section_key: 'truth',
    label: 'Section 02 — La Vérité',
    position: 20,
    is_visible: true,
    content: {
      title: "Vous n'êtes pas cassé(e).\nVous êtes conditionné(e).",
      paragraphs: [
        "Chaque réaction excessive. Chaque relation qui finit pareil. Chaque effondrement que vous n'arrivez pas à expliquer.",
        "Ce ne sont pas des défauts de caractère. Ce sont des schémas. Construits dans l'enfance, renforcés par vos expériences, répétés à votre insu.",
      ],
      conclusion: "Quand vous comprenez votre schéma, vous arrêtez de le subir.",
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'xl',
      title_align: 'center',
      text_font: 'DM Sans',
      text_align: 'center',
    },
  },
  {
    section_key: 'julia_book',
    label: 'Section 03 — Julia et le Livre',
    position: 21,
    is_visible: true,
    content: {
      title: "Tout est parti d'un livre.\nÉcrit par Julia. Pour vous.",
      author_intro: "Je m'appelle Julia Laureau. Pendant des années, j'ai accompagné des personnes en souffrance en burn-out, en rupture, perdues dans des schémas relationnels qui se répètent.",
      author_story: "J'ai mis des années à comprendre les mécanismes qui nous emprisonnent. Et quand j'ai compris, j'ai écrit Le Déconditionnement pour que d'autres n'aient pas à attendre aussi longtemps.",
      platform_text: "SOS Shine, c'est ce livre mis en vie. Chaque protocole, chaque section de cette plateforme est construit sur ce que j'ai appris en accompagnant des centaines de personnes.",
      promise: "Je ne vous promets pas que tout va aller bien. Je vous promets que vous allez comprendre. Et que comprendre change tout.",
      signature: "— Julia Laureau\nFondatrice de SOS Shine\u00ae\ufe0f | Auteure du Déconditionnement",
      author_image: '/images/julia.jpeg',
      book_image: '/images/book-cover.jpeg',
      book_url: 'https://www.amazon.fr/SOS-Shine-Briller-Comme-Diamant/dp/2959566807',
      team_intro: "Ils m'ont rejointe pour donner vie à cette vision.",
      team_description: "William apporte son expertise en contenu et en accompagnement. Thomas a construit l'architecture technique de la plateforme et dans la mise en action. Ensemble, nous avons créé l'outil que j'avais imaginé.",
      team_members: [
        { name: 'Julia', role: 'Fondatrice', image: '/images/julia.jpeg' },
        { name: 'William', role: 'Contenu & Accompagnement', image: '/images/wiliam.png' },
        { name: 'Thomas', role: 'Architecture technique', image: '/images/thomas.jpeg' },
      ],
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'xl',
      title_align: 'center',
      text_font: 'DM Sans',
      text_align: 'left',
    },
  },
  {
    section_key: 'member_stories',
    label: 'Section 04 — Témoignages Membres',
    position: 22,
    is_visible: true,
    content: {
      title: "Ils ont cherché une explication.\nIls ont trouvé un chemin.",
      subtitle: "Ce que les lecteurs ont écrit :",
      items: [
        { quote: "Je ne comprenais pas pourquoi je réagissais comme ça. En lisant le premier protocole, j'ai eu l'impression qu'on m'avait enfin expliqué ma propre histoire." },
        { quote: "J'ai mis des mots sur quelque chose que je portais depuis 10 ans. Juste ça. Et tout a changé." },
        { quote: "La nuit où tout s'est effondré, il était 2h du matin. J'ai réécouté l'audio de Julia. Ce n'était pas de la magie mais j'étais moins seule." },
      ],
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'xl',
      title_align: 'center',
      text_font: 'DM Sans',
    },
  },
  {
    section_key: 'encyclopedia_v2',
    label: "Section 05 — L'Encyclopédie V2",
    position: 23,
    is_visible: true,
    content: {
      badge: "L'ENCYCLOPÉDIE SOS SHINE",
      title: "Votre situation a un nom.\nEt un protocole dédié.",
      description: "Pas des conseils généraux. Des outils construits pour ce que vous vivez, maintenant.",
      search_placeholder: "Rechercher ce que vous traversez (ex : anxiété, rupture…)",
      tags: ['Abandon', 'Anxiété', 'Burn-out', 'Dépendance affective', 'Deuil', 'Peur', 'Rejet', 'Rupture', 'Solitude', 'Trahison'],
      more_label: 'Et plus…',
      button_label: "Explorer l'encyclopédie complète",
      button_href: '/encyclopedie',
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'xl',
      title_align: 'center',
      text_font: 'DM Sans',
      text_align: 'center',
    },
  },
  {
    section_key: 'parcours',
    label: 'Section 06 — Le Parcours',
    position: 24,
    is_visible: true,
    content: {
      badge: 'LE PARCOURS SOS SHINE',
      title: "Trois étapes. Dans l'ordre.\nPour que ça dure.",
      steps: [
        {
          num: '01',
          title: 'COMPRENDRE',
          description: "Mettre des mots sur ce qui vous détruit en silence. Les protocoles SOS Shine construits par Julia à partir de centaines d'accompagnements décodent votre schéma pour que vous puissiez enfin regarder ce qui se passe en face.",
          color: '#55EFC4',
        },
        {
          num: '02',
          title: 'LIBÉRER',
          description: "Une crise à 2h du matin ? Un effondrement qui arrive d'un coup ? Cette étape est là pour ça. Elle court-circuite la panique en temps réel. Pas de la méditation. Une libération physique et émotionnelle immédiate.",
          color: '#74C0FC',
        },
        {
          num: '03',
          title: 'AGIR',
          description: "Comprendre ne suffit pas. Pour ne plus retomber dans le même schéma, vous devez le reprogrammer. L'hypnose et les protocoles pratiques transforment vos prises de conscience en nouveaux réflexes automatiques.",
          color: '#E17055',
        },
      ],
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'xl',
      title_align: 'center',
      text_font: 'DM Sans',
    },
  },
  {
    section_key: 'community_v2',
    label: 'Section 07 — Communauté V2',
    position: 25,
    is_visible: true,
    content: {
      badge: 'VOTRE RÉSEAU DE SOUTIEN PRIVÉ',
      title: "Vous n'avez pas besoin d'expliquer.\nIci, on comprend. Parce qu'on est passés par là.",
      description: "SOS Shine n'est pas une plateforme de contenu. C'est un espace vivant. Un réseau social privé de personnes qui traversent — ou ont traversé ce que vous vivez.",
      paragraph: "Posez une question à 23h. Partagez une victoire. Lisez que quelqu'un ressent exactement la même chose.",
      closing: "Parfois, être vu suffit à changer quelque chose.",
      blocks: [
        { icon: '\ud83d\udd25', title: 'Le Feu de Camp', description: "L'espace d'entraide anonyme et bienveillant. Échangez sans jugement avec ceux qui traversent la même tempête." },
        { icon: '\u2728', title: 'Mes Rayons', description: "Votre espace personnel au sein de la communauté. Partagez ce que vous voulez, quand vous voulez." },
        { icon: '\ud83d\udcdd', title: 'Mon Éclat', description: "Votre espace de micro-blog privé. Un endroit pour noter, traverser, évoluer." },
        { icon: '\ud83c\udfa5', title: 'Les Lives et Événements', description: "Des rencontres en direct pour que le digital prépare et le collectif transforme." },
      ],
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'xl',
      title_align: 'center',
      text_font: 'DM Sans',
      text_align: 'center',
    },
  },
  {
    section_key: 'day_one',
    label: 'Section 08 — Dès Jour 1',
    position: 26,
    is_visible: true,
    content: {
      title: "Pas demain. Pas dans 3 semaines.\nCe soir.",
      items: [
        'Votre Signature Émotionnelle — identifiez votre profil en 20 questions',
        "L'encyclopédie complète — un protocole pour chaque situation de vie",
        "Le protocole d'urgence — si vous êtes en crise ce soir, allez-y directement",
        'La communauté Feu de Camp — des gens qui comprennent, maintenant',
        'Shine TV, Shine Audible, Shine Journal, Shine Shorts — le format qui vous convient',
        "200+ protocoles guidés, construits sur des années d'accompagnement réel",
      ],
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'xl',
      title_align: 'center',
      text_font: 'DM Sans',
    },
  },
  {
    section_key: 'not_us',
    label: 'Section 09 — Ce que nous ne sommes pas',
    position: 27,
    is_visible: true,
    content: {
      title: "SOS Shine n'est pas une plateforme de développement personnel.\nC'est un espace de déconditionnement.",
      quote: "On ne vous répète pas que tout est possible.\nOn vous montre pourquoi vous faites ce que vous faites.\nEt comment faire autrement.",
      author: '— Julia Laureau',
      disclaimer: "Nous ne posons aucun diagnostic. Nous ne remplaçons pas un suivi professionnel quand il est nécessaire.",
      description: "Ce que nous faisons : vous expliquer vos schémas émotionnels. Vous montrer comment votre biologie, vos croyances et vos automatismes fabriquent vos réactions. Et vous donner des outils concrets pour changer ça.",
      closing: "Des humains qui parlent à des humains. Sans filtre. Sans faux espoir.",
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'lg',
      title_align: 'center',
      text_font: 'DM Sans',
      text_align: 'center',
    },
  },
  {
    section_key: 'pricing_v2',
    label: 'Section 10 — Tarification V2',
    position: 28,
    is_visible: true,
    content: {
      badge: 'TARIFICATION',
      title: "Choisissez votre niveau d'engagement.",
      subtitle: 'Sans engagement — Annulable à tout instant.',
      plans: [
        {
          name: 'ACCÈS',
          price: '9,90',
          period: '/ mois',
          description: 'Pour explorer à votre rythme.',
          button_label: 'Commencer — 7 jours gratuits',
          button_href: '/rejoindre',
          highlight: false,
          badge: '',
          features: [
            'Encyclopédie complète',
            '200+ protocoles guidés',
            'Communauté, Audible et Feu de Camp',
          ],
        },
        {
          name: 'ENGAGEMENT',
          price: '49,90',
          period: '/ mois',
          description: 'Pour ceux qui veulent vraiment transformer quelque chose.',
          button_label: 'Commencer — 7 jours gratuits',
          button_href: '/rejoindre',
          highlight: true,
          badge: 'POPULAIRE',
          features: [
            "Tout de l'Accès",
            'Lives hebdomadaires avec Julia',
            'Événements collectifs',
            'Soin collectif mensuel',
            'Shine TV, Shine Audible, Shine Journal',
            'Shine Shorts et contenus exclusifs',
          ],
        },
      ],
      footer_title: "7 jours pour tester l'intégralité de votre formule.",
      footer_text: "Si ce n'est pas pour vous — zéro prélèvement. Zéro justification.",
      footer_quote: "On croit en ce qu'on fait. On vous laisse vérifier.\nParce que si on doit vous retenir par un contrat, c'est qu'on n'a pas fait notre travail.",
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'xl',
      title_align: 'center',
    },
  },
  {
    section_key: 'for_who',
    label: 'Section 11 — Pour qui',
    position: 29,
    is_visible: true,
    content: {
      title: 'SOS Shine est fait pour vous si…',
      positive: [
        'Vous en avez assez de répéter les mêmes schémas sans comprendre pourquoi',
        "Vous avez besoin d'un espace disponible à n'importe quelle heure",
        'Vous cherchez à comprendre, pas juste à aller mieux',
        "Vous voulez des outils concrets, pas des discours inspirants",
      ],
      negative_title: "Ce n'est pas pour vous si…",
      negative: [
        'Vous cherchez un diagnostic médical ou un suivi thérapeutique',
        "Vous attendez qu'on vous dise que tout est possible et que tout va bien",
      ],
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'lg',
      title_align: 'center',
      text_font: 'DM Sans',
    },
  },
  {
    section_key: 'cta_final',
    label: 'Section 12 — CTA Final',
    position: 30,
    is_visible: true,
    content: {
      title: "Rejoignez-nous.\nNe soyez plus jamais seul(e) face à vos tempêtes.",
      button_label: 'Rejoindre SOS Shine',
      button_href: '/rejoindre',
      details: '9,90\u20ac/mois \u00b7 Sans engagement \u00b7 7 jours gratuits \u00b7 Tout inclus',
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'xl',
      title_align: 'center',
    },
  },
  {
    section_key: 'footer_v2',
    label: 'Footer V2',
    position: 31,
    is_visible: true,
    content: {
      logo_text: 'SOS Shine\u00ae\ufe0f',
      links: [
        { label: 'Mentions légales', href: '/mentions-legales' },
        { label: 'CGV', href: '/cgv' },
        { label: 'Confidentialité', href: '/confidentialite' },
        { label: 'Contact', href: '/contact' },
        { label: 'Blog', href: '/blog' },
      ],
      socials: [
        { label: 'YouTube', href: '' },
        { label: 'Instagram', href: '' },
        { label: 'Facebook', href: '' },
      ],
      copyright: '© 2026 SOS Shine\u00ae\ufe0f — Tous droits réservés',
    },
    styles: {},
  },
]

/** Get default for a specific section_key */
export function getDefaultSection(key: string): LandingSectionDefault | undefined {
  return LANDING_DEFAULTS.find((s) => s.section_key === key)
}

/** Build a map from an array of sections (DB rows or defaults) */
export function buildSectionMap<T extends { section_key: string }>(
  sections: T[]
): Record<string, T> {
  const map: Record<string, T> = {}
  for (const s of sections) map[s.section_key] = s
  return map
}
