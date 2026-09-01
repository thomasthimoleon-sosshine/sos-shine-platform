'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import ShineIcon from '@/components/icons/ShineIcon'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  L'ANNUAIRE DES MEMBRES
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Se relier à quelqu'un était déjà possible — le Rayon existe, la fiche de
 *  profil aussi. Mais on ne pouvait tomber sur une personne que si l'une de ses
 *  publications passait dans le fil. Aucun moyen de chercher quelqu'un, ni de
 *  voir qui d'autre est là.
 *
 *  Cet écran ne fait qu'une chose : trouver. Le reste — la fiche, la demande
 *  de Rayon, son état — reste dans ProfileDrawer, qui le faisait déjà.
 *
 *  Ce qu'on montre d'une personne : son prénom, son pseudo, sa présentation,
 *  son avatar. Jamais son adresse e-mail, et on ne cherche pas dessus : ce
 *  n'est pas une donnée d'annuaire.
 */

type Membre = {
  id: string
  prenom: string
  pseudo: string | null
  bio: string | null
  avatar_url: string | null
  role: string
  created_at: string
}

type Lien = 'aucun' | 'envoye' | 'recu' | 'proche'

const CHAMPS = 'id, prenom, pseudo, bio, avatar_url, role, created_at'
const PREMIERE_PAGE = 60
const MAX_RESULTATS = 40

const TITRES: Record<string, string> = {
  founder: 'Fondation',
  admin_content: 'Équipe',
  admin_support: 'Équipe',
}

const ETATS: Record<Lien, { texte: string; or: boolean } | null> = {
  aucun: null,
  envoye: { texte: 'Demande envoyée', or: false },
  recu: { texte: 'Vous a envoyé un Rayon', or: true },
  proche: { texte: 'Dans vos proches', or: true },
}

