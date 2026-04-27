'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/lib/i18n/useTranslation'

type Mood = 'great' | 'good' | 'neutral' | 'difficult' | 'tough'

interface JournalEntry {
  id: string
  content: string
  mood: Mood
  created_at: string
}

const STORAGE_KEY = 'sos-shine-journal'

const MOODS: { value: Mood; emoji: string; label: string; color: string }[] = [
  { value: 'great', emoji: '\u2728', label: 'Excellent', color: '#55EFC4' },
  { value: 'good', emoji: '\u2600\uFE0F', label: 'Bien', color: '#74C0FC' },
  { value: 'neutral', emoji: '\u2601\uFE0F', label: 'Neutre', color: '#C9A961' },
  { value: 'difficult', emoji: '\uD83C\uDF27\uFE0F', label: 'Difficile', color: '#E17055' },
  { value: 'tough', emoji: '\u26A1', label: 'Dur', color: '#EF4444' },
]

function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function loadEntries(): JournalEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveEntries(entries: JournalEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

function getMoodInfo(mood: Mood) {
  return MOODS.find((m) => m.value === mood) || MOODS[2]
}

const ease: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

export default function JournalPage() {
  const { t } = useTranslation()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [showModal, setShowModal] = useState(false)
  const [content, setContent] = useState('')
  const [selectedMood, setSelectedMood] = useState<Mood>('neutral')
  const [filterMood, setFilterMood] = useState<Mood | 'all'>('all')

  useEffect(() => {
    setEntries(loadEntries())
  }, [])

  const filteredEntries = useMemo(() => {
    const filtered = filterMood === 'all' ? entries : entries.filter((e) => e.mood === filterMood)
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [entries, filterMood])

  const groupedEntries = useMemo(() => {
    const groups: Record<string, JournalEntry[]> = {}
    filteredEntries.forEach((entry) => {
      const date = new Date(entry.created_at)
      const key = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      if (!groups[key]) groups[key] = []
      groups[key].push(entry)
    })
    return groups
  }, [filteredEntries])

  function handleCreate() {
    if (!content.trim()) return
    const newEntry: JournalEntry = {
      id: generateId(),
      content: content.trim(),
      mood: selectedMood,
      created_at: new Date().toISOString(),
    }
    const updated = [newEntry, ...entries]
    setEntries(updated)
    saveEntries(updated)
    setContent('')
    setSelectedMood('neutral')
    setShowModal(false)
  }

  function deleteEntry(id: string) {
    const updated = entries.filter((e) => e.id !== id)
    setEntries(updated)
    saveEntries(updated)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {t('journal.title')}
          </h1>
          <p className="mt-1 text-[14px]" style={{ color: 'var(--text-secondary)' }}>
            {t('journal.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 hover:scale-105 cursor-pointer flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))', color: '#09090b' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t('journal.new_entry')}
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.5, ease }}
        className="glass p-4"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[12px] font-medium mr-1" style={{ color: 'var(--text-muted)' }}>Filtrer :</span>
          <button
            onClick={() => setFilterMood('all')}
            className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer"
            style={{
              background: filterMood === 'all' ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.04)',
              color: filterMood === 'all' ? 'var(--brand)' : 'var(--text-muted)',
              border: `1px solid ${filterMood === 'all' ? 'rgba(212, 175, 55, 0.2)' : 'transparent'}`,
            }}
          >
            {t('journal.all_moods')}
          </button>
          {MOODS.map((mood) => (
            <button
              key={mood.value}
              onClick={() => setFilterMood(mood.value)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer flex items-center gap-1.5"
              style={{
                background: filterMood === mood.value ? `${mood.color}15` : 'rgba(255,255,255,0.04)',
                color: filterMood === mood.value ? mood.color : 'var(--text-muted)',
                border: `1px solid ${filterMood === mood.value ? `${mood.color}30` : 'transparent'}`,
              }}
            >
              <span>{mood.emoji}</span>
              {mood.label}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="glass p-3 flex items-center gap-2"
      >
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--brand)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
          {t('journal.privacy')}
        </p>
      </motion.div>

      {filteredEntries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="glass p-12 text-center"
        >
          <div
            className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(212, 175, 55, 0.08)' }}
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--brand)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
          </div>
          <p className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>
            {filterMood !== 'all' ? 'Aucune entrée avec cet état' : t('journal.empty')}
          </p>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>
            {filterMood !== 'all' ? 'Essayez un autre filtre' : t('journal.empty_desc')}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedEntries).map(([month, monthEntries]) => (
            <div key={month}>
              <h3
                className="text-[11px] font-semibold uppercase tracking-widest mb-3 capitalize"
                style={{ color: 'var(--text-muted)' }}
              >
                {month}
              </h3>
              <div className="space-y-3">
                <AnimatePresence>
                  {monthEntries.map((entry, i) => {
                    const moodInfo = getMoodInfo(entry.mood)
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.03, duration: 0.4, ease }}
                        className="glass glass-hover p-5 group relative"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium"
                                style={{ background: `${moodInfo.color}12`, color: moodInfo.color }}
                              >
                                {moodInfo.emoji} {moodInfo.label}
                              </span>
                              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                                {formatDate(entry.created_at)}
                              </span>
                            </div>
                            <p className="text-[14px] leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                              {entry.content}
                            </p>
                            <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
                              {entry.content.length} {t('journal.characters')}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer shrink-0"
                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}
                            title={t('common.delete')}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease }}
              className="glass w-full max-w-lg p-6 space-y-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {t('journal.new_entry')}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
                  style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div>
                <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                  {t('journal.mood')}
                </label>
                <div className="flex items-center gap-2">
                  {MOODS.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setSelectedMood(mood.value)}
                      className="flex-1 py-2.5 rounded-xl text-center transition-all cursor-pointer"
                      style={{
                        background: selectedMood === mood.value ? `${mood.color}15` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${selectedMood === mood.value ? `${mood.color}40` : 'var(--border)'}`,
                      }}
                    >
                      <span className="text-xl block">{mood.emoji}</span>
                      <span
                        className="text-[10px] block mt-1 font-medium"
                        style={{ color: selectedMood === mood.value ? mood.color : 'var(--text-muted)' }}
                      >
                        {mood.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>{t('journal.write')}</label>
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{content.length} {t('journal.characters')}</span>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Écrivez librement..."
                  rows={6}
                  className="w-full px-3.5 py-2.5 rounded-xl text-[14px] outline-none resize-none transition-colors leading-relaxed"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <button
                onClick={handleCreate}
                disabled={!content.trim()}
                className="w-full py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, var(--brand), var(--brand-deep))', color: '#09090b' }}
              >
                {t('journal.save')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
