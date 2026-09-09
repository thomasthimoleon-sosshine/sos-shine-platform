import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/crm/supabase-admin'
import { getResendClient } from '@/lib/crm/resend'
import { verifyAdminAccess } from '@/lib/crm/auth'

export async function POST(request: Request) {
  try {
    if (!await verifyAdminAccess()) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ error: 'Config missing' }, { status: 500 })

    const { campaignId } = await request.json()
    if (!campaignId) return NextResponse.json({ error: 'Campaign ID requis' }, { status: 400 })

    const { data: campaign, error: campErr } = await supabase
      .from('crm_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campErr || !campaign) {
      return NextResponse.json({ error: 'Campagne introuvable' }, { status: 404 })
    }

    if (campaign.status === 'sent') {
      return NextResponse.json({ error: 'Campagne déjà envoyée' }, { status: 400 })
    }

    let contactsQuery = supabase
      .from('crm_contacts')
      .select('id, email, first_name')

    if (campaign.segment && campaign.segment !== 'all') {
      contactsQuery = contactsQuery.eq('source', campaign.segment)
    }

    const { data: contacts, error: contactsErr } = await contactsQuery
    if (contactsErr) throw contactsErr

    if (!contacts || contacts.length === 0) {
      return NextResponse.json({ error: 'Aucun contact à envoyer' }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
      || (process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}` : null)
      || 'https://sosshine.com'

    const { client: resend, fromEmail } = await getResendClient()

    let sentCount = 0
    const batchSize = 50
    for (let i = 0; i < contacts.length; i += batchSize) {
      const batch = contacts.slice(i, i + batchSize)

      for (const contact of batch) {
        try {
          const personalizedHtml = campaign.html_content
            .replace(/\{firstName\}/g, contact.first_name || 'Membre')
            .replace(/\{email\}/g, contact.email)

          const trackingPixel = `<img src="${siteUrl}/api/crm/track/open?cid=${campaignId}&uid=${contact.id}" width="1" height="1" style="display:none" />`

          const wrappedHtml = wrapLinks(personalizedHtml, siteUrl, campaignId, contact.id)

          const finalHtml = wrappedHtml + trackingPixel

          const { error: sendErr } = await resend.emails.send({
            from: `SOS Shine® <${fromEmail}>`,
            to: contact.email,
            subject: campaign.subject.replace(/\{firstName\}/g, contact.first_name || 'Membre'),
            html: finalHtml,
          })

          if (!sendErr) {
            sentCount++
            await supabase.from('crm_campaign_events').insert({
              campaign_id: campaignId,
              contact_id: contact.id,
              event_type: 'sent',
              metadata: {},
            })
          }
        } catch (e) {
          console.error(`Failed to send to ${contact.email}:`, e)
        }
      }
    }

    await supabase
      .from('crm_campaigns')
      .update({ status: 'sent', sent_count: sentCount, sent_at: new Date().toISOString() })
      .eq('id', campaignId)

    return NextResponse.json({ message: 'sent', sentCount })
  } catch (err) {
    console.error('CRM send error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

function wrapLinks(html: string, siteUrl: string, campaignId: string, contactId: string): string {
  return html.replace(
    /href="(https?:\/\/[^"]+)"/g,
    (match, url) => {
      const encoded = encodeURIComponent(url)
      return `href="${siteUrl}/api/crm/track/click?cid=${campaignId}&uid=${contactId}&url=${encoded}"`
    }
  )
}
