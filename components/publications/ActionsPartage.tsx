'use client'

/**
 *  ENVOYER À UN PROCHE · PARTAGER
 *  ──────────────────────────────
 *
 *  Ces deux gestes existaient sur le fil et nulle part ailleurs, dans du code
 *  écrit à même la page. Les reproduire ailleurs par copie aurait garanti
 *  qu'ils divergent au premier changement — c'est justement ce qui manquait
 *  au journal. Ils vivent donc ici, et les deux pages appellent le même code.
 *
 *  Une chose que le fil n'avait pas à gérer : une publication du journal peut
 *  être réservée aux Rayons. On ne propose alors pas le partage vers
 *  l'extérieur, et la liste des destinataires se limite aux proches — les
 *  seuls qui pourront ouvrir le lien.
 */

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { incrementAndCheckBadges } from '@/lib/badgeService'
import ShineIcon from '@/components/icons/ShineIcon'

type Membre = { id: string; prenom: string; avatar_url: string | null }

type Props = {
  /** Adresse de la publication, telle qu'elle sera ouverte par le destinataire. */
  lien: string
  /** Titre repris dans le message privé et dans les intentions de partage. */
  titre: string
  /** Première ligne du message privé, avant le titre et le lien. */
  introMessage: string
  /** Membre connecté : sert à s'exclure de la liste et à compter le partage. */
  utilisateurId: string | null
  /**
   * Limite les destinataires aux proches. À poser dès que la publication
   * n'est pas publique : envoyer le lien à quelqu'un d'autre lui donnerait
   * une page vide.
   */
  prochesUniquement?: boolean
  /** Propose le partage hors SOS Shine. Jamais pour un contenu non public. */
  partageExterne?: boolean
  /**
   * Glissé entre « envoyer » et « partager ». Le fil intercale son bouton
   * « garder » à cet endroit : le passer ici évite de réordonner sa barre
   * d'actions pour la commodité de ce composant.
   */
  children?: React.ReactNode
  style?: React.CSSProperties
}

const CHAMP: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
}

