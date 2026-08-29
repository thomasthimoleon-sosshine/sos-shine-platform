'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { blogArticles as staticArticles, BLOG_CATEGORIES } from '@/data/blog/articles'
import type { BlogArticle } from '@/data/blog/articles'
import { aujourdhui } from '@/lib/blog-parution'
import ShineIcon from '@/components/icons/ShineIcon'

const gold = 'var(--brand)'
const goldRgb = '201,169,97'

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.trim().split('\n')
  const elements: React.ReactNode[] = []
  let key = 0
  let inList = false
  let listItems: string[] = []

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key++} className="space-y-2 my-4">
          {listItems.map((item, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed font-light text-[var(--text-secondary)]">
              <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: gold }} />
              <span dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
            </li>
          ))}
        </ul>
      )
      listItems = []
      inList = false
    }
  }

  function inlineFormat(text: string): string {
    let r = text
    r = r.replace(/\*\*(.+?)\*\*/g, '<strong style="color: var(--text-primary); font-weight: 600;">$1</strong>')
    r = r.replace(/\*(.+?)\*/g, '<em style="color: var(--brand);">$1</em>')
    return r
  }

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    if (!trimmed) { flushList(); continue }
    if (trimmed.startsWith('## ')) { flushList(); elements.push(<h2 key={key++} className="font-display text-xl font-light mt-8 mb-3 text-[var(--text-primary)]">{trimmed.slice(3)}</h2>); continue }
    if (trimmed.startsWith('### ')) { flushList(); elements.push(<h3 key={key++} className="font-display text-lg font-light mt-6 mb-2" style={{ color: gold }}>{trimmed.slice(4)}</h3>); continue }
    if (trimmed === '---') { flushList(); elements.push(<hr key={key++} className="my-8 border-0 h-px" style={{ background: `rgba(${goldRgb}, 0.2)` }} />); continue }
 if (trimmed.startsWith('> ')) { flushList(); elements.push(<blockquote className="my-6 pl-5 py-3 font-display text-base italic font-light text-[var(--text-primary)]" key={key++} style={{ borderLeft: `2px solid ${gold}` }}><p dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed.slice(2)) }} /></blockquote>); continue }
    if (trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed)) { inList = true; listItems.push(trimmed.replace(/^[-\d]+[.\s]+/, '')); continue }
    flushList()
    elements.push(<p key={key++} className="text-sm leading-[1.8] font-light my-3 text-[var(--text-secondary)]" dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed) }} />)
  }
  flushList()
  return <div>{elements}</div>
}

