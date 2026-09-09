/**
 *  POST /api/compte/supprimer
 *
 *  Droit à l'effacement (RGPD art. 17). Un membre ne disposait d'aucun moyen
 *  de supprimer son compte : ni bouton, ni route, ni procédure. La seule voie
 *  était manuelle, réservée au fondateur, et incomplète — le client Stripe,
 *  les fiches CRM et les réponses de questionnaire y survivaient.
 *
 *  Trois principes tenus ici :
 *
 *  1. On efface AVANT de supprimer le compte d'authentification. L'inverse
 *     laisse des lignes orphelines qu'on ne sait plus rattacher à personne.
 *  2. On efface aussi par ADRESSE, pas seulement par identifiant : les fiches
 *     créées avant l'inscription (questionnaire, prospection) ne portent que
 *     l'adresse, et survivaient donc à toute suppression.
 *  3. L'abonnement Stripe est annulé, mais le client Stripe n'est pas
 *     détruit : les factures émises relèvent d'une obligation comptable de
 *     conservation, que le droit à l'effacement ne lève pas.
 */

import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStripe } from '@/lib/stripe/client'
import {
  TABLES_PAR_USER_ID,
  TABLES_PAR_EMAIL,
  TABLES_MESSAGES,
} from '@/lib/compte/donnees-personnelles'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const session = await createServerClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
  }

  // Confirmation explicite : une suppression déclenchée par une requête
  // isolée serait irréversible et sans recours.
  let confirmation = ''
  try {
    const body = await request.json()
    confirmation = String(body?.confirmation || '')
  } catch { /* corps absent */ }
  if (confirmation.trim().toUpperCase() !== 'SUPPRIMER') {
    return NextResponse.json({ error: 'Confirmation manquante' }, { status: 400 })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch {
    return NextResponse.json({ error: 'Suppression indisponible pour le moment' }, { status: 503 })
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any
  const email = (user.email || '').toLowerCase()

  // ── 1. Annuler l'abonnement en cours ────────────────────────────────────
  try {
    const stripe = getStripe()
    const { data: sub } = await db
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .maybeSingle()
    if (stripe && sub?.stripe_subscription_id) {
      await stripe.subscriptions.cancel(sub.stripe_subscription_id)
    }
  } catch {
    // Un abonnement déjà résilié ou introuvable ne doit pas bloquer
    // l'effacement : le droit prime sur la propreté du dossier Stripe.
  }

  // ── 2. Effacer les fichiers déposés ─────────────────────────────────────
  try {
    for (const dossier of ['avatars', 'voice', 'posts']) {
      const { data: fichiers } = await db.storage.from('uploads').list(`${dossier}/${user.id}`)
      if (fichiers?.length) {
        await db.storage
          .from('uploads')
          .remove(fichiers.map((f: { name: string }) => `${dossier}/${user.id}/${f.name}`))
      }
    }
  } catch { /* espace de stockage indisponible */ }

  // ── 3. Effacer les données, table par table ─────────────────────────────
  const echecs: string[] = []

  for (const table of TABLES_PAR_USER_ID) {
    const { error } = await db.from(table).delete().eq('user_id', user.id)
    if (error && !/does not exist|schema cache/i.test(error.message || '')) echecs.push(table)
  }

  if (email) {
    for (const table of TABLES_PAR_EMAIL) {
      const { error } = await db.from(table).delete().ilike('email', email)
      if (error && !/does not exist|schema cache/i.test(error.message || '')) echecs.push(table)
    }
  }

  for (const { table, colonnes } of TABLES_MESSAGES) {
    for (const colonne of colonnes) {
      const { error } = await db.from(table).delete().eq(colonne, user.id)
      if (error && !/does not exist|schema cache/i.test(error.message || '')) echecs.push(table)
    }
  }

  // Le courrier anonyme est délibérément conservé : il ne porte plus aucune
  // identité, il n'y a donc rien à y effacer — et rien qui permette de le
  // retrouver.

  await db.from('profiles').delete().eq('id', user.id)

  // ── 4. Supprimer le compte d'authentification, en dernier ───────────────
  const { error: erreurAuth } = await db.auth.admin.deleteUser(user.id)
  if (erreurAuth) {
    console.error('[suppression compte] échec auth:', erreurAuth.message, 'tables en échec:', echecs)
    return NextResponse.json(
      {
        error:
          "Vos données ont été effacées mais le compte n'a pas pu être fermé. " +
          'Écrivez-nous à julialaureau@sosshine.com, nous terminons à la main.',
      },
      { status: 500 },
    )
  }

  if (echecs.length) {
    console.warn('[suppression compte] tables non effacées:', [...new Set(echecs)].join(', '))
  }

  await session.auth.signOut()
  return NextResponse.json({ ok: true })
}
