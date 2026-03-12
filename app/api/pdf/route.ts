/**
 * SOS Shine — API Route PDF
 *
 * GET /api/pdf?type=invoice&id=...
 * GET /api/pdf?type=affiliation&from=...&to=...
 * GET /api/pdf?type=journal
 * GET /api/pdf?type=certificate&eventId=...
 *
 * Toutes les routes nécessitent une authentification.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateInvoicePDF } from '@/lib/pdf/invoice'
import { generateAffiliationReportPDF } from '@/lib/pdf/affiliation'
import { generateJournalPDF } from '@/lib/pdf/journal'
import { generateCertificatePDF } from '@/lib/pdf/certificate'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const type = searchParams.get('type')

  try {
    switch (type) {
      case 'invoice':
        return await handleInvoice(supabase, user.id, searchParams)
      case 'affiliation':
        return await handleAffiliation(supabase, user.id, searchParams)
      case 'journal':
        return await handleJournal(supabase, user.id, searchParams)
      case 'certificate':
        return await handleCertificate(supabase, user.id, searchParams)
      default:
        return NextResponse.json(
          { error: 'Type de PDF invalide. Types disponibles : invoice, affiliation, journal, certificate' },
          { status: 400 }
        )
    }
  } catch (err) {
    console.error('[PDF API]', err)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du PDF' },
      { status: 500 }
    )
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pdfResponse(pdfBytes: Uint8Array, filename: string): NextResponse {
  return new NextResponse(pdfBytes as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(pdfBytes.length),
    },
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = Awaited<ReturnType<typeof createClient>>

// ─── Invoice ─────────────────────────────────────────────────────────────────

async function handleInvoice(
  supabase: SupabaseClient,
  userId: string,
  params: URLSearchParams
): Promise<NextResponse> {
  // Récupérer le profil et l'abonnement
  const { data: profile } = await supabase
    .from('profiles')
    .select('prenom, email')
    .eq('id', userId)
    .single()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!profile || !subscription) {
    return NextResponse.json({ error: 'Données insuffisantes' }, { status: 404 })
  }

  const planPrices: Record<string, number> = {
    essentiel: 19.99,
    premium: 39.99,
    diamant: 69.99,
  }

  const price = planPrices[subscription.plan] || 0
  const now = new Date()
  const invoiceNum = `SOS-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${userId.slice(0, 6).toUpperCase()}`

  const pdfBytes = await generateInvoicePDF({
    invoiceNumber: invoiceNum,
    date: now,
    status: subscription.status === 'active' ? 'paid' : 'pending',
    customer: {
      name: profile.prenom || profile.email,
      email: profile.email,
    },
    items: [
      {
        description: `Abonnement SOS Shine — ${subscription.plan}`,
        plan: subscription.plan,
        period: subscription.current_period_end
          ? `Jusqu'au ${new Date(subscription.current_period_end).toLocaleDateString('fr-FR')}`
          : undefined,
        quantity: 1,
        unitPrice: price,
        total: price,
      },
    ],
    subtotal: price,
    tax: price * 0.2,
    taxRate: 20,
    total: price * 1.2,
    paymentMethod: 'Carte bancaire (Stripe)',
    stripeInvoiceId: subscription.stripe_subscription_id || undefined,
  })

  return pdfResponse(pdfBytes, `facture-${invoiceNum}.pdf`)
}

// ─── Affiliation ─────────────────────────────────────────────────────────────

async function handleAffiliation(
  supabase: SupabaseClient,
  userId: string,
  params: URLSearchParams
): Promise<NextResponse> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('prenom, email')
    .eq('id', userId)
    .single()

  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!profile || !affiliate) {
    return NextResponse.json({ error: 'Compte affilié non trouvé' }, { status: 404 })
  }

  // Période
  const fromParam = params.get('from')
  const toParam = params.get('to')
  const to = toParam ? new Date(toParam) : new Date()
  const from = fromParam ? new Date(fromParam) : new Date(to.getFullYear(), to.getMonth() - 1, 1)

  // Clics
  const { count: totalClicks } = await supabase
    .from('affiliate_clicks')
    .select('*', { count: 'exact', head: true })
    .eq('affiliate_id', affiliate.id)
    .gte('created_at', from.toISOString())
    .lte('created_at', to.toISOString())

  // Conversions
  const { data: conversions } = await supabase
    .from('affiliate_conversions')
    .select('*')
    .eq('affiliate_id', affiliate.id)
    .gte('created_at', from.toISOString())
    .lte('created_at', to.toISOString())
    .order('created_at', { ascending: false })

  // Retraits
  const { data: withdrawals } = await supabase
    .from('withdrawal_requests')
    .select('*')
    .eq('affiliate_id', affiliate.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const convList = conversions || []
  const totalEarnings = convList.reduce((sum, c) => sum + (c.commission_amount || 0), 0)
  const paidEarnings = convList
    .filter((c) => c.status === 'paid')
    .reduce((sum, c) => sum + (c.commission_amount || 0), 0)

  const tierMap: Record<string, 'bronze' | 'silver' | 'gold' | 'diamond'> = {
    bronze: 'bronze',
    silver: 'silver',
    gold: 'gold',
    diamond: 'diamond',
  }
  const rateMap: Record<string, number> = { bronze: 10, silver: 15, gold: 20, diamond: 25 }

  const tier = tierMap[affiliate.current_tier] || 'bronze'

  const pdfBytes = await generateAffiliationReportPDF({
    affiliate: {
      name: profile.prenom || profile.email,
      email: profile.email,
      referralCode: affiliate.referral_code,
      tier,
      commissionRate: rateMap[tier],
    },
    period: { from, to },
    summary: {
      totalClicks: totalClicks || 0,
      totalConversions: convList.length,
      totalEarnings,
      pendingEarnings: totalEarnings - paidEarnings,
      paidEarnings,
      conversionRate: (totalClicks || 0) > 0 ? (convList.length / (totalClicks || 1)) * 100 : 0,
    },
    conversions: convList.map((c) => {
      const statusMap: Record<string, 'pending' | 'confirmed' | 'paid'> = {
        pending: 'pending',
        confirmed: 'confirmed',
        paid: 'paid',
        cancelled: 'pending',
      }
      return {
        date: c.created_at,
        memberName: c.referred_user_id?.slice(0, 8) || 'Membre',
        type: c.conversion_type || 'subscription',
        plan: c.plan || 'essentiel',
        amount: c.amount || 0,
        commission: c.commission_amount || 0,
        status: statusMap[c.status] || 'pending',
      }
    }),
    withdrawals: (withdrawals || []).map((w) => ({
      date: w.created_at,
      amount: w.amount,
      method: w.payment_method === 'bank_transfer' ? 'iban' : 'paypal',
      status: w.status || 'pending',
    })),
  })

  return pdfResponse(pdfBytes, `rapport-affiliation-${from.toISOString().slice(0, 7)}.pdf`)
}

// ─── Journal ─────────────────────────────────────────────────────────────────

async function handleJournal(
  supabase: SupabaseClient,
  userId: string,
  params: URLSearchParams
): Promise<NextResponse> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('prenom, email')
    .eq('id', userId)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 })
  }

  // Le journal est stocké en localStorage côté client.
  // Les entrées sont envoyées dans le body via POST (voir route POST ci-dessous).
  // Pour GET, on retourne une erreur indiquant d'utiliser POST.
  return NextResponse.json(
    { error: 'Utilisez POST /api/pdf avec type=journal et les entrées dans le body' },
    { status: 400 }
  )
}

// ─── Certificate ─────────────────────────────────────────────────────────────

async function handleCertificate(
  supabase: SupabaseClient,
  userId: string,
  params: URLSearchParams
): Promise<NextResponse> {
  const eventId = params.get('eventId')
  const certType = params.get('certType') || 'event'

  const { data: profile } = await supabase
    .from('profiles')
    .select('prenom, email')
    .eq('id', userId)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 })
  }

  if (certType === 'event' && eventId) {
    // Vérifier l'inscription
    const { data: registration } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .single()

    if (!registration) {
      return NextResponse.json({ error: 'Inscription non trouvée' }, { status: 404 })
    }

    // Récupérer l'événement
    const { data: event } = await supabase
      .from('events')
      .select('title, event_date, event_type')
      .eq('id', eventId)
      .single()

    const pdfBytes = await generateCertificatePDF({
      type: 'event',
      recipientName: profile.prenom || profile.email,
      title: event?.title || 'Événement SOS Shine',
      description: `A participé à l'événement "${event?.title}" organisé par SOS Shine.`,
      date: event?.event_date || new Date().toISOString(),
      eventType: event?.event_type,
      certificateId: `CERT-${eventId?.slice(0, 8).toUpperCase()}`,
    })

    return pdfResponse(pdfBytes, `certificat-${event?.title?.toLowerCase().replace(/\s+/g, '-') || 'event'}.pdf`)
  }

  // Certificat de signature émotionnelle
  if (certType === 'signature') {
    const signatureType = params.get('signatureType') || 'Cristallin'

    const pdfBytes = await generateCertificatePDF({
      type: 'signature',
      recipientName: profile.prenom || profile.email,
      title: `Signature Émotionnelle : ${signatureType}`,
      description: `A découvert sa Signature Émotionnelle "${signatureType}" grâce au quiz SOS Shine.`,
      date: new Date(),
      certificateId: `SIG-${userId.slice(0, 8).toUpperCase()}`,
    })

    return pdfResponse(pdfBytes, `certificat-signature-${signatureType.toLowerCase()}.pdf`)
  }

  return NextResponse.json({ error: 'Paramètres manquants (eventId ou certType)' }, { status: 400 })
}

// ─── POST route pour le journal (données côté client) ────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await request.json()
  const type = body.type

  if (type === 'journal') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('prenom, email')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 })
    }

    const entries = body.entries || []

    if (entries.length === 0) {
      return NextResponse.json({ error: 'Aucune entrée de journal fournie' }, { status: 400 })
    }

    const pdfBytes = await generateJournalPDF({
      memberName: profile.prenom || profile.email,
      exportDate: new Date(),
      entries,
    })

    return pdfResponse(pdfBytes, `journal-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  return NextResponse.json({ error: 'Type invalide pour POST' }, { status: 400 })
}
