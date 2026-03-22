import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { sendTemplateEmail } from '@/lib/email-templates/automated-emails'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createSupabaseClient(url, key)
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { eventId } = await request.json()
    if (!eventId) {
      return NextResponse.json({ error: 'eventId requis' }, { status: 400 })
    }

    const admin = getAdminClient()
    if (!admin) {
      return NextResponse.json({ error: 'Config missing' }, { status: 500 })
    }

    // Insert registration
    const { error: regError } = await admin.from('event_registrations').insert({
      event_id: eventId,
      user_id: user.id,
      status: 'registered',
    })

    if (regError) {
      // Already registered or other error
      if (regError.code === '23505') {
        return NextResponse.json({ error: 'Déjà inscrit' }, { status: 409 })
      }
      return NextResponse.json({ error: regError.message }, { status: 500 })
    }

    // Fetch event details + user profile for the email
    const [eventRes, profileRes] = await Promise.all([
      admin.from('events').select('title, event_date, start_time').eq('id', eventId).single(),
      admin.from('profiles').select('prenom, email').eq('id', user.id).single(),
    ])

    const event = eventRes.data
    const profile = profileRes.data

    if (profile?.email && event) {
      const firstName = profile.prenom || 'Membre'
      const eventDate = event.event_date
        ? new Date(event.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'Date à confirmer'
      const eventTime = event.start_time || 'Heure à confirmer'

      sendTemplateEmail('event_registration', profile.email, {
        firstName,
        email: profile.email,
        eventName: event.title || 'Événement SOS Shine',
        eventDate,
        eventTime,
      }, { recipientName: firstName }).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Event registration error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
