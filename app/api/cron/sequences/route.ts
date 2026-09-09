import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/crm/supabase-admin'
import { getResendClient } from '@/lib/crm/resend'

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    // Garde fermée par défaut. Elle était écrite « si un secret est défini ET
    // que l'en-tête ne correspond pas, refuser » : quand la variable n'était
    // pas définie en production, la condition était fausse et la route
    // s'ouvrait à tout le monde. Un secret absent doit fermer, pas ouvrir.
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ error: 'Config missing' }, { status: 500 })

    const now = new Date().toISOString()

    const { data: enrollments, error } = await supabase
      .from('crm_sequence_enrollments')
      .select('*, crm_sequences(*)')
      .eq('status', 'active')
      .lte('next_send_at', now)

    if (error) throw error
    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({ message: 'Aucun envoi de séquence à traiter', processed: 0 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
      || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null)
      || 'https://sosshine.com'

    const { client: resend, fromEmail } = await getResendClient()
    let processed = 0

    for (const enrollment of enrollments) {
      try {
        const { data: step } = await supabase
          .from('crm_sequence_steps')
          .select('*')
          .eq('sequence_id', enrollment.sequence_id)
          .eq('step_order', enrollment.current_step)
          .single()

        if (!step) {
          await supabase
            .from('crm_sequence_enrollments')
            .update({ status: 'completed' })
            .eq('id', enrollment.id)
          continue
        }

        const personalizedHtml = step.html_content
          .replace(/\{firstName\}/g, enrollment.contact_first_name || 'Membre')
          .replace(/\{email\}/g, enrollment.contact_email)

        const personalizedSubject = step.subject
          .replace(/\{firstName\}/g, enrollment.contact_first_name || 'Membre')

        const { error: sendErr } = await resend.emails.send({
          from: `SOS Shine® <${fromEmail}>`,
          to: enrollment.contact_email,
          subject: personalizedSubject,
          html: personalizedHtml,
        })

        if (!sendErr) {
          processed++

          await supabase.from('crm_campaign_events').insert({
            campaign_id: enrollment.sequence_id,
            contact_email: enrollment.contact_email,
            event_type: 'sequence_sent',
            metadata: { step_order: step.step_order, step_subject: step.subject },
          })

          const { data: nextStep } = await supabase
            .from('crm_sequence_steps')
            .select('step_order, delay_days')
            .eq('sequence_id', enrollment.sequence_id)
            .eq('step_order', enrollment.current_step + 1)
            .single()

          if (nextStep) {
            const nextSendAt = new Date()
            nextSendAt.setDate(nextSendAt.getDate() + nextStep.delay_days)
            await supabase
              .from('crm_sequence_enrollments')
              .update({
                current_step: nextStep.step_order,
                next_send_at: nextSendAt.toISOString(),
              })
              .eq('id', enrollment.id)
          } else {
            await supabase
              .from('crm_sequence_enrollments')
              .update({ status: 'completed' })
              .eq('id', enrollment.id)
          }
        }
      } catch (e) {
        console.error(`Sequence send failed for enrollment ${enrollment.id}:`, e)
      }
    }

    return NextResponse.json({ message: 'OK', processed })
  } catch (err) {
    console.error('Cron sequences error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
