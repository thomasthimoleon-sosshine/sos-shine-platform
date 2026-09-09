/**
 *  GET /api/compte/export
 *
 *  Droit d'accès et portabilité (RGPD art. 15 et 20). Rien ne permettait
 *  jusqu'ici à un membre d'obtenir ses données : ni bouton, ni route, ni
 *  procédure décrite.
 *
 *  Renvoie un fichier JSON, format lisible par une machine comme le demande
 *  l'article 20, et lisible par un humain qui l'ouvre dans un éditeur.
 *
 *  L'identité vient de la session : on n'exporte que ses propres données.
 */

import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  TABLES_PAR_USER_ID,
  TABLES_PAR_EMAIL,
  TABLES_MESSAGES,
} from '@/lib/compte/donnees-personnelles'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await createServerClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch {
    return NextResponse.json({ error: 'Export indisponible pour le moment' }, { status: 503 })
  }

  const email = (user.email || '').toLowerCase()
  const donnees: Record<string, unknown> = {}
  const absentes: string[] = []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = admin as any

  const { data: profil } = await db.from('profiles').select('*').eq('id', user.id).maybeSingle()
  donnees.profil = profil ?? null
  donnees.compte = {
    id: user.id,
    email: user.email,
    cree_le: user.created_at,
    derniere_connexion: user.last_sign_in_at,
  }

  for (const table of TABLES_PAR_USER_ID) {
    const { data, error } = await db.from(table).select('*').eq('user_id', user.id)
    if (error) { absentes.push(table); continue }
    if (data && data.length) donnees[table] = data
  }

  if (email) {
    for (const table of TABLES_PAR_EMAIL) {
      const { data, error } = await db.from(table).select('*').ilike('email', email)
      if (error) { absentes.push(table); continue }
      if (data && data.length) {
        // Une même table peut avoir été remplie par l'identifiant ET par
        // l'adresse : on fusionne sans doublon.
        const deja = (donnees[table] as { id?: string }[]) || []
        const vus = new Set(deja.map(l => l.id))
        donnees[table] = [...deja, ...data.filter((l: { id?: string }) => !vus.has(l.id))]
      }
    }
  }

  for (const { table, colonnes } of TABLES_MESSAGES) {
    const lignes: unknown[] = []
    for (const colonne of colonnes) {
      const { data, error } = await db.from(table).select('*').eq(colonne, user.id)
      if (error) { absentes.push(table); break }
      if (data) lignes.push(...data)
    }
    if (lignes.length) donnees[table] = lignes
  }

  const enveloppe = {
    _a_propos: {
      description: "Export de vos données personnelles détenues par SOS Shine.",
      genere_le: new Date().toISOString(),
      droits:
        "Vous pouvez demander la rectification ou l'effacement de ces données. " +
        "La suppression de votre compte est disponible depuis « Mon compte ».",
      contact: 'julialaureau@sosshine.com',
      note_tables_absentes: absentes.length
        ? "Certaines catégories n'existent pas dans cette installation : " + [...new Set(absentes)].join(', ')
        : undefined,
    },
    ...donnees,
  }

  const nom = `sos-shine-donnees-${new Date().toISOString().slice(0, 10)}.json`
  return new NextResponse(JSON.stringify(enveloppe, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="${nom}"`,
      'cache-control': 'no-store',
    },
  })
}
