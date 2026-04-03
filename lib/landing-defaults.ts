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
      surtitle: "L'Encyclopédie Pratique des Schémas Émotionnels",
      title: "Ne subissez plus\nvotre chaos intérieur.\nReprogrammez-le.",
      subtitle: "Un écosystème de déconditionnement émotionnel accessible 24/7. Synergie de 3 experts, 50+ protocoles exclusifs et une communauté d'élite pour transformer vos blocages (anxiété, deuil, dépendance) en clarté absolue.",
      video_url: '',
      image_url: '',
      cta_primary_label: 'Découvrir ma Signature Émotionnelle',
      cta_primary_href: '/signature-emotionnelle',
      cta_primary_subtext: 'Test gratuit en 15 questions — Diagnostic immédiat.',
      cta_secondary_label: 'Découvrir les protocoles',
      cta_secondary_href: '/encyclopedie',
      trust_items: [
        'Approche holistique validée',
        '50+ Protocoles',
        'Sans engagement',
      ],
      buttons: [
        { label: "Découvrir ma Signature Émotionnelle", href: '/signature-emotionnelle', variant: 'primary' },
        { label: "Découvrir les protocoles", href: '/encyclopedie', variant: 'outline' },
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
        { value: '200+', label: 'PROTOCOLES DE TRANSFORMATION' },
        { value: '5', label: 'UNIVERS DE CONTENU' },
        { value: '24/7', label: 'COMMUNAUTÉ & SOUTIEN' },
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
      description: 'Un test exclusif en 15 questions — créé par nos thérapeutes — pour révéler votre architecture émotionnelle profonde. Gratuit. Confidentiel. Immédiat.',
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
      title: "Le vrai problème n'est pas\nce que vous ressentez.\nC'est que vous l'affrontez\nseul(e) à 3h du matin.",
      description: "Anxiété vertigineuse, schémas amoureux destructeurs, deuil insurmontable ou burn-out silencieux. La thérapie classique vous aide à comprendre le « pourquoi ». Mais quand la tempête frappe en pleine nuit, les mots ne suffisent plus. Votre système nerveux est en alerte maximale et vos anciens schémas reprennent le contrôle.",
      closing: "Vous n'êtes pas brisé(e). Vous manquez simplement des outils tactiques pour désamorcer la crise en temps réel.",
      cta_text: "Explorer l'Index des Solutions",
      cta_href: '/encyclopedie',
      symptoms: [
        { icon: 'anxiety', label: 'Anxiété & Crises' },
        { icon: 'heart', label: 'Schémas amoureux' },
        { icon: 'grief', label: 'Deuil & Perte' },
        { icon: 'burnout', label: 'Burn-out silencieux' },
        { icon: 'dependency', label: 'Dépendance affective' },
        { icon: 'trauma', label: 'Trauma & PTSD' },
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
      label: 'Le principe SOS Shine',
      title: "On ne change pas qui vous êtes.\nOn libère qui vous étiez\navant les blessures.",
      description: "Abandon, trahison, burn-out, deuil, rupture\u2026 Chaque blessure a une origine, un mécanisme et une clé de libération. Nos thérapeutes ont créé un protocole précis en 3 étapes pour chacune. Comprendre. Libérer. Agir.",
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
      label: 'La Méthode SOS Shine®',
      title: "L'ingénierie de votre libération\nen 3 phases.",
      items: [
        { num: '01', title: 'Comprendre', subtitle: 'Le Diagnostic', description: "Nous décodons votre architecture émotionnelle. Mettez des mots précis sur un chaos invisible. Une vidéo créée par nos thérapeutes pour identifier l'origine du blocage.", color: '#55EFC4' },
        { num: '02', title: 'Libérer & Intégrer', subtitle: "L'Urgence", description: "Un accès instantané à des outils de décharge nerveuse. Court-circuitez l'angoisse, le rejet ou la peur en temps réel, où que vous soyez. Séance guidée d'hypnose, méditation ou soin énergétique.", color: '#74C0FC' },
        { num: '03', title: 'Agir', subtitle: 'Le Hack du Subconscient', description: "Ne vous contentez pas d'aller mieux temporairement. Grâce à l'hypnose clinique et nos protocoles somatiques, transformez la prise de conscience en réflexe neurologique automatique.", color: '#E17055' },
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
      label: "L\u2019encyclop\u00e9die",
      title: "Trouvez ce que vous traversez.\nOn s\u2019occupe du reste.",
      description: "Chaque blessure \u00e9motionnelle a son protocole d\u00e9di\u00e9, cr\u00e9\u00e9 par nos th\u00e9rapeutes. Vid\u00e9o, s\u00e9ance guid\u00e9e, exercices concrets \u2014 tout est l\u00e0.",
      image_url: '',
      items: ['Abandon', 'Anxi\u00e9t\u00e9', 'Burn-out', 'Confiance en soi', 'D\u00e9pendance affective', 'D\u00e9pression', 'Deuil', 'Intuition', 'Mission de vie', 'Pardon', 'R\u00e9silience', 'Relations toxiques', 'Stress', 'Trauma', 'Violence'],
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
      label: "Votre sanctuaire privé",
      title: "Votre sanctuaire privé.\nDans votre poche, 24/7.",
      features: [
        { icon: 'encyclopedia', title: "L'Encyclopédie Interactive", description: "Une issue en un clic pour chaque expérience de vie (Dépendance affective, Trahison, Peur). Protocoles créés par nos 3 experts." },
        { icon: 'community', title: 'Le Feu de Camp', description: "Un espace d'entraide anonyme et bienveillant. Échangez avec ceux qui partagent votre fréquence. Quelqu'un répond toujours." },
        { icon: 'events', title: 'Les Shine Walks & Soins Collectifs', description: "Le digital prépare le terrain, le physique scelle la transformation. Événements live et rencontres en présentiel." },
        { icon: 'media', title: '5 Univers de Contenu', description: "Shine TV, Shine Audible, Shine Shorts, Shine Librairie, Shine Journal. Chaque format adapté à votre moment." },
      ],
      cta_label: "Voir l'intérieur de la plateforme",
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
      title: "3h du matin.\nVous n\u2019\u00eates plus seul(e).",
      description: "Une communaut\u00e9 de personnes qui comprennent ce que vous vivez \u2014 parce qu\u2019elles le vivent aussi. Pas de jugement. Pas de platitudes. Du vrai.",
      image_url: '',
      blocks: [
        { title: 'Le Feu de Camp', description: "Un chat d\u00e9di\u00e9 \u00e0 chaque blessure \u00e9motionnelle. Vous \u00e9changez avec des personnes qui traversent la m\u00eame \u00e9preuve. Quelqu\u2019un r\u00e9pond toujours, m\u00eame \u00e0 3h du matin." },
        { title: 'Le Mur Communautaire', description: "Partagez vos avanc\u00e9es, vos prises de conscience, vos victoires. Chaque t\u00e9moignage inspire quelqu\u2019un d\u2019autre \u00e0 avancer." },
        { title: 'Les Rencontres', description: "Soins collectifs en live, ateliers en pr\u00e9sentiel, Shine Walks. Le digital pr\u00e9pare, le r\u00e9el transforme." },
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
      label: "Preuve sociale",
      title: "Ils ont traversé la tempête.\nIls ont repris le contrôle.",
      verified_badge: "Avis vérifiés de membres actifs",
      items: [
        { quote: "15 ans de dépendance affective. J'ai compris le schéma dès la première vidéo. Le protocole m'a libérée en 3 semaines.", name: 'Marie, 34 ans', city: 'Lyon' },
        { quote: "3h du matin, seul, au fond du trou. J'ai ouvert le Feu de Camp. Quelqu'un m'a dit « tiens bon, je suis passé par là ». Cette nuit-là a tout changé.", name: 'Karim, 41 ans', city: 'Bordeaux' },
        { quote: "Burn-out total. En 2 mois, j'ai retrouvé mon énergie et quitté le job qui me détruisait. SOS Shine m'a redonné l'élan que j'avais perdu.", name: 'Sophie, 28 ans', city: 'Bruxelles' },
        { quote: "Le protocole sur le deuil m'a permis de faire la paix avec la perte de mon père. Aujourd'hui j'aide d'autres personnes à traverser ça.", name: 'Antoine, 37 ans', city: 'Genève' },
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
      title: "N\u00e9 d\u2019un livre.\nDevenu un mouvement.",
      paragraph1: "Tout a commencé avec un livre. Julia Laureau, thérapeute holistique, a créé \"SOS Shine — Briller Comme un Diamant\" — bien plus qu'un ouvrage de développement personnel, une véritable bible de transformation qui combine coaching vidéo, méditations guidées et séances énergétiques.",
      paragraph2: "Ce programme interactif a déjà aidé des dizaines de personnes à se libérer de leurs blocages et à accéder à leur véritable potentiel. Face à cet élan, la plateforme SOS Shine est née — la continuité naturelle du livre, transformée en une communauté vivante d'accompagnement et de reconstruction.",
      quote: "Vous avez en vous le pouvoir de tout changer, de tout transmuter, et d'évoluer vers une nouvelle version de vous-même.",
      book_url: "https://www.amazon.fr/SOS-Shine-Briller-Comme-Diamant/dp/2959566807",
      book_image: "/images/book-cover.jpeg",
      button_label: "Découvrir le livre",
      // Trinité / Fondateurs (page Notre Histoire)
      trinite_title: "Trois forces. Une seule mission.",
      trinite_intro: "Tout a commencé par un livre. Julia, portée par une conviction profonde, a écrit pour libérer ceux qui se sentaient prisonniers d'eux-mêmes. Puis William et Thomas l'ont rejointe. Trois visions. Trois piliers. Une trinité indissociable pour déconditionner l'être humain dans sa totalité.",
      julia_pilier: "Le Pilier Énergétique",
      julia_desc: "Auteure du livre fondateur de SOS Shine, Julia canalise l'énergie invisible qui nous traverse. Sa vision : reconnecter chaque individu à sa vibration authentique, celle qu'il a oubliée sous des couches de conditionnements.",
      william_pilier: "Le Pilier Corporel",
      william_desc: "Spécialiste en hypnose et diplômé en médecine chinoise internationale, William apporte les solutions physiques concrètes pour déconstruire les croyances et les blocages ancrés dans le corps. Sa maîtrise du lien corps-esprit permet de libérer ce que les mots seuls ne peuvent atteindre.",
      thomas_pilier: "Le Pilier Pratique",
      thomas_desc: "Thomas intervient sur le côté pratique et concret du déconditionnement. À travers des cahiers d'exercices et des protocoles d'action, il transforme la prise de conscience en résultats tangibles. Son approche : vous donner les outils pour devenir l'architecte de votre propre transformation.",
      trinite_tagline: "Âme · Corps · Esprit",
      trinite_conclusion: "Trois triangles à côtés égaux. Trois dimensions de l'être. Un seul objectif : vous aider à devenir la personne que vous auriez toujours dû être. Le déconditionnement total commence ici.",
      manifeste: "Nous ne guérissons pas. Nous révélons. Ce que vous cherchez est déjà en vous — enfoui sous des années de conditionnements. Notre mission est de vous aider à le retrouver.",
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
      title: "Trois forces.\nUne seule mission.",
      description: "Julia, thérapeute holistique. William, spécialiste en hypnose et médecine chinoise. Thomas, architecte de la transformation. Ensemble, ils couvrent les trois dimensions de l'être : âme, corps et esprit.",
      members: [
        { name: 'Julia', role: 'Fondatrice', expertise: 'Thérapie holistique & Énergie', image: '/images/julia.jpeg' },
        { name: 'Wiliam', role: 'Co-fondateur', expertise: 'Hypnose & Médecine chinoise', image: '/images/wiliam.png' },
        { name: 'Thomas', role: 'Co-fondateur', expertise: 'Protocoles pratiques & Action', image: '/images/thomas.jpeg' },
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
    label: 'Transformations Réelles',
    position: 10,
    is_visible: true,
    content: {
      label: 'Transformations réelles',
      title: "Des vies transformées.\nDes résultats concrets.",
      description: "Chaque parcours est unique, mais le résultat est le même : une vie plus libre, plus alignée, plus lumineuse.",
      items: [
        { before: "Je n'arrivais plus à dormir. Je ruminais sans cesse, paralysée par l'angoisse de l'abandon.", after: "Je dors paisiblement. J'ai compris que ma valeur ne dépend pas du regard de l'autre.", timeframe: "6 semaines", challenge: "Dépendance affective" },
        { before: "Je portais une colère sourde depuis l'enfance. Chaque relation finissait par exploser.", after: "J'ai fait la paix avec mon histoire. Aujourd'hui, je construis des liens sains et durables.", timeframe: "8 semaines", challenge: "Trahison" },
        { before: "Burn-out total. Je me sentais vide, déconnecté de tout ce qui comptait pour moi.", after: "J'ai retrouvé mon énergie et ma direction. J'ai quitté ce qui me détruisait et j'avance enfin.", timeframe: "2 mois", challenge: "Perte de sens" },
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
      label: 'Notre Manifeste',
      title: "Nous ne guérissons pas.\nNous révélons.",
      paragraphs: [
        "Ce que vous cherchez est déjà en vous — enfoui sous des années de conditionnements, de croyances héritées, de blessures non dites.",
        "Notre mission n'est pas de vous réparer. Vous n'êtes pas cassé(e). Notre mission est de vous aider à retrouver ce que la vie vous a fait oublier : votre puissance, votre lumière, votre vérité.",
        "SOS Shine existe parce que personne ne devrait traverser ses épreuves seul(e). Parce que la souffrance mérite d'être entendue, comprise, et transformée — pas ignorée.",
        "Nous croyons que chaque être humain porte en lui le pouvoir de se reconstruire. Et nous avons créé l'espace pour que cela devienne possible.",
      ],
      signature: "L'équipe SOS Shine",
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
      label: 'Investissement',
      title: "Sécurisez votre écosystème\nde croissance.",
      subtitle: "7 jours gratuits. Sans engagement. Annulation en un clic.",
      footer: "Parce que si on doit vous retenir par un contrat, c'est qu'on n'a pas fait notre travail. Annulation garantie en 1 clic.",
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
            'Shine Librairie',
            'Shine TV & Shorts',
            'Shine Audible',
            'Soin collectif mensuel',
            "7 jours d'essai gratuit — 0€",
          ],
        },
        {
          name: 'Premium',
          tagline: "L'immersion totale",
          price: '99,90',
          period: '/mois',
          button_label: 'Démarrer mon essai de 7 jours (Gratuit)',
          button_href: '/signup',
          highlight: false,
          badge: 'Expérience complète',
          features: [
            "Tout le contenu de la Sérénité",
            'Live thématique hebdomadaire',
            'Canal privé Telegram avec les fondateurs',
            'Événements physiques',
            'Ateliers Premium (48 semaines)',
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
      title: "Satisfait ou remboursé.\nSans condition.",
      description: "Testez SOS Shine pendant 7 jours gratuitement. Si notre approche ne vous convient pas, vous ne payez rien. Pas de justification, pas de procédure compliquée. On croit en ce qu'on fait — et on vous le prouve.",
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
      title: "Le premier pas\nest toujours le plus dur.\nOn le fait ensemble.",
      image_url: '',
      button_label: 'Rejoindre SOS Shine',
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
      description: "Blessure ancienne ou crise en cours \u2014 on a cr\u00e9\u00e9 un protocole pour ce que vous vivez. Il vous attend.",
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
      items: ['Soutien 24/7', 'Communauté bienveillante', 'Protocoles exclusifs', 'Soins collectifs', 'Chat dédié', 'Événements live', 'Méditation guidée', 'Coaching immersif'],
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
          q: "Est-ce que SOS Shine remplace un thérapeute ?",
          a: "Non. SOS Shine est un complément, pas un substitut. Nos protocoles sont créés par nos trois fondateurs, chacun expert dans son domaine, mais nous recommandons de consulter un professionnel de santé si nécessaire.",
        },
        {
          q: "Comment fonctionne l'essai gratuit ?",
          a: "Vous accédez à tout le contenu de votre formule pendant 7 jours. Si ça ne vous convient pas, annulez en un clic — zéro prélèvement, zéro question.",
        },
        {
          q: "C'est quoi exactement un protocole en 3 étapes ?",
          a: "Pour chaque blessure émotionnelle, nos fondateurs ont créé : une vidéo pour comprendre l'origine du blocage, une séance guidée pour libérer l'émotion, et des exercices concrets pour ancrer la transformation. Vous avancez à votre rythme.",
        },
        {
          q: "Mes données sont-elles protégées ?",
          a: "Vos données ne sont jamais vendues ni partagées. Vous pouvez utiliser un pseudo dans la communauté. Tout est chiffré et confidentiel.",
        },
        {
          q: "Qui crée les contenus ?",
          a: "Julia (thérapeute holistique), William (hypnose et médecine chinoise) et Thomas (protocoles pratiques). Chaque protocole combine leurs trois expertises : âme, corps et esprit.",
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