export default function ActionsPartage({
  lien,
  titre,
  introMessage,
  utilisateurId,
  prochesUniquement = false,
  partageExterne = true,
  children,
  style,
}: Props) {
  const [envoiOuvert, setEnvoiOuvert] = React.useState(false)
  const [menuOuvert, setMenuOuvert] = React.useState(false)
  const [membres, setMembres] = React.useState<Membre[]>([])
  const [chargement, setChargement] = React.useState(false)
  const [recherche, setRecherche] = React.useState('')
  const [envoiVers, setEnvoiVers] = React.useState<string | null>(null)
  const [envoye, setEnvoye] = React.useState<string | null>(null)

  /** Un partage vers l'extérieur, quel que soit le canal : il compte pour les badges. */
  function compterPartage() {
    if (!utilisateurId) return
    incrementAndCheckBadges(utilisateurId, 'shares_external').catch(() => {})
  }

  async function ouvrirEnvoi() {
    setEnvoiOuvert(true)
    setRecherche('')
    setEnvoye(null)
    if (membres.length > 0 || !utilisateurId) return
    setChargement(true)
    const supabase = createClient()

    if (prochesUniquement) {
      const { data: liens } = await supabase
        .from('shine_connections')
        .select('sender_id, receiver_id')
        .eq('status', 'accepted')
        .or(`sender_id.eq.${utilisateurId},receiver_id.eq.${utilisateurId}`)
      const ids = (liens || [] as { sender_id: string; receiver_id: string }[])
        .map(l => (l.sender_id === utilisateurId ? l.receiver_id : l.sender_id))
      if (ids.length === 0) { setMembres([]); setChargement(false); return }
      const { data } = await supabase
        .from('profiles')
        .select('id, prenom, avatar_url')
        .in('id', ids)
        .order('prenom')
      setMembres((data || []) as Membre[])
    } else {
      const { data } = await supabase
        .from('profiles')
        .select('id, prenom, avatar_url')
        .neq('id', utilisateurId)
        .order('prenom')
        .limit(50)
      setMembres((data || []) as Membre[])
    }
    setChargement(false)
  }

  async function envoyer(destinataire: string) {
    if (!utilisateurId) return
    setEnvoiVers(destinataire)
    const supabase = createClient()
    await supabase.from('private_messages').insert({
      sender_id: utilisateurId,
      receiver_id: destinataire,
      content: `${introMessage}\n\n"${titre}"\n${lien}`,
      message_type: 'text',
      is_read: false,
    })
    setEnvoiVers(null)
    setEnvoye(destinataire)
    // On laisse une seconde : sans elle, la fenêtre se referme si vite
    // qu'on doute d'avoir envoyé quoi que ce soit.
    setTimeout(() => setEnvoiOuvert(false), 900)
  }

  const visibles = membres.filter(m =>
    (m.prenom || '').toLowerCase().includes(recherche.toLowerCase()),
  )

  const champ = { ...CHAMP, ...style }

  return (
    <>
      <button
        onClick={ouvrirEnvoi}
        title="Envoyer à un proche"
        aria-label="Envoyer à un proche"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer text-[var(--text-muted)]"
      >
        <ShineIcon name="rayon" className="w-4 h-4" />
      </button>

      {children}

      {partageExterne && (
        <div className="ml-auto relative">
          <button
            onClick={() => setMenuOuvert(o => !o)}
            title="Partager en dehors de SOS Shine"
            aria-label="Partager en dehors de SOS Shine"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer text-[var(--text-muted)]"
          >
            <ShineIcon name="diffuser" className="w-4 h-4" />
          </button>

          {menuOuvert && (
            <div className="absolute right-0 bottom-full mb-2 rounded-xl py-2 px-1 z-30 shadow-xl min-w-[160px] bg-[var(--surface-card)] border border-[var(--border)]">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(lien)}`}
                target="_blank" rel="noopener noreferrer" onClick={compterPartage}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors text-[var(--text-secondary)]"
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <ShineIcon name="globe" className="w-3.5 h-3.5" /> Facebook
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(lien)}&text=${encodeURIComponent(titre)}`}
                target="_blank" rel="noopener noreferrer" onClick={compterPartage}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors text-[var(--text-secondary)]"
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <ShineIcon name="diffuser" className="w-3.5 h-3.5" /> X (Twitter)
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${titre} ${lien}`)}`}
                target="_blank" rel="noopener noreferrer" onClick={compterPartage}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors text-[var(--text-secondary)]"
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <ShineIcon name="parole" className="w-3.5 h-3.5" /> WhatsApp
              </a>
              <button
                onClick={() => { navigator.clipboard?.writeText(lien); compterPartage(); setMenuOuvert(false) }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors w-full text-left cursor-pointer text-[var(--text-secondary)]"
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <ShineIcon name="partage" className="w-3.5 h-3.5" /> Copier le lien
              </button>
            </div>
          )}
        </div>
      )}

      {envoiOuvert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={e => { if (e.target === e.currentTarget) setEnvoiOuvert(false) }}
        >
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-4 bg-[var(--surface-card)] border border-[var(--border)]">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[var(--text-primary)]">Envoyer en message privé</h3>
              <button onClick={() => setEnvoiOuvert(false)} className="p-1 cursor-pointer text-[var(--text-muted)]" aria-label="Fermer">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {prochesUniquement && (
              <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                Cette publication est réservée à vos Rayons : seuls vos proches peuvent l&apos;ouvrir.
              </p>
            )}

            <input
              type="text"
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
              placeholder="Rechercher un membre..."
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={champ}
            />

            <div className="max-h-60 overflow-y-auto space-y-1">
              {visibles.map(membre => (
                <button
                  key={membre.id}
                  onClick={() => envoyer(membre.id)}
                  disabled={envoiVers === membre.id || envoye === membre.id}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer disabled:opacity-60 text-[var(--text-primary)]"
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {membre.avatar_url ? (
                    <img src={membre.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
                      style={{ background: 'rgba(201,169,97,0.12)', color: 'var(--brand)' }}>
                      {membre.prenom?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <span className="flex-1 text-left">{membre.prenom}</span>
                  {envoiVers === membre.id ? (
                    <div className="w-4 h-4 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
                  ) : envoye === membre.id ? (
                    <span style={{ color: 'var(--brand)' }}><ShineIcon name="valide" className="w-4 h-4" /></span>
                  ) : (
                    <span className="text-[var(--text-muted)]"><ShineIcon name="rayon" className="w-4 h-4" /></span>
                  )}
                </button>
              ))}
              {!chargement && visibles.length === 0 && (
                <p className="text-center text-xs py-4 text-[var(--text-muted)]">
                  {prochesUniquement && membres.length === 0
                    ? "Vous n'avez pas encore de proche à qui l'envoyer."
                    : 'Aucun membre trouvé'}
                </p>
              )}
              {chargement && (
                <p className="text-center text-xs py-4 text-[var(--text-muted)]">Chargement…</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
