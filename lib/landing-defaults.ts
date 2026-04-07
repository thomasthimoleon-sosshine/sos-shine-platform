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
      surtitle: "Plateforme de déconditionnement émotionnel",
      title: "Comprenez vos schémas.\nReprenez le contrôle\nde vos émotions.",
      subtitle: "200+ protocoles concrets pour décoder vos réactions automatiques, comprendre votre biologie émotionnelle et changer durablement vos comportements. Créés par 3 spécialistes. Accessibles 24/7.",
      video_url: '',
      image_url: '',
      cta_primary_label: 'Découvrir ma Signature Émotionnelle',
      cta_primary_href: '/signature-emotionnelle',
      cta_primary_subtext: 'Test gratuit — 20 questions — Résultat immédiat.',
      cta_secondary_label: "Explorer l'encyclopédie",
      cta_secondary_href: '/encyclopedie',
      trust_items: [
        '200+ protocoles',
        '7 jours gratuits',
        'Sans engagement',
      ],
      buttons: [
        { label: "Découvrir ma Signature Émotionnelle", href: '/signature-emotionnelle', variant: 'primary' },
        { label: "Explorer l'encyclopédie", href: '/encyclopedie', variant: 'outline' },
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
    position: 0.5,
    is_visible: true,
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
    position: 0.7,
    is_visible: true,
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
    label: 'Problème & Agitation',
    position: 1,
    is_visible: true,
    content: {
      label: 'Le vrai problème',
      title: "Vous ne manquez pas de volonté.\nVous manquez de compréhension\nsur votre propre fonctionnement.",
      description: "Vous répétez les mêmes schémas relationnels. Vous réagissez de manière disproportionnée sans comprendre pourquoi. Vous avez l'impression de tourner en rond malgré vos efforts. Ce n'est pas un manque de courage — c'est un conditionnement. Des réflexes émotionnels installés depuis l'enfance qui pilotent vos réactions à votre place.",
      closing: "Vous n'êtes pas le problème. Vos conditionnements le sont. Et des conditionnements, ça se change.",
      cta_text: "Explorer l'encyclopédie",
      cta_href: '/encyclopedie',
      symptoms: [
        { icon: 'anxiety', label: 'Anxiété & Stress' },
        { icon: 'heart', label: 'Schémas relationnels' },
        { icon: 'grief', label: 'Deuil & Perte' },
        { icon: 'burnout', label: 'Épuisement' },
        { icon: 'dependency', label: 'Dépendance affective' },
        { icon: 'trauma', label: 'Blocages émotionnels' },
      ],
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
    position: 2,
    is_visible: true,
    content: {
      label: 'Notre approche',
      title: "On ne vous dit pas\nce que vous voulez entendre.\nOn vous montre comment\nvous fonctionnez.",
      description: "Chaque réaction émotionnelle a une origine, un mécanisme et une clé de compréhension. Nos protocoles en 3 étapes vous permettent de décoder vos schémas, modifier votre biologie émotionnelle et installer de nouveaux réflexes. Pas de théorie abstraite — des outils concrets.",
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
    label: 'La Méthode (3 Phases)',
    position: 3,
    is_visible: true,
    content: {
      label: 'La Méthode',
      title: "3 étapes pour chaque\nschéma émotionnel.",
      items: [
        { num: '01', title: 'Comprendre', subtitle: 'Identifier le schéma', description: "Une vidéo vous explique concrètement d'où vient votre réaction, comment elle s'est installée, et pourquoi elle se répète. Vous mettez des mots clairs sur ce qui était confus.", color: '#55EFC4' },
        { num: '02', title: 'Intégrer', subtitle: 'Changer la biologie', description: "Une séance audio guidée pour modifier votre état émotionnel en temps réel. Respiration, visualisation, ancrage corporel — vous apprenez à réguler votre système nerveux autrement.", color: '#74C0FC' },
        { num: '03', title: 'Agir', subtitle: 'Installer le nouveau réflexe', description: "Des exercices pratiques et un cahier d'action pour transformer la prise de conscience en comportement durable. Vous ne comprenez pas seulement — vous changez.", color: '#E17055' },
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
    label: "L'Encyclopédie",
    position: 4,
    is_visible: true,
    content: {
      label: "L'encyclopédie",
      title: "200+ schémas émotionnels.\nChacun a son protocole.",
      description: "Tapez ce que vous traversez. Chaque sujet a un protocole en 3 étapes : vidéo explicative, séance audio guidée, exercices d'action. Vous avancez à votre rythme.",
      image_url: '',
      items: ['Abandon', 'Anxiété', 'Burn-out', 'Confiance en soi', 'Dépendance affective', 'Deuil', 'Intuition', 'Mission de vie', 'Pardon', 'Résilience', 'Relations toxiques', 'Stress', 'Trahison', 'Et plus...'],
      show_max: 15,
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'lg',
      title_align: 'center',
      text_align: 'center',
    },
  },
  {
    section_key: 'produit',
    label: "L'Écosystème (Produit)",
    position: 5,
    is_visible: true,
    content: {
      label: "Votre espace privé",
      title: "Tout ce dont vous avez besoin.\nDans votre poche, 24/7.",
      features: [
        { icon: 'encyclopedia', title: "L'Encyclopédie Interactive", description: "200+ protocoles de déconditionnement classés par thème. Dépendance affective, trahison, anxiété, deuil — trouvez votre sujet, suivez le protocole." },
        { icon: 'community', title: 'La Communauté', description: "Un espace d'échange entre personnes qui traversent les mêmes épreuves. Pas de jugement. Pas de leçons de morale. Du vrai." },
        { icon: 'events', title: 'Les Événements Live', description: "Conférences hebdomadaires, ateliers en présentiel, Shine Walks. Le digital donne les clés, le présentiel ancre le changement." },
        { icon: 'media', title: '5 Univers de Contenu', description: "Shine TV (vidéos), Shine Audible (podcasts, méditations), Shine Shorts, Shine Librairie (guides, cahiers d'exercices). Le format qui vous correspond." },
      ],
      cta_label: "Commencer l'essai gratuit",
      cta_href: '/signup',
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
    section_key: 'communaute',
    label: 'Communauté',
    position: 6,
    is_visible: true,
    content: {
      title: "Vous n'êtes plus seul(e)\nface à ce que vous traversez.",
      description: "Des personnes qui vivent la même chose que vous. Pas de coaches autoproclamés. Pas de positivité toxique. Des humains qui avancent ensemble, avec honnêteté.",
      image_url: '',
      blocks: [
        { title: 'Les Chats Thématiques', description: "Un espace d'échange dédié à chaque sujet. Vous parlez avec des personnes qui comprennent votre situation — parce qu'elles la vivent aussi." },
        { title: 'Le Mur Communautaire', description: "Partagez vos avancées, vos prises de conscience, vos questions. Chaque message rappelle à quelqu'un qu'il n'est pas seul." },
        { title: 'Les Événements', description: "Conférences live hebdomadaires, ateliers en présentiel, Shine Walks. Le changement se vit aussi dans le réel." },
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
    label: 'Témoignages',
    position: 7,
    is_visible: true,
    content: {
      label: "Témoignages",
      title: "Ils ont compris leurs schémas.\nIls ont changé leur quotidien.",
      verified_badge: "Retours de membres actifs",
      items: [
        { quote: "15 ans à répéter le même schéma en amour. La vidéo sur la dépendance affective m'a fait comprendre d'où ça venait. Aujourd'hui je choisis mes relations différemment.", name: 'Marie, 34 ans', city: 'Lyon' },
        { quote: "3h du matin, seul avec mes pensées. J'ai ouvert le chat. Quelqu'un m'a dit « tiens bon, je suis passé par là ». Savoir qu'on n'est pas seul, ça change tout.", name: 'Karim, 41 ans', city: 'Bordeaux' },
        { quote: "Je ne comprenais pas pourquoi je m'épuisais pour les autres. Le protocole m'a montré mon schéma. En 2 mois, j'ai posé des limites que je n'avais jamais osé poser.", name: 'Sophie, 28 ans', city: 'Bruxelles' },
        { quote: "Le protocole sur le deuil m'a donné les clés pour comprendre ce que je traversais. Aujourd'hui j'accompagne d'autres personnes dans la communauté.", name: 'Antoine, 37 ans', city: 'Genève' },
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
    position: 8,
    is_visible: false,
    content: {
      label: "L'Histoire",
      title: "Né d'un livre.\nDevenu un mouvement.",
      paragraph1: "Tout a commencé avec un livre. Julia Laureau a créé \"SOS Shine — Briller Comme un Diamant\" — un programme concret de déconditionnement émotionnel qui combine vidéos explicatives, exercices pratiques et séances audio guidées.",
      paragraph2: "Ce programme a aidé des dizaines de personnes à comprendre leurs schémas et à reprendre le contrôle de leurs réactions. Face à cette demande, la plateforme SOS Shine est née — un espace complet d'accompagnement au déconditionnement, ouvert 24/7.",
      quote: "Comprendre comment vous fonctionnez, c'est reprendre le pouvoir sur ce que vous ressentez.",
      book_url: "https://www.amazon.fr/SOS-Shine-Briller-Comme-Diamant/dp/2959566807",
      book_image: "/images/book-cover.jpeg",
      button_label: "Découvrir le livre",
      // Trinité / Fondateurs (page Notre Histoire)
      trinite_title: "Trois forces. Une seule mission.",
      trinite_intro: "Tout a commencé par un livre. Julia, portée par une conviction profonde, a écrit pour ceux qui se sentaient prisonniers de leurs schémas. Puis William et Thomas l'ont rejointe. Trois approches complémentaires pour accompagner le déconditionnement dans toutes ses dimensions.",
      julia_pilier: "La Compréhension Émotionnelle",
      julia_desc: "Auteure du livre fondateur de SOS Shine, Julia décrypte les schémas émotionnels profonds. Sa vision : aider chaque personne à comprendre ses réactions automatiques et à retrouver sa vraie nature, celle qui existe sous les conditionnements.",
      william_pilier: "L'Approche Corporelle",
      william_desc: "Spécialiste en hypnose et formé en médecine chinoise, William travaille sur le lien entre le corps et les émotions. Son approche aide à débloquer ce que la compréhension intellectuelle seule ne suffit pas à changer.",
      thomas_pilier: "L'Action Concrète",
      thomas_desc: "Thomas intervient sur le côté pratique du déconditionnement. À travers des cahiers d'exercices et des protocoles d'action, il transforme la prise de conscience en changements de comportement concrets et durables.",
      trinite_tagline: "Comprendre · Ressentir · Agir",
      trinite_conclusion: "Trois dimensions complémentaires. Un seul objectif : vous donner les clés pour comprendre vos schémas et reprendre le contrôle de vos émotions. Le déconditionnement commence ici.",
      manifeste: "Nous ne sommes pas des médecins. Nous sommes des humains qui parlent à des humains. Notre rôle : vous montrer comment vous fonctionnez — et vous donner les outils pour fonctionner autrement.",
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'lg',
      title_align: 'center',
    },
  },
  {
    section_key: 'fondateurs',
    label: 'Les Fondateurs (Cartes d\'Autorité)',
    position: 9,
    is_visible: true,
    content: {
      label: 'Les Fondateurs',
      title: "Trois passionnés.\nUne seule conviction.",
      description: "Nous ne sommes pas des médecins. Nous sommes trois personnes qui ont étudié le fonctionnement humain — émotions, corps, comportements — et qui ont créé les outils que nous aurions aimé avoir nous-mêmes.",
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
    position: 10,
    is_visible: true,
    content: {
      label: 'Résultats concrets',
      title: "Ils ont compris leur schéma.\nVoici ce qui a changé.",
      description: "Le déconditionnement, ce n'est pas de la magie. C'est de la compréhension appliquée. Voici des exemples concrets de changements observés par nos membres.",
      items: [
        { before: "Je ruminais sans cesse. Chaque relation me ramenait au même sentiment d'abandon. Je ne comprenais pas pourquoi.", after: "J'ai identifié mon schéma de dépendance affective. Aujourd'hui je reconnais le réflexe quand il arrive — et je choisis ma réaction.", timeframe: "6 semaines", challenge: "Dépendance affective" },
        { before: "Une colère permanente que je n'arrivais pas à expliquer. Chaque conflit dégénérait et je perdais le contrôle.", after: "J'ai compris d'où venait cette colère. J'ai appris à la réguler au lieu de la subir. Mes relations ont changé.", timeframe: "8 semaines", challenge: "Trahison" },
        { before: "Épuisé. Je donnais tout aux autres sans jamais m'occuper de moi. Je ne savais pas dire non.", after: "J'ai compris mon schéma de sur-adaptation. J'ai posé des limites claires. J'ai retrouvé mon énergie.", timeframe: "2 mois", challenge: "Épuisement émotionnel" },
      ],
    },
    styles: {
      title_font: 'Cormorant Garamond',
      title_size: 'lg',
      title_align: 'center',
    },
  },
  {
    section_key: 'manifeste',
    label: 'Manifeste',
    position: 11,
    is_visible: true,
    content: {
      label: 'Ce en quoi on croit',
      title: "On ne vous dit pas\nce que vous voulez entendre.",
      paragraphs: [
        "Nous ne sommes pas des médecins. Nous ne posons aucun diagnostic. Nous ne prétendons pas remplacer un suivi professionnel quand il est nécessaire.",
        "Ce qu'on fait : on vous explique vos schémas émotionnels. On vous montre comment votre biologie, vos croyances et vos automatismes fabriquent vos réactions au quotidien. Et on vous donne les outils concrets pour changer ça.",
        "SOS Shine n'est pas une plateforme de développement personnel. C'est un espace de déconditionnement. On ne vous répète pas que « tout est possible » — on vous montre pourquoi vous faites ce que vous faites, et comment faire autrement.",
        "Des humains qui parlent à des humains. Sans filtre. Sans faux espoir. Avec des protocoles qui marchent parce qu'ils s'appuient sur la compréhension de votre fonctionnement réel.",
      ],
      signature: "Julia, William & Thomas",
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
    position: 12,
    is_visible: true,
    content: {
      label: 'Tarification',
      title: "Choisissez votre\naccompagnement.",
      subtitle: "Sans engagement — Annulable à tout instant.",
      footer: "Parce que si on doit vous retenir par un contrat, c'est qu'on n'a pas fait notre travail.",
      trust_badges: ['Paiement sécurisé Stripe', 'Données chiffrées', 'Annulation en 1 clic'],
      plans: [
        {
          name: 'Essentielle',
          tagline: 'Les fondations',
          price: '9,90',
          period: '/mois',
          button_label: "Commencer maintenant",
          button_href: '/signup',
          highlight: false,
          badge: '',
          features: [
            "Encyclopédie complète (accès illimité)",
            'Chat & Communauté',
          ],
        },
        {
          name: 'Sérénité',
          tagline: "Le point d'équilibre",
          price: '49,90',
          period: '/mois',
          button_label: 'Démarrer mon essai de 7 jours (Gratuit)',
          button_href: '/signup',
          highlight: true,
          badge: 'Choix Stratégique',
          features: [
            "Tout le contenu de l'Essentielle",
            'Shine Librairie (guides, cahiers)',
            'Shine TV & Shorts',
            'Shine Audible (podcasts, méditations)',
            'Session collective mensuelle',
            'Live thématique hebdomadaire',
            'Événements physiques',
            "7 jours d'essai gratuit — 0€",
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
    position: 13,
    is_visible: true,
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
    section_key: 'cta_dark',
    label: 'CTA (fond sombre)',
    position: 14,
    is_visible: true,
    content: {
      title: "Rejoignez-nous.\nNe soyez plus jamais\nseul(e) face à vos émotions.",
      image_url: '',
      button_label: 'Commencer — 7 jours gratuits',
      button_href: '/signup',
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
    position: 12,
    is_visible: false,
    content: {
      description: "Quel que soit votre schéma émotionnel, on a créé un protocole pour vous aider à le comprendre et à le changer.",
      button_label: 'Commencer gratuitement',
      button_href: '/signup',
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
    position: 13,
    is_visible: true,
    content: {
      name: 'SOS Shine',
      copyright_year: '2026',
      links: [
        { label: 'Notre Histoire', href: '/notre-histoire' },
        { label: 'Blog', href: '/blog' },
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
    position: 14,
    is_visible: true,
    content: {
      items: ['Abandon', 'Anxiété', 'Burn-out', 'Confiance en soi', 'Dépendance', 'Deuil', 'Trauma', 'Résilience', 'Pardon'],
      speed: 35,
    },
    styles: {},
  },
  {
    section_key: 'ticker_2',
    label: 'Bandeau défilant 2',
    position: 15,
    is_visible: false,
    content: {
      items: ['Accessible 24/7', 'Communauté bienveillante', '200+ protocoles', 'Sessions collectives', 'Chat dédié', 'Événements live', 'Séances guidées', 'Cahiers d\'exercices'],
      speed: 40,
    },
    styles: {},
  },
  {
    section_key: 'faq',
    label: 'FAQ',
    position: 16,
    is_visible: true,
    content: {
      label: 'FAQ',
      title: 'Vos questions, nos réponses',
      subtitle: "Une question qui n'est pas ici ? Écrivez-nous, on répond toujours.",
      cta_text: 'Encore des doutes ?',
      cta_button_label: 'Contactez-nous',
      cta_button_href: '/contact',
      items: [
        {
          q: "Est-ce que SOS Shine remplace un médecin ou un professionnel de santé ?",
          a: "Non, absolument pas. SOS Shine est une plateforme d'accompagnement au déconditionnement émotionnel. Nous ne sommes pas des médecins, nous ne posons aucun diagnostic et nous ne remplaçons en aucun cas un suivi médical ou psychologique. Si vous traversez une situation qui nécessite un accompagnement professionnel, nous vous encourageons à consulter.",
        },
        {
          q: "Comment fonctionne l'essai gratuit ?",
          a: "Vous accédez à tout le contenu de votre formule pendant 7 jours. Si ça ne vous convient pas, annulez en un clic — zéro prélèvement, zéro question.",
        },
        {
          q: "C'est quoi un protocole en 3 étapes ?",
          a: "Pour chaque schéma émotionnel, nos fondateurs ont créé : une vidéo pour comprendre le mécanisme, une séance audio guidée pour modifier votre état émotionnel, et des exercices concrets pour installer de nouveaux réflexes. Vous avancez à votre rythme.",
        },
        {
          q: "C'est quoi la différence avec du développement personnel ?",
          a: "Le développement personnel vous dit souvent ce que vous voulez entendre. Nous, on vous montre comment vous fonctionnez vraiment — vos schémas, vos automatismes, votre biologie émotionnelle — et on vous donne les clés pour changer ça concrètement. C'est du déconditionnement, pas de la motivation.",
        },
        {
          q: "Mes données sont-elles protégées ?",
          a: "Vos données ne sont jamais vendues ni partagées. Vous pouvez utiliser un pseudo dans la communauté. Tout est chiffré et confidentiel.",
        },
        {
          q: "Qui crée les contenus ?",
          a: "Julia (spécialiste du déconditionnement émotionnel), William (approche corporelle et hypnose) et Thomas (protocoles d'action). Chaque protocole combine leurs trois approches complémentaires.",
        },
        {
          q: "Je peux annuler quand je veux ?",
          a: "Oui. Aucun engagement, aucune condition cachée. Annulation en un clic depuis votre espace membre. Si on doit vous retenir par un contrat, c'est qu'on n'a pas fait notre travail.",
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
    section_key: 'legal_mentions',
    label: 'Page — Mentions légales',
    position: 17,
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
    position: 18,
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
    position: 19,
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
    position: 20,
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
