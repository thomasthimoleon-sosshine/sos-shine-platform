import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/crm/supabase-admin'
import { getResendClient } from '@/lib/crm/resend'

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

    const { data: campaigns, error } = await supabase
      .from('crm_campaigns')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_at', now)

    if (error) throw error
    if (!campaigns || campaigns.length === 0) {
      return NextResponse.json({ message: 'Aucune campagne à envoyer', processed: 0 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
      || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null)
      || 'https://sosshine.com'

    const { client: resend, fromEmail } = await getResendClient()
    let totalSent = 0

    for (const campaign of campaigns) {
      let contactsQuery = supabase
        .from('crm_contacts')
        .select('id, email, first_name')

      if (campaign.segment && campaign.segment !== 'all') {
        contactsQuery = contactsQuery.eq('source', campaign.segment)
      }

      const { data: contacts } = await contactsQuery
      if (!contacts || contacts.length === 0) continue

      let sentCount = 0
      for (const contact of contacts) {
        try {
          const personalizedHtml = campaign.html_content
            .replace(/\{firstName\}/g, contact.first_name || 'Membre')
            .replace(/\{email\}/g, contact.email)

          const trackingPixel = `<img src="${siteUrl}/api/crm/track/open?cid=${campaign.id}&uid=${contact.id}" width="1" height="1" style="display:none" />`

          const wrappedHtml = personalizedHtml.replace(
            /href="(https?:\/\/[^"]+)"/g,
            (_: string, url: string) => {
              const encoded = encodeURIComponent(url)
              return `href="${siteUrl}/api/crm/track/click?cid=${campaign.id}&uid=${contact.id}&url=${encoded}"`
            }
          )

          const { error: sendErr } = await resend.emails.send({
            from: `SOS Shine® <${fromEmail}>`,
            to: contact.email,
            subject: campaign.subject.replace(/\{firstName\}/g, contact.first_name || 'Membre'),
            html: wrappedHtml + trackingPixel,
          })

          if (!sendErr) {
            sentCount++
            await supabase.from('crm_campaign_events').insert({
              campaign_id: campaign.id,
              contact_email: contact.email,
              event_type: 'sent',
              metadata: {},
            })
          }
        } catch (e) {
          console.error(`Cron send failed for ${contact.email}:`, e)
        }
      }

      await supabase
        .from('crm_campaigns')
        .update({ status: 'sent', sent_count: sentCount, sent_at: new Date().toISOString() })
        .eq('id', campaign.id)

      totalSent += sentCount
    }

    return NextResponse.json({ message: 'OK', campaignsProcessed: campaigns.length, totalSent })
  } catch (err) {
    console.error('Cron campaigns error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
