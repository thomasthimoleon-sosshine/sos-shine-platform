import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/crm/supabase-admin'
import { verifyAdminAccess } from '@/lib/crm/auth'
import { getResendClient } from '@/lib/crm/resend'

// GET — Diagnostic complet du système email + automatisations
export async function GET() {
  try {
    if (!await verifyAdminAccess()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ error: 'Config missing' }, { status: 500 })

    const diagnostic: Record<string, unknown> = {}

    // 1. Config
    diagnostic.config = {
      resend_api_key: process.env.RESEND_API_KEY ? 'ok' : 'missing',
      resend_from_email: process.env.RESEND_FROM_EMAIL || 'missing',
      supabase: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'ok' : 'missing',
      cron_secret: process.env.CRON_SECRET ? 'ok' : 'missing',
    }

    // 2. Tables check
    const tables = ['email_templates', 'scheduled_emails', 'crm_sequences', 'crm_sequence_steps', 'crm_sequence_enrollments']
    const tableStatus: Record<string, string> = {}
    for (const t of tables) {
      const { error } = await supabase.from(t).select('id').limit(1)
      tableStatus[t] = error ? `error: ${error.message}` : 'ok'
    }
    diagnostic.tables = tableStatus

    // 3. Templates
    const { count: templatesTotal } = await supabase.from('email_templates').select('*', { count: 'exact', head: true })
    const { count: templatesActive } = await supabase.from('email_templates').select('*', { count: 'exact', head: true }).eq('is_active', true)
    diagnostic.templates = { total: templatesTotal || 0, active: templatesActive || 0 }

    // 4. Scheduled emails stats
    const { count: pendingCount } = await supabase
      .from('scheduled_emails')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
    const { count: sentCount } = await supabase
      .from('scheduled_emails')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sent')
    const { count: failedCount } = await supabase
      .from('scheduled_emails')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed')
    diagnostic.scheduled_emails = {
      pending: pendingCount || 0,
      sent: sentCount || 0,
      failed: failedCount || 0,
    }

    // 5. Recent failed emails (last 10)
    const { data: recentFailed } = await supabase
      .from('scheduled_emails')
      .select('template_key, recipient_email, error_message, scheduled_at')
      .eq('status', 'failed')
      .order('scheduled_at', { ascending: false })
      .limit(10)
    diagnostic.recent_failures = recentFailed || []

    // 6. Sequences stats
    const { data: sequences } = await supabase
      .from('crm_sequences')
      .select('id, name, trigger_type, status')

    const seqStats = []
    for (const seq of (sequences || [])) {
      const { count: activeEnroll } = await supabase
        .from('crm_sequence_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('sequence_id', seq.id)
        .eq('status', 'active')
      const { count: completedEnroll } = await supabase
        .from('crm_sequence_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('sequence_id', seq.id)
        .eq('status', 'completed')
      seqStats.push({
        name: seq.name,
        trigger_type: seq.trigger_type,
        status: seq.status,
        active_enrollments: activeEnroll || 0,
        completed_enrollments: completedEnroll || 0,
      })
    }
    diagnostic.sequences = seqStats

    // 7. Due enrollments (ready to send now)
    const { count: dueCount } = await supabase
      .from('crm_sequence_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .lte('next_send_at', new Date().toISOString())
    diagnostic.due_enrollments = dueCount || 0

    // 8. Recent CRM events
    const { data: recentEvents } = await supabase
      .from('crm_campaign_events')
      .select('event_type, metadata, created_at')
      .order('created_at', { ascending: false })
      .limit(20)
    diagnostic.recent_events = recentEvents || []

    return NextResponse.json(diagnostic)
  } catch (err) {
    console.error('CRM automations diagnostic error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST — Actions: test email, trigger cron, retry failed
export async function POST(request: NextRequest) {
  try {
    if (!await verifyAdminAccess()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

    const { action, email } = await request.json()

    if (action === 'test_email') {
      if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })

      try {
        const { client: resend, fromEmail } = await getResendClient()
        const { data, error } = await resend.emails.send({
          from: `SOS Shine® <${fromEmail}>`,
          to: email,
          subject: 'Test email SOS Shine - Diagnostic CRM',
          html: `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#000000;font-family:sans-serif;color:#E0E0E0;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;">
<tr><td align="center" style="padding:40px 16px;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td align="center" style="padding-bottom:32px;">
<span style="font-size:28px;font-weight:300;letter-spacing:0.15em;color:#C9A961;font-family:Georgia,serif;">SOS SHINE<sup style="font-size:14px;">®</sup></span>
</td></tr>
<tr><td style="background:#0A0A0A;border:1px solid #1a1a1a;border-radius:16px;padding:40px 32px;">
<h2 style="color:#C9A961;margin:0 0 16px;">Test réussi !</h2>
<p style="color:#E0E0E0;line-height:1.6;">Si vous lisez ceci, votre configuration email fonctionne correctement.</p>
<table style="margin:24px 0;width:100%;font-size:14px;color:#a1a1aa;">
<tr><td style="padding:8px 0;border-bottom:1px solid #1a1a1a;"><strong style="color:#E0E0E0;">From</strong></td><td style="padding:8px 0;border-bottom:1px solid #1a1a1a;">${fromEmail}</td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #1a1a1a;"><strong style="color:#E0E0E0;">To</strong></td><td style="padding:8px 0;border-bottom:1px solid #1a1a1a;">${email}</td></tr>
<tr><td style="padding:8px 0;"><strong style="color:#E0E0E0;">Date</strong></td><td style="padding:8px 0;">${new Date().toLocaleString('fr-FR')}</td></tr>
</table>
<p style="color:#50C878;font-weight:600;">Resend API: Connecté</p>
</td></tr>
<tr><td align="center" style="padding-top:24px;color:#666;font-size:12px;">
<p style="margin:0;">Email de test envoyé depuis le CRM SOS Shine®</p>
</td></tr></table></td></tr></table></body></html>`,
        })

        if (error) {
          return NextResponse.json({
            success: false,
            error: 'Erreur serveur',
            conseil: (error as any).message?.includes('not a verified')
              ? 'Le domaine sosshine.com doit être vérifié dans Resend (resend.com/domains). Ajoutez les records DNS SPF, DKIM et DMARC.'
              : (error as any).message?.includes('API key')
              ? 'La clé API Resend est invalide. Vérifiez RESEND_API_KEY dans .env.local.'
              : undefined,
          })
        }

        return NextResponse.json({ success: true, resend_id: data?.id, from: fromEmail, to: email })
      } catch (err: any) {
        return NextResponse.json({ success: false, error: 'Erreur serveur' })
      }
    }

    if (action === 'trigger_cron') {
      // Trigger the cron internally
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
        || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null)
        || 'https://sosshine.com'

      const cronSecret = process.env.CRON_SECRET
      const headers: Record<string, string> = {}
      if (cronSecret) headers['Authorization'] = `Bearer ${cronSecret}`

      const res = await fetch(`${siteUrl}/api/cron/emails`, { headers })
      const data = await res.json()
      return NextResponse.json({ success: res.ok, cron_result: data })
    }

    if (action === 'retry_failed') {
      const supabase = getAdminClient()
      if (!supabase) return NextResponse.json({ error: 'Config missing' }, { status: 500 })

      // Count failed emails first
      const { count } = await supabase
        .from('scheduled_emails')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed')

      // Reset failed emails to pending so cron picks them up
      await supabase
        .from('scheduled_emails')
        .update({ status: 'pending', error_message: null })
        .eq('status', 'failed')

      return NextResponse.json({ success: true, retried: count || 0 })
    }

    return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
  } catch (err) {
    console.error('CRM automations action error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
