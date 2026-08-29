'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import AudioPlayer from '@/components/AudioPlayer'
import ShineIcon from '@/components/icons/ShineIcon'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  LE FEED DES PUBLICATIONS ENREGISTRÉES
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Ouvrir une publication depuis Mes Favoris renvoyait sur le mur de la
 *  communauté, c'est-à-dire sur toutes les publications de tout le monde. La
 *  personne perdait sa sélection au moment précis où elle voulait la lire.
 *
 *  Ici, elle reste chez elle : le feed ne contient que ce qu'elle a enregistré,
 *  en entier, dans l'ordre où elle l'a mis de côté. On ouvre sur la publication
 *  cliquée, et on peut faire défiler les autres à la suite.
 */

type Publication = {
  bookmarkId: string
  id: string
  title: string
  content: string
  category: string
  imageUrl: string | null
  videoUrl: string | null
  audioUrl: string | null
  createdAt: string
  savedAt: string
  auteur: string
  auteurAvatar: string | null
}

const CATEGORIES: Record<string, string> = {
  temoignage: 'Témoignage',
  partage: 'Partage',
  question: 'Question',
  remerciements: 'Remerciements',
  gratitude: 'Gratitude',
  citation: 'Citation',
}

function dateCourte(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function PublicationsSauvegardees({
  focusId,
  onClose,
}: {
  /** Publication sur laquelle ouvrir le feed. */
  focusId: string
  onClose: () => void
}) {
  const [publications, setPublications] = useState<Publication[]>([])
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur] = useState<string | null>(null)
  const cible = useRef<HTMLDivElement | null>(null)

  const charger = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setChargement(false); return }

      const { data: signets } = await supabase
        .from('post_bookmarks')
        .select('id, post_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!signets?.length) { setPublications([]); setChargement(false); return }

      const { data: posts } = await supabase
        .from('posts')
        .select('id, author_id, title, content, category, image_url, video_url, audio_url, created_at')
        .in('id', signets.map(s => s.post_id))

      const auteurs = [...new Set((posts || []).map(p => p.author_id))]
      const { data: profils } = await supabase
        .from('profiles')
        .select('id, prenom, avatar_url')
        .in('id', auteurs)

      const parAuteur = new Map((profils || []).map(p => [p.id, p]))
      const parPost = new Map((posts || []).map(p => [p.id, p]))

      // L'ordre des signets fait foi : le dernier enregistré vient en premier.
      const liste: Publication[] = []
      for (const s of signets) {
        const p = parPost.get(s.post_id)
        if (!p) continue                       // publication supprimée depuis
        const a = parAuteur.get(p.author_id)
        liste.push({
          bookmarkId: s.id,
          id: p.id,
          title: p.title || '',
          content: p.content || '',
          category: p.category,
          imageUrl: p.image_url,
          videoUrl: p.video_url,
          audioUrl: p.audio_url,
          createdAt: p.created_at,
          savedAt: s.created_at,
          auteur: a?.prenom || 'Un membre',
          auteurAvatar: a?.avatar_url || null,
        })
      }
      setPublications(liste)
    } catch {
      setErreur('Impossible de charger vos publications enregistrées. Réessayez dans un instant.')
    }
    setChargement(false)
  }, [])

  useEffect(() => { charger() }, [charger])

  // On ouvre sur la publication cliquée, sans l'arracher à sa liste : les
  // autres restent au-dessus et en dessous, à portée de défilement.
  useEffect(() => {
    if (chargement || !cible.current) return
    cible.current.scrollIntoView({ block: 'start', behavior: 'auto' })
  }, [chargement])

  async function retirer(bookmarkId: string) {
    const supabase = createClient()
    await supabase.from('post_bookmarks').delete().eq('id', bookmarkId)
    setPublications(prev => prev.filter(p => p.bookmarkId !== bookmarkId))
    window.dispatchEvent(new Event('favorites-changed'))
  }

  const retour = (
    <button
      onClick={onClose}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12.5px] font-medium cursor-pointer transition-all hover:brightness-110"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
      Mes favoris
    </button>
  )

  if (chargement) {
    return (
      <div className="space-y-6">
        {retour}
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {retour}
        <p className="text-[12.5px] text-[var(--text-muted)]">
          {publications.length} publication{publications.length > 1 ? 's' : ''} enregistrée{publications.length > 1 ? 's' : ''}
        </p>
      </div>

      <div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--text-primary)]">
          Mes publications
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Tout ce que vous avez mis de côté, à lire d&apos;une traite.
        </p>
      </div>

      {erreur && (
        <div className="rounded-xl p-4 text-sm"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)' }}>
          {erreur}
        </div>
      )}

      {publications.length === 0 ? (
        <div className="text-center py-16 rounded-2xl"
          style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <ShineIcon name="garder" className="w-10 h-10 mx-auto mb-4" color="var(--text-muted)" strokeWidth={1.2} />
          <p className="text-lg text-[var(--text-secondary)]">Vous n&apos;avez plus de publication enregistrée</p>
          <p className="text-sm mt-2 max-w-sm mx-auto text-[var(--text-muted)]">
            Le signet, sur une publication du fil, la range ici.
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {publications.map((p, i) => {
            const ouverte = p.id === focusId
            return (
              <motion.article
                key={p.bookmarkId}
                ref={ouverte ? cible : undefined}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.2), duration: 0.35 }}
                className="group rounded-2xl p-5 sm:p-6 scroll-mt-24"
                style={{
                  background: 'var(--surface-card)',
                  border: `1px solid ${ouverte ? 'rgba(201,169,97,0.35)' : 'var(--border)'}`,
                }}
              >
                {/* Auteur, date, et le signet pour retirer */}
                <div className="flex items-center gap-3 mb-4">
                  {p.auteurAvatar ? (
                    <img src={p.auteurAvatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                      style={{ background: 'rgba(201,169,97,0.12)', color: 'var(--brand)' }}>
                      {p.auteur.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{p.auteur}</p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {dateCourte(p.createdAt)}
                      {CATEGORIES[p.category] && <> · {CATEGORIES[p.category]}</>}
                    </p>
                  </div>
                  <button
                    onClick={() => retirer(p.bookmarkId)}
                    title="Retirer de mes favoris"
                    aria-label={`Retirer « ${p.title || 'cette publication'} » de mes favoris`}
                    className="shrink-0 p-2 rounded-lg cursor-pointer transition-colors
                               opacity-60 hover:opacity-100 focus-visible:opacity-100
                               focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--brand)]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <ShineIcon name="garder" className="w-4 h-4" />
                  </button>
                </div>

                {p.title && (
                  <h2 className="font-display text-xl font-semibold mb-2 text-[var(--text-primary)]">{p.title}</h2>
                )}

                {/* Le texte en entier : c'est pour le lire qu'on l'a enregistré. */}
                <p className="text-[14.5px] leading-[1.75] whitespace-pre-wrap text-[var(--text-secondary)]">
                  {p.content}
                </p>

                {p.imageUrl && (
                  <img src={p.imageUrl} alt="" loading="lazy"
                    className="mt-4 w-full rounded-xl object-contain max-h-[28rem]" />
                )}
                {p.videoUrl && (
                  <video src={p.videoUrl} controls controlsList="nodownload"
                    onContextMenu={e => e.preventDefault()}
                    className="mt-4 w-full rounded-xl max-h-[28rem]" />
                )}
                {p.audioUrl && <div className="mt-4"><AudioPlayer src={p.audioUrl} /></div>}

                <p className="mt-4 text-[11px] text-[var(--text-muted)]">
                  Enregistrée le {dateCourte(p.savedAt)}
                </p>
              </motion.article>
            )
          })}
        </div>
      )}
    </div>
  )
}
