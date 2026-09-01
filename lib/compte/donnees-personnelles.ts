/**
 *  DONNÉES PERSONNELLES D'UN MEMBRE — inventaire partagé
 *  ─────────────────────────────────────────────────────
 *
 *  L'export et la suppression doivent porter sur exactement le même
 *  périmètre. Tenus séparément, ils divergent : on exporte une table qu'on
 *  oublie d'effacer, ou l'inverse. Ils lisent donc tous deux cette liste.
 *
 *  Une table absente de la base — migration non passée — ne doit jamais faire
 *  échouer l'opération : chaque accès est isolé, et son échec seulement noté.
 */

/** Tables reliées au compte par `user_id`. */
export const TABLES_PAR_USER_ID = [
  'user_progress',
  'user_xp',
  'user_goals',
  'onboarding_responses',
  'notification_preferences',
  'push_subscriptions',
  'nps_responses',
  'post_likes',
  'post_bookmarks',
  'post_comments',
  'posts',
  'blog_favorites',
  'shine_shorts_favorites',
  'shine_shorts_shines',
  'shine_shorts_ratings',
  'shine_shorts_reviews',
  'shine_tv_favorites',
  'shine_tv_ratings',
  'shine_tv_reviews',
  'shine_audible_favorites',
  'shine_audible_ratings',
  'shine_audible_reviews',
  'shine_audible_history',
  'shine_library_favorites',
  'shine_library_ratings',
  'shine_library_reviews',
  'douleur_quiz_attempts',
  'protocol_unlocks',
  'encyclopedia_progress',
  'challenge_participations',
  'challenge_phase_progress',
  'affiliates',
  'withdrawal_requests',
  'subscriptions',
] as const

/** Tables reliées au compte par l'adresse e-mail, sans clé étrangère. */
export const TABLES_PAR_EMAIL = [
  'crm_contacts',
  'crm_sequence_enrollments',
  'signature_leads',
  'newsletter_weekly_subscribers',
  'protocol_notifications',
  'event_leads',
  'waitlist',
  'quiz_v2_responses',
  'quiz_v3_responses',
] as const

/**
 * Tables où les deux colonnes existent : on les vide par l'identifiant ET par
 * l'adresse, parce que les lignes créées avant l'inscription ne portent que
 * l'adresse.
 */
export const TABLES_MIXTES = ['quiz_v2_responses', 'quiz_v3_responses'] as const

/**
 * Messages privés : deux colonnes, et une conversation a un autre bout.
 * On efface ce que la personne a écrit ; ce qu'elle a reçu appartient aussi
 * à son interlocuteur et n'est pas supprimé de son côté à lui.
 */
export const TABLES_MESSAGES = [
  { table: 'private_messages', colonnes: ['sender_id', 'receiver_id'] },
  { table: 'shine_connections', colonnes: ['sender_id', 'receiver_id'] },
] as const
