import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendTemplateEmail, sendRawEmail, wrapInEmailLayout, renderTemplate } from '@/lib/email-templates/automated-emails'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

// Ce cron doit être appelé toutes les 15 minutes
// Il traite :
// 1. Les emails programmés (scheduled_emails) dont l'heure est passée
// 2. Les séquences CRM (crm_sequence_enrollments) — étapes à envoyer
// 3. Les rappels d'événements J-1
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || process.env.BOT_SECRET
    const isVercelCron = request.headers.get('x-vercel-cron') === '1'
    if (!isVercelCron && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ error: 'Config missing' }, { status: 500 })

    const now = new Date().toISOString()
    let scheduledEmailsSent = 0
    let sequenceEmailsSent = 0
    let remindersSent = 0
    const errors: string[] = []

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
            scheduledEmailsSent++
          } else {
            await supabase
              .from('scheduled_emails')
              .update({ status: 'failed', error_message: result.error || 'Unknown error' })
              .eq('id', scheduled.id)
            errors.push(`scheduled:${scheduled.template_key}→${scheduled.recipient_email}: ${result.error}`)
          }
        } catch (err) {
          await supabase
            .from('scheduled_emails')
            .update({ status: 'failed', error_message: String(err) })
            .eq('id', scheduled.id)
          errors.push(`scheduled:${scheduled.template_key}: ${String(err)}`)
        }
      }
    }

    // ═══════════════════════════════════════════
    // 2. Traiter les séquences CRM (enrollments)
    // ═══════════════════════════════════════════
    const { data: dueEnrollments } = await supabase
      .from('crm_sequence_enrollments')
      .select('*')
      .eq('status', 'active')
      .lte('next_send_at', now)
      .order('next_send_at')
      .limit(50)

    if (dueEnrollments && dueEnrollments.length > 0) {
      for (const enrollment of dueEnrollments) {
        try {
          // Fetch the current step
          const { data: step } = await supabase
            .from('crm_sequence_steps')
            .select('*')
            .eq('sequence_id', enrollment.sequence_id)
            .eq('step_order', enrollment.current_step)
            .single()

          if (!step) {
            // No more steps → mark completed
            await supabase
              .from('crm_sequence_enrollments')
              .update({ status: 'completed' })
              .eq('id', enrollment.id)
            continue
          }

          // Check sequence is still active
          const { data: sequence } = await supabase
            .from('crm_sequences')
            .select('status, name')
            .eq('id', enrollment.sequence_id)
            .single()

          if (!sequence || sequence.status !== 'active') {
            continue // Sequence paused/archived, skip
          }

          // Render and send the email
          const variables: Record<string, string> = {
            firstName: enrollment.contact_first_name || 'Membre',
            email: enrollment.contact_email,
            site_url: process.env.NEXT_PUBLIC_SITE_URL || 'https://sosshine.com',
            current_year: new Date().getFullYear().toString(),
          }

          const subject = renderTemplate(step.subject, variables)
          const bodyHtml = renderTemplate(step.html_content, variables)

          const result = await sendRawEmail(
            enrollment.contact_email,
            subject,
            bodyHtml,
            { recipientName: enrollment.contact_first_name || undefined }
          )

          if (result.success) {
            sequenceEmailsSent++

            // Log CRM event
            try {
              await supabase.from('crm_campaign_events').insert({
                campaign_id: null,
                contact_id: null,
                event_type: 'sequence_sent',
                metadata: {
                  sequence_id: enrollment.sequence_id,
                  sequence_name: sequence.name,
                  step_order: enrollment.current_step,
                  recipient: enrollment.contact_email,
                  subject,
                  sent_at: new Date().toISOString(),
                },
              })
            } catch {}

            // Advance to next step
            const nextStepOrder = enrollment.current_step + 1
            const { data: nextStep } = await supabase
              .from('crm_sequence_steps')
              .select('step_order, delay_days')
              .eq('sequence_id', enrollment.sequence_id)
              .eq('step_order', nextStepOrder)
              .single()

            if (nextStep) {
              const nextSendAt = new Date()
              nextSendAt.setDate(nextSendAt.getDate() + nextStep.delay_days)
              await supabase
                .from('crm_sequence_enrollments')
                .update({
                  current_step: nextStepOrder,
                  next_send_at: nextSendAt.toISOString(),
                })
                .eq('id', enrollment.id)
            } else {
              // No more steps → completed
              await supabase
                .from('crm_sequence_enrollments')
                .update({ status: 'completed' })
                .eq('id', enrollment.id)
            }
          } else {
            errors.push(`sequence:${sequence.name}→${enrollment.contact_email}: ${result.error}`)
          }
        } catch (err) {
          errors.push(`sequence_enrollment:${enrollment.id}: ${String(err)}`)
        }
      }
    }

    // ═══════════════════════════════════════════
    // 3. Rappels d'événements J-1
    // ═══════════════════════════════════════════
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    const { data: tomorrowEvents } = await supabase
      .from('events')
      .select('id, title, event_date, start_time')
      .eq('event_date', tomorrowStr)
      .eq('is_published', true)

    if (tomorrowEvents && tomorrowEvents.length > 0) {
      for (const event of tomorrowEvents) {
        const { data: registrations } = await supabase
          .from('event_registrations')
          .select('user_id')
          .eq('event_id', event.id)
          .eq('status', 'registered')

        if (!registrations || registrations.length === 0) continue

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

            if (result.success) remindersSent++
          }
        }

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
      scheduled_emails_sent: scheduledEmailsSent,
      sequence_emails_sent: sequenceEmailsSent,
      event_reminders_sent: remindersSent,
      pending_processed: pendingEmails?.length || 0,
      enrollments_processed: dueEnrollments?.length || 0,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (err) {
    console.error('Cron emails error:', err)
    return NextResponse.json({ error: 'Erreur serveur', details: String(err) }, { status: 500 })
  }
}
