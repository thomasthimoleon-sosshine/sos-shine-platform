// ═══════════════════════════════════════════════════════════════
// Accès découverte — offert à l'achat d'un protocole seul (33€)
//
// Acheter un protocole ouvre TOUTE la plateforme pendant 30 jours.
// À l'échéance, l'utilisateur ne conserve que le protocole acheté
// (son déblocage dans protocol_unlocks, lui, est définitif).
// ═══════════════════════════════════════════════════════════════

export const DISCOVERY_ACCESS_DAYS = 30

/** Plan servi pendant la fenêtre découverte : l'accès complet. */
export const DISCOVERY_PLAN = 'serenite'

/** Date de fin de la fenêtre, à poser au moment de l'achat. */
export function discoveryEndsAt(from: Date = new Date()): string {
  const end = new Date(from)
  end.setDate(end.getDate() + DISCOVERY_ACCESS_DAYS)
  return end.toISOString()
}

/** Jours restants (arrondis au jour supérieur), 0 si la fenêtre est fermée. */
export function discoveryDaysLeft(until: string | null | undefined): number {
  if (!until) return 0
  const ms = new Date(until).getTime() - Date.now()
  if (ms <= 0) return 0
  return Math.ceil(ms / (24 * 60 * 60 * 1000))
}

/** Libellé court du temps restant : « 12 jours », « demain », « aujourd'hui ». */
export function discoveryTimeLeftLabel(until: string | null | undefined): string {
  const days = discoveryDaysLeft(until)
  if (days <= 0) return "aujourd'hui"
  if (days === 1) return 'demain'
  return `${days} jours`
}
