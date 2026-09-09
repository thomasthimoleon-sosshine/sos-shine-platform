export type ZodiacSign =
  | 'belier' | 'taureau' | 'gemeaux' | 'cancer'
  | 'lion' | 'vierge' | 'balance' | 'scorpion'
  | 'sagittaire' | 'capricorne' | 'verseau' | 'poisson'

export const ZODIAC_INFO: Record<ZodiacSign, { label: string; symbol: string; element: string; dates: string }> = {
  belier:      { label: 'Bélier',      symbol: '♈', element: 'Feu',  dates: '21 mars - 19 avril' },
  taureau:     { label: 'Taureau',     symbol: '♉', element: 'Terre', dates: '20 avril - 20 mai' },
  gemeaux:     { label: 'Gémeaux',     symbol: '♊', element: 'Air',   dates: '21 mai - 20 juin' },
  cancer:      { label: 'Cancer',      symbol: '♋', element: 'Eau',   dates: '21 juin - 22 juillet' },
  lion:        { label: 'Lion',        symbol: '♌', element: 'Feu',   dates: '23 juillet - 22 août' },
  vierge:      { label: 'Vierge',      symbol: '♍', element: 'Terre', dates: '23 août - 22 septembre' },
  balance:     { label: 'Balance',     symbol: '♎', element: 'Air',   dates: '23 septembre - 22 octobre' },
  scorpion:    { label: 'Scorpion',    symbol: '♏', element: 'Eau',   dates: '23 octobre - 21 novembre' },
  sagittaire:  { label: 'Sagittaire',  symbol: '♐', element: 'Feu',   dates: '22 novembre - 21 décembre' },
  capricorne:  { label: 'Capricorne',  symbol: '♑', element: 'Terre', dates: '22 décembre - 19 janvier' },
  verseau:     { label: 'Verseau',     symbol: '♒', element: 'Air',   dates: '20 janvier - 18 février' },
  poisson:     { label: 'Poisson',     symbol: '♓', element: 'Eau',   dates: '19 février - 20 mars' },
}

// Map founder first names to their zodiac signs
export const FOUNDER_ZODIAC: Record<string, ZodiacSign> = {
  'Julia': 'belier',
  'William': 'cancer',
  'Thomas': 'poisson',
}

type EnergyForecast = {
  energy: string      // ex: "Haute", "Modérée", "Intense"
  color: string       // color for the energy level
  mood: string        // ex: "Créativité débordante"
  advice: string      // conseil du jour
  luckyHour: string   // heure favorable
  element: string     // élément dominant
}

