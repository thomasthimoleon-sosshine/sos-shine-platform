import Link from 'next/link'

/**
 *  MENTION LÉGALE DU TUNNEL D'ACHAT
 *  ────────────────────────────────
 *
 *  Les trois points d'entrée du paiement — /rejoindre, les tarifs de l'espace
 *  membre, le choix d'un protocole — ne comportaient aucun lien vers les CGV.
 *
 *  Et les CGV affirmaient que le client « consent expressément » à
 *  l'exécution immédiate et « renonce » à son droit de rétractation, alors
 *  que rien, nulle part, ne recueillait ni n'affichait ce consentement. Sans
 *  lui, la dérogation de l'article L221-28 tombe et le délai de quatorze
 *  jours reste ouvert sur chaque vente.
 *
 *  Un seul texte pour les trois écrans : trois copies auraient divergé.
 */
export default function MentionAchat({ recurrent = true }: { recurrent?: boolean }) {
  return (
    <p className="mt-4 text-[11px] leading-relaxed text-center" style={{ color: 'var(--text-muted)' }}>
      {recurrent && 'Sans engagement, résiliable à tout moment depuis votre espace. '}
      En validant, vous demandez l&apos;accès immédiat à la plateforme et acceptez de
      renoncer, de ce fait, à votre droit de rétractation de 14 jours sur les contenus
      déjà mis à disposition.{' '}
      <Link href="/cgv" className="gold-underline" style={{ color: 'var(--text-secondary)' }}>
        Conditions générales
      </Link>
      {' · '}
      <Link href="/confidentialite" className="gold-underline" style={{ color: 'var(--text-secondary)' }}>
        Confidentialité
      </Link>
    </p>
  )
}
