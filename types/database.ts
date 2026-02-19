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
  plan: 'essential' | 'premium' | null
  created_at: string
}

// ── Subscriptions ──
export type Subscription = {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan: 'essential' | 'premium'
  status: 'trialing' | 'active' | 'inactive' | 'canceled' | 'past_due'
  current_period_end: string | null
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
  // Étape 2 — Libération Énergétique
  audio_energy_url: string | null
  // Étape 3 — Intégration & Méditation
  audio_meditation_url: string | null
  // Étape 4 — Action & Reprogrammation
  pdf_url: string | null
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
export type Post = {
  id: string
  author_id: string
  title: string
  content: string
  image_url: string | null
  post_type: 'announcement' | 'douleur_published' | 'event_published' | 'general'
  is_published: boolean
  created_at: string
  updated_at: string
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
  notification_type: 'new_douleur' | 'new_event' | 'new_post' | 'new_soin'
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
type DefaultColumns = 'id' | 'created_at' | 'updated_at' | 'audio_url' | 'message_type' | 'status' | 'room_code' | 'call_type' | 'event_type' | 'target_user_id' | 'room_id'
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
      events: Table<Event>
      event_registrations: Table<EventRegistration>
      content_views: Table<ContentView>
      notifications: Table<Notification>
      private_messages: Table<PrivateMessage>
      signaling_rooms: Table<SignalingRoom>
      group_events: Table<GroupEvent>
      site_settings: Table<SiteSetting>
      landing_sections: Table<LandingSection>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}

// ── Helper types ──
export type MessageWithProfile = Message & {
  profiles: Pick<Profile, 'prenom' | 'pseudo' | 'role' | 'avatar_url'>
}

export type PostWithAuthor = Post & {
  profiles: Pick<Profile, 'prenom' | 'role' | 'avatar_url'>
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
