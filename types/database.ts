export type Profile = {
  id: string
  prenom: string
  email: string
  role: 'member' | 'founder'
  avatar_url: string | null
  created_at: string
}

export type Subscription = {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  status: 'trialing' | 'active' | 'inactive' | 'canceled' | 'past_due'
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export type Douleur = {
  id: string
  title: string
  slug: string
  description: string | null
  video_url: string | null
  audio_url: string | null
  pdf_url: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  user_id: string
  douleur_id: string | null
  content: string
  is_general: boolean
  is_deleted: boolean
  created_at: string
}

export type Event = {
  id: string
  title: string
  description: string | null
  location_name: string | null
  latitude: number | null
  longitude: number | null
  event_date: string
  price: number
  max_participants: number | null
  created_by: string | null
  is_active: boolean
  created_at: string
}

export type EventRegistration = {
  id: string
  event_id: string
  user_id: string
  status: 'registered' | 'canceled'
  created_at: string
}

// Supabase Database type for typed client
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'> & { created_at?: string }
        Update: Partial<Omit<Profile, 'id'>>
        Relationships: []
      }
      subscriptions: {
        Row: Subscription
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Subscription, 'id'>>
        Relationships: []
      }
      douleurs: {
        Row: Douleur
        Insert: Omit<Douleur, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Douleur, 'id'>>
        Relationships: []
      }
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<Message, 'id'>>
        Relationships: []
      }
      events: {
        Row: Event
        Insert: Omit<Event, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<Event, 'id'>>
        Relationships: []
      }
      event_registrations: {
        Row: EventRegistration
        Insert: Omit<EventRegistration, 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<EventRegistration, 'id'>>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Helper type for message with profile joined
export type MessageWithProfile = Message & {
  profiles: Pick<Profile, 'prenom' | 'role' | 'avatar_url'>
}
