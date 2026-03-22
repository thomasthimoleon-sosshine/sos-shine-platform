import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendTemplateEmail } from '@/lib/email-templates/automated-emails'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

// Ce cron doit être appelé toutes les heures (ou toutes les 15 min)
// Il traite :
// 1. Les emails programmés (scheduled_emails) dont l'heure est passée
// 2. Les rappels d'événements J-1
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ error: 'Config missing' }, { status: 500 })

    const now = new Date().toISOString()
    let emailsSent = 0
    let reminderssSent = 0

    // ═══════════════════════════════════════════
    // 1. Traiter les emails programmés (scheduled_emails)
    // ═══════════════════════════════════════════
    const { data: pendingEmails } = await supabase
      .from('scheduled_emails')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', now)
      .order('scheduled_at')
      .limit(50)

    if (pendingEmails && pendingEmails.length > 0) {
      for (const scheduled of pendingEmails) {
        try {
          const result = await sendTemplateEmail(
            scheduled.template_key,
            scheduled.recipient_email,
            scheduled.variables || {},
            { recipientName: scheduled.recipient_name || undefined }
          )

          if (result.success) {
            await supabase
              .from('scheduled_emails')
              .update({ status: 'sent', sent_at: new Date().toISOString() })
              .eq('id', scheduled.id)
            emailsSent++
          } else {
            await supabase
              .from('scheduled_emails')
              .update({ status: 'failed', error_message: result.error || 'Unknown error' })
              .eq('id', scheduled.id)
          }
        } catch (err) {
          await supabase
            .from('scheduled_emails')
            .update({ status: 'failed', error_message: String(err) })
            .eq('id', scheduled.id)
        }
      }
    }

    // ═══════════════════════════════════════════
    // 2. Rappels d'événements J-1
    // ═══════════════════════════════════════════
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0] // YYYY-MM-DD

    const { data: tomorrowEvents } = await supabase
      .from('events')
      .select('id, title, event_date, start_time')
      .eq('event_date', tomorrowStr)
      .eq('is_published', true)

    if (tomorrowEvents && tomorrowEvents.length > 0) {
      for (const event of tomorrowEvents) {
        // Get all registered users for this event
        const { data: registrations } = await supabase
          .from('event_registrations')
          .select('user_id')
          .eq('event_id', event.id)
          .eq('status', 'registered')

        if (!registrations || registrations.length === 0) continue

        // Check if reminder already sent today for this event
        const { data: alreadySent } = await supabase
          .from('crm_campaign_events')
          .select('id')
          .eq('event_type', `event_reminder_${event.id}`)
          .gte('created_at', new Date().toISOString().split('T')[0])
          .limit(1)

        if (alreadySent && alreadySent.length > 0) continue

        const eventDate = event.event_date
          ? new Date(event.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
          : 'Demain'
        const eventTime = event.start_time || 'Heure à confirmer'

        for (const reg of registrations) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('prenom, email')
            .eq('id', reg.user_id)
            .single()

          if (profile?.email) {
            const result = await sendTemplateEmail('event_reminder', profile.email, {
              firstName: profile.prenom || 'Membre',
              email: profile.email,
              eventName: event.title || 'Événement SOS Shine',
              eventDate,
              eventTime,
            }, { recipientName: profile.prenom || 'Membre' })

            if (result.success) reminderssSent++
          }
        }

        // Log that reminder was sent for this event
        await supabase.from('crm_campaign_events').insert({
          event_type: `event_reminder_${event.id}`,
          metadata: {
            event_title: event.title,
            registrations_count: registrations.length,
          },
        })
      }
    }

    return NextResponse.json({
      message: 'OK',
      scheduled_emails_sent: emailsSent,
      event_reminders_sent: reminderssSent,
      pending_processed: pendingEmails?.length || 0,
    })
  } catch (err) {
    console.error('Cron emails error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
