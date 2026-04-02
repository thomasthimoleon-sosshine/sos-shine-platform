import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/crm/supabase-admin'
import { getResendClient } from '@/lib/crm/resend'

const GRACE_PERIOD_DAYS = 7
const REMINDER_INTERVALS_DAYS = [0, 3, 7] // immédiat, +3j, +7j

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sosshine.com'

export async function GET(request: Request) {
  try {
    // Vérifier l'auth du cron (Vercel Cron ou appel manuel avec secret)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || process.env.BOT_SECRET
    const isVercelCron = request.headers.get('x-vercel-cron') === '1'
    if (!isVercelCron && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabase = getAdminClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Config missing' }, { status: 500 })
    }

    const now = new Date()
    const results = {
      expired_blocked: 0,
      reminders_sent: 0,
      grace_periods_started: 0,
      grace_periods_ended: 0,
      reactivated: 0,
      errors: [] as string[],
    }

    // ─── 0. Détecter les essais gratuits expirés (trial_end dépassé) ───
    const { data: expiredTrials } = await supabase
      .from('subscriptions')
      .select('id, user_id, plan, status, trial_end, profiles(prenom, email)')
      .eq('status', 'trialing')
      .not('trial_end', 'is', null)
      .lt('trial_end', now.toISOString())

    if (expiredTrials && expiredTrials.length > 0) {
      for (const trial of expiredTrials) {
        try {
          // Mettre à jour le statut : l'essai est terminé, vérifier si le paiement a été capturé
          // Si Stripe n'a pas converti automatiquement en 'active', on passe en past_due
          const graceEnd = new Date(now)
          graceEnd.setDate(graceEnd.getDate() + GRACE_PERIOD_DAYS)

          await supabase.from('subscriptions').update({
            status: 'past_due',
            payment_failed_at: now.toISOString(),
            grace_period_end: graceEnd.toISOString(),
            reminder_sent_count: 0,
            updated_at: now.toISOString(),
          }).eq('id', trial.id)

          await supabase.from('subscription_payment_logs').insert({
            user_id: trial.user_id,
            subscription_id: trial.id,
            event_type: 'trial_expired',
            plan: trial.plan,
            metadata: { trial_end: trial.trial_end },
          })

          results.grace_periods_started++

          const profile = (trial as Record<string, unknown>).profiles as { prenom: string; email: string } | null
          if (profile?.email) {
            await sendReminder(supabase, trial, profile, 'payment_failed_1', now)
            results.reminders_sent++
          }
        } catch (e) {
          results.errors.push(`Expired trial ${trial.id}: ${(e as Error).message}`)
        }
      }
    }

    // ─── 1. Détecter les abonnements expirés (current_period_end dépassé) ───
    const { data: expiredSubs } = await supabase
      .from('subscriptions')
      .select('id, user_id, plan, status, current_period_end, grace_period_end, profiles(prenom, email)')
      .in('status', ['active', 'trialing'])
      .lt('current_period_end', now.toISOString())

    if (expiredSubs && expiredSubs.length > 0) {
      for (const sub of expiredSubs) {
        try {
          // Démarrer la période de grâce
          const graceEnd = new Date(now)
          graceEnd.setDate(graceEnd.getDate() + GRACE_PERIOD_DAYS)

          await supabase.from('subscriptions').update({
            status: 'past_due',
            payment_failed_at: now.toISOString(),
            grace_period_end: graceEnd.toISOString(),
            reminder_sent_count: 0,
            updated_at: now.toISOString(),
          }).eq('id', sub.id)

          // Log
          await supabase.from('subscription_payment_logs').insert({
            user_id: sub.user_id,
            subscription_id: sub.id,
            event_type: 'grace_period_started',
            plan: sub.plan,
            metadata: { grace_period_end: graceEnd.toISOString() },
          })

          results.grace_periods_started++

          // Envoyer le 1er rappel
          const profile = (sub as Record<string, unknown>).profiles as { prenom: string; email: string } | null
          if (profile?.email) {
            await sendReminder(supabase, sub, profile, 'payment_failed_1', now)
            results.reminders_sent++
          }
        } catch (e) {
          results.errors.push(`Expired sub ${sub.id}: ${(e as Error).message}`)
        }
      }
    }

    // ─── 2. Envoyer les rappels pour les past_due ───
    const { data: pastDueSubs } = await supabase
      .from('subscriptions')
      .select('id, user_id, plan, status, payment_failed_at, reminder_sent_count, last_reminder_sent_at, grace_period_end, profiles(prenom, email)')
      .eq('status', 'past_due')
      .not('grace_period_end', 'is', null)

    if (pastDueSubs && pastDueSubs.length > 0) {
      for (const sub of pastDueSubs) {
        try {
          const profile = (sub as Record<string, unknown>).profiles as { prenom: string; email: string } | null
          if (!profile?.email) continue

          const reminderCount = sub.reminder_sent_count || 0
          const paymentFailedAt = new Date(sub.payment_failed_at!)

          // Vérifier si on doit envoyer le prochain rappel
          if (reminderCount < REMINDER_INTERVALS_DAYS.length) {
            const nextReminderDay = REMINDER_INTERVALS_DAYS[reminderCount]
            const nextReminderDate = new Date(paymentFailedAt)
            nextReminderDate.setDate(nextReminderDate.getDate() + nextReminderDay)

            if (now >= nextReminderDate) {
              const lastSent = sub.last_reminder_sent_at ? new Date(sub.last_reminder_sent_at) : null
              // Ne pas renvoyer si déjà envoyé aujourd'hui
              if (!lastSent || (now.getTime() - lastSent.getTime()) > 12 * 60 * 60 * 1000) {
                const reminderType = `payment_failed_${reminderCount + 1}` as 'payment_failed_1' | 'payment_failed_2' | 'payment_failed_3'
                await sendReminder(supabase, sub, profile, reminderType, now)
                results.reminders_sent++
              }
            }
          }

          // ─── 3. Fin de période de grâce → bloquer l'accès ───
          if (sub.grace_period_end && new Date(sub.grace_period_end) < now) {
            await supabase.from('subscriptions').update({
              status: 'canceled',
              updated_at: now.toISOString(),
            }).eq('id', sub.id)

            await supabase.from('profiles').update({
              is_active: false,
              plan: null,
            }).eq('id', sub.user_id)

            await supabase.from('subscription_payment_logs').insert({
              user_id: sub.user_id,
              subscription_id: sub.id,
              event_type: 'access_blocked',
              plan: sub.plan,
              metadata: { reason: 'grace_period_ended' },
            })

            // Email final
            await sendReminder(supabase, sub, profile, 'access_blocked', now)

            results.grace_periods_ended++
            results.expired_blocked++
          }
        } catch (e) {
          results.errors.push(`Past due sub ${sub.id}: ${(e as Error).message}`)
        }
      }
    }

    // ─── 4. Rappel "abonnement expire bientôt" (3 jours avant) ───
    const threeDaysFromNow = new Date(now)
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

    const { data: expiringSubs } = await supabase
      .from('subscriptions')
      .select('id, user_id, plan, current_period_end, cancel_at_period_end, profiles(prenom, email)')
      .eq('status', 'active')
      .eq('cancel_at_period_end', true)
      .lt('current_period_end', threeDaysFromNow.toISOString())
      .gt('current_period_end', now.toISOString())

    if (expiringSubs && expiringSubs.length > 0) {
      for (const sub of expiringSubs) {
        try {
          const profile = (sub as Record<string, unknown>).profiles as { prenom: string; email: string } | null
          if (!profile?.email) continue

          // Vérifier qu'on n'a pas déjà envoyé ce rappel
          const { data: existing } = await supabase
            .from('subscription_reminders')
            .select('id')
            .eq('user_id', sub.user_id)
            .eq('reminder_type', 'expiring_soon')
            .gt('created_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
            .limit(1)

          if (!existing || existing.length === 0) {
            await sendReminder(supabase, sub, profile, 'expiring_soon', now)
            results.reminders_sent++
          }
        } catch (e) {
          results.errors.push(`Expiring sub ${sub.id}: ${(e as Error).message}`)
        }
      }
    }

    return NextResponse.json({
      message: 'Cron abonnements terminé',
      timestamp: now.toISOString(),
      ...results,
    })
  } catch (err) {
    console.error('Cron subscriptions error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// ─── Envoi d'email de rappel ───
async function sendReminder(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sub: any,
  profile: { prenom: string; email: string },
  reminderType: string,
  now: Date,
) {
  const emailContent = getEmailContent(reminderType, profile.prenom, sub.plan, sub.grace_period_end)

  let emailSent = false
  let emailError: string | null = null

  try {
    const { client: resend, fromEmail } = await getResendClient()

    const { error } = await resend.emails.send({
      from: `SOS Shine® <${fromEmail}>`,
      to: profile.email,
      subject: emailContent.subject,
      html: emailContent.html,
    })

    if (error) {
      emailError = JSON.stringify(error)
    } else {
      emailSent = true
    }
  } catch (e) {
    emailError = (e as Error).message
  }

  // Enregistrer le rappel
  await supabase.from('subscription_reminders').insert({
    user_id: sub.user_id,
    subscription_id: sub.id,
    reminder_type: reminderType,
    email_sent: emailSent,
    email_sent_at: emailSent ? now.toISOString() : null,
    email_error: emailError,
  })

  // Mettre à jour le compteur de rappels
  if (reminderType.startsWith('payment_failed_')) {
    await supabase.from('subscriptions').update({
      reminder_sent_count: (sub.reminder_sent_count || 0) + 1,
      last_reminder_sent_at: now.toISOString(),
    }).eq('id', sub.id)
  }

  // Log
  await supabase.from('subscription_payment_logs').insert({
    user_id: sub.user_id,
    subscription_id: sub.id,
    event_type: 'reminder_sent',
    plan: sub.plan,
    metadata: { reminder_type: reminderType, email_sent: emailSent, email_error: emailError },
  })
}

// ─── Templates d'emails ───
function getEmailContent(
  reminderType: string,
  prenom: string,
  plan: string,
  graceEnd: string | null,
) {
  const name = prenom || 'Membre'
  const planLabel = plan === 'premium' ? 'Premium' : plan === 'serenite' ? 'Sérénité' : 'Essentielle'
  const graceEndFormatted = graceEnd
    ? new Date(graceEnd).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  const baseStyle = `
    font-family: 'DM Sans', Arial, sans-serif;
    background: #0A0A0A;
    color: #E8E0D0;
    padding: 40px 20px;
  `
  const cardStyle = `
    max-width: 560px;
    margin: 0 auto;
    background: #141414;
    border: 1px solid rgba(212,175,55,0.15);
    border-radius: 16px;
    padding: 40px;
  `
  const buttonStyle = `
    display: inline-block;
    padding: 14px 32px;
    background: linear-gradient(135deg, #D4AF37, #B8960F);
    color: #050505;
    text-decoration: none;
    border-radius: 50px;
    font-weight: 600;
    font-size: 14px;
    margin-top: 24px;
  `

  const templates: Record<string, { subject: string; html: string }> = {
    payment_failed_1: {
      subject: `⚠️ ${name}, votre paiement SOS Shine n'a pas abouti`,
      html: `<div style="${baseStyle}"><div style="${cardStyle}">
        <h1 style="color: #D4AF37; font-size: 24px; margin-bottom: 16px;">Paiement non abouti</h1>
        <p>Bonjour ${name},</p>
        <p>Nous n'avons pas pu traiter le paiement de votre abonnement <strong>${planLabel}</strong>.</p>
        <p>Pas de panique ! Vous avez <strong>7 jours</strong> pour mettre à jour vos informations de paiement et conserver votre accès à la plateforme.</p>
        <p style="color: #9A9080; font-size: 13px;">Date limite : ${graceEndFormatted}</p>
        <a href="${SITE_URL}/compte-inactif" style="${buttonStyle}">Mettre à jour mon paiement</a>
        <p style="color: #9A9080; font-size: 12px; margin-top: 32px;">Si vous avez des questions, contactez-nous à julialaureau@sosshine.com</p>
      </div></div>`,
    },
    payment_failed_2: {
      subject: `🔔 Rappel : mettez à jour votre paiement SOS Shine`,
      html: `<div style="${baseStyle}"><div style="${cardStyle}">
        <h1 style="color: #E17055; font-size: 24px; margin-bottom: 16px;">Rappel de paiement</h1>
        <p>Bonjour ${name},</p>
        <p>Votre paiement pour l'abonnement <strong>${planLabel}</strong> est toujours en attente.</p>
        <p>Il vous reste quelques jours pour régulariser votre situation avant la suspension de votre accès.</p>
        <p style="color: #E17055; font-size: 13px; font-weight: 600;">Date limite : ${graceEndFormatted}</p>
        <a href="${SITE_URL}/compte-inactif" style="${buttonStyle}">Régulariser maintenant</a>
      </div></div>`,
    },
    payment_failed_3: {
      subject: `🚨 Dernier rappel avant suspension — SOS Shine`,
      html: `<div style="${baseStyle}"><div style="${cardStyle}">
        <h1 style="color: #ef4444; font-size: 24px; margin-bottom: 16px;">Dernier rappel</h1>
        <p>Bonjour ${name},</p>
        <p>Ceci est notre <strong>dernier rappel</strong> concernant votre abonnement <strong>${planLabel}</strong>.</p>
        <p>Si nous ne recevons pas votre paiement d'ici le <strong>${graceEndFormatted}</strong>, votre accès à la plateforme sera suspendu.</p>
        <p>Vous pourrez toujours vous réabonner à tout moment.</p>
        <a href="${SITE_URL}/compte-inactif" style="${buttonStyle}">Mettre à jour mon paiement</a>
      </div></div>`,
    },
    expiring_soon: {
      subject: `💎 Votre abonnement SOS Shine expire bientôt`,
      html: `<div style="${baseStyle}"><div style="${cardStyle}">
        <h1 style="color: #D4AF37; font-size: 24px; margin-bottom: 16px;">Abonnement bientôt terminé</h1>
        <p>Bonjour ${name},</p>
        <p>Votre abonnement <strong>${planLabel}</strong> arrive à son terme dans quelques jours.</p>
        <p>Si vous souhaitez continuer à profiter de la communauté SOS Shine, pensez à renouveler votre abonnement.</p>
        <a href="${SITE_URL}/rejoindre" style="${buttonStyle}">Renouveler mon abonnement</a>
        <p style="color: #9A9080; font-size: 12px; margin-top: 32px;">Vous nous manquerez si vous partez. N'hésitez pas à nous écrire.</p>
      </div></div>`,
    },
    access_blocked: {
      subject: `🔒 Votre accès SOS Shine a été suspendu`,
      html: `<div style="${baseStyle}"><div style="${cardStyle}">
        <h1 style="color: #ef4444; font-size: 24px; margin-bottom: 16px;">Accès suspendu</h1>
        <p>Bonjour ${name},</p>
        <p>La période de grâce pour votre abonnement <strong>${planLabel}</strong> a expiré et votre accès a été suspendu.</p>
        <p>Votre contenu et vos connexions sont sauvegardés. Vous pouvez vous réabonner à tout moment pour retrouver l'accès.</p>
        <a href="${SITE_URL}/rejoindre" style="${buttonStyle}">Se réabonner</a>
        <p style="color: #9A9080; font-size: 12px; margin-top: 32px;">Des questions ? julialaureau@sosshine.com</p>
      </div></div>`,
    },
  }

  return templates[reminderType] || templates.payment_failed_1
}
