'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import FeatureGate from '@/components/FeatureGate'
import type { PremiumAtelier } from '@/types/database'

const MONTHS = [
  { label: 'AVR.', month: 'Avril', year: 2026 },
  { label: 'MAI', month: 'Mai', year: 2026 },
  { label: 'JUIN', month: 'Juin', year: 2026 },
  { label: 'JUIL.', month: 'Juillet', year: 2026 },
  { label: 'AOÛT', month: 'Août', year: 2026 },
  { label: 'SEP.', month: 'Septembre', year: 2026 },
  { label: 'OCT.', month: 'Octobre', year: 2026 },
  { label: 'NOV.', month: 'Novembre', year: 2026 },
  { label: 'DÉC.', month: 'Décembre', year: 2026 },
  { label: 'JAN.', month: 'Janvier', year: 2027 },
  { label: 'FÉV.', month: 'Février', year: 2027 },
  { label: 'MARS', month: 'Mars', year: 2027 },
]

const ARC_NUMERALS = ['I', 'II', 'III', 'IV']

export default function AteliersPage() {
  return (
    <FeatureGate featureKey="ateliers_premium" loadingText="Chargement des ateliers...">
      <AteliersContent />
    </FeatureGate>
  )
}

function AteliersContent() {
  const [ateliers, setAteliers] = useState<PremiumAtelier[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(1)
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('premium_ateliers')
        .select('*')
        .eq('is_active', true)
        .order('month_index')
        .order('week')
      if (data) setAteliers(data)
      setLoading(false)
    }
    load()
  }, [])

  const monthAteliers = ateliers.filter(a => a.month_index === selectedMonth)
  const currentTheme = monthAteliers[0]
  const monthInfo = MONTHS[selectedMonth - 1]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 rounded-2xl mx-auto flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))' }}>
            <div className="w-5 h-5 border-2 border-[var(--dark)] border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Chargement des ateliers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h1
          className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wider uppercase mb-2"
          style={{ color: 'var(--brand)' }}
        >
          SOS Shine<span className="text-sm align-super">&#174;</span> Premium &middot; 48 Ateliers
        </h1>
        <p
          className="text-xs sm:text-sm tracking-[0.2em] uppercase"
          style={{ color: 'var(--text-muted)' }}
        >
          Avril 2026 &rarr; Mars 2027 &middot; Un atelier par semaine
        </p>
      </div>

      {/* Month Navigation */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
        {MONTHS.map((m, i) => {
          const monthIndex = i + 1
          const isActive = selectedMonth === monthIndex
          return (
            <button
              key={monthIndex}
              onClick={() => { setSelectedMonth(monthIndex); setExpandedWeek(null) }}
              className="px-4 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer"
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, var(--brand), var(--brand-deep))'
                  : 'rgba(201,169,97,0.08)',
                color: isActive ? '#000000' : 'var(--text-secondary)',
                border: isActive ? 'none' : '1px solid rgba(201,169,97,0.15)',
              }}
            >
              {m.label}
            </button>
          )
        })}
      </div>

      {/* Current Month Theme */}
      {currentTheme && monthInfo && (
        <motion.div
          key={selectedMonth}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-8">
            <span className="text-4xl">{currentTheme.month_icon}</span>
            <div>
              <h2
                className="font-display text-xl sm:text-2xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                {currentTheme.month_theme}
              </h2>
              <p
                className="text-xs sm:text-sm tracking-[0.15em] uppercase font-medium"
                style={{ color: 'var(--brand)' }}
              >
                {monthInfo.month} {monthInfo.year} &middot; Arc {ARC_NUMERALS[currentTheme.arc_number - 1]} &mdash; {currentTheme.arc_label}
              </p>
            </div>
          </div>

          {/* Weekly Cards */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {monthAteliers.map((atelier) => (
                <motion.div
                  key={atelier.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: (atelier.week - 1) * 0.08 }}
                >
                  <div
                    className="rounded-2xl overflow-hidden transition-all duration-200"
                    style={{
                      background: expandedWeek === atelier.week
                        ? 'rgba(201,169,97,0.06)'
                        : 'var(--surface-card)',
                      border: '1px solid rgba(201,169,97,0.15)',
                    }}
                  >
                    {/* Card Header */}
                    <button
                      onClick={() => setExpandedWeek(expandedWeek === atelier.week ? null : atelier.week)}
                      className="w-full flex items-center gap-4 sm:gap-6 px-5 sm:px-7 py-5 sm:py-6 cursor-pointer text-left group"
                    >
                      {/* Week number */}
                      <div className="shrink-0">
                        <span
                          className="text-base sm:text-lg font-display font-bold"
                          style={{ color: 'var(--brand)' }}
                        >
                          Semaine {atelier.week}
                        </span>
                      </div>

                      {/* Title */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm sm:text-[15px] font-medium truncate sm:whitespace-normal"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {atelier.title}
                        </p>
                      </div>

                      {/* LIVE badge + Play button */}
                      <div className="flex items-center gap-3 shrink-0">
                        {atelier.is_live && (
                          <span
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
                            style={{
                              background: 'rgba(239,68,68,0.15)',
                              color: '#EF4444',
                              border: '1px solid rgba(239,68,68,0.3)',
                            }}
                          >
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            Live
                          </span>
                        )}
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                          style={{
                            background: 'rgba(201,169,97,0.1)',
                            border: '1px solid rgba(201,169,97,0.2)',
                          }}
                        >
                          <svg
                            className="w-4 h-4 ml-0.5"
                            fill="var(--brand)"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {expandedWeek === atelier.week && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="px-5 sm:px-7 pb-6"
                      >
                        <div
                          className="pt-4"
                          style={{ borderTop: '1px solid rgba(201,169,97,0.1)' }}
                        >
                          {atelier.description && (
                            <p
                              className="text-sm leading-relaxed mb-4"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              {atelier.description}
                            </p>
                          )}

                          {/* Video / Live / Replay */}
                          <div className="flex flex-wrap gap-3">
                            {atelier.video_url && (
                              <a
                                href={atelier.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 hover:scale-[1.03]"
                                style={{
                                  background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))',
                                  color: '#000000',
                                }}
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                                Regarder l&apos;atelier
                              </a>
                            )}
                            {atelier.live_url && (
                              <a
                                href={atelier.live_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 hover:scale-[1.03]"
                                style={{
                                  background: 'rgba(239,68,68,0.15)',
                                  color: '#EF4444',
                                  border: '1px solid rgba(239,68,68,0.3)',
                                }}
                              >
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                Rejoindre le live
                              </a>
                            )}
                            {atelier.replay_url && (
                              <a
                                href={atelier.replay_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 hover:scale-[1.03]"
                                style={{
                                  background: 'rgba(201,169,97,0.08)',
                                  color: 'var(--brand)',
                                  border: '1px solid rgba(201,169,97,0.2)',
                                }}
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                                </svg>
                                Voir le replay
                              </a>
                            )}
                            {!atelier.video_url && !atelier.live_url && !atelier.replay_url && (
                              <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
                                Contenu bientôt disponible
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Arc progress indicator */}
          {currentTheme && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {[1, 2, 3, 4].map(arc => (
                <div
                  key={arc}
                  className="flex items-center gap-2"
                >
                  <div
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: currentTheme.arc_number === arc ? '3rem' : '1.5rem',
                      background: currentTheme.arc_number >= arc
                        ? 'var(--brand)'
                        : 'rgba(201,169,97,0.15)',
                    }}
                  />
                  {arc < 4 && <div className="w-1" />}
                </div>
              ))}
              <span
                className="ml-3 text-[11px] tracking-wider uppercase font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                Arc {ARC_NUMERALS[currentTheme.arc_number - 1]} / IV
              </span>
            </div>
          )}
        </motion.div>
      )}

      {monthAteliers.length === 0 && !loading && (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Les ateliers de ce mois ne sont pas encore disponibles.
          </p>
        </div>
      )}
    </div>
  )
}
