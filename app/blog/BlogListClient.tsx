'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { blogArticles as staticArticles, BLOG_CATEGORIES } from '@/data/blog/articles'
import type { BlogArticle } from '@/data/blog/articles'
import ThemeToggle from '@/components/ThemeToggle'
import { createClient } from '@/lib/supabase/client'

const gold = '#D4AF37'
const goldRgb = '212,175,55'

interface BlogListClientProps {
  initialArticles?: BlogArticle[]
}

export default function BlogListClient({ initialArticles }: BlogListClientProps) {
  const [allArticles, setAllArticles] = useState<BlogArticle[]>(initialArticles && initialArticles.length > 0 ? initialArticles : staticArticles)

  useEffect(() => {
    async function loadDbArticles() {
      try {
        const supabase = createClient()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any)
          .from('blog_articles')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false })
        if (data && data.length > 0) {
          const dbArticles: BlogArticle[] = data.map((a: Record<string, unknown>) => ({
            slug: a.slug as string,
            title: a.title as string,
            subtitle: (a.subtitle as string) || '',
            excerpt: (a.excerpt as string) || '',
            metaTitle: (a.meta_title as string) || (a.title as string),
            metaDescription: (a.meta_description as string) || (a.excerpt as string),
            author: { name: (a.author_name as string) || 'SOS Shine', role: (a.author_role as string) || '' },
            publishedAt: (a.published_at as string) || '',
            readTime: (a.read_time as number) || 5,
            category: (a.category as string) || 'transformation',
            tags: (a.tags as string[]) || [],
            coverImage: a.cover_image as string | undefined,
            featured: (a.featured as boolean) || false,
            content: (a.content as string) || '',
            contentType: (a.content_type as 'markdown' | 'html') || 'markdown',
          }))
          // Merge: DB articles first, then static articles not already in DB
          const dbSlugs = new Set(dbArticles.map(a => a.slug))
          const merged = [...dbArticles, ...staticArticles.filter(a => !dbSlugs.has(a.slug))]
          setAllArticles(merged)
        }
      } catch {
        // Silently use static articles if DB not available
      }
    }
    loadDbArticles()
  }, [])

  const featured = allArticles.find((a) => a.featured)
  const others = allArticles.filter((a) => !a.featured)

  return (
    <main className="grain relative z-0 min-h-screen" style={{ background: 'var(--dark, #050505)' }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 py-3 md:py-4 header-animate header-scrolled">
        <div className="flex items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-3">
            <img src="/images/logo-shine.png" alt="SOS Shine" className="h-10 sm:h-14 md:h-16 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="text-xs tracking-[0.15em] uppercase font-medium px-3 py-1.5 rounded-full"
              style={{ color: gold, background: `rgba(${goldRgb}, 0.1)`, border: `1px solid rgba(${goldRgb}, 0.2)` }}
            >
              Blog
            </Link>
            <Link
              href="/login"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              aria-label="Connexion"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: gold }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-28 sm:pt-32 md:pt-40 pb-12 md:pb-20 px-5 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span
              className="inline-block px-4 py-1.5 rounded-full text-[10px] sm:text-xs tracking-[0.25em] uppercase font-medium mb-6"
              style={{ background: `rgba(${goldRgb}, 0.08)`, color: gold, border: `1px solid rgba(${goldRgb}, 0.15)` }}
            >
              Le Journal SOS Shine
            </span>
            <h1 className="font-display text-3xl sm:text-4xl md:text-6xl font-light leading-[1.1] mb-4 md:mb-6">
              Comprendre vos emotions.{' '}
              <span className="text-shimmer">Transformer votre vie.</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg font-light max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Articles experts, guides pratiques et decouvertes scientifiques pour une relation
              nouvelle avec vos emotions. Par les fondateurs de SOS Shine.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-5 md:px-8 mb-8 md:mb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
            <span
              className="flex-shrink-0 px-4 py-2 rounded-full text-xs tracking-wider uppercase font-medium cursor-pointer transition-all"
              style={{ background: `rgba(${goldRgb}, 0.12)`, color: gold, border: `1px solid rgba(${goldRgb}, 0.25)` }}
            >
              Tous
            </span>
            {BLOG_CATEGORIES.map((cat) => (
              <span
                key={cat.slug}
                className="flex-shrink-0 px-4 py-2 rounded-full text-xs tracking-wider uppercase font-medium cursor-pointer transition-all hover:opacity-80"
                style={{ background: 'var(--surface-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                {cat.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {featured && (
        <section className="px-5 md:px-8 mb-12 md:mb-20">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href={`/blog/${featured.slug}`}>
                <article
                  className="group relative overflow-hidden rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 transition-all duration-500 hover:shadow-2xl cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, rgba(212,175,55,0.06), var(--surface-card))',
                    border: '1px solid rgba(212,175,55,0.12)',
                  }}
                >
                  <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(ellipse at center, rgba(${goldRgb}, 0.04) 0%, transparent 70%)` }} />

                  <div className="relative z-10">
                    <div className="flex flex-wrap items-center gap-3 mb-4 md:mb-6">
                      <span
                        className="px-3 py-1 rounded-full text-[10px] tracking-[0.15em] uppercase font-semibold"
                        style={{ background: `rgba(${goldRgb}, 0.1)`, color: gold }}
                      >
                        Article vedette
                      </span>
                      <span className="text-[10px] sm:text-xs tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>
                        {featured.readTime} min de lecture
                      </span>
                    </div>

                    <h2 className="font-display text-xl sm:text-2xl md:text-4xl font-light leading-[1.15] mb-3 md:mb-5 group-hover:text-[var(--brand)] transition-colors duration-300">
                      {featured.title}
                    </h2>

                    <p className="text-sm md:text-base font-light leading-relaxed mb-6 md:mb-8 max-w-3xl" style={{ color: 'var(--text-secondary)' }}>
                      {featured.excerpt}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium" style={{ background: `rgba(${goldRgb}, 0.1)`, color: gold }}>
                          {featured.author.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium">{featured.author.name}</p>
                          <p className="text-[10px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>{featured.author.role}</p>
                        </div>
                      </div>
                      <span
                        className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide group-hover:scale-105 transition-transform"
                        style={{ background: `linear-gradient(135deg, ${gold}, #B8960F)`, color: '#050505' }}
                      >
                        Lire l&apos;article
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Other Articles Grid */}
      {others.length > 0 && (
        <section className="px-5 md:px-8 mb-16 md:mb-24">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest mb-6 md:mb-8" style={{ color: 'var(--text-muted)' }}>
              Derniers articles
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {others.map((article, i) => (
                <motion.div
                  key={article.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link href={`/blog/${article.slug}`}>
                    <article
                      className="group rounded-2xl p-5 md:p-6 h-full transition-all duration-300 hover:shadow-lg cursor-pointer"
                      style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}
                    >
                      <span className="text-[10px] tracking-[0.15em] uppercase font-medium" style={{ color: BLOG_CATEGORIES.find(c => c.slug === article.category)?.color || gold }}>
                        {BLOG_CATEGORIES.find(c => c.slug === article.category)?.label || article.category}
                      </span>
                      <h3 className="font-display text-lg md:text-xl font-light mt-2 mb-3 leading-snug group-hover:text-[var(--brand)] transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-xs font-light leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                        {article.excerpt.slice(0, 140)}...
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{article.readTime} min</span>
                        <span className="text-xs font-medium" style={{ color: gold }}>
                          Lire &rarr;
                        </span>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="px-5 md:px-8 pb-16 md:pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.04), var(--surface-card))',
              border: '1px solid rgba(212,175,55,0.1)',
            }}
          >
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-light mb-3 md:mb-4" style={{ color: gold }}>
              Decouvrez votre Signature Emotionnelle
            </h2>
            <p className="text-xs sm:text-sm font-light mb-5 md:mb-6 max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
              15 questions pour reveler votre architecture emotionnelle profonde.
              Un diagnostic premium et hyper-personnalise. Gratuit.
            </p>
            <Link href="/signature-emotionnelle">
              <button
                className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-sm font-semibold tracking-wide hover:scale-105 transition-transform"
                style={{ background: `linear-gradient(135deg, ${gold}, #B8960F)`, color: '#050505' }}
              >
                Faire le test gratuit &rarr;
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 md:px-8 py-8 md:py-12 border-t" style={{ borderColor: 'var(--border)', background: 'rgba(0,0,0,0.3)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/">
            <img src="/images/logo-shine.png" alt="SOS Shine" className="h-10 md:h-12 w-auto object-contain" />
          </Link>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/" className="text-[10px] tracking-[0.15em] uppercase text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors">Accueil</Link>
            <Link href="/encyclopedie" className="text-[10px] tracking-[0.15em] uppercase text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors">Encyclopedie</Link>
            <Link href="/blog" className="text-[10px] tracking-[0.15em] uppercase text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors">Blog</Link>
            <Link href="/contact" className="text-[10px] tracking-[0.15em] uppercase text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors">Contact</Link>
          </div>
          <p className="text-[10px] tracking-[0.15em] uppercase text-[var(--text-muted)]">&copy; 2026 SOS Shine</p>
        </div>
      </footer>
    </main>
  )
}
