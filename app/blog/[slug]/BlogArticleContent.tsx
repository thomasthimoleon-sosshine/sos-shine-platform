'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import ThemeToggle from '@/components/ThemeToggle'
import type { BlogArticle } from '@/data/blog/articles'

const gold = '#D4AF37'
const goldRgb = '212,175,55'

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function onScroll() {
      const h = document.documentElement.scrollHeight - window.innerHeight
      if (h > 0) setProgress((window.scrollY / h) * 100)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[3px]" style={{ background: 'transparent' }}>
      <div
        className="h-full transition-[width] duration-100"
        style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${gold}, #E8CC6E)` }}
      />
    </div>
  )
}

function MarkdownRenderer({ content }: { content: string }) {
  // Simple markdown-to-HTML for blog articles
  const lines = content.trim().split('\n')
  const elements: React.ReactNode[] = []
  let key = 0
  let inList = false
  let listItems: string[] = []

  function flushList() {
    if (listItems.length > 0) {
      elements.push(
        <ul key={key++} className="space-y-2 my-4 md:my-6">
          {listItems.map((item, i) => (
            <li key={i} className="flex gap-3 text-sm md:text-[15.5px] leading-relaxed font-light" style={{ color: 'var(--text-secondary)' }}>
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
    // Bold
    r = r.replace(/\*\*(.+?)\*\*/g, '<strong style="color: var(--text-primary); font-weight: 600;">$1</strong>')
    // Italic
    r = r.replace(/\*(.+?)\*/g, '<em class="font-display" style="color: var(--gold);">$1</em>')
    return r
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      flushList()
      continue
    }

    // Heading 2
    if (trimmed.startsWith('## ')) {
      flushList()
      const text = trimmed.slice(3)
      elements.push(
        <h2
          key={key++}
          className="font-display text-xl sm:text-2xl md:text-3xl font-light mt-10 md:mt-16 mb-4 md:mb-6 leading-[1.2]"
          style={{ color: 'var(--text-primary)' }}
          id={text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}
        >
          {text}
        </h2>
      )
      continue
    }

    // Heading 3
    if (trimmed.startsWith('### ')) {
      flushList()
      const text = trimmed.slice(4)
      elements.push(
        <h3
          key={key++}
          className="font-display text-lg sm:text-xl md:text-2xl font-light mt-8 md:mt-12 mb-3 md:mb-4 leading-[1.25]"
          style={{ color: gold }}
          id={text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}
        >
          {text}
        </h3>
      )
      continue
    }

    // Horizontal rule
    if (trimmed === '---') {
      flushList()
      elements.push(
        <div key={key++} className="my-8 md:my-14 flex items-center justify-center gap-4">
          <span className="block w-16 h-px" style={{ background: `linear-gradient(to right, transparent, rgba(${goldRgb}, 0.3))` }} />
          <span className="block w-2 h-2 rotate-45" style={{ background: gold, opacity: 0.4 }} />
          <span className="block w-16 h-px" style={{ background: `linear-gradient(to left, transparent, rgba(${goldRgb}, 0.3))` }} />
        </div>
      )
      continue
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushList()
      const text = trimmed.slice(2)
      elements.push(
        <blockquote
          key={key++}
          className="my-6 md:my-10 pl-5 md:pl-6 py-3 md:py-4 relative"
          style={{ borderLeft: `2px solid ${gold}` }}
        >
          <p
            className="font-display text-base md:text-lg italic font-light leading-relaxed"
            style={{ color: 'var(--text-primary)' }}
            dangerouslySetInnerHTML={{ __html: inlineFormat(text) }}
          />
        </blockquote>
      )
      continue
    }

    // List item
    if (trimmed.startsWith('- ')) {
      inList = true
      listItems.push(trimmed.slice(2))
      continue
    }

    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      inList = true
      listItems.push(trimmed.replace(/^\d+\.\s/, ''))
      continue
    }

    // Regular paragraph
    flushList()
    elements.push(
      <p
        key={key++}
        className="text-sm md:text-[15.5px] leading-[1.85] font-light my-3 md:my-5"
        style={{ color: 'var(--text-secondary)' }}
        dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed) }}
      />
    )
  }

  flushList()

  return <div>{elements}</div>
}

