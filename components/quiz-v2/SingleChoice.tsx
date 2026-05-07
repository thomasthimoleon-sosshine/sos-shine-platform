'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Choice } from '@/lib/quiz-v2/questions'

type Props = {
  choices: Choice[]
  hasOther?: boolean
  selected: number | null
  otherText: string
  onSelect: (index: number) => void
  onOtherChange: (text: string) => void
  onSelectOther: () => void
  isOtherSelected: boolean
  onAutoAdvance?: () => void
  microReveal?: (string | undefined)[]
}

export function SingleChoice({
  choices, hasOther, selected, otherText, onSelect, onOtherChange,
  onSelectOther, isOtherSelected, onAutoAdvance, microReveal,
}: Props) {
  const advancingRef = useRef(false)
  const [revealText, setRevealText] = useState<string | null>(null)

  const handleSelect = (i: number) => {
    if (advancingRef.current) return
    onSelect(i)

    try { navigator.vibrate?.(8) } catch {}

    if (!onAutoAdvance) return
    advancingRef.current = true

    const reveal = microReveal?.[i]
    if (reveal) {
      setRevealText(reveal)
      setTimeout(() => {
        advancingRef.current = false
        onAutoAdvance()
      }, 950)
    } else {
      setTimeout(() => {
        advancingRef.current = false
        onAutoAdvance()
      }, 200)
    }
  }

  return (
    <div className="space-y-2">
      {choices.map((choice, i) => (
        <motion.button
          key={i}
          onClick={() => handleSelect(i)}
          className="w-full text-left px-4 py-3 rounded-2xl flex items-center gap-3 cursor-pointer"
          style={{
            background: selected === i ? 'rgba(201,169,97,0.1)' : 'rgba(255,255,255,0.035)',
            border: selected === i ? '1.5px solid rgba(201,169,97,0.45)' : '1.5px solid rgba(255,255,255,0.06)',
            minHeight: '52px',
          }}
          whileTap={{ scale: 0.975, transition: { duration: 0.08 } }}
        >
          <span className="text-base flex-shrink-0 w-7 text-center">{choice.emoji}</span>
          <span
            className="text-sm font-sans leading-snug flex-1"
            style={{ color: selected === i ? 'var(--text-primary)' : 'rgba(255,255,255,0.6)' }}
          >
            {choice.shortText || choice.text}
          </span>
          {selected === i && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15, ease: 'backOut' }}
              className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: 'var(--brand)' }}
            >
              <span className="text-[8px] font-bold" style={{ color: '#000' }}>✓</span>
            </motion.span>
          )}
        </motion.button>
      ))}

      {hasOther && (
        <motion.div
          className="w-full px-4 py-3 rounded-2xl"
          style={{
            background: isOtherSelected ? 'rgba(201,169,97,0.1)' : 'rgba(255,255,255,0.035)',
            border: isOtherSelected ? '1.5px solid rgba(201,169,97,0.45)' : '1.5px solid rgba(255,255,255,0.06)',
          }}
        >
          <button
            onClick={onSelectOther}
            className="flex items-center gap-3 w-full text-left cursor-pointer"
            style={{ minHeight: '28px' }}
          >
            <span className="text-base flex-shrink-0 w-7 text-center">✍️</span>
            <span className="text-sm font-sans" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {otherText || 'Autre chose…'}
            </span>
          </button>
          {isOtherSelected && (
            <textarea
              value={otherText}
              onChange={(e) => onOtherChange(e.target.value)}
              placeholder="Écris ici..."
              maxLength={200}
              rows={2}
              autoFocus
              className="w-full mt-3 px-3 py-2 rounded-xl text-sm outline-none resize-none font-sans"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-primary)',
              }}
            />
          )}
        </motion.div>
      )}

      {/* Micro-reveal — emotional echo after selection */}
      <AnimatePresence>
        {revealText && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="font-display text-sm italic text-center pt-3 pb-1 leading-relaxed"
            style={{ color: 'var(--brand)', opacity: 0.9 }}
          >
            {revealText}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
