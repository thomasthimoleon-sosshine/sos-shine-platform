// ── Profiles ──
export type Profile = {
  id: string
  prenom: string
  pseudo: string | null
  email: string
  role: 'member' | 'founder' | 'admin_content' | 'admin_support'
  avatar_url: string | null
  bio: string | null
  video_url: string | null
  plan: 'essential' | 'serenite' | 'premium' | null
  birth_date?: string | null
  zodiac_sign?: string | null
  greetings_progress?: { night: number; morning: number; afternoon: number; evening: number }
  is_bot?: boolean
  is_active?: boolean
  publish_banned_until?: string | null
  created_at: string
}

// ── Subscriptions ──
export type Subscription = {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan: 'essential' | 'serenite' | 'premium'
  status: 'trialing' | 'active' | 'inactive' | 'canceled' | 'past_due'
  current_period_end: string | null
  cancel_at_period_end?: boolean
  trial_end?: string | null
  waitlist_discount?: boolean
  created_at: string
  updated_at: string
}

// ── Douleurs (core content) ──
export type Douleur = {
  id: string
  title: string
  slug: string
  subtitle: string | null
  category: string | null
  is_original: boolean
  description: string | null
  // Étape 1 — Comprendre
  video_url: string | null
  step1_audio_url: string | null
  step1_pdf_url: string | null
  step1_image_url: string | null
  // Étape 2 — Libérer & Intégrer
  audio_energy_url: string | null
  step2_video_url: string | null
  step2_pdf_url: string | null
  step2_image_url: string | null
  // Étape 3 — Agir
  audio_meditation_url: string | null
  step3_video_url: string | null
  pdf_url: string | null
  step3_image_url: string | null
  exercise_content: string | null
  // Meta
  image_url: string | null
  tags: string[]
  is_active: boolean
  is_published: boolean
  created_at: string
  updated_at: string
}

// ── Douleur Steps (dynamic steps per challenge) ──
export type DouleurStep = {
  id: string
  douleur_id: string
  step_number: number
  title: string
  subtitle: string | null
  description: string | null
  icon: string
  color: string
  video_url: string | null
  video_url_2: string | null
  audio_url: string | null
  audio_url_2: string | null
  pdf_url: string | null
  image_url: string | null
  video_cover: string | null
  video2_cover: string | null
  audio_cover: string | null
  audio2_cover: string | null
  exercise_content: string | null
  created_at: string
  updated_at: string
}

// ── Messages (chat per douleur + general) ──
export type Message = {
  id: string
  user_id: string
  douleur_id: string | null
  content: string
  audio_url: string | null
  message_type: 'text' | 'audio'
  is_general: boolean
  is_deleted: boolean
  is_anonymous: boolean
  created_at: string
}

// ── Posts (mur communautaire) ──
export type PostCategory = 'temoignage' | 'partage' | 'question' | 'remerciements' | 'gratitude' | 'citation'
export type PostMediaType = 'text' | 'image' | 'video' | 'audio'
export type PostVisibility = 'public' | 'rayons_only'

export type Post = {
  id: string
  author_id: string
  title: string
  content: string
  image_url: string | null
  video_url: string | null
  audio_url: string | null
  post_type: 'announcement' | 'douleur_published' | 'event_published' | 'general' | 'community' | 'eclat'
  category: PostCategory
  media_type: PostMediaType
  visibility: PostVisibility
  is_published: boolean
  delete_locked: boolean
  created_at: string
  updated_at: string
}

