'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/lib/i18n/useTranslation'
import { localeNames, localeFlags, type Locale } from '@/lib/i18n/translations'

const locales: Locale[] = ['fr', 'en', 'es']

export default function LanguageSelector() {
  const { locale, changeLocale, mounted } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  if (!mounted) return <div className="w-9 h-9" />

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer text-sm"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        title={localeNames[locale]}
        aria-label="Change language"
      >
        <span className="text-base">{localeFlags[locale]}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-11 rounded-xl overflow-hidden z-50"
            style={{
              background: 'rgba(15, 15, 18, 0.95)',
              backdropFilter: 'blur(24px)',
              border: '1px solid var(--dark-border)',
              boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
              minWidth: '140px',
            }}
          >
            {locales.map((l) => (
              <button
                key={l}
                onClick={() => { changeLocale(l); setOpen(false) }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors cursor-pointer"
                style={{
                  background: l === locale ? 'rgba(212,175,55,0.08)' : 'transparent',
                  color: l === locale ? 'var(--gold)' : 'var(--text-secondary)',
                }}
              >
                <span className="text-base">{localeFlags[l]}</span>
                <span className="font-medium">{localeNames[l]}</span>
                {l === locale && (
                  <svg className="w-3.5 h-3.5 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: 'var(--gold)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
