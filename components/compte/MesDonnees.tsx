'use client'

/**
 *  MES DONNÉES — accès, portabilité, effacement
 *  ────────────────────────────────────────────
 *
 *  Trois droits que le RGPD accorde et que le produit ne permettait
 *  d'exercer par aucun moyen : ni bouton, ni page, ni procédure décrite.
 *
 *  La suppression demande d'écrire le mot en toutes lettres. Un simple
 *  « êtes-vous sûr ? » se clique sans le lire ; recopier un mot oblige à
 *  comprendre ce qu'on fait — et cette action-là est irréversible.
 */

import React from 'react'
import ShineIcon from '@/components/icons/ShineIcon'

export default function MesDonnees() {
  const [ouvert, setOuvert] = React.useState(false)
  const [motSaisi, setMotSaisi] = React.useState('')
  const [enCours, setEnCours] = React.useState(false)
  const [erreur, setErreur] = React.useState<string | null>(null)

  async function supprimer() {
    setEnCours(true)
    setErreur(null)
    try {
      const res = await fetch('/api/compte/supprimer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: motSaisi.trim().toUpperCase() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErreur(data.error || "La suppression n'a pas abouti.")
        setEnCours(false)
        return
      }
      window.location.href = '/'
    } catch {
      setErreur('Connexion perdue. Réessayez dans un instant.')
      setEnCours(false)
    }
  }

  return (
    <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
      <h3 className="font-semibold text-base mb-1 text-[var(--text-primary)]">Mes données</h3>
      <p className="text-sm mb-5 text-[var(--text-secondary)]">
        Vos données vous appartiennent. Vous pouvez en obtenir une copie, ou tout effacer.
      </p>

      <a
        href="/api/compte/export"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
        style={{ color: 'var(--text-primary)', border: '1px solid var(--border)' }}
      >
        <ShineIcon name="dossier" className="w-4 h-4" />
        Télécharger mes données
      </a>
      <p className="text-xs mt-2 text-[var(--text-muted)]">
        Un fichier contenant votre profil, vos publications, votre progression et vos réponses.
      </p>

      <div className="mt-7 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
        {!ouvert ? (
          <>
            <button
              type="button"
              onClick={() => setOuvert(true)}
              className="text-sm font-medium cursor-pointer"
              style={{ color: '#FF6B6B' }}
            >
              Supprimer mon compte
            </button>
            <p className="text-xs mt-2 text-[var(--text-muted)]">
              Définitif. Pensez à télécharger vos données avant.
            </p>
          </>
        ) : (
          <div>
            <p className="text-sm font-medium mb-2 text-[var(--text-primary)]">
              Supprimer définitivement votre compte
            </p>
            <p className="text-sm mb-4 text-[var(--text-secondary)]">
              Votre profil, vos publications, votre journal, votre progression et vos réponses
              aux questionnaires seront effacés. Votre abonnement en cours sera résilié.
              Cette action ne peut pas être annulée.
            </p>
            <p className="text-xs mb-4 text-[var(--text-muted)]">
              Vos factures sont conservées : la loi comptable l&apos;impose, et le droit à
              l&apos;effacement ne lève pas cette obligation.
            </p>

            <label className="block text-xs font-medium mb-1.5 text-[var(--text-muted)]">
              Écrivez <strong style={{ color: 'var(--text-primary)' }}>SUPPRIMER</strong> pour confirmer
            </label>
            <input
              type="text"
              value={motSaisi}
              onChange={e => setMotSaisi(e.target.value)}
              autoComplete="off"
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none mb-4"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />

            {erreur && (
              <p className="text-xs px-3 py-2 rounded-lg mb-4" style={{ background: 'rgba(255,107,107,0.1)', color: '#FF6B6B' }}>
                {erreur}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => { setOuvert(false); setMotSaisi(''); setErreur(null) }}
                disabled={enCours}
                className="px-4 py-2 rounded-xl text-sm font-medium cursor-pointer disabled:opacity-50"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={supprimer}
                disabled={enCours || motSaisi.trim().toUpperCase() !== 'SUPPRIMER'}
                className="px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-40"
                style={{ background: '#FF6B6B', color: '#1A0E0E' }}
              >
                {enCours ? 'Suppression…' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
