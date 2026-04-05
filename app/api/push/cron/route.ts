import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

function getTimeSlot(): 'night' | 'morning' | 'afternoon' | 'evening' {
  // Use Paris timezone for French users
  const now = new Date()
  const parisHour = parseInt(now.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: 'Europe/Paris' }))
  if (parisHour < 5) return 'night'
  if (parisHour < 12) return 'morning'
  if (parisHour < 18) return 'afternoon'
  return 'evening'
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: Request) {
  // Encouragement push notifications are temporarily disabled
  return NextResponse.json({ message: 'Encouragement push notifications désactivées temporairement' })
}
