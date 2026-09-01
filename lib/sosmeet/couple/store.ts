/**
 * SOS Meet Couple, accès à la base, côté serveur uniquement.
 * Toutes les tables sont en RLS fermée : on passe par le client admin, après
 * avoir authentifié la personne. Ce fichier centralise les garde-fous pour
 * qu'aucune route ne puisse les contourner par inadvertance.
 */
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { STATUS_RANK, type CoupleStatus } from './types'

export type CoupleRow = {
  id: string
  invite_code: string
  invite_expires: string
  partner_a: string
  partner_b: string | null
  status: CoupleStatus
  safety_flag: string | null
  created_at: string
}

export async function currentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export function admin() {
  return createAdminClient()
}

/** Le duo non archivé de cette personne, quel que soit son côté. */
export async function coupleOf(userId: string): Promise<CoupleRow | null> {
  const db = admin()
  if (!db) return null
  const { data } = await (db as any)
    .from('sosmeet_couples')
    .select('*')
    .or(`partner_a.eq.${userId},partner_b.eq.${userId}`)
    .neq('status', 'ARCHIVE')
    .maybeSingle()
  return (data as CoupleRow) || null
}

/** De quel côté du duo se trouve cette personne. */
export function sideOf(couple: CoupleRow, userId: string): 'a' | 'b' | null {
  if (couple.partner_a === userId) return 'a'
  if (couple.partner_b === userId) return 'b'
  return null
}

/**
 * Avance le statut. Un statut ne recule jamais tout seul : seule l'équipe
 * peut le faire, via la route admin, et c'est tracé.
 */
export async function advanceStatus(coupleId: string, from: CoupleStatus, to: CoupleStatus) {
  const db = admin()
  if (!db) return
  if (STATUS_RANK[to] <= STATUS_RANK[from]) return
  await (db as any).from('sosmeet_couples')
    .update({ status: to, updated_at: new Date().toISOString() })
    .eq('id', coupleId)
}

/** Journal de traçabilité. Toute action d'équipe y passe (invariant I3). */
export async function audit(coupleId: string, actorId: string | null, action: string,
                            target?: string, detail?: Record<string, unknown>) {
  const db = admin()
  if (!db) return
  try {
    await (db as any).from('sosmeet_couple_audit')
      .insert({ couple_id: coupleId, actor_id: actorId, action, target: target || null, detail: detail || null })
  } catch { /* le journal ne doit jamais bloquer une action utilisateur */ }
}

/**
 * L'état d'avancement des DEUX partenaires, sans jamais exposer la moindre
 * réponse. C'est tout ce qu'une personne a le droit de savoir de l'autre.
 */
export async function progressOf(coupleId: string) {
  const db = admin()
  if (!db) return []
  const { data } = await (db as any)
    .from('sosmeet_couple_answers')
    .select('user_id, sealed_at, answers')
    .eq('couple_id', coupleId)
  return ((data || []) as Array<{ user_id: string; sealed_at: string | null; answers: Record<string, number> }>)
    .map(r => ({
      userId: r.user_id,
      sealed: !!r.sealed_at,
      answered: Object.keys(r.answers || {}).length,
    }))
}
