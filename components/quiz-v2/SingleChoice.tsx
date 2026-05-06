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
    <div className="space-y-2.5">
      {choices.map((choice, i) => (
        <motion.button
          key={i}
          onClick={() => handleSelect(i)}
          className="w-full text-left px-4 py-3.5 rounded-2xl flex items-center gap-3.5 cursor-pointer transition-colors"
          style={{
            background: selected === i ? 'rgba(201,169,97,0.12)' : 'rgba(255,255,255,0.04)',
            border: selected === i ? '1.5px solid rgba(201,169,97,0.5)' : '1.5px solid rgba(255,255,255,0.07)',
            minHeight: '56px',
          }}
          whileTap={{ scale: 0.97, transition: { duration: 0.08 } }}
        >
          {/* Radio indicator */}
          <span
            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
            style={{
              border: selected === i ? '2px solid var(--brand)' : '2px solid rgba(255,255,255,0.15)',
              background: selected === i ? 'var(--brand)' : 'transparent',
              transition: 'all 0.15s ease',
            }}
          >
            {selected === i && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.12 }}
                className="w-2 h-2 rounded-full"
                style={{ background: '#000' }}
              />
            )}
          </span>
          <span className="text-lg flex-shrink-0">{choice.emoji}</span>
          <span className="text-sm leading-snug" style={{ color: selected === i ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
            {choice.text}
          </span>
        </motion.button>
      ))}

      {hasOther && (
        <motion.div
          className="w-full px-4 py-3.5 rounded-2xl"
          style={{
            background: isOtherSelected ? 'rgba(201,169,97,0.12)' : 'rgba(255,255,255,0.04)',
            border: isOtherSelected ? '1.5px solid rgba(201,169,97,0.5)' : '1.5px solid rgba(255,255,255,0.07)',
          }}
        >
          <button
            onClick={onSelectOther}
            className="flex items-center gap-3.5 w-full text-left cursor-pointer"
            style={{ minHeight: '28px' }}
          >
            <span
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
              style={{
                border: isOtherSelected ? '2px solid var(--brand)' : '2px solid rgba(255,255,255,0.15)',
                background: isOtherSelected ? 'var(--brand)' : 'transparent',
              }}
            >
              {isOtherSelected && <span className="w-2 h-2 rounded-full" style={{ background: '#000' }} />}
            </span>
            <span className="text-lg flex-shrink-0">✍️</span>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {otherText ? otherText : 'Aucune de ces réponses…'}
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
              className="w-full mt-3 px-3 py-2 rounded-xl text-sm outline-none resize-none"
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
