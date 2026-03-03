export type BotProfile = {
  prenom: string
  email: string
  avatar_url: string
  bio: string
  plan: 'essential' | 'serenite' | 'premium'
}

export const BOT_PROFILES: BotProfile[] = [
  {
    prenom: 'Cécilia',
    email: 'cecilia.bot@sosshine.internal',
    avatar_url: '/avatars/cecilia.png',
    bio: 'Passionnée de développement personnel et de méditation. Je crois profondément en la force du collectif.',
    plan: 'premium',
  },
  {
    prenom: 'Loïc',
    email: 'loic.bot@sosshine.internal',
    avatar_url: '/avatars/loic.png',
    bio: 'En chemin vers une meilleure version de moi-même. Le sport et la nature sont mes alliés.',
    plan: 'essential',
  },
  {
    prenom: 'Sandra',
    email: 'sandra.bot@sosshine.internal',
    avatar_url: '/avatars/sandra.png',
    bio: 'Maman de deux enfants, j\'ai trouvé ici un espace de soutien incroyable. Merci SOS Shine.',
    plan: 'premium',
  },
  {
    prenom: 'Zoé',
    email: 'zoe.bot@sosshine.internal',
    avatar_url: '/avatars/zoe.png',
    bio: 'Étudiante en psychologie, je m\'intéresse aux schémas émotionnels et à la résilience.',
    plan: 'essential',
  },
  {
    prenom: 'Nicolas',
    email: 'nicolas.bot@sosshine.internal',
    avatar_url: '/avatars/nicolas.png',
    bio: 'Entrepreneur, j\'ai appris que prendre soin de ses émotions est la clé du succès.',
    plan: 'premium',
  },
]