export default function MembresTab({ onProfileClick }: { onProfileClick: (userId: string) => void }) {
  const [recherche, setRecherche] = useState('')
  const [membres, setMembres] = useState<Membre[]>([])
  const [liens, setLiens] = useState<Record<string, Lien>>({})
  const [chargement, setChargement] = useState(true)
  const [moi, setMoi] = useState<string | null>(null)
  const debut = useRef<Membre[]>([])

  // ── Les liens déjà tissés, pour ne pas proposer un Rayon à quelqu'un qui
  //    est déjà un proche. ──
  const chargerLiens = useCallback(async (userId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('shine_connections')
      .select('sender_id, receiver_id, status')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)

    const carte: Record<string, Lien> = {}
    for (const c of (data || []) as { sender_id: string; receiver_id: string; status: string }[]) {
      const autre = c.sender_id === userId ? c.receiver_id : c.sender_id
      carte[autre] = c.status === 'accepted' ? 'proche' : (c.sender_id === userId ? 'envoye' : 'recu')
    }
    setLiens(carte)
  }, [])

  useEffect(() => {
    async function ouvrir() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setChargement(false); return }
      setMoi(user.id)

      const { data } = await supabase
        .from('profiles')
        .select(CHAMPS)
        .neq('id', user.id)
        .not('is_bot', 'is', true)
        .order('created_at', { ascending: false })
        .limit(PREMIERE_PAGE)

      const liste = (data || []) as Membre[]
      debut.current = liste
      setMembres(liste)
      await chargerLiens(user.id)
      setChargement(false)
    }
    ouvrir()
  }, [chargerLiens])

  // ── La recherche part en base dès trois lettres : l'annuaire n'est pas
  //    chargé en entier, il ne le sera jamais. ──
  useEffect(() => {
    const terme = recherche.trim()
    if (!moi) return
    if (terme.length < 3) { setMembres(debut.current); return }

    let vivant = true
    const minuteur = setTimeout(async () => {
      const supabase = createClient()
      const motif = `%${terme}%`
      const { data } = await supabase
        .from('profiles')
        .select(CHAMPS)
        .neq('id', moi)
        .not('is_bot', 'is', true)
        .or(`prenom.ilike.${motif},pseudo.ilike.${motif}`)
        .order('prenom', { ascending: true })
        .limit(MAX_RESULTATS)
      if (vivant) setMembres((data || []) as Membre[])
    }, 260)

    return () => { vivant = false; clearTimeout(minuteur) }
  }, [recherche, moi])

  const cherche = recherche.trim().length >= 3
  const intitule = useMemo(() => {
    if (chargement) return ''
    const n = membres.length
    if (cherche) return n === 0 ? 'Personne de ce nom' : `${n} membre${n > 1 ? 's' : ''} trouvé${n > 1 ? 's' : ''}`
    return 'Les membres arrivés récemment'
  }, [chargement, membres.length, cherche])

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-semibold text-[var(--text-primary)]">Trouver quelqu&apos;un</h2>
        <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
          Cherchez une personne par son prénom ou son pseudo, ouvrez sa fiche, et envoyez-lui un Rayon.
        </p>
      </div>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
          <ShineIcon name="rayon" className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={recherche}
          onChange={e => setRecherche(e.target.value)}
          placeholder="Un prénom, un pseudo…"
          aria-label="Rechercher un membre"
          className="w-full pl-11 pr-4 py-3 rounded-xl text-[14px] outline-none transition-colors
                     focus:border-[var(--border-strong)]"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        />
      </div>

      {chargement ? (
        <div className="flex justify-center py-14">
          <div className="w-7 h-7 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <p className="text-[12px] text-[var(--text-muted)]">{intitule}</p>

          {membres.length === 0 ? (
            <div className="text-center py-14 rounded-2xl"
              style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
              <ShineIcon name="membres" className="w-9 h-9 mx-auto mb-3" color="var(--text-muted)" strokeWidth={1.2} />
              <p className="text-[15px] text-[var(--text-secondary)]">Aucun membre ne porte ce nom</p>
              <p className="text-[13px] mt-1.5 text-[var(--text-muted)]">
                Essayez avec le début du prénom, ou moins de lettres.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {membres.map((m, i) => {
                const etat = ETATS[liens[m.id] || 'aucun']
                const titre = TITRES[m.role]
                return (
                  <motion.button
                    key={m.id}
                    onClick={() => onProfileClick(m.id)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.2), duration: 0.3 }}
                    className="text-left p-4 rounded-2xl cursor-pointer transition-all hover:-translate-y-0.5"
                    style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center gap-3">
                      {m.avatar_url ? (
                        <img src={m.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover shrink-0" />
                      ) : (
                        <span className="w-11 h-11 rounded-full flex items-center justify-center text-[15px] font-semibold shrink-0"
                          style={{ background: 'rgba(201,169,97,0.12)', color: 'var(--brand)' }}>
                          {m.prenom.trim().charAt(0).toUpperCase()}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="block text-[14.5px] font-medium truncate text-[var(--text-primary)]">
                            {m.prenom.trim()}
                          </span>
                          {titre && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0"
                              style={{ background: 'rgba(201,169,97,0.12)', color: 'var(--brand)' }}>
                              {titre}
                            </span>
                          )}
                        </span>
                        {m.pseudo && (
                          <span className="block text-[12px] truncate text-[var(--text-muted)]">@{m.pseudo}</span>
                        )}
                      </span>
                    </div>

                    {m.bio && (
                      <p className="mt-3 text-[13px] leading-relaxed line-clamp-2 text-[var(--text-secondary)]">
                        {m.bio}
                      </p>
                    )}

                    <span className="mt-3 flex items-center gap-1.5 text-[11.5px]"
                      style={{ color: etat?.or ? 'var(--brand)' : 'var(--text-muted)' }}>
                      {etat ? (
                        <>
                          <ShineIcon name="rayon" className="w-3.5 h-3.5" />
                          {etat.texte}
                        </>
                      ) : (
                        <>Voir sa fiche <span aria-hidden>→</span></>
                      )}
                    </span>
                  </motion.button>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
