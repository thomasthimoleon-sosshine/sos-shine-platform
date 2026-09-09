#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// TEST : Simuler l'inscription complète d'un utilisateur
// - Création du compte dans Supabase (Auth + Profile)
// - Envoi du mail de bienvenue avec identifiants
// - Aucun passage par Stripe = aucun débit
// ═══════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import crypto from 'crypto'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

// ── Config ──
const TEST_USER = {
  prenom: process.argv[2] || 'Stras',
  email: process.argv[3] || '',
  plan: 'essential',
}

if (!TEST_USER.email) {
  console.error('❌ Usage: node scripts/test-signup-flow.mjs <prenom> <email>')
  console.error('   Exemple: node scripts/test-signup-flow.mjs Stras stras@example.com')
  process.exit(1)
}

// ── Clients ──
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const resendApiKey = process.env.RESEND_API_KEY
const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@sosshine.com'
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sosshine.com'

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase non configuré (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)')
  process.exit(1)
}
if (!resendApiKey) {
  console.error('❌ Resend non configuré (RESEND_API_KEY)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const resend = new Resend(resendApiKey)

console.log('═══════════════════════════════════════════')
console.log('  SOS SHINE — Test inscription complète')
console.log('═══════════════════════════════════════════')
console.log(`  Prénom : ${TEST_USER.prenom}`)
console.log(`  Email  : ${TEST_USER.email}`)
console.log(`  Plan   : ${TEST_USER.plan}`)
console.log('═══════════════════════════════════════════\n')

let userId = null

try {
  // ═══ ÉTAPE 1 : Vérifier si le profil existe déjà ═══
  console.log('📋 Étape 1/4 — Vérification du profil existant...')
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, email, prenom, plan')
    .eq('email', TEST_USER.email)
    .maybeSingle()

  if (existingProfile) {
    console.log(`   ⚠️  Profil existant trouvé : ${existingProfile.id}`)
    console.log(`   → Prénom: ${existingProfile.prenom}, Plan: ${existingProfile.plan}`)
    console.log('   → On continue avec ce profil (pas de double création)\n')
    userId = existingProfile.id
  } else {
    console.log('   ✅ Aucun profil existant — on crée un nouveau compte\n')
  }

  // ═══ ÉTAPE 2 : Créer le compte Auth + Profil ═══
  let tempPassword = null
  let isNewUser = false

  if (!userId) {
    console.log('🔐 Étape 2/4 — Création du compte Supabase...')
    tempPassword = crypto.randomBytes(8).toString('base64url')

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: TEST_USER.email,
      password: tempPassword,
      email_confirm: true,
    })

    if (authError) {
      console.error('   ❌ Erreur création Auth:', authError.message)
      process.exit(1)
    }

    userId = authUser.user.id
    isNewUser = true
    console.log(`   ✅ Compte Auth créé : ${userId}`)
    console.log(`   🔑 Mot de passe temporaire : ${tempPassword}`)

    // Créer le profil
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      email: TEST_USER.email,
      prenom: TEST_USER.prenom,
      role: 'member',
      plan: TEST_USER.plan,
      is_active: true,
      created_at: new Date().toISOString(),
    }, { onConflict: 'id' })

    if (profileError) {
      console.error('   ❌ Erreur création profil:', profileError.message)
    } else {
      console.log('   ✅ Profil créé dans la table profiles\n')
    }
  } else {
    console.log('🔐 Étape 2/4 — Compte existant, pas de création\n')
    tempPassword = crypto.randomBytes(8).toString('base64url')
    isNewUser = false
  }

  // ═══ ÉTAPE 3 : Créer l'abonnement (sans Stripe) ═══
  console.log('💳 Étape 3/4 — Création abonnement en base (simulation, pas de Stripe)...')

  const periodEnd = new Date()
  periodEnd.setMonth(periodEnd.getMonth() + 1)

  const { error: subError } = await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: 'test_cus_stras_simulation',
    stripe_subscription_id: 'test_sub_stras_simulation',
    plan: TEST_USER.plan,
    status: 'active',
    current_period_end: periodEnd.toISOString(),
    cancel_at_period_end: false,
    trial_end: null,
    waitlist_discount: false,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })

  if (subError) {
    console.error('   ⚠️  Erreur abonnement:', subError.message)
    console.log('   (La table subscriptions a peut-être une structure différente)')
  } else {
    console.log('   ✅ Abonnement "essential" créé (expire dans 1 mois)\n')
  }

  // ═══ ÉTAPE 4 : Envoyer l'email de bienvenue ═══
  console.log('📧 Étape 4/4 — Envoi de l\'email de bienvenue...')

  const loginUrl = `${siteUrl}/login`
  const resetUrl = `${siteUrl}/forgot-password`
  const planName = 'Essentielle'

  const emailHtml = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#050505;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#E0E0E0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#050505;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:28px;font-weight:300;letter-spacing:0.15em;color:#D4AF37;font-family:Georgia,'Times New Roman',serif;">
                SOS SHINE<span style="font-size:14px;vertical-align:super;">&reg;</span>
              </span>
            </td>
          </tr>
          <tr>
            <td style="background:#0A0A0A;border:1px solid #1a1a1a;border-radius:16px;padding:40px 32px;">
              <h2 style="color:#D4AF37;font-family:Georgia,'Times New Roman',serif;font-weight:300;font-size:24px;margin:0 0 24px;">
                Bienvenue dans SOS Shine, ${TEST_USER.prenom} !
              </h2>
              <p style="color:#E0E0E0;font-size:15px;line-height:1.7;margin:0 0 16px;">
                Votre compte <strong>SOS Shine</strong> a &eacute;t&eacute; cr&eacute;&eacute; avec succ&egrave;s
                avec l'offre <strong style="color:#D4AF37;">${planName}</strong>.
              </p>
              ${isNewUser && tempPassword ? `
              <div style="background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.2);border-radius:12px;padding:24px;margin:24px 0;">
                <p style="color:#D4AF37;font-size:13px;text-transform:uppercase;letter-spacing:0.15em;margin:0 0 12px;font-weight:600;">
                  Vos identifiants de connexion
                </p>
                <p style="color:#E0E0E0;font-size:15px;margin:0 0 8px;">
                  <strong>Email :</strong> ${TEST_USER.email}
                </p>
                <p style="color:#E0E0E0;font-size:15px;margin:0;">
                  <strong>Mot de passe temporaire :</strong>
                  <code style="background:rgba(255,255,255,0.08);padding:3px 8px;border-radius:4px;font-size:16px;letter-spacing:0.05em;">${tempPassword}</code>
                </p>
              </div>
              <p style="color:#E0E0E0;font-size:15px;line-height:1.7;margin:0 0 24px;">
                Connectez-vous et changez votre mot de passe d&egrave;s que possible.
              </p>
              ` : `
              <p style="color:#E0E0E0;font-size:15px;line-height:1.7;margin:0 0 24px;">
                Votre abonnement est maintenant actif. Connectez-vous pour acc&eacute;der &agrave; votre espace.
              </p>
              `}
              <div style="text-align:center;margin:32px 0;">
                <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#D4AF37,#B8960F);color:#050505;padding:14px 40px;border-radius:50px;text-decoration:none;font-weight:600;font-size:15px;">
                  Se connecter
                </a>
              </div>
              <p style="color:#999;font-size:13px;line-height:1.6;margin:24px 0 0;text-align:center;">
                Vous pouvez aussi <a href="${resetUrl}" style="color:#D4AF37;text-decoration:underline;">cr&eacute;er un nouveau mot de passe</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:32px;color:#666;font-size:12px;line-height:1.6;">
              <p style="margin:0;">SOS Shine&reg; &middot; hello@sosshine.com</p>
              <p style="margin:4px 0 0;">La premi&egrave;re encyclop&eacute;die mondiale du bien-&ecirc;tre &eacute;motionnel</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const { data: emailResult, error: emailError } = await resend.emails.send({
    from: `SOS Shine <${fromEmail}>`,
    to: [TEST_USER.email],
    subject: `Bienvenue sur SOS Shine — Vos identifiants de connexion`,
    html: emailHtml,
  })

  if (emailError) {
    console.error('   ❌ Erreur envoi email:', emailError.message || JSON.stringify(emailError))
  } else {
    console.log(`   ✅ Email envoyé avec succès ! (ID: ${emailResult?.id})`)
  }

  // ═══ RÉSUMÉ ═══
  console.log('\n═══════════════════════════════════════════')
  console.log('  RÉSUMÉ DU TEST')
  console.log('═══════════════════════════════════════════')
  console.log(`  ✅ Compte Supabase  : ${isNewUser ? 'CRÉÉ' : 'EXISTANT'}`)
  console.log(`  ✅ Profil           : ${TEST_USER.prenom} (${TEST_USER.email})`)
  console.log(`  ✅ Abonnement       : ${TEST_USER.plan} (simulé)`)
  console.log(`  ✅ Email envoyé     : ${emailError ? 'NON ❌' : 'OUI'}`)
  console.log(`  ✅ User ID          : ${userId}`)
  if (isNewUser && tempPassword) {
    console.log(`  🔑 Mot de passe     : ${tempPassword}`)
  }
  console.log(`  💳 Stripe           : NON (simulation, aucun débit)`)
  console.log('═══════════════════════════════════════════')
  console.log('\n⚠️  Pour supprimer ce compte test après :')
  console.log(`   → Supabase Dashboard > Authentication > Users > ${TEST_USER.email} > Delete`)
  console.log(`   → Ou relancez avec --cleanup (à implémenter)`)

} catch (err) {
  console.error('\n❌ Erreur inattendue:', err)
  process.exit(1)
}
