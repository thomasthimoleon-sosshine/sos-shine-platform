import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/crm/supabase-admin'

// Domaines autorisés pour les redirections (anti open-redirect)
const ALLOWED_DOMAINS = ['sosshine.com', 'www.sosshine.com', 'sosshine.fr', 'www.sosshine.fr']

function isSafeRedirectUrl(rawUrl: string): boolean {
  try {
    const decoded = decodeURIComponent(rawUrl)
    const parsed = new URL(decoded)
    // Autoriser uniquement HTTPS et les domaines connus
    if (parsed.protocol !== 'https:') return false
    return ALLOWED_DOMAINS.some(d => parsed.hostname === d || parsed.hostname.endsWith(`.${d}`))
  } catch {
    return false
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const campaignId = searchParams.get('cid')
  const contactId = searchParams.get('uid')
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Bloquer les redirections vers des domaines non autorisés
  if (!isSafeRedirectUrl(url)) {
    console.warn('[CRM Track Click] Blocked redirect to untrusted URL:', url)
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (campaignId && contactId) {
    try {
      const supabase = getAdminClient()
      if (supabase) {
        await supabase.from('crm_campaign_events').insert({
          campaign_id: campaignId,
          contact_id: contactId,
          event_type: 'click',
          metadata: { url: decodeURIComponent(url) },
        })

        const { data } = await supabase
          .from('crm_campaigns')
          .select('click_count')
          .eq('id', campaignId)
          .single()

        if (data) {
          await supabase
            .from('crm_campaigns')
            .update({ click_count: (data.click_count || 0) + 1 })
            .eq('id', campaignId)
        }
      }
    } catch (e) {
      console.error('Track click error:', e)
    }
  }

  return NextResponse.redirect(decodeURIComponent(url))
}
