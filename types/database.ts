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
  is_active: boolean
  is_published: boolean
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
  notification_type: 'new_douleur' | 'new_event' | 'new_post' | 'new_soin' | 'warning'
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

// ── Helper: columns with DB defaults are optional on Insert ──
type DefaultColumns = 'id' | 'created_at' | 'updated_at' | 'audio_url' | 'message_type' | 'status' | 'room_code' | 'call_type' | 'event_type' | 'target_user_id' | 'room_id' | 'category' | 'media_type' | 'video_url' | 'image_url' | 'is_published' | 'delete_locked' | 'publish_banned_until' | 'is_bot' | 'is_read' | 'is_deleted' | 'is_general' | 'is_anonymous' | 'is_active' | 'email_sent' | 'is_visible' | 'position' | 'total_clicks' | 'total_referrals' | 'total_earnings' | 'pending_earnings' | 'paid_earnings' | 'current_tier' | 'referral_code' | 'approved_at' | 'rejected_at' | 'rejection_reason' | 'paid_at' | 'payment_reference' | 'commission_amount' | 'visibility'
type OptionalId<T> = Omit<T, Extract<DefaultColumns, keyof T>> &
  Partial<Pick<T, Extract<DefaultColumns, keyof T>>>

// ── Supabase table helper ──
type Table<Row, Insert = OptionalId<Row>, Update = Partial<Row>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

// ── Database (Supabase schema) ──
export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile>
      subscriptions: Table<Subscription>
      douleurs: Table<Douleur>
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
      pinned_posts: Table<PinnedPost>
    }
    Views: Record<string, never>
    Functions: {
      add_xp: {
        Args: { p_user_id: string; p_amount: number; p_reason?: string }
        Returns: { total_xp: number; level: number; level_up: boolean }
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
