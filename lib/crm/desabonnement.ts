/**
 *  DÉSABONNEMENT DES E-MAILS
 *  ─────────────────────────
 *
 *  Tous les e-mails portaient un lien « Se désinscrire » vers
 *  /api/unsubscribe. Cette route n'existait pas : le destinataire tombait sur
 *  une page introuvable. Et aucun envoi ne consultait de statut de
 *  désabonnement — les colonnes prévues pour ça n'étaient ni lues ni écrites.
 *
 *  Autrement dit : personne ne pouvait arrêter les envois.
 *
 *  Ce fichier tient les deux bouts — écrire le désabonnement, et le lire
 *  avant chaque envoi — pour que les deux ne puissent plus diverger.
 */

import { createAdminClient } from '@/lib/supabase/admin'

function normaliser(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * Enregistre le désabonnement partout où l'adresse peut être sollicitée :
 * la fiche CRM, la newsletter, et les séquences en cours.
 *
 * Renvoie `false` si rien n'a pu être écrit — l'appelant doit alors le dire
 * à la personne plutôt que d'afficher une confirmation mensongère.
 */
export async function marquerDesabonne(email: string): Promise<boolean> {
  const adresse = normaliser(email)
  if (!adresse || !adresse.includes('@')) return false

  // Ces tables ne sont pas décrites dans les types générés : on relâche la
  // vérification ici plutôt que d'inventer un typage qui mentirait.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let supabase: any
  try {
    supabase = createAdminClient()
  } catch {
    return false
  }

  let auMoinsUn = false

  // Chaque table est traitée séparément : l'absence de l'une (migration non
  // passée) ne doit pas empêcher les autres d'enregistrer le refus.
  const { error: e1 } = await supabase
    .from('crm_contacts')
    .update({ unsubscribed: true })
    .ilike('email', adresse)
  if (!e1) auMoinsUn = true

  const { error: e2 } = await supabase
    .from('newsletter_weekly_subscribers')
    .update({ unsubscribed_at: new Date().toISOString() })
    .ilike('email', adresse)
  if (!e2) auMoinsUn = true

  // Sortir des séquences en cours : sans cela, les e-mails déjà programmés
  // continueraient de partir.
  const { error: e3 } = await supabase
    .from('crm_sequence_enrollments')
    .update({ status: 'unsubscribed' })
    .ilike('email', adresse)
    .eq('status', 'active')
  if (!e3) auMoinsUn = true

  return auMoinsUn
}

/**
 * Vrai si l'adresse a demandé à ne plus rien recevoir.
 *
 * En cas de panne de la base, on répond `false` : mieux vaut un e-mail de
 * trop qu'une séquence entièrement bloquée par un incident réseau. Le refus
 * lui-même, lui, est durablement enregistré en base.
 */
export async function estDesabonne(email: string): Promise<boolean> {
  const adresse = normaliser(email)
  if (!adresse) return false

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase: any = createAdminClient()
    const { data } = await supabase
      .from('crm_contacts')
      .select('unsubscribed')
      .ilike('email', adresse)
      .limit(1)
    if (data && data.length > 0 && (data[0] as { unsubscribed?: boolean }).unsubscribed) return true

    const { data: news } = await supabase
      .from('newsletter_weekly_subscribers')
      .select('unsubscribed_at')
      .ilike('email', adresse)
      .limit(1)
    if (news && news.length > 0 && (news[0] as { unsubscribed_at?: string | null }).unsubscribed_at) return true

    return false
  } catch {
    return false
  }
}