export default function BlogArticleContent({ article }: { article: BlogArticle }) {
  return (
    <main className="grain relative z-0 min-h-screen" style={{ background: 'var(--dark, #050505)' }}>
      <ReadingProgress />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 py-3 md:py-4 header-animate header-scrolled">
        <div className="flex items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-3">
            <img src="/images/logo-shine.png" alt="SOS Shine" className="h-10 sm:h-14 md:h-16 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="text-xs tracking-[0.15em] uppercase font-medium px-3 py-1.5 rounded-full transition-colors hover:opacity-80"
              style={{ color: 'var(--text-muted)', background: 'var(--dark-card)', border: '1px solid var(--dark-border)' }}
            >
              &larr; Blog
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Article Hero */}
      <article className="pt-24 sm:pt-28 md:pt-36 pb-12 md:pb-20">
        <div className="px-5 md:px-8 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 mb-6 md:mb-8 text-[10px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>
              <Link href="/" className="hover:text-[var(--gold)] transition-colors">Accueil</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-[var(--gold)] transition-colors">Blog</Link>
              <span>/</span>
              <span className="truncate max-w-[200px]" style={{ color: 'var(--text-secondary)' }}>{article.title}</span>
            </nav>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-5 md:mb-6">
              <span
                className="px-3 py-1 rounded-full text-[10px] tracking-[0.12em] uppercase font-semibold"
                style={{ background: `rgba(${goldRgb}, 0.1)`, color: gold }}
              >
                {article.category}
              </span>
              <span className="text-[10px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>
                {formatDate(article.publishedAt)}
              </span>
              <span className="text-[10px] sm:text-xs" style={{ color: 'var(--text-muted)' }}>
                {article.readTime} min de lecture
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-2xl sm:text-3xl md:text-5xl font-light leading-[1.1] mb-4 md:mb-6">
              {article.title}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg font-light leading-relaxed mb-6 md:mb-8" style={{ color: 'var(--text-secondary)' }}>
              {article.subtitle}
            </p>

            {/* Author */}
            <div className="flex items-center gap-4 pb-6 md:pb-10 mb-6 md:mb-10" style={{ borderBottom: '1px solid var(--dark-border)' }}>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium"
                style={{ background: `rgba(${goldRgb}, 0.1)`, color: gold }}
              >
                {article.author.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="text-sm font-medium">{article.author.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{article.author.role}</p>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <MarkdownRenderer content={article.content} />
          </motion.div>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10 md:mt-16 pt-6 md:pt-8"
            style={{ borderTop: '1px solid var(--dark-border)' }}
          >
            <p className="text-[10px] tracking-[0.15em] uppercase font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
              Tags
            </p>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full text-[10px] sm:text-xs"
                  style={{ background: 'var(--dark-card)', color: 'var(--text-muted)', border: '1px solid var(--dark-border)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-10 md:mt-16"
          >
            <div
              className="rounded-2xl p-6 sm:p-8 md:p-10 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(212,175,55,0.05), var(--dark-card))',
                border: '1px solid rgba(212,175,55,0.12)',
              }}
            >
              <h3 className="font-display text-lg sm:text-xl md:text-2xl font-light mb-2 md:mb-3" style={{ color: gold }}>
                Pret(e) a decouvrir votre Signature Emotionnelle ?
              </h3>
              <p className="text-xs sm:text-sm font-light mb-4 md:mb-5 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
                15 questions pour reveler votre architecture emotionnelle profonde. Gratuit et confidentiel.
              </p>
              <Link href="/signature-emotionnelle">
                <button
                  className="px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold tracking-wide hover:scale-105 transition-transform"
                  style={{ background: `linear-gradient(135deg, ${gold}, #B8960F)`, color: '#050505' }}
                >
                  Faire le test gratuit &rarr;
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Back to blog */}
          <div className="mt-8 md:mt-12 text-center">
            <Link href="/blog" className="text-xs font-medium hover:opacity-80 transition-opacity" style={{ color: gold }}>
              &larr; Retour au blog
            </Link>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="px-5 md:px-8 py-8 md:py-12 border-t" style={{ borderColor: 'var(--dark-border)', background: 'rgba(0,0,0,0.3)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/">
            <img src="/images/logo-shine.png" alt="SOS Shine" className="h-10 md:h-12 w-auto object-contain" />
          </Link>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link href="/" className="text-[10px] tracking-[0.15em] uppercase text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors">Accueil</Link>
            <Link href="/blog" className="text-[10px] tracking-[0.15em] uppercase text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors">Blog</Link>
            <Link href="/contact" className="text-[10px] tracking-[0.15em] uppercase text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors">Contact</Link>
          </div>
          <p className="text-[10px] tracking-[0.15em] uppercase text-[var(--text-muted)]">&copy; 2026 SOS Shine</p>
        </div>
      </footer>
    </main>
  )
}