// 7 forecasts per sign, rotating by day of week
const FORECASTS: Record<ZodiacSign, EnergyForecast[]> = {
  belier: [
    { energy: 'Explosive', color: '#FF6B6B', mood: 'Guerrier intérieur éveillé', advice: 'Canalise ton feu dans un projet qui te passionne.', luckyHour: '9h-11h', element: '🔥' },
    { energy: 'Haute', color: '#55EFC4', mood: 'Pulsion créatrice', advice: 'Ton audace est ta force aujourd\'hui. Ose le premier pas.', luckyHour: '14h-16h', element: '🔥' },
    { energy: 'Modérée', color: '#74C0FC', mood: 'Introspection active', advice: 'Ralentis pour mieux rebondir. La patience est ton alliée.', luckyHour: '10h-12h', element: '💨' },
    { energy: 'Intense', color: '#E17055', mood: 'Détermination absolue', advice: 'Rien ne peut t\'arrêter, mais choisis bien tes batailles.', luckyHour: '8h-10h', element: '🔥' },
    { energy: 'Douce', color: '#A29BFE', mood: 'Repos du guerrier', advice: 'Accorde-toi la douceur que tu donnes aux autres.', luckyHour: '18h-20h', element: '💧' },
    { energy: 'Haute', color: '#FFEAA7', mood: 'Magnétisme solaire', advice: 'Ta lumière inspire. Partage-la sans compter.', luckyHour: '11h-13h', element: '🔥' },
    { energy: 'Transformatrice', color: '#FD79A8', mood: 'Renaissance intérieure', advice: 'Lâche ce qui ne te sert plus. Place au renouveau.', luckyHour: '7h-9h', element: '🌍' },
  ],
  taureau: [
    { energy: 'Stable', color: '#55EFC4', mood: 'Ancrage profond', advice: 'Ta stabilité est un refuge. Offre-la à ceux qui en ont besoin.', luckyHour: '10h-12h', element: '🌍' },
    { energy: 'Sensuelle', color: '#FD79A8', mood: 'Connexion terrestre', advice: 'Reconnecte-toi à la nature pour recharger ton énergie.', luckyHour: '15h-17h', element: '🌍' },
    { energy: 'Haute', color: '#FFEAA7', mood: 'Abondance intérieure', advice: 'Tu mérites le meilleur. N\'accepte aucun compromis.', luckyHour: '9h-11h', element: '🌍' },
    { energy: 'Modérée', color: '#74C0FC', mood: 'Contemplation', advice: 'La beauté est partout autour de toi. Prends le temps de la voir.', luckyHour: '16h-18h', element: '💨' },
    { energy: 'Douce', color: '#A29BFE', mood: 'Cocooning sacré', advice: 'Crée un espace de douceur pour toi. Tu le mérites.', luckyHour: '20h-22h', element: '💧' },
    { energy: 'Intense', color: '#E17055', mood: 'Détermination terrienne', advice: 'Tes racines sont profondes. Rien ne peut te déstabiliser.', luckyHour: '8h-10h', element: '🌍' },
    { energy: 'Lumineuse', color: '#55EFC4', mood: 'Gratitude', advice: 'Célèbre chaque petite victoire. Elles construisent les grandes.', luckyHour: '12h-14h', element: '🌍' },
  ],
  gemeaux: [
    { energy: 'Électrique', color: '#74C0FC', mood: 'Esprit vif', advice: 'Tes idées fusent. Note-les avant qu\'elles ne s\'envolent.', luckyHour: '9h-11h', element: '💨' },
    { energy: 'Haute', color: '#FFEAA7', mood: 'Communication fluide', advice: 'Tes mots ont un pouvoir de guérison aujourd\'hui.', luckyHour: '14h-16h', element: '💨' },
    { energy: 'Modérée', color: '#A29BFE', mood: 'Dualité harmonieuse', advice: 'Accepte tes deux facettes. Elles font ta richesse.', luckyHour: '11h-13h', element: '💨' },
    { energy: 'Intense', color: '#E17055', mood: 'Curiosité débordante', advice: 'Explore sans limites, mais termine ce que tu commences.', luckyHour: '10h-12h', element: '🔥' },
    { energy: 'Douce', color: '#55EFC4', mood: 'Écoute profonde', advice: 'Écoute plus que tu ne parles. Les réponses viendront.', luckyHour: '18h-20h', element: '💧' },
    { energy: 'Lumineuse', color: '#FD79A8', mood: 'Connexion sociale', advice: 'Un échange sincère peut tout changer. Ouvre ton cœur.', luckyHour: '15h-17h', element: '💨' },
    { energy: 'Transformatrice', color: '#FF6B6B', mood: 'Renouveau mental', advice: 'Libère ton esprit des pensées obsolètes.', luckyHour: '7h-9h', element: '🔥' },
  ],
  cancer: [
    { energy: 'Intuitive', color: '#A29BFE', mood: 'Sensibilité accrue', advice: 'Fais confiance à ton intuition. Elle ne ment jamais.', luckyHour: '21h-23h', element: '💧' },
    { energy: 'Haute', color: '#74C0FC', mood: 'Vague d\'amour', advice: 'Ton cœur est un océan. Laisse-le déborder de bienveillance.', luckyHour: '10h-12h', element: '💧' },
    { energy: 'Protectrice', color: '#55EFC4', mood: 'Bouclier émotionnel', advice: 'Protège ton énergie. Tous ne méritent pas ton ouverture.', luckyHour: '14h-16h', element: '💧' },
    { energy: 'Douce', color: '#FFEAA7', mood: 'Nostalgie lumineuse', advice: 'Le passé éclaire, mais le présent est ton trésor.', luckyHour: '18h-20h', element: '🌙' },
    { energy: 'Intense', color: '#E17055', mood: 'Marée émotionnelle', advice: 'Surfe sur tes émotions au lieu de les combattre.', luckyHour: '9h-11h', element: '💧' },
    { energy: 'Lumineuse', color: '#FD79A8', mood: 'Nid douillet', advice: 'Crée un cocon de douceur autour de toi et tes proches.', luckyHour: '16h-18h', element: '💧' },
    { energy: 'Transformatrice', color: '#FF6B6B', mood: 'Lune nouvelle intérieure', advice: 'Chaque fin est un nouveau départ. Embrasse le changement.', luckyHour: '22h-0h', element: '🌙' },
  ],
  lion: [
    { energy: 'Royale', color: '#FFEAA7', mood: 'Éclat solaire', advice: 'Brille de ta lumière sans te soucier de l\'ombre.', luckyHour: '12h-14h', element: '🔥' },
    { energy: 'Haute', color: '#E17055', mood: 'Leadership naturel', advice: 'Guide par l\'exemple. Ton charisme ouvre les portes.', luckyHour: '9h-11h', element: '🔥' },
    { energy: 'Modérée', color: '#74C0FC', mood: 'Humilité noble', advice: 'La vraie force est dans la vulnérabilité assumée.', luckyHour: '15h-17h', element: '💨' },
    { energy: 'Intense', color: '#FF6B6B', mood: 'Passion dévorante', advice: 'Canalise ta flamme vers ce qui compte vraiment.', luckyHour: '10h-12h', element: '🔥' },
    { energy: 'Douce', color: '#A29BFE', mood: 'Cœur de lion apaisé', advice: 'Rugir n\'est pas toujours nécessaire. Le silence aussi est puissant.', luckyHour: '20h-22h', element: '💧' },
    { energy: 'Lumineuse', color: '#55EFC4', mood: 'Générosité rayonnante', advice: 'Donne sans attendre de retour. L\'univers te le rendra.', luckyHour: '11h-13h', element: '🔥' },
    { energy: 'Transformatrice', color: '#FD79A8', mood: 'Métamorphose dorée', advice: 'Laisse mourir l\'ego pour que le cœur puisse régner.', luckyHour: '7h-9h', element: '🌍' },
  ],
  vierge: [
    { energy: 'Analytique', color: '#55EFC4', mood: 'Clarté mentale', advice: 'Ton esprit est un scalpel. Utilise-le avec précision et compassion.', luckyHour: '8h-10h', element: '🌍' },
    { energy: 'Haute', color: '#74C0FC', mood: 'Perfection sereine', advice: 'L\'imperfection est la plus belle forme de perfection.', luckyHour: '10h-12h', element: '🌍' },
    { energy: 'Modérée', color: '#FFEAA7', mood: 'Service sacré', advice: 'Aider les autres te nourrit, mais n\'oublie pas de te nourrir toi.', luckyHour: '14h-16h', element: '🌍' },
    { energy: 'Intense', color: '#E17055', mood: 'Purification', advice: 'Fais le tri dans tes pensées. Garde l\'essentiel.', luckyHour: '7h-9h', element: '🌍' },
    { energy: 'Douce', color: '#A29BFE', mood: 'Repos mérité', advice: 'Tu en fais assez. Permets-toi de ne rien faire.', luckyHour: '19h-21h', element: '💧' },
    { energy: 'Lumineuse', color: '#FD79A8', mood: 'Guérison naturelle', advice: 'Ton corps te parle. Écoute ses messages.', luckyHour: '11h-13h', element: '🌍' },
    { energy: 'Transformatrice', color: '#FF6B6B', mood: 'Lâcher-prise', advice: 'Contrôler n\'est pas vivre. Lâche prise et observe la magie.', luckyHour: '16h-18h', element: '💨' },
  ],
  balance: [
    { energy: 'Harmonieuse', color: '#FD79A8', mood: 'Équilibre parfait', advice: 'Tu es le pont entre les mondes. Maintiens l\'harmonie.', luckyHour: '10h-12h', element: '💨' },
    { energy: 'Haute', color: '#FFEAA7', mood: 'Beauté intérieure', advice: 'La grâce est dans chaque geste. Cultive l\'élégance de l\'âme.', luckyHour: '14h-16h', element: '💨' },
    { energy: 'Modérée', color: '#74C0FC', mood: 'Justice du cœur', advice: 'Écoute les deux côtés avant de juger, surtout toi-même.', luckyHour: '11h-13h', element: '💨' },
    { energy: 'Intense', color: '#E17055', mood: 'Passion esthétique', advice: 'Crée quelque chose de beau aujourd\'hui. L\'art guérit.', luckyHour: '15h-17h', element: '🔥' },
    { energy: 'Douce', color: '#A29BFE', mood: 'Paix profonde', advice: 'La paix intérieure est le plus grand luxe. Offre-la-toi.', luckyHour: '18h-20h', element: '💧' },
    { energy: 'Lumineuse', color: '#55EFC4', mood: 'Diplomatie céleste', advice: 'Tes mots sont un baume. Utilise-les pour apaiser.', luckyHour: '9h-11h', element: '💨' },
    { energy: 'Transformatrice', color: '#FF6B6B', mood: 'Choix décisif', advice: 'Choisir, c\'est avancer. L\'indécision est le seul mauvais choix.', luckyHour: '8h-10h', element: '🔥' },
  ],
  scorpion: [
    { energy: 'Magnétique', color: '#E17055', mood: 'Profondeur abyssale', advice: 'Plonge dans tes ombres. C\'est là que se cache ta lumière.', luckyHour: '22h-0h', element: '💧' },
    { energy: 'Haute', color: '#FF6B6B', mood: 'Régénération', advice: 'Comme le phénix, tu renais plus fort de chaque épreuve.', luckyHour: '9h-11h', element: '💧' },
    { energy: 'Modérée', color: '#A29BFE', mood: 'Mystère sacré', advice: 'Tout n\'a pas besoin d\'être révélé. Le mystère a du pouvoir.', luckyHour: '21h-23h', element: '💧' },
    { energy: 'Intense', color: '#FD79A8', mood: 'Passion alchimique', advice: 'Transforme tes blessures en sagesse. C\'est ton don.', luckyHour: '14h-16h', element: '🔥' },
    { energy: 'Douce', color: '#74C0FC', mood: 'Vulnérabilité assumée', advice: 'Ouvre-toi sans crainte. La vraie force est dans la transparence.', luckyHour: '18h-20h', element: '💧' },
    { energy: 'Lumineuse', color: '#FFEAA7', mood: 'Pouvoir intérieur', advice: 'Tu possèdes une force que d\'autres ne font que rêver.', luckyHour: '10h-12h', element: '🔥' },
    { energy: 'Transformatrice', color: '#55EFC4', mood: 'Mue sacrée', advice: 'Laisse tomber l\'ancienne peau. La nouvelle est plus belle.', luckyHour: '3h-5h', element: '💧' },
  ],
  sagittaire: [
    { energy: 'Aventurière', color: '#E17055', mood: 'Soif d\'horizon', advice: 'L\'aventure commence dans ton esprit. Élargis tes frontières.', luckyHour: '9h-11h', element: '🔥' },
    { energy: 'Haute', color: '#FFEAA7', mood: 'Optimisme solaire', advice: 'Ton enthousiasme est contagieux. Répands-le sans retenue.', luckyHour: '11h-13h', element: '🔥' },
    { energy: 'Modérée', color: '#74C0FC', mood: 'Sagesse philosophe', advice: 'Prends du recul. La vue d\'en haut change tout.', luckyHour: '15h-17h', element: '💨' },
    { energy: 'Intense', color: '#FF6B6B', mood: 'Flèche de vérité', advice: 'Dis ta vérité avec amour. Elle libère plus qu\'elle ne blesse.', luckyHour: '10h-12h', element: '🔥' },
    { energy: 'Douce', color: '#A29BFE', mood: 'Paix nomade', advice: 'Même immobile, ton esprit peut voyager. Médite.', luckyHour: '20h-22h', element: '💨' },
    { energy: 'Lumineuse', color: '#55EFC4', mood: 'Foi retrouvée', advice: 'Crois en l\'impossible. C\'est souvent ce qui arrive.', luckyHour: '14h-16h', element: '🔥' },
    { energy: 'Transformatrice', color: '#FD79A8', mood: 'Expansion de conscience', advice: 'Chaque expérience t\'enrichit. Rien n\'est perdu.', luckyHour: '7h-9h', element: '🔥' },
  ],
  capricorne: [
    { energy: 'Souveraine', color: '#55EFC4', mood: 'Sommet en vue', advice: 'Chaque pas te rapproche du sommet. Ne regarde pas en bas.', luckyHour: '7h-9h', element: '🌍' },
    { energy: 'Haute', color: '#FFEAA7', mood: 'Discipline dorée', advice: 'Ta rigueur est un art. Elle sculpte ton destin.', luckyHour: '8h-10h', element: '🌍' },
    { energy: 'Modérée', color: '#74C0FC', mood: 'Patience ancestrale', advice: 'Le temps est ton allié. Fais-lui confiance.', luckyHour: '14h-16h', element: '🌍' },
    { energy: 'Intense', color: '#E17055', mood: 'Ambition sacrée', advice: 'Vise haut, mais n\'oublie pas pourquoi tu grimpes.', luckyHour: '9h-11h', element: '🌍' },
    { energy: 'Douce', color: '#A29BFE', mood: 'Tendresse cachée', advice: 'Laisse voir ta douceur. Elle est ta plus grande beauté.', luckyHour: '19h-21h', element: '💧' },
    { energy: 'Lumineuse', color: '#FD79A8', mood: 'Héritage intérieur', advice: 'Tu portes la sagesse de tes ancêtres. Honore-la.', luckyHour: '10h-12h', element: '🌍' },
    { energy: 'Transformatrice', color: '#FF6B6B', mood: 'Fondations neuves', advice: 'Parfois il faut déconstruire pour mieux reconstruire.', luckyHour: '6h-8h', element: '🌍' },
  ],
  verseau: [
    { energy: 'Visionnaire', color: '#74C0FC', mood: 'Éclair de génie', advice: 'Tes idées sont en avance sur leur temps. Persévère.', luckyHour: '11h-13h', element: '💨' },
    { energy: 'Haute', color: '#A29BFE', mood: 'Liberté cosmique', advice: 'Être unique n\'est pas un défaut. C\'est ton super-pouvoir.', luckyHour: '14h-16h', element: '💨' },
    { energy: 'Modérée', color: '#55EFC4', mood: 'Humanité profonde', advice: 'Connecte-toi aux autres tout en restant fidèle à toi-même.', luckyHour: '10h-12h', element: '💨' },
    { energy: 'Intense', color: '#FF6B6B', mood: 'Révolution intérieure', advice: 'Brise les chaînes de tes vieilles croyances.', luckyHour: '9h-11h', element: '🔥' },
    { energy: 'Douce', color: '#FFEAA7', mood: 'Fraternité universelle', advice: 'L\'amour inconditionnel commence par soi.', luckyHour: '18h-20h', element: '💧' },
    { energy: 'Lumineuse', color: '#FD79A8', mood: 'Invention sacrée', advice: 'Crée ce qui n\'existe pas encore. Le monde en a besoin.', luckyHour: '15h-17h', element: '💨' },
    { energy: 'Transformatrice', color: '#E17055', mood: 'Éveil collectif', advice: 'Ton éveil élève tous ceux qui t\'entourent.', luckyHour: '8h-10h', element: '💨' },
  ],
  poisson: [
    { energy: 'Mystique', color: '#A29BFE', mood: 'Océan de conscience', advice: 'Nage dans les profondeurs de ton être. Les trésors t\'y attendent.', luckyHour: '22h-0h', element: '💧' },
    { energy: 'Haute', color: '#74C0FC', mood: 'Empathie divine', advice: 'Ta capacité à ressentir les autres est un don. Protège-le.', luckyHour: '10h-12h', element: '💧' },
    { energy: 'Modérée', color: '#55EFC4', mood: 'Rêverie créatrice', advice: 'Tes rêves sont des messages. Écoute-les attentivement.', luckyHour: '14h-16h', element: '💧' },
    { energy: 'Intense', color: '#FD79A8', mood: 'Fusion cosmique', advice: 'Tu es connecté à tout. Utilise cette connexion pour guérir.', luckyHour: '21h-23h', element: '💧' },
    { energy: 'Douce', color: '#FFEAA7', mood: 'Bain de lumière', advice: 'Baigne-toi dans la lumière de ta propre compassion.', luckyHour: '18h-20h', element: '💧' },
    { energy: 'Lumineuse', color: '#E17055', mood: 'Art sacré', advice: 'Exprime ce que les mots ne peuvent dire. L\'art est ton langage.', luckyHour: '15h-17h', element: '🔥' },
    { energy: 'Transformatrice', color: '#FF6B6B', mood: 'Dissolution de l\'ego', advice: 'Lâche le contrôle. La rivière sait où elle va.', luckyHour: '3h-5h', element: '💧' },
  ],
}