// ── Post Likes ──
export type PostLike = {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

// ── Post Comments ──
export type PostComment = {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
}

export type PostCommentWithAuthor = PostComment & {
  profiles: Pick<Profile, 'prenom' | 'role' | 'avatar_url'>
}

// ── Events ──
export type Event = {
  id: string
  title: string
  description: string | null
  event_type: 'soin_collectif' | 'atelier' | 'live' | 'rencontre' | 'shine_walk'
  location_name: string | null
  latitude: number | null
  longitude: number | null
  event_date: string
  live_url: string | null
  replay_url: string | null
  price: number
  max_participants: number | null
  created_by: string | null
  hosts: string[] | null
  is_active: boolean
  created_at: string
}

// ── Event Registrations ──
export type EventRegistration = {
  id: string
  event_id: string
  user_id: string
  status: 'registered' | 'canceled'
  created_at: string
}

// ── Premium Ateliers (programme 48 semaines) ──
export type PremiumAtelier = {
  id: string
  month_index: number
  week: number
  arc_number: number
  arc_label: string
  month_theme: string
  month_icon: string
  title: string
  description: string | null
  video_url: string | null
  live_url: string | null
  replay_url: string | null
  is_live: boolean
  is_active: boolean
  created_at: string
}

// ── Content Tracking (analytics) ──
export type ContentView = {
  id: string
  user_id: string
  douleur_id: string | null
  event_id: string | null
  content_type: 'video' | 'audio_energy' | 'audio_meditation' | 'pdf' | 'exercise' | 'page_view'
  duration_seconds: number | null
  created_at: string
}

// ── Notifications ──
export type Notification = {
  id: string
  user_id: string | null
  title: string
  body: string
  link: string | null
  notification_type: 'new_douleur' | 'new_event' | 'new_post' | 'new_soin' | 'warning' | 'new_video' | 'new_audio' | 'new_book' | 'new_protocol'
  is_read: boolean
  email_sent: boolean
  created_at: string
}

// ── Private Messages (messagerie privée) ──
export type PrivateMessage = {
  id: string
  sender_id: string
  receiver_id: string
  content: string | null
  audio_url: string | null
  message_type: 'text' | 'audio'
  is_read: boolean
  created_at: string
}

// ── Signaling Rooms (WebRTC natif — visio 1-to-1 et groupe) ──
export type SignalingRoom = {
  id: string
  room_code: string
  created_by: string
  room_type: 'one_to_one' | 'group'
  call_type: 'audio' | 'video'
  target_user_id: string | null
  status: 'waiting' | 'active' | 'ended' | 'rejected'
  created_at: string
}

// ── Group Events (visio de groupe) ──
export type GroupEvent = {
  id: string
  host_id: string
  title: string
  description: string | null
  event_type: 'audio' | 'video'
  start_time: string
  status: 'scheduled' | 'live' | 'ended' | 'canceled'
  room_id: string | null
  max_participants: number | null
  created_at: string
}

// ── Affiliates ──
export type AffiliateTier = 'bronze' | 'silver' | 'gold' | 'diamond'
export type AffiliateStatus = 'pending' | 'approved' | 'rejected' | 'suspended'

export type Affiliate = {
  id: string
  user_id: string
  status: AffiliateStatus
  referral_code: string
  motivation: string
  audience_size: string | null
  promotion_channels: string[]
  social_links: Record<string, string>
  website_url: string | null
  total_clicks: number
  total_referrals: number
  total_earnings: number
  pending_earnings: number
  paid_earnings: number
  current_tier: AffiliateTier
  approved_at: string | null
  rejected_at: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
}

export type AffiliateClick = {
  id: string
  affiliate_id: string
  ip_hash: string | null
  user_agent: string | null
  referrer_url: string | null
  created_at: string
}

export type AffiliateConversion = {
  id: string
  affiliate_id: string
  referred_user_id: string | null
  conversion_type: 'signup' | 'subscription' | 'renewal'
  plan: 'essential' | 'serenite' | 'premium' | null
  amount: number
  commission_rate: number
  commission_amount: number
  status: 'pending' | 'confirmed' | 'paid' | 'cancelled'
  created_at: string
}

export type AffiliatePayout = {
  id: string
  affiliate_id: string
  amount: number
  payment_method: 'bank_transfer' | 'paypal' | 'stripe'
  payment_reference: string | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  created_at: string
  paid_at: string | null
}

// ── Withdrawal Requests (demandes de retrait) ──
export type WithdrawalRequest = {
  id: string
  user_id: string
  affiliate_id: string
  amount: number
  iban: string | null
  paypal_email: string | null
  payment_method: 'bank_transfer' | 'paypal'
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  admin_note: string | null
  processed_by: string | null
  processed_at: string | null
  created_at: string
}

// ── User Progress (encyclopedia progression tracking) ──
export type UserProgress = {
  id: string
  user_id: string
  douleur_id: string
  step1_completed: boolean
  step2_completed: boolean
  step3_completed: boolean
  steps_completed: Record<string, boolean>
  completed_at: string | null
  created_at: string
  updated_at: string
}

// ── User XP (experience points and levels) ──
export type UserXP = {
  id: string
  user_id: string
  total_xp: number
  level: number
  shines_given: number
  shines_received: number
  created_at: string
  updated_at: string
}

// ── Daily User Actions (anti-farming tracking) ──
export type DailyUserAction = {
  id: string
  user_id: string
  action_date: string
  action_type: string
  count: number
  created_at: string
  updated_at: string
}

// ── Encyclopedia Progress (Boss Quest scores) ──
export type EncyclopediaProgress = {
  id: string
  user_id: string
  module_id: string
  best_score_percentage: number
  xp_awarded: number
  created_at: string
  updated_at: string
}

// ── Challenges (community challenges) ──
export type ChallengeRewardType = 'xp' | 'video' | 'call' | 'badge'
export type ChallengeStatus = 'draft' | 'active' | 'completed' | 'archived'

export type Challenge = {
  id: string
  title: string
  description: string | null
  reward_type: ChallengeRewardType
  reward_value: number
  reward_detail: string | null
  start_date: string | null
  end_date: string | null
  status: ChallengeStatus
  max_participants: number | null
  created_by: string | null
  winner_id: string | null
  created_at: string
  updated_at: string
}

// ── Challenge Participations ──
export type ChallengeParticipationStatus = 'enrolled' | 'in_progress' | 'completed' | 'abandoned'

export type ChallengeParticipation = {
  id: string
  challenge_id: string
  user_id: string
  status: ChallengeParticipationStatus
  progress: number
  completed_at: string | null
  created_at: string
  updated_at: string
}

// ── Challenge Phases ──
export type ChallengePhase = {
  id: string
  challenge_id: string
  phase_number: number
  title: string
  description: string | null
  duration_days: number | null
  created_at: string
}

export type ChallengePhaseProgressStatus = 'pending' | 'in_progress' | 'completed'

export type ChallengePhaseProgress = {
  id: string
  participation_id: string
  phase_id: string
  status: ChallengePhaseProgressStatus
  completed_at: string | null
  created_at: string
}

// ── Pinned Posts ──
export type PinnedPost = {
  id: string
  post_id: string | null
  challenge_id: string | null
  pinned_by: string | null
  pin_type: 'winner' | 'announcement' | 'highlight'
  expires_at: string | null
  created_at: string
}

// ── Shine Connections (Mes Rayons — personal connections) ──
export type ShineConnectionStatus = 'pending' | 'accepted' | 'declined'

export type ShineConnection = {
  id: string
  sender_id: string
  receiver_id: string
  status: ShineConnectionStatus
  created_at: string
  updated_at: string
}

export type ShineConnectionWithProfile = ShineConnection & {
  profiles: Pick<Profile, 'id' | 'prenom' | 'pseudo' | 'avatar_url' | 'role' | 'bio'>
}

// ── Site Settings (admin customization) ──
export type SiteSetting = {
  id: string
  key: string
  value: string
  updated_by: string | null
  updated_at: string
}

// ── Landing Sections (CMS landing page) ──
export type LandingSection = {
  id: string
  section_key: string
  label: string
  position: number
  is_visible: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: Record<string, any>
  styles: Record<string, string>
  updated_by: string | null
  updated_at: string
}

// ── Onboarding Responses ──
export type OnboardingResponse = {
  id: string
  user_id: string
  goals: string[]
  completed_at: string
  created_at: string
  updated_at: string
}

// ── User Goals (generated from onboarding) ──
export type UserGoal = {
  id: string
  user_id: string
  title: string
  description: string | null
  goal_key: string
  recommended_slug: string | null
  status: 'active' | 'completed'
  source: 'onboarding' | 'manual'
  created_at: string
  updated_at: string
}

// ── Shine TV Videos ──
// ── Shine Shorts ──
export type ShineShort = {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  video_url: string | null
  category: string
  duration_seconds: number
  douleur_id: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export type ShineShortFavorite = {
  id: string
  user_id: string
  short_id: string
  created_at: string
}

export type ShineShortRating = {
  id: string
  user_id: string
  short_id: string
  rating: number
  created_at: string
  updated_at: string
}

export type ShineShortReview = {
  id: string
  user_id: string
  short_id: string
  content: string
  rating: number
  created_at: string
  updated_at: string
}

export type ShineTvVideo = {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  video_url: string | null
  category: string
  duration_minutes: number
  year: number
  douleur_id: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

// ── Shine TV Favorites ──
export type ShineTvFavorite = {
  id: string
  user_id: string
  video_id: string
  created_at: string
}

// ── Shine TV Ratings ──
export type ShineTvRating = {
  id: string
  user_id: string
  video_id: string
  rating: number
  created_at: string
  updated_at: string
}

// ── Shine TV Reviews ──
export type ShineTvReview = {
  id: string
  user_id: string
  video_id: string
  content: string
  rating: number
  created_at: string
  updated_at: string
}

// ── Shine Audible Tracks ──
export type ShineAudibleTrack = {
  id: string
  title: string
  description: string | null
  cover_url: string | null
  audio_url: string | null
  narrator: string | null
  category: string
  content_type: 'podcast' | 'audiobook' | 'meditation' | 'hypnosis' | 'ambient'
  duration_seconds: number
  year: number
  douleur_id: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

// ── Shine Audible Favorites ──
export type ShineAudibleFavorite = {
  id: string
  user_id: string
  track_id: string
  created_at: string
}

// ── Shine Audible Ratings ──
export type ShineAudibleRating = {
  id: string
  user_id: string
  track_id: string
  rating: number
  created_at: string
  updated_at: string
}

// ── Shine Audible Reviews ──
export type ShineAudibleReview = {
  id: string
  user_id: string
  track_id: string
  content: string
  rating: number
  created_at: string
  updated_at: string
}

// ── Shine Audible History ──
export type ShineAudibleHistory = {
  id: string
  user_id: string
  track_id: string
  progress_seconds: number
  completed: boolean
  listened_at: string
}

// ── Shine Library Books ──
export type ShineLibraryBook = {
  id: string
  title: string
  author: string
  description: string | null
  cover_url: string | null
  pdf_url: string | null
  category: string
  content_type: 'ebook' | 'guide' | 'workbook' | 'journal' | 'protocol'
  page_count: number
  year: number
  douleur_id: string | null
  is_published: boolean
  is_featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

// ── Shine Library Favorites ──
export type ShineLibraryFavorite = {
  id: string
  user_id: string
  book_id: string
  created_at: string
}

// ── Shine Library Ratings ──
export type ShineLibraryRating = {
  id: string
  user_id: string
  book_id: string
  rating: number
  created_at: string
  updated_at: string
}

// ── Shine Library Reviews ──
export type ShineLibraryReview = {
  id: string
  user_id: string
  book_id: string
  content: string
  rating: number
  created_at: string
  updated_at: string
}

// ── Douleur Quiz (QCM per challenge) ──
export type DouleurQuizQuestion = {
  id: string
  douleur_id: string
  question: string
  options: string[]          // ["Option A", "Option B", "Option C", "Option D"]
  correct_indices: number[]  // [0, 2] = indices of correct answers
  sort_order: number
  created_at: string
  updated_at: string
}

export type DouleurQuizAttempt = {
  id: string
  user_id: string
  douleur_id: string
  score: number
  total: number
  passed: boolean
  answers: number[][]  // user's selected indices per question
  created_at: string
}

// ── Courrier Anonyme (anonymous mailbox) ──
export type CourrierAnonymeCategory = 'question' | 'recommandation' | 'temoignage' | 'suggestion' | 'autre'
export type CourrierAnonymeStatus = 'new' | 'read' | 'planned' | 'answered' | 'archived'
export type CourrierAnsweredVia = 'shine_tv' | 'podcast' | 'article' | 'direct'

export type CourrierAnonyme = {
  id: string
  user_id: string | null
  category: CourrierAnonymeCategory
  subject: string | null
  content: string
  status: CourrierAnonymeStatus
  admin_note: string | null
  answered_via: CourrierAnsweredVia | null
  answered_url: string | null
  answered_at: string | null
  answered_by: string | null
  is_pinned: boolean
  created_at: string
  updated_at: string
}

// ── Site Visits (connection tracking) ──
export type SiteVisit = {
  id: string
  user_id: string | null
  page_path: string
  referrer: string | null
  user_agent: string | null
  ip_hash: string | null
  country: string | null
  device_type: string
  session_id: string | null
  is_authenticated: boolean
  created_at: string
}

// ── Helper: columns with DB defaults are optional on Insert ──
type DefaultColumns = 'id' | 'created_at' | 'updated_at' | 'completed_at' | 'audio_url' | 'message_type' | 'status' | 'room_code' | 'call_type' | 'event_type' | 'target_user_id' | 'room_id' | 'category' | 'media_type' | 'video_url' | 'image_url' | 'is_published' | 'delete_locked' | 'publish_banned_until' | 'is_bot' | 'is_read' | 'is_deleted' | 'is_general' | 'is_anonymous' | 'is_active' | 'email_sent' | 'is_visible' | 'position' | 'total_clicks' | 'total_referrals' | 'total_earnings' | 'pending_earnings' | 'paid_earnings' | 'current_tier' | 'referral_code' | 'approved_at' | 'rejected_at' | 'rejection_reason' | 'paid_at' | 'payment_reference' | 'commission_amount' | 'visibility' | 'source' | 'is_featured' | 'sort_order' | 'duration_minutes' | 'duration_seconds' | 'page_count' | 'year' | 'completed' | 'progress_seconds' | 'listened_at' | 'rating' | 'content_type' | 'admin_note' | 'answered_via' | 'answered_url' | 'answered_at' | 'answered_by' | 'is_pinned' | 'subject' | 'user_id' | 'douleur_id'
type OptionalId<T> = Omit<T, Extract<DefaultColumns, keyof T>> &
  Partial<Pick<T, Extract<DefaultColumns, keyof T>>>

// ── Supabase table helper ──
type Table<Row, Insert = OptionalId<Row>, Update = Partial<Row>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

// ── Encouragement Messages ──
export type EncouragementMessage = {
  id: string
  time_slot: 'night' | 'morning' | 'afternoon' | 'evening'
  message: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// ── Push Subscriptions ──
export type PushSubscription = {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// ── Database (Supabase schema) ──
export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile>
      subscriptions: Table<Subscription>
      douleurs: Table<Douleur>
      douleur_steps: Table<DouleurStep>
      messages: Table<Message>
      posts: Table<Post>
      post_likes: Table<PostLike>
      post_comments: Table<PostComment>
      events: Table<Event>
      event_registrations: Table<EventRegistration>
      content_views: Table<ContentView>
      notifications: Table<Notification>
      private_messages: Table<PrivateMessage>
      signaling_rooms: Table<SignalingRoom>
      group_events: Table<GroupEvent>
      affiliates: Table<Affiliate>
      affiliate_clicks: Table<AffiliateClick>
      affiliate_conversions: Table<AffiliateConversion>
      affiliate_payouts: Table<AffiliatePayout>
      withdrawal_requests: Table<WithdrawalRequest>
      shine_connections: Table<ShineConnection>
      site_settings: Table<SiteSetting>
      landing_sections: Table<LandingSection>
      user_progress: Table<UserProgress>
      user_xp: Table<UserXP>
      challenges: Table<Challenge>
      challenge_participations: Table<ChallengeParticipation>
      challenge_phases: Table<ChallengePhase>
      challenge_phase_progress: Table<ChallengePhaseProgress>
      pinned_posts: Table<PinnedPost>
      onboarding_responses: Table<OnboardingResponse>
      user_goals: Table<UserGoal>
      shine_shorts: Table<ShineShort>
      shine_shorts_favorites: Table<ShineShortFavorite>
      shine_shorts_ratings: Table<ShineShortRating>
      shine_shorts_reviews: Table<ShineShortReview>
      shine_tv_videos: Table<ShineTvVideo>
      shine_tv_favorites: Table<ShineTvFavorite>
      shine_tv_ratings: Table<ShineTvRating>
      shine_tv_reviews: Table<ShineTvReview>
      shine_audible_tracks: Table<ShineAudibleTrack>
      shine_audible_favorites: Table<ShineAudibleFavorite>
      shine_audible_ratings: Table<ShineAudibleRating>
      shine_audible_reviews: Table<ShineAudibleReview>
      shine_audible_history: Table<ShineAudibleHistory>
      shine_library_books: Table<ShineLibraryBook>
      shine_library_favorites: Table<ShineLibraryFavorite>
      shine_library_ratings: Table<ShineLibraryRating>
      shine_library_reviews: Table<ShineLibraryReview>
      courrier_anonyme: Table<CourrierAnonyme>
      douleur_quiz_questions: Table<DouleurQuizQuestion>
      douleur_quiz_attempts: Table<DouleurQuizAttempt>
      daily_user_actions: Table<DailyUserAction>
      encyclopedia_progress: Table<EncyclopediaProgress>
      site_visits: Table<SiteVisit>
      premium_ateliers: Table<PremiumAtelier>
      encouragement_messages: Table<EncouragementMessage>
      push_subscriptions: Table<PushSubscription>
    }
    Views: Record<string, never>
    Functions: {
      add_xp: {
        Args: { p_user_id: string; p_amount: number; p_reason?: string }
        Returns: { total_xp: number; level: number; level_up: boolean }
      }
      check_and_increment_daily_action: {
        Args: { p_user_id: string; p_action_type: string }
        Returns: { allowed: boolean; count: number; xp_to_award: number }
      }
      award_encyclopedia_xp: {
        Args: { p_user_id: string; p_module_id: string; p_score_percentage: number; p_total_steps: number }
        Returns: { potential_xp: number; xp_earned: number; xp_delta_awarded: number; previous_score: number; new_score: number; xp_remaining: number }
      }
    }
  }
}

// ── Helper types ──
export type MessageWithProfile = Message & {
  profiles: Pick<Profile, 'prenom' | 'pseudo' | 'role' | 'avatar_url'>
}

export type PostWithAuthor = Post & {
  profiles: Pick<Profile, 'prenom' | 'role' | 'avatar_url'>
  post_likes: { count: number }[]
  post_comments: { count: number }[]
  user_has_liked?: boolean
}

export type EventWithRegistrations = Event & {
  event_registrations: { count: number }[]
}

export type PrivateMessageWithProfile = PrivateMessage & {
  profiles: Pick<Profile, 'prenom' | 'pseudo' | 'role' | 'avatar_url'>
}

export type ConversationPreview = {
  partner: Pick<Profile, 'id' | 'prenom' | 'pseudo' | 'avatar_url' | 'role'>
  lastMessage: PrivateMessage
  unreadCount: number
}

export type WithdrawalRequestWithProfile = WithdrawalRequest & {
  profiles: Pick<Profile, 'prenom' | 'email' | 'avatar_url'>
}

export type AffiliateWithProfile = Affiliate & {
  profiles: Pick<Profile, 'prenom' | 'email' | 'avatar_url'>
}
