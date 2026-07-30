// =============================================
// SOS SHINE® - Service d'emails automatiques
// 23 templates éditables depuis le BackOffice
// =============================================

import { getResendClient } from '@/lib/crm/resend'
import { withTrackingPixel } from '@/lib/crm/tracking-pixel'
import { createClient } from '@supabase/supabase-js'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null)
    || 'https://sosshine.com'
}

// ============================================================
// Wrapping HTML en layout SOS Shine
// ============================================================

export function wrapInEmailLayout(bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#000000;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#E0E0E0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <img src="https://sosshine.com/images/logo-shine.png" alt="SOS Shine" width="140" style="display:block;margin:0 auto;" />
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="background:#000000;border:1px solid #1a1a1a;border-radius:16px;padding:40px 32px;">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:32px;color:#666;font-size:12px;line-height:1.6;">
              <p style="margin:0;">SOS Shine® · hello@sosshine.com</p>
              <p style="margin:4px 0 0;">La première encyclopédie mondiale du bien-être émotionnel</p>
              <p style="margin:12px 0 0;"><a href="${getSiteUrl()}/unsubscribe" style="color:#C9A961;text-decoration:underline;">Se désinscrire</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ============================================================
// Rendu des variables dans un template
// ============================================================

export function renderTemplate(html: string, variables: Record<string, string>): string {
  let rendered = html
  for (const [key, value] of Object.entries(variables)) {
    // Support both {{ variable }} and {variable} formats
    rendered = rendered.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), value)
    rendered = rendered.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
  }
  return rendered
}

// ============================================================
// Envoi immédiat d'un email template
// ============================================================

export async function sendTemplateEmail(
  templateKey: string,
  recipientEmail: string,
  variables: Record<string, string>,
  options?: { recipientName?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getAdminClient()
    if (!supabase) return { success: false, error: 'Database not configured' }

    // Fetch template from DB
    const { data: template, error: fetchErr } = await supabase
      .from('email_templates')
      .select('*')
      .eq('template_key', templateKey)
      .eq('is_active', true)
      .single()

    if (fetchErr || !template) {
      console.error(`Template ${templateKey} not found or inactive:`, fetchErr)
      return { success: false, error: `Template ${templateKey} not found` }
    }

    // Add default variables
    const allVars: Record<string, string> = {
      site_url: getSiteUrl(),
      current_year: new Date().getFullYear().toString(),
      ...variables,
    }

    const subject = renderTemplate(template.subject, allVars)
    const bodyHtml = renderTemplate(template.html_content, allVars)
    const fullHtml = withTrackingPixel(wrapInEmailLayout(bodyHtml), recipientEmail, templateKey)

    const { client: resend, fromEmail } = await getResendClient()
    const { error: sendErr } = await resend.emails.send({
      from: `SOS Shine® <${fromEmail}>`,
      to: recipientEmail,
      subject,
      html: fullHtml,
    })

    if (sendErr) {
      console.error(`Failed to send ${templateKey} to ${recipientEmail}:`, sendErr)
      return { success: false, error: String(sendErr) }
    }

    // Log in CRM events
    try {
      await supabase.from('crm_campaign_events').insert({
        campaign_id: null,
        contact_id: null,
        event_type: `auto_email_${templateKey}`,
        metadata: {
          template_key: templateKey,
          recipient: recipientEmail,
          recipient_name: options?.recipientName,
          sent_at: new Date().toISOString(),
        },
      })
    } catch {}

    return { success: true }
  } catch (err) {
    console.error(`sendTemplateEmail error for ${templateKey}:`, err)
    return { success: false, error: String(err) }
  }
}

// ============================================================
// Programmer un email différé
// ============================================================

export async function scheduleEmail(
  templateKey: string,
  recipientEmail: string,
  variables: Record<string, string>,
  delayDays: number,
  options?: { recipientName?: string; metadata?: Record<string, unknown> }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getAdminClient()
    if (!supabase) return { success: false, error: 'Database not configured' }

    const scheduledAt = new Date()
    scheduledAt.setDate(scheduledAt.getDate() + delayDays)

    // Check if already scheduled (avoid duplicates)
    const { data: existing } = await supabase
      .from('scheduled_emails')
      .select('id')
      .eq('template_key', templateKey)
      .eq('recipient_email', recipientEmail)
      .eq('status', 'pending')
      .maybeSingle()

    if (existing) {
      return { success: true } // Already scheduled
    }

    const { error } = await supabase.from('scheduled_emails').insert({
      template_key: templateKey,
      recipient_email: recipientEmail,
      recipient_name: options?.recipientName || null,
      variables,
      scheduled_at: scheduledAt.toISOString(),
      metadata: options?.metadata || {},
    })

    if (error) {
      console.error(`Failed to schedule ${templateKey}:`, error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

// ============================================================
// Annuler des emails programmés (ex: si l'utilisateur s'abonne)
// ============================================================

export async function cancelScheduledEmails(
  recipientEmail: string,
  templateKeys?: string[]
): Promise<void> {
  try {
    const supabase = getAdminClient()
    if (!supabase) return

    let query = supabase
      .from('scheduled_emails')
      .update({ status: 'cancelled' })
      .eq('recipient_email', recipientEmail)
      .eq('status', 'pending')

    if (templateKeys && templateKeys.length > 0) {
      query = query.in('template_key', templateKeys)
    }

    await query
  } catch {}
}

// ============================================================
// Plan name helpers
// ============================================================

export function getPlanDisplayName(plan: string): string {
  switch (plan) {
    case 'essential': return 'Essentielle (ancien)'
    case 'serenite': return 'SOS Shine'
    case 'premium': return 'Premium'
    default: return plan
  }
}

export function getPlanAmount(plan: string): string {
  switch (plan) {
    case 'essential': return '9,90€ (ancien tarif)'
    case 'serenite': return '29,90€'
    case 'premium': return '99,90€'
    default: return plan
  }
}

// ============================================================
// Envoi d'un email brut (HTML custom, sans template DB)
// ============================================================

export async function sendRawEmail(
  recipientEmail: string,
  subject: string,
  bodyHtml: string,
  options?: { recipientName?: string; eventType?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const fullHtml = withTrackingPixel(wrapInEmailLayout(bodyHtml), recipientEmail, options?.eventType || 'raw')
    const { client: resend, fromEmail } = await getResendClient()

    const { error: sendErr } = await resend.emails.send({
      from: `SOS Shine® <${fromEmail}>`,
      to: recipientEmail,
      subject,
      html: fullHtml,
    })

    if (sendErr) {
      console.error(`Failed to send raw email to ${recipientEmail}:`, sendErr)
      return { success: false, error: String(sendErr) }
    }

    // Log in CRM events
    try {
      const supabase = getAdminClient()
      if (supabase) {
        await supabase.from('crm_campaign_events').insert({
          campaign_id: null,
          contact_id: null,
          event_type: options?.eventType || 'auto_email_raw',
          metadata: {
            recipient: recipientEmail,
            recipient_name: options?.recipientName,
            sent_at: new Date().toISOString(),
          },
        })
      }
    } catch {}

    return { success: true }
  } catch (err) {
    console.error(`sendRawEmail error:`, err)
    return { success: false, error: String(err) }
  }
}
