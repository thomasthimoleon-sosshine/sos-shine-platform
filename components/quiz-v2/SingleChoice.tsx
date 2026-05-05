'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
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
}

export function SingleChoice({ choices, hasOther, selected, otherText, onSelect, onOtherChange, onSelectOther, isOtherSelected, onAutoAdvance }: Props) {
  const advancingRef = useRef(false)

  const handleSelect = (i: number) => {
    if (advancingRef.current) return
    onSelect(i)
    if (onAutoAdvance) {
      advancingRef.current = true
      setTimeout(() => {
        advancingRef.current = false
        onAutoAdvance()
      }, 200)
    }
  }

  return (
    <div className="space-y-3">
      {choices.map((choice, i) => (
        <motion.button
          key={i}
          onClick={() => handleSelect(i)}
          className="w-full text-left px-5 py-4 rounded-xl flex items-center gap-3 cursor-pointer"
          style={{
            background: selected === i ? 'rgba(201,169,97,0.14)' : 'rgba(255,255,255,0.03)',
            border: selected === i ? '1px solid rgba(201,169,97,0.45)' : '1px solid rgba(255,255,255,0.06)',
            minHeight: '56px',
          }}
          whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
        >
          <span className="text-lg flex-shrink-0">{choice.emoji}</span>
          <span className="text-sm flex-1" style={{ color: selected === i ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
            {choice.text}
          </span>
          {selected === i && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{ background: 'var(--brand)', color: '#000' }}
            >
              ✓
            </motion.span>
          )}
        </motion.button>
      ))}

      {hasOther && (
        <motion.div
          className="w-full px-5 py-4 rounded-xl"
          style={{
            background: isOtherSelected ? 'rgba(201,169,97,0.14)' : 'rgba(255,255,255,0.03)',
            border: isOtherSelected ? '1px solid rgba(201,169,97,0.45)' : '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <button
            onClick={onSelectOther}
            className="flex items-center gap-3 w-full text-left cursor-pointer"
            style={{ minHeight: '28px' }}
          >
            <span className="text-lg flex-shrink-0">✍️</span>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {otherText ? otherText : 'Aucune de ces réponses. Voici ce qui se passe vraiment :'}
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
              className="w-full mt-3 px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-primary)',
              }}
            />
          )}
        </motion.div>
      )}
    </div>
  )
}
