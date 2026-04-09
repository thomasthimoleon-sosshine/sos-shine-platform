/* ─────────────────────────────────────────────
   Landing Page — Section defaults & types
   Source unique de vérité pour le contenu initial
───────────────────────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SectionContent = Record<string, any>
export type SectionStyles = Record<string, string>

export interface LandingSectionRow {
  id: string
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
      header_login_label: 'Se connecter',
      header_login_href: '/login',
      header_cta_label: 'Commencer gratuitement',
      header_cta_href: '/signup',
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
      surtitle: "PLATEFORME DE DÉCONDITIONNEMENT ÉMOTIONNEL",
      title: "Ce que vous vivez\na une explication.\nEt une sortie.",
      subtitle: "SOS Shine décode les schémas émotionnels qui pilotent votre vie — et vous donne les outils pour reprendre les commandes. Pas du bien-être. De la transformation réelle.",
      video_url: '',
      video_label: 'Découvrir SOS Shine en 2 minutes',
      image_url: '',
      cta_primary_label: 'Rejoindre SOS Shine — 7 jours gratuits',
      cta_primary_href: '/signup',
      cta_primary_subtext: '',
      cta_secondary_label: "Découvrir comment ça fonctionne",
      cta_secondary_href: '#parcours',
      trust_items: [
        '200+ protocoles',
        '7 jours gratuits',
        'Sans engagement',
      ],
      buttons: [
        { label: "Rejoindre SOS Shine — 7 jours gratuits", href: '/signup', variant: 'primary' },
        { label: "Découvrir comment ça fonctionne", href: '#parcours', variant: 'outline' },
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
    section_key: 'stats',
    label: 'Chiffres clés (Social Proof)',
    position: 50,
    is_visible: false,
    content: {
      items: [
        { value: '200+', label: 'PROTOCOLES DE DÉCONDITIONNEMENT' },
        { value: '5', label: 'UNIVERS DE CONTENU' },
        { value: '24/7', label: 'ACCESSIBLE À TOUT MOMENT' },
      ],
    },
    styles: {},
  },
  {
    section_key: 'signature_cta',
    label: 'CTA Signature Émotionnelle',
    position: 51,
    is_visible: false,
    content: {
      label: 'Test exclusif',
      title: 'Découvrez votre',
      title_highlight: 'Signature Émotionnelle',
      description: "20 questions pour identifier votre profil émotionnel dominant — comment vous réagissez au stress, aux relations, aux épreuves. Comprendre son fonctionnement, c'est le premier pas pour le changer.",
      button_label: 'Faire le test gratuit →',
      button_href: '/signature-emotionnelle',
    },
    styles: {},
  },
  {
    section_key: 'probleme',
    label: 'La vérité qui change tout',
    position: 1,
    is_visible: true,
    content: {
      label: 'La vérité qui change tout',
      title: "Vous n'êtes pas cassé(e).\nVous êtes conditionné(e).",
      description: "Chaque réaction excessive. Chaque relation qui finit pareil. Chaque effondrement que vous n'arrivez pas à expliquer.\n\nCe ne sont pas des défauts de caractère. Ce sont des schémas. Construits dans l'enfance, renforcés par vos expériences, répétés à votre insu.",
      closing: "Quand vous comprenez votre schéma, vous arrêtez de le subir.",
      cta_text: '',
      cta_href: '',
      symptoms: [],
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
    section_key: 'principe',
    label: 'Le Principe',
    position: 52,
    is_visible: false,
    content: {
      label: 'Notre approche',
      title: "On ne vous dit pas\nce que vous voulez entendre.\nOn vous montre comment\nvous fonctionnez.",
      description: "",
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
    section_key: 'histoire',
    label: "Julia et le livre",
    position: 2,
    is_visible: true,
    content: {
      label: "L'origine",
      title: "Tout est parti d'un livre.\nÉcrit par Julia. Pour vous.",
      paragraph1: "Je m'appelle Julia Laureau. Pendant des années, j'ai accompagné des personnes en souffrance — en burn-out, en rupture, perdues dans des schémas relationnels qui se répètent.",
      paragraph2: "J'ai mis des années à comprendre les mécanismes qui nous emprisonnent. Et quand j'ai compris, j'ai écrit Le Déconditionnement pour que d'autres n'aient pas à attendre aussi longtemps.",
      paragraph3: "SOS Shine, c'est ce livre mis en vie. Chaque protocole, chaque section de cette plateforme est construit sur ce que j'ai appris en accompagnant des centaines de personnes.",
      paragraph4: "Je ne vous promets pas que tout va aller bien. Je vous promets que vous allez comprendre. Et que comprendre change tout.",
      quote: "",
      signature: "Julia Laureau",
      signature_subtitle: "Fondatrice de SOS Shine\u00ae | Auteure du Déconditionnement",
      team_title: "Ils m'ont rejointe pour donner vie à cette vision.",
      team_description: "William apporte son expertise en contenu et en accompagnement. Thomas a construit l'architecture technique de la plateforme et dans la mise en action. Ensemble, nous avons créé l'outil que j'avais imaginé.",
      book_url: "https://www.amazon.fr/SOS-Shine-Briller-Comme-Diamant/dp/2959566807",
      book_image: "/images/book-cover.jpeg",
      button_label: "Découvrir le livre",
      trinite_title: "",
      trinite_intro: "",
      julia_pilier: "",
      julia_desc: "",
      william_pilier: "",
      william_desc: "",
      thomas_pilier: "",
      thomas_desc: "",
      trinite_tagline: "",
      trinite_conclusion: "",
      manifeste: "",
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'lg',
      title_align: 'center',
    },
  },
  {
    section_key: 'temoignages',
    label: 'Témoignages',
    position: 3,
    is_visible: true,
    content: {
      label: "Ce que les lecteurs ont écrit",
      title: "Ils ont cherché une explication.\nIls ont trouvé un chemin.",
      verified_badge: "",
      items: [
        { quote: "Je ne comprenais pas pourquoi je réagissais comme ça. En lisant le premier protocole, j'ai eu l'impression qu'on m'avait enfin expliqué ma propre histoire.", name: '', city: '' },
        { quote: "J'ai mis des mots sur quelque chose que je portais depuis 10 ans. Juste ça. Et tout a changé.", name: '', city: '' },
        { quote: "La nuit où tout s'est effondré, il était 2h du matin. J'ai réécouté l'audio de Julia. Ce n'était pas de la magie — mais j'étais moins seule.", name: '', city: '' },
      ],
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_align: 'center',
    },
  },
  {
    section_key: 'encyclopedie',
    label: "L'Encyclopédie SOS Shine",
    position: 4,
    is_visible: true,
    content: {
      label: "L'ENCYCLOPÉDIE SOS SHINE",
      title: "Votre situation a un nom.\nEt un protocole dédié.",
      description: "Pas des conseils généraux. Des outils construits pour ce que vous vivez, maintenant.",
      image_url: '',
      items: ['Abandon', 'Anxiété', 'Burn-out', 'Dépendance affective', 'Deuil', 'Peur', 'Rejet', 'Rupture', 'Solitude', 'Trahison', 'Et plus\u2026'],
      show_max: 15,
      search_placeholder: 'Rechercher ce que vous traversez (ex : anxiété, rupture\u2026)',
      button_label: "Explorer l'encyclopédie complète",
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'lg',
      title_align: 'center',
      text_align: 'center',
    },
  },
  {
    section_key: 'steps',
    label: 'Le Parcours (3 étapes)',
    position: 5,
    is_visible: true,
    content: {
      label: 'LE PARCOURS SOS SHINE',
      title: "Trois étapes. Dans l'ordre.\nPour que ça dure.",
      step_label: '',
      items: [
        { num: '01', title: 'COMPRENDRE', subtitle: '', description: "Mettre des mots sur ce qui vous détruit en silence. Les protocoles SOS Shine — construits par Julia à partir de centaines d'accompagnements — décodent votre schéma pour que vous puissiez enfin regarder ce qui se passe en face.", color: '#55EFC4' },
        { num: '02', title: 'LIBÉRER', subtitle: '', description: "Une crise à 2h du matin ? Un effondrement qui arrive d'un coup ? Cette étape est là pour ça. Elle court-circuite la panique en temps réel. Pas de la méditation. Une libération physique et émotionnelle immédiate.", color: '#74C0FC' },
        { num: '03', title: 'AGIR', subtitle: '', description: "Comprendre ne suffit pas. Pour ne plus retomber dans le même schéma, vous devez le reprogrammer. L'hypnose et les protocoles pratiques transforment vos prises de conscience en nouveaux réflexes automatiques.", color: '#E17055' },
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
    section_key: 'communaute',
    label: 'Communauté',
    position: 6,
    is_visible: true,
    content: {
      label: "VOTRE RÉSEAU DE SOUTIEN PRIVÉ",
      title: "Vous n'avez pas besoin d'expliquer.\nIci, on comprend.\nParce qu'on est passés par là.",
      description: "SOS Shine n'est pas une plateforme de contenu. C'est un espace vivant. Un réseau social privé de personnes qui traversent — ou ont traversé — ce que vous vivez.\n\nPosez une question à 23h. Partagez une victoire. Lisez que quelqu'un ressent exactement la même chose.\n\nParfois, être vu suffit à changer quelque chose.",
      image_url: '',
      blocks: [
        { icon: 'fire', title: 'Le Feu de Camp', description: "L'espace d'entraide anonyme et bienveillant. Échangez sans jugement avec ceux qui traversent la même tempête." },
        { icon: 'sparkle', title: 'Mes Rayons', description: "Votre espace personnel au sein de la communauté. Partagez ce que vous voulez, quand vous voulez." },
        { icon: 'journal', title: 'Mon Éclat', description: "Votre espace de micro-blog privé. Un endroit pour noter, traverser, évoluer." },
        { icon: 'live', title: 'Les Lives et Événements', description: "Des rencontres en direct pour que le digital prépare et le collectif transforme." },
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
    section_key: 'produit',
    label: "Ce que vous recevez dès J1",
    position: 7,
    is_visible: true,
    content: {
      label: "Ce que vous recevez dès J1",
      title: "Pas demain. Pas dans 3 semaines.\nCe soir.",
      checklist: [
        "Votre Signature Émotionnelle — identifiez votre profil en 20 questions",
        "L'encyclopédie complète — un protocole pour chaque situation de vie",
        "Le protocole d'urgence — si vous êtes en crise ce soir, allez-y directement",
        "La communauté Feu de Camp — des gens qui comprennent, maintenant",
        "Shine TV, Shine Audible, Shine Journal, Shine Shorts — le format qui vous convient",
        "200+ protocoles guidés, construits sur des années d'accompagnement réel",
      ],
      features: [],
      cta_label: '',
      cta_href: '',
      mockup_image: '',
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'lg',
      title_align: 'center',
      text_font: 'DM Sans',
    },
  },
  {
    section_key: 'fondateurs',
    label: 'Les Fondateurs (Cartes d\'Autorité)',
    position: 53,
    is_visible: false,
    content: {
      label: 'Les Fondateurs',
      title: "Trois passionnés.\nUne seule conviction.",
      description: "",
      members: [
        { name: 'Julia', role: 'Fondatrice', expertise: 'Déconditionnement émotionnel', image: '/images/julia.jpeg' },
        { name: 'Wiliam', role: 'Co-fondateur', expertise: 'Approche corporelle & Hypnose', image: '/images/wiliam.png' },
        { name: 'Thomas', role: 'Co-fondateur', expertise: 'Protocoles d\'action', image: '/images/thomas.jpeg' },
      ],
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'lg',
      title_align: 'center',
    },
  },
  {
    section_key: 'transformation',
    label: 'Avant / Après',
    position: 54,
    is_visible: false,
    content: {
      label: '',
      title: '',
      description: '',
      items: [],
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'lg',
      title_align: 'center',
    },
  },
  {
    section_key: 'manifeste',
    label: 'Ce que nous ne sommes pas',
    position: 8,
    is_visible: true,
    content: {
      label: 'Ce que nous ne sommes pas',
      title: "SOS Shine n'est pas une plateforme\nde développement personnel.\nC'est un espace de déconditionnement.",
      paragraphs: [
        "On ne vous répète pas que tout est possible.\nOn vous montre pourquoi vous faites ce que vous faites.\nEt comment faire autrement.",
        "Nous ne posons aucun diagnostic. Nous ne remplaçons pas un suivi professionnel quand il est nécessaire.",
        "Ce que nous faisons : vous expliquer vos schémas émotionnels. Vous montrer comment votre biologie, vos croyances et vos automatismes fabriquent vos réactions. Et vous donner des outils concrets pour changer ça.",
        "Des humains qui parlent à des humains. Sans filtre. Sans faux espoir.",
      ],
      signature: "Julia Laureau",
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
    position: 9,
    is_visible: true,
    content: {
      label: 'TARIFICATION',
      title: "Choisissez votre niveau\nd'engagement.",
      subtitle: "Sans engagement — Annulable à tout instant.",
      footer: "Parce que si on doit vous retenir par un contrat, c'est qu'on n'a pas fait notre travail.",
      guarantee_title: "7 jours pour tester l'intégralité de votre formule.",
      guarantee_description: "Si ce n'est pas pour vous — zéro prélèvement. Zéro justification.\n\nOn croit en ce qu'on fait. On vous laisse vérifier.",
      trust_badges: ['Paiement sécurisé Stripe', 'Données chiffrées', 'Annulation en 1 clic'],
      plans: [
        {
          name: 'Accès',
          tagline: 'Pour explorer à votre rythme.',
          price: '9,90',
          period: '/mois',
          button_label: "Commencer — 7 jours gratuits",
          button_href: '/signup',
          highlight: false,
          badge: '',
          features: [
            "Encyclopédie complète",
            '200+ protocoles guidés',
            'Communauté, Audible et Feu de Camp',
          ],
        },
        {
          name: 'Engagement',
          tagline: "Pour ceux qui veulent vraiment transformer quelque chose.",
          price: '49,90',
          period: '/mois',
          button_label: 'Commencer — 7 jours gratuits',
          button_href: '/signup',
          highlight: true,
          badge: 'Populaire',
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
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'lg',
      title_align: 'center',
    },
  },
  {
    section_key: 'garantie',
    label: 'Garantie',
    position: 55,
    is_visible: false,
    content: {
      label: 'Notre engagement',
      title: "7 jours pour juger\npar vous-même.",
      description: "Accédez à tout le contenu de votre formule pendant 7 jours. Si ça ne vous correspond pas, annulez en un clic — zéro prélèvement, zéro justification. On croit en ce qu'on fait. Et on vous laisse vérifier.",
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'lg',
      title_align: 'center',
    },
  },
  {
    section_key: 'pour_qui',
    label: 'Pour qui / Pas pour qui',
    position: 10,
    is_visible: true,
    content: {
      title: "SOS Shine est fait pour vous si\u2026",
      for_items: [
        "Vous en avez assez de répéter les mêmes schémas sans comprendre pourquoi",
        "Vous avez besoin d'un espace disponible à n'importe quelle heure",
        "Vous cherchez à comprendre, pas juste à aller mieux",
        "Vous voulez des outils concrets, pas des discours inspirants",
      ],
      not_title: "Ce n'est pas pour vous si\u2026",
      not_items: [
        "Vous cherchez un diagnostic médical ou un suivi thérapeutique",
        "Vous attendez qu'on vous dise que tout est possible et que tout va bien",
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
    label: 'CTA final',
    position: 11,
    is_visible: true,
    content: {
      title: "Rejoignez-nous.",
      subtitle: "Ne soyez plus jamais seul(e) face à vos tempêtes.",
      image_url: '',
      button_label: 'Rejoindre SOS Shine',
      button_href: '/signup',
      trust_line: '9,90\u20ac/mois \u00b7 Sans engagement \u00b7 7 jours gratuits \u00b7 Tout inclus',
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
    position: 56,
    is_visible: false,
    content: {
      description: '',
      button_label: '',
      button_href: '/signup',
      login_text: '',
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
    position: 12,
    is_visible: true,
    content: {
      name: 'SOS Shine\u00ae',
      copyright_year: '2026',
      copyright_suffix: ' — Tous droits réservés',
      links: [
        { label: 'Mentions l\u00e9gales', href: '/mentions-legales' },
        { label: 'CGV', href: '/cgv' },
        { label: 'Confidentialit\u00e9', href: '/confidentialite' },
        { label: 'Contact', href: '/contact' },
        { label: 'Blog', href: '/blog' },
      ],
      social_youtube: 'https://www.youtube.com/@SOS-Shine',
      social_instagram: 'https://www.instagram.com/julia_laureau_sosshine/',
      social_facebook: 'https://www.facebook.com/sosshinejulia',
    },
    styles: {},
  },
  {
    section_key: 'ticker_1',
    label: 'Bandeau défilant 1',
    position: 57,
    is_visible: false,
    content: {
      items: ['Abandon', 'Anxiété', 'Burn-out', 'Confiance en soi', 'Dépendance', 'Deuil', 'Trauma', 'Résilience', 'Pardon'],
      speed: 35,
    },
    styles: {},
  },
  {
    section_key: 'ticker_2',
    label: 'Bandeau défilant 2',
    position: 58,
    is_visible: false,
    content: {
      items: [],
      speed: 40,
    },
    styles: {},
  },
  {
    section_key: 'faq',
    label: 'FAQ',
    position: 59,
    is_visible: false,
    content: {
      label: 'FAQ',
      title: 'Vos questions, nos réponses',
      subtitle: '',
      cta_text: '',
      cta_button_label: '',
      cta_button_href: '/contact',
      items: [],
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'lg',
      title_align: 'center',
    },
  },
  {
    section_key: 'legal_mentions',
    label: 'Page — Mentions légales',
    position: 60,
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
    position: 61,
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
    position: 62,
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
    position: 63,
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