/**
 * Returns the energy forecast for a given zodiac sign based on the current date.
 * Uses a seed based on day of year to produce consistent results throughout the day.
 */
export function getDailyForecast(sign: ZodiacSign): EnergyForecast & { sign: ZodiacSign } {
  const today = new Date()
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  )
  const forecasts = FORECASTS[sign]
  const index = dayOfYear % forecasts.length
  return { ...forecasts[index], sign }
}

/**
 * Determines the zodiac sign from a birth date string (YYYY-MM-DD or any parseable date).
 * Returns null if the date is invalid.
 */
export function getZodiacSignFromDate(birthDate: string): ZodiacSign | null {
  const date = new Date(birthDate)
  if (isNaN(date.getTime())) return null

  const month = date.getMonth() + 1 // 1-12
  const day = date.getDate()

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'belier'
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taureau'
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemeaux'
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer'
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'lion'
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'vierge'
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'balance'
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpion'
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittaire'
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorne'
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'verseau'
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'poisson'

  return null
}

/**
 * Resolves the zodiac sign for a user, checking:
 * 1. Profile zodiac_sign field (explicit override)
 * 2. Birth date calculation
 * 3. Founder mapping by first name
 * Returns null if no sign is found (user didn't provide birth date).
 */
export function resolveZodiacSign(prenom: string, profileSign?: string | null, birthDate?: string | null): ZodiacSign | null {
  if (profileSign && profileSign in ZODIAC_INFO) return profileSign as ZodiacSign
  if (birthDate) {
    const fromDate = getZodiacSignFromDate(birthDate)
    if (fromDate) return fromDate
  }
  // Check founder mapping (trim + case-insensitive)
  const trimmed = prenom.trim()
  const normalizedName = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase()
  if (normalizedName in FOUNDER_ZODIAC) return FOUNDER_ZODIAC[normalizedName]
  return null
}
