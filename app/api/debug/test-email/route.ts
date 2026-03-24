// =============================================
// SOS SHINE® — Diagnostic d'envoi d'email
// GET /api/debug/test-email?to=votre@email.com
// =============================================

import { NextRequest, NextResponse } from 'next/server'
import { getResendClient } from '@/lib/crm/resend'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const to = req.nextUrl.searchParams.get('to')
  if (!to) {
    return NextResponse.json({ error: 'Ajoutez ?to=votre@email.com' }, { status: 400 })
  }

  const results: Record<string, unknown> = {}

  // 1. Check env vars
  results.env = {
    RESEND_API_KEY: process.env.RESEND_API_KEY ? `✅ défini (${process.env.RESEND_API_KEY.slice(0, 8)}...)` : '❌ manquant',
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || '❌ manquant',
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ défini' : '❌ manquant',
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ défini' : '❌ manquant',
    CRON_SECRET: process.env.CRON_SECRET ? '✅ défini' : '⚠️ manquant (emails programmés non sécurisés)',
  }

  // 2. Check Supabase tables
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && key) {
    const supabase = createClient(url, key)

    const { error: tmplErr } = await supabase
      .from('email_templates')
      .select('template_key')
      .limit(1)
    results.table_email_templates = tmplErr ? `❌ ${tmplErr.message}` : '✅ existe'

    const { data: tmplCount } = await supabase
      .from('email_templates')
      .select('template_key', { count: 'exact', head: true })
    results.templates_count = tmplCount ? '✅' : '⚠️ 0 templates - lancez /api/crm/email-templates/seed'

    const { error: schedErr } = await supabase
      .from('scheduled_emails')
      .select('id')
      .limit(1)
    results.table_scheduled_emails = schedErr ? `❌ ${schedErr.message}` : '✅ existe'

    // Count pending scheduled emails
    const { count: pendingCount } = await supabase
      .from('scheduled_emails')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
    results.pending_scheduled_emails = pendingCount ?? 0
  } else {
    results.supabase = '❌ non configuré'
  }

  // 3. Try sending a test email
  try {
    const { client: resend, fromEmail } = await getResendClient()

    const { data, error } = await resend.emails.send({
      from: `SOS Shine® Test <${fromEmail}>`,
      to,
      subject: '✅ Test email SOS Shine - Diagnostic',
      html: `
        <div style="font-family:sans-serif;padding:20px;">
          <h2 style="color:#D4AF37;">Test réussi !</h2>
          <p>Si vous lisez ceci, l'envoi d'email fonctionne correctement.</p>
          <p><strong>From:</strong> ${fromEmail}</p>
          <p><strong>To:</strong> ${to}</p>
          <p><strong>Date:</strong> ${new Date().toISOString()}</p>
        </div>
      `,
    })

    if (error) {
      results.send_test = {
        status: '❌ ÉCHEC',
        error: error,
        conseil: error.message?.includes('not a verified')
          ? '→ Vous devez vérifier le domaine sosshine.com dans Resend (resend.com/domains)'
          : error.message?.includes('API key')
          ? '→ La clé API Resend est invalide'
          : '→ Vérifiez les logs pour plus de détails',
      }
    } else {
      results.send_test = {
        status: '✅ ENVOYÉ',
        resend_id: data?.id,
        from: fromEmail,
        to,
      }
    }
  } catch (err: any) {
    results.send_test = {
      status: '❌ ERREUR',
      error: err.message || String(err),
    }
  }

  return NextResponse.json(results, { status: 200 })
}
