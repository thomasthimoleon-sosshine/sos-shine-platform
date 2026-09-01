// ═══════════════════════════════════════════════════════════════
// Date de parution d'un article de blog.
//
// Les pages publiques ne filtraient que sur is_published : un article
// enregistré avec une date future paraissait immédiatement, seulement trié
// plus haut dans la liste. Programmer un calendrier éditorial était donc
// impossible sans décocher la case à la main chaque semaine.
//
// Désormais, published_at fait le travail : un article daté du 8 décembre
// reste invisible jusqu'au 8 décembre, sans intervention.
// ═══════════════════════════════════════════════════════════════

/** Aujourd'hui au format de la colonne published_at (une date, pas un instant). */
export function aujourdhui(): string {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Restreint une requête aux articles effectivement parus.
 * L'administration, elle, interroge la table sans passer par ici : elle doit
 * voir les articles programmés pour pouvoir les préparer.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parus(requete: any) {
  return requete.eq('is_published', true).lte('published_at', aujourdhui())
}
