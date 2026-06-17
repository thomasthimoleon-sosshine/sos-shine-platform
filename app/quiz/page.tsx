import { createClient } from '@supabase/supabase-js'
import QuizLandingClient from './QuizLandingClient'

export type NextEvent = {
  id: string
  title: string
  event_date: string | null
  end_time: string | null
  location_name: string | null
}

async function getNextEvent(): Promise<NextEvent | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
  const { data } = await supabase
    .from('physical_events')
    .select('id, title, event_date, end_time, location_name')
    .eq('is_published', true)
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .limit(1)
    .single()

  return (data as NextEvent) || null
}

export default async function QuizLandingPage() {
  const nextEvent = await getNextEvent()
  return <QuizLandingClient nextEvent={nextEvent} />
}
