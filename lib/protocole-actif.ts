// ═══════════════════════════════════════════════════════════════
// Le protocole actif d'un membre — une seule réponse, partout.
//
// Le tableau de bord et « Mon parcours guidé » désignaient deux protocoles
// différents : le premier lisait user_goals (l'objectif coché à l'inscription),
// le second quiz_v2_responses (la signature émotionnelle), et aucun des deux ne
// connaissait l'autre. Cette fonction est désormais la seule source.
//
// Ordre de priorité :
//   1. un lien explicite (?protocol=…) — la personne a cliqué sur ce protocole
//   2. un protocole commencé et pas encore terminé : « continuer mon protocole
//      du jour » ne peut désigner que celui-là. Un quiz passé il y a trois
//      semaines ne prime pas sur un travail en cours.
//   3. sa signature émotionnelle, par identifiant puis par e-mail
//   4. à défaut, l'objectif choisi à l'inscription
//   5. rien : on l'invite à passer la signature émotionnelle, jamais un
//      protocole tiré au hasard.
// ═══════════════════════════════════════════════════════════════

import { calculateMatchScores } from '@/lib/quiz-v2/scoring'

/** Où mener quelqu'un dont on ne sait encore rien. */
export const CHEMIN_SIGNATURE = '/signature-emotionnelle'

export type OrigineProtocole = 'lien' | 'progression' | 'signature' | 'objectif'

export type ProtocoleActif = {
  /** Slug du protocole, ou null si la personne n'a encore rien exprimé. */
  slug: string | null
  /** Ce qui a désigné ce protocole. Null quand slug l'est aussi. */
  origine: OrigineProtocole | null
  /** L'intitulé de l'objectif, seulement quand c'est lui qui a tranché. */
  titreObjectif: string | null
}

const AUCUN: ProtocoleActif = { slug: null, origine: null, titreObjectif: null }

type ReponseQuiz = {
  top_protocol_slug: string | null
  scores: Record<string, number> | null
}

/**
 * Résout le protocole d'un membre.
 *
 * @param supabase  client Supabase (navigateur)
 * @param slugLien  slug passé dans l'URL, s'il y en a un
 * @param slugRepli slug mémorisé avant l'inscription (sessionStorage) : il ne
 *                  sert qu'après la base, pour ne pas qu'un onglet resté ouvert
 *                  impose un protocole périmé.
 */
export async function resoudreProtocoleActif(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  slugLien?: string | null,
  slugRepli?: string | null,
): Promise<ProtocoleActif> {
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: douleurs }, { data: protocoles }] = await Promise.all([
    supabase.from('douleurs').select('id, slug').eq('is_published', true),
    supabase.from('protocols').select('slug, dimension_weights').eq('status', 'available'),
  ])

  const parDouleur = new Map<string, string>(
    (douleurs || []).map((d: { id: string; slug: string }) => [d.id, d.slug]),
  )
  const publiés = new Set<string>(parDouleur.values())
  const accessible = (slug?: string | null): slug is string => !!slug && publiés.has(slug)

  /** Le protocole dont les poids collent le mieux à la signature. */
  function meilleurSelonScores(scores: Record<string, number>): string | null {
    const liste = (protocoles || []) as { slug: string; dimension_weights: Record<string, number> }[]
    const meilleur = liste
      .filter(p => accessible(p.slug))
      .map(p => ({ slug: p.slug, score: calculateMatchScores(scores, p.dimension_weights) }))
      .sort((a, b) => b.score - a.score)[0]
    return meilleur?.slug ?? null
  }

  // 1. Un lien explicite l'emporte : la personne vient de cliquer dessus.
  if (accessible(slugLien)) {
    return { slug: slugLien, origine: 'lien', titreObjectif: null }
  }

  // 2. Un protocole commencé et pas terminé. C'est le plus fort des signaux :
  //    la personne y a déjà posé des étapes. Le tableau de bord renvoyait vers
  //    la signature émotionnelle alors qu'un protocole était en cours.
  if (user?.id) {
    const { data: avancement } = await supabase
      .from('user_progress')
      .select('douleur_id, completed_at, updated_at')
      .eq('user_id', user.id)
      .is('completed_at', null)
      .order('updated_at', { ascending: false })
      // Départage deux protocoles touchés dans la même seconde : sans cela
      // l'ordre change d'un chargement à l'autre, et le protocole affiché avec.
      .order('douleur_id', { ascending: true })
      .limit(20)

    for (const ligne of (avancement || []) as { douleur_id: string }[]) {
      const slug = parDouleur.get(ligne.douleur_id)
      if (slug) return { slug, origine: 'progression', titreObjectif: null }
    }
  }

  // 3. La signature émotionnelle — par identifiant, puis par e-mail (le quiz
  //    peut avoir été passé avant l'inscription).
  function lireSignature(reponse: ReponseQuiz | undefined): string | null {
    if (!reponse) return null
    if (accessible(reponse.top_protocol_slug)) return reponse.top_protocol_slug
    return reponse.scores ? meilleurSelonScores(reponse.scores) : null
  }

  for (const filtre of [
    user?.id ? { colonne: 'user_id', valeur: user.id } : null,
    user?.email ? { colonne: 'email', valeur: user.email } : null,
  ]) {
    if (!filtre) continue
    const { data } = await supabase
      .from('quiz_v2_responses')
      .select('top_protocol_slug, scores')
      .eq(filtre.colonne, filtre.valeur)
      .order('created_at', { ascending: false })
      .limit(1)
    const slug = lireSignature((data || [])[0] as ReponseQuiz | undefined)
    if (slug) return { slug, origine: 'signature', titreObjectif: null }
  }

  // 4. À défaut, l'objectif choisi à l'inscription. On départage les objectifs
  //    cochés d'un même geste par leur identifiant : sinon l'ordre change d'un
  //    chargement à l'autre, et le protocole affiché avec.
  if (user?.id) {
    const { data: objectifs } = await supabase
      .from('user_goals')
      .select('id, title, recommended_slug')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .not('recommended_slug', 'is', null)
      .order('created_at', { ascending: false })
      .order('id', { ascending: true })
      .limit(10)

    const retenu = ((objectifs || []) as { id: string; title: string; recommended_slug: string }[])
      .find(o => accessible(o.recommended_slug))
    if (retenu) {
      return { slug: retenu.recommended_slug, origine: 'objectif', titreObjectif: retenu.title }
    }
  }

  // 5. Le slug mémorisé avant l'inscription, s'il vaut encore quelque chose.
  if (accessible(slugRepli)) {
    return { slug: slugRepli, origine: 'signature', titreObjectif: null }
  }

  return AUCUN
}
