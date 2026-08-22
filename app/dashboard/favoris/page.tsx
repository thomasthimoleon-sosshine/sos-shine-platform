'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import ShineIcon, { type ShineIconName } from '@/components/icons/ShineIcon'
import { getFavorites } from '@/components/FavoriteButton'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  MES FAVORIS — tout ce que le membre a mis de côté, au même endroit
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Avant, cette page n'affichait QUE les protocoles de l'encyclopédie. Tout le
 *  reste — publications enregistrées, formats courts, vidéos, podcasts,
 *  lectures — vivait dans sa propre section et n'apparaissait jamais ici. On
 *  pouvait enregistrer une vidéo et ne plus jamais la retrouver.
 *
 *  Chaque source a sa propre table, chargée en parallèle. Une table absente ne
 *  casse rien : sa catégorie affiche zéro. C'est le cas du blog tant que la
 *  migration 20260822_blog_favorites.sql n'est pas passée.
 */

type Cat = 'protocoles' | 'publications' | 'shorts' | 'videos' | 'podcasts' | 'lectures' | 'blog'

type Item = {
  id: string
  cat: Cat
  title: string
  subtitle: string
  href: string
  image: string | null
  savedAt: string | null
}

const CATEGORIES: { id: Cat; label: string; icon: ShineIconName; color: string }[] = [
  { id: 'protocoles', label: 'Protocoles', icon: 'healing', color: '#C9A961' },
  { id: 'publications', label: 'Publications', icon: 'parole', color: '#E3D5BE' },
  { id: 'shorts', label: 'Formats courts', icon: 'shorts', color: '#D2536A' },
  { id: 'videos', label: 'Vidéos', icon: 'video', color: '#C78790' },
  { id: 'podcasts', label: 'Podcasts & audios', icon: 'audio', color: '#A88248' },
  { id: 'lectures', label: 'Lectures', icon: 'texte', color: '#F5DE9B' },
  { id: 'blog', label: 'Blog', icon: 'temoignage', color: '#E0A9A4' },
]

const CAT_MAP = new Map(CATEGORIES.map(c => [c.id, c]))

function extract(content: string, max = 110) {
  const clean = content.replace(/\s+/g, ' ').trim()
  return clean.length > max ? clean.slice(0, max) + '…' : clean
}

