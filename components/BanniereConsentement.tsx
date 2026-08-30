'use client'

/**
 *  BANNIÈRE DE CONSENTEMENT
 *  ────────────────────────
 *
 *  Refuser doit être aussi simple qu'accepter : c'est la position constante
 *  de la CNIL, et la raison pour laquelle tant de bandeaux ont été
 *  sanctionnés. Les deux boutons ont donc le même poids visuel, côte à côte,
 *  au même niveau. Aucun n'est mis en avant.
 *
 *  Tant que rien n'est choisi, rien n'est mesuré : le silence n'est pas un
 *  accord. La bannière ne masque pas la page et ne piège pas la navigation.
 */

import React from 'react'
import Link from 'next/link'
import { lireConsentement, ecrireConsentement } from '@/lib/consentement'

export default function BanniereConsentement() {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    // Au premier rendu seulement : le serveur ne connaît pas ce choix, et
    // l'afficher avant l'hydratation ferait clignoter la bannière.
    if (lireConsentement() === null) setVisible(true)
  }, [])

  function decider(valeur: 'accepte' | 'refuse') {
    ecrireConsentement(valeur)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Mesure d'audience"
      aria-live="polite"
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 90,
        display: 'flex', justifyContent: 'center', padding: '16px',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          width: '100%', maxWidth: 620,
          background: 'var(--surface-overlay, var(--surface-card, #16130D))',
          border: '1px solid var(--border, rgba(201,169,97,0.22))',
          borderRadius: 16,
          boxShadow: 'var(--shadow-xl, 0 18px 50px rgba(0,0,0,0.45))',
          padding: '20px 22px',
        }}
      >
        <p style={{ margin: '0 0 6px', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
          Nous mesurons la fréquentation du site
        </p>
        <p style={{ margin: '0 0 16px', fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          Pour savoir quelles pages vous servent vraiment. Cette mesure est la nôtre : elle
          n&apos;est transmise à aucun publicitaire, et le site ne contient aucun traceur
          extérieur. Vous pouvez refuser — le site fonctionne exactement pareil.{' '}
          <Link href="/confidentialite" style={{ color: 'var(--brand)', textDecoration: 'underline' }}>
            En savoir plus
          </Link>
        </p>

        {/* Même taille, même style, même rang : refuser doit être aussi
            facile qu'accepter. */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => decider('refuse')}
            style={{
              flex: '1 1 140px', padding: '11px 18px', borderRadius: 999,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              background: 'transparent',
              border: '1px solid var(--border, rgba(201,169,97,0.3))',
              color: 'var(--text-primary)',
            }}
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={() => decider('accepte')}
            style={{
              flex: '1 1 140px', padding: '11px 18px', borderRadius: 999,
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              background: 'transparent',
              border: '1px solid var(--border, rgba(201,169,97,0.3))',
              color: 'var(--text-primary)',
            }}
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  )
}