export default function DashboardBlogPage() {
  const router = useRouter()
  const [articles, setArticles] = useState<BlogArticle[]>(staticArticles)
  const [loading, setLoading] = useState(true)
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase as any)
          .from('blog_articles')
          .select('*')
          .eq('is_published', true)
          .lte('published_at', aujourdhui())
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
          const dbSlugs = new Set(dbArticles.map(a => a.slug))
          setArticles([...dbArticles, ...staticArticles.filter(a => !dbSlugs.has(a.slug))])
        }
      } catch {
        // use static articles
      }
      setLoading(false)
    }
    load()
  }, [router])

  const filteredArticles = selectedCategory
    ? articles.filter(a => a.category === selectedCategory)
    : articles

  const featured = filteredArticles.find(a => a.featured)
  const others = filteredArticles.filter(a => a !== featured)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Article detail view
  if (selectedArticle) {
    return (
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => setSelectedArticle(null)}
          className="flex items-center gap-2 text-sm font-medium mb-6 cursor-pointer transition-opacity hover:opacity-80"
          style={{ color: gold }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Retour au blog
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full text-[10px] tracking-[0.12em] uppercase font-semibold"
              style={{ background: `rgba(${goldRgb}, 0.1)`, color: gold }}>
              {BLOG_CATEGORIES.find(c => c.slug === selectedArticle.category)?.label || selectedArticle.category}
            </span>
            <span className="text-xs text-[var(--text-muted)]">{formatDate(selectedArticle.publishedAt)}</span>
            <span className="text-xs text-[var(--text-muted)]">{selectedArticle.readTime} min de lecture</span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-light leading-[1.15] mb-3">{selectedArticle.title}</h1>
          <p className="text-sm font-light leading-relaxed mb-6 text-[var(--text-secondary)]">{selectedArticle.subtitle}</p>

          {/* Author */}
          <div className="flex items-center gap-3 pb-6 mb-6 border-b border-[var(--border)]">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
              style={{ background: `rgba(${goldRgb}, 0.1)`, color: gold }}>
              {selectedArticle.author.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="text-sm font-medium">{selectedArticle.author.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{selectedArticle.author.role}</p>
            </div>
          </div>

          {/* Content */}
          {selectedArticle.contentType === 'html' ? (
            <div className="blog-html-content" dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
          ) : (
            <MarkdownRenderer content={selectedArticle.content} />
          )}

          {/* Tags */}
          {selectedArticle.tags.length > 0 && (
            <div className="mt-10 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
              <p className="text-[10px] uppercase tracking-widest font-medium mb-3 text-[var(--text-muted)]">Tags</p>
              <div className="flex flex-wrap gap-2">
                {selectedArticle.tags.map(tag => (
                  <span key={tag} className="px-3 py-1.5 rounded-full text-xs"
                    style={{ background: 'var(--surface-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  // Blog listing view
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-display text-2xl sm:text-3xl font-light mb-2">
          Blog <span style={{ color: gold }}>SOS Shine</span>
        </h1>
        <p className="text-sm font-light text-[var(--text-secondary)]">
          Articles, guides et conseils pour transformer votre relation aux &eacute;motions.
        </p>
      </motion.div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory(null)}
          className="flex-shrink-0 px-4 py-2 rounded-full text-xs tracking-wider uppercase font-medium cursor-pointer transition-all"
          style={{
            background: !selectedCategory ? `rgba(${goldRgb}, 0.12)` : 'var(--surface-card)',
            color: !selectedCategory ? gold : 'var(--text-muted)',
            border: `1px solid ${!selectedCategory ? `rgba(${goldRgb}, 0.25)` : 'var(--border)'}`,
          }}
        >
          Tous
        </button>
        {BLOG_CATEGORIES.map(cat => (
          <button
            key={cat.slug}
            onClick={() => setSelectedCategory(selectedCategory === cat.slug ? null : cat.slug)}
            className="flex-shrink-0 px-4 py-2 rounded-full text-xs tracking-wider uppercase font-medium cursor-pointer transition-all"
            style={{
              background: selectedCategory === cat.slug ? `${cat.color}15` : 'var(--surface-card)',
              color: selectedCategory === cat.slug ? cat.color : 'var(--text-muted)',
              border: `1px solid ${selectedCategory === cat.slug ? `${cat.color}40` : 'var(--border)'}`,
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Featured */}
      {featured && !selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <button
            onClick={() => setSelectedArticle(featured)}
            className="w-full text-left cursor-pointer"
          >
            <article
              className="group relative overflow-hidden rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:shadow-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(201,169,97,0.06), var(--surface-card))',
                border: '1px solid rgba(201,169,97,0.12)',
              }}
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full text-[10px] tracking-[0.15em] uppercase font-semibold"
                  style={{ background: `rgba(${goldRgb}, 0.1)`, color: gold }}>
                  Article vedette
                </span>
                <span className="text-xs text-[var(--text-muted)]">{featured.readTime} min</span>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-light leading-[1.2] mb-3 group-hover:text-[var(--brand)] transition-colors">
                {featured.title}
              </h2>
              <p className="text-sm font-light leading-relaxed mb-5 max-w-2xl text-[var(--text-secondary)]">
                {featured.excerpt}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                  style={{ background: `rgba(${goldRgb}, 0.1)`, color: gold }}>
                  {featured.author.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-xs font-medium">{featured.author.name}</p>
                  <p className="text-[10px] text-[var(--text-muted)]">{featured.author.role}</p>
                </div>
              </div>
            </article>
          </button>
        </motion.div>
      )}

      {/* Articles grid */}
      {others.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {others.map((article, i) => (
            <motion.div
              key={article.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 + i * 0.05 }}
            >
              <button
                onClick={() => setSelectedArticle(article)}
                className="w-full text-left cursor-pointer"
              >
                <article
                  className="group rounded-xl p-5 h-full transition-all duration-300 hover:shadow-lg"
                  style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}
                >
                  <span className="text-[10px] tracking-[0.12em] uppercase font-medium"
                    style={{ color: BLOG_CATEGORIES.find(c => c.slug === article.category)?.color || gold }}>
                    {BLOG_CATEGORIES.find(c => c.slug === article.category)?.label || article.category}
                  </span>
                  <h3 className="font-display text-base font-light mt-2 mb-2 leading-snug group-hover:text-[var(--brand)] transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-xs font-light leading-relaxed mb-3 line-clamp-2 text-[var(--text-secondary)]">
                    {article.excerpt.slice(0, 120)}...
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {article.author.name} &middot; {article.readTime} min
                    </span>
                    <span className="text-xs font-medium" style={{ color: gold }}>Lire</span>
                  </div>
                </article>
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {filteredArticles.length === 0 && (
        <div className="text-center py-16 rounded-2xl" style={{ background: 'var(--surface-card)', border: '1px solid var(--border)' }}>
          <p className="mb-3 flex justify-center" style={{ color: 'var(--brand)' }}><ShineIcon name="texte" className="w-8 h-8" /></p>
          <p className="text-sm text-[var(--text-muted)]">Aucun article dans cette cat&eacute;gorie</p>
        </div>
      )}
    </div>
  )
}