export default function FavorisPage() {
  const [items, setItems] = useState<Item[]>([])
  const [active, setActive] = useState<Cat | 'all'>('all')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const collected: Item[] = []

    // ── Protocoles : ils sont stockés en local, pas en base ──
    const slugs = getFavorites()
    if (slugs.length > 0) {
      const { data } = await supabase
        .from('douleurs')
        .select('id, title, slug, description')
        .in('slug', slugs)
      for (const d of data || []) {
        collected.push({
          id: `p-${d.id}`, cat: 'protocoles', title: d.title,
          subtitle: extract(d.description || ''),
          href: `/dashboard/encyclopedie/${d.slug}`, image: null, savedAt: null,
        })
      }
    }

    if (!user) { setItems(collected); setLoading(false); return }

    /** Une table absente ne doit pas emporter les six autres catégories. */
    async function safe<T>(fn: () => Promise<T>): Promise<T | null> {
      try { return await fn() } catch { return null }
    }

    const [posts, shorts, videos, tracks, books, blog] = await Promise.all([
      safe(async () => {
        const { data: bm } = await supabase
          .from('post_bookmarks').select('post_id, created_at').eq('user_id', user.id)
        if (!bm?.length) return []
        const { data } = await supabase
          .from('posts').select('id, title, content, category, image_url')
          .in('id', bm.map(b => b.post_id))
        const when = new Map(bm.map(b => [b.post_id, b.created_at]))
        return (data || []).map(p => ({
          id: `c-${p.id}`, cat: 'publications' as Cat,
          title: p.title || 'Publication',
          subtitle: extract(p.content || ''),
          href: `/dashboard/mur?post=${p.id}`,
          image: p.image_url, savedAt: when.get(p.id) || null,
        }))
      }),
      safe(async () => {
        const { data: fav } = await supabase
          .from('shine_shorts_favorites').select('short_id, created_at').eq('user_id', user.id)
        if (!fav?.length) return []
        const { data } = await supabase
          .from('shine_shorts').select('id, title, description, thumbnail_url')
          .in('id', fav.map(f => f.short_id))
        const when = new Map(fav.map(f => [f.short_id, f.created_at]))
        return (data || []).map(v => ({
          id: `s-${v.id}`, cat: 'shorts' as Cat, title: v.title,
          subtitle: extract(v.description || ''),
          href: `/dashboard/shine-shorts?id=${v.id}`,
          image: v.thumbnail_url, savedAt: when.get(v.id) || null,
        }))
      }),
      safe(async () => {
        const { data: fav } = await supabase
          .from('shine_tv_favorites').select('video_id, created_at').eq('user_id', user.id)
        if (!fav?.length) return []
        const { data } = await supabase
          .from('shine_tv_videos').select('id, title, description, thumbnail_url')
          .in('id', fav.map(f => f.video_id))
        const when = new Map(fav.map(f => [f.video_id, f.created_at]))
        return (data || []).map(v => ({
          id: `v-${v.id}`, cat: 'videos' as Cat, title: v.title,
          subtitle: extract(v.description || ''),
          href: `/dashboard/shine-tv?id=${v.id}`,
          image: v.thumbnail_url, savedAt: when.get(v.id) || null,
        }))
      }),
      safe(async () => {
        const { data: fav } = await supabase
          .from('shine_audible_favorites').select('track_id, created_at').eq('user_id', user.id)
        if (!fav?.length) return []
        const { data } = await supabase
          .from('shine_audible_tracks').select('id, title, description, cover_url, narrator')
          .in('id', fav.map(f => f.track_id))
        const when = new Map(fav.map(f => [f.track_id, f.created_at]))
        return (data || []).map(t => ({
          id: `a-${t.id}`, cat: 'podcasts' as Cat, title: t.title,
          subtitle: t.narrator ? `Lu par ${t.narrator}` : extract(t.description || ''),
          href: `/dashboard/shine-audible?id=${t.id}`,
          image: t.cover_url, savedAt: when.get(t.id) || null,
        }))
      }),
      safe(async () => {
        const { data: fav } = await supabase
          .from('shine_library_favorites').select('book_id, created_at').eq('user_id', user.id)
        if (!fav?.length) return []
        const { data } = await supabase
          .from('shine_library_books').select('id, title, author, description, cover_url')
          .in('id', fav.map(f => f.book_id))
        const when = new Map(fav.map(f => [f.book_id, f.created_at]))
        return (data || []).map(b => ({
          id: `l-${b.id}`, cat: 'lectures' as Cat, title: b.title,
          subtitle: b.author || extract(b.description || ''),
          href: `/dashboard/shine-librairie?id=${b.id}`,
          image: b.cover_url, savedAt: when.get(b.id) || null,
        }))
      }),
      safe(async () => {
        const { data: fav } = await supabase
          .from('blog_favorites').select('article_slug, created_at').eq('user_id', user.id)
        if (!fav?.length) return []
        const { data } = await supabase
          .from('blog_articles').select('slug, title, excerpt, cover_url')
          .in('slug', fav.map(f => f.article_slug))
        const when = new Map(fav.map(f => [f.article_slug, f.created_at]))
        return (data || []).map((a: { slug: string; title: string; excerpt: string | null; cover_url: string | null }) => ({
          id: `b-${a.slug}`, cat: 'blog' as Cat, title: a.title,
          subtitle: extract(a.excerpt || ''),
          href: `/dashboard/blog?slug=${a.slug}`,
          image: a.cover_url, savedAt: when.get(a.slug) || null,
        }))
      }),
    ])

    collected.push(...[posts, shorts, videos, tracks, books, blog].flatMap(r => r || []))

    // Le plus récemment enregistré d'abord ; les protocoles (sans date) à la fin.
    collected.sort((a, b) => {
      if (!a.savedAt && !b.savedAt) return 0
      if (!a.savedAt) return 1
      if (!b.savedAt) return -1
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    })

    setItems(collected)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    window.addEventListener('favorites-changed', load)
    return () => window.removeEventListener('favorites-changed', load)
  }, [load])

  const counts = CATEGORIES.reduce((acc, c) => {
    acc[c.id] = items.filter(i => i.cat === c.id).length
    return acc
  }, {} as Record<Cat, number>)

  const shown = active === 'all' ? items : items.filter(i => i.cat === active)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--text-primary)]">
        Mes Favoris
      </h1>

      {/* ── La ligne des catégories ── */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        <button
          onClick={() => setActive('all')}
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12.5px] font-medium cursor-pointer transition-all"
          style={{
            background: active === 'all' ? 'var(--brand)' : 'rgba(255,255,255,0.04)',
            color: active === 'all' ? '#0A0806' : 'var(--text-secondary)',
            border: active === 'all' ? 'none' : '1px solid var(--border)',
          }}
        >
          Tout
          <span className="tabular-nums opacity-70">{items.length}</span>
        </button>

        {CATEGORIES.map(c => {
          const n = counts[c.id]
          const on = active === c.id
          return (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              disabled={n === 0}
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12.5px] font-medium transition-all
                         disabled:cursor-default cursor-pointer"
              style={{
                background: on ? `${c.color}1F` : 'rgba(255,255,255,0.04)',
                color: on ? c.color : 'var(--text-secondary)',
                border: `1px solid ${on ? `${c.color}55` : 'var(--border)'}`,
                opacity: n === 0 ? 0.4 : 1,
              }}
            >
              <ShineIcon name={c.icon} className="w-4 h-4" color={on ? c.color : undefined} />
              {c.label}
              <span className="tabular-nums opacity-70">{n}</span>
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : shown.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <ShineIcon name="garder" className="w-10 h-10 mx-auto mb-4" color="var(--text-muted)" strokeWidth={1.2} />
          <p className="text-lg text-[var(--text-secondary)]">
            {active === 'all' ? 'Rien d’enregistré pour le moment' : `Rien dans « ${CAT_MAP.get(active as Cat)?.label} »`}
          </p>
          <p className="text-sm mt-2 max-w-sm mx-auto text-[var(--text-muted)]">
            Le signet présent sur les protocoles, les publications, les vidéos et les lectures
            met le contenu de côté et le range ici.
          </p>
          <Link
            href="/dashboard/encyclopedie"
            className="inline-block mt-6 px-6 py-2.5 rounded-full text-sm font-medium transition-all"
            style={{ background: 'rgba(201,169,97,0.1)', color: 'var(--brand)', border: '1px solid rgba(201,169,97,0.2)' }}
          >
            Explorer l&apos;encyclopédie
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {shown.map((it, i) => {
            const c = CAT_MAP.get(it.cat)!
            return (
              <motion.div
                key={it.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.35 }}
              >
                <Link
                  href={it.href}
                  className="group flex gap-4 rounded-xl p-4 h-full transition-all duration-300 hover:-translate-y-0.5"
                  style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}
                >
                  <div className="w-16 h-16 rounded-lg shrink-0 overflow-hidden flex items-center justify-center"
                    style={{ background: `${c.color}12`, border: `1px solid ${c.color}22` }}>
                    {it.image
                      ? <img src={it.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                      : <ShineIcon name={c.icon} className="w-6 h-6" color={c.color} strokeWidth={1.3} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] mb-1.5"
                      style={{ color: c.color }}>
                      <ShineIcon name={c.icon} className="w-3 h-3" />
                      {c.label}
                    </span>
                    <h3 className="font-semibold text-[15px] leading-tight mb-1 truncate
                                   group-hover:text-[var(--brand)] transition-colors text-[var(--text-primary)]">
                      {it.title}
                    </h3>
                    <p className="text-[13px] leading-relaxed line-clamp-2 text-[var(--text-secondary)]">
                      {it.subtitle}
                    </p>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
