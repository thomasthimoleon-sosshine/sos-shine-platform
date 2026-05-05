'use client'

import { motion } from 'framer-motion'
import type { Choice } from '@/lib/quiz-v2/questions'

type Props = {
  choices: Choice[]
  hasOther?: boolean
  maxSelections?: number
  selected: number[]
  otherText: string
  onToggle: (index: number) => void
  onOtherChange: (text: string) => void
  isOtherSelected: boolean
  onToggleOther: () => void
}

export function MultiChoice({ choices, hasOther, maxSelections, selected, otherText, onToggle, onOtherChange, isOtherSelected, onToggleOther }: Props) {
  const atMax = maxSelections ? selected.length >= maxSelections : false

  return (
    <div className="space-y-3">
      {maxSelections && (
        <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
          Choisis jusqu&apos;à {maxSelections} réponses
        </p>
      )}

      {choices.map((choice, i) => {
        const isSelected = selected.includes(i)
        const isDisabled = atMax && !isSelected

        return (
          <motion.button
            key={i}
            onClick={() => !isDisabled && onToggle(i)}
            className="w-full text-left px-5 py-4 rounded-xl flex items-center gap-3 cursor-pointer"
            style={{
              background: isSelected ? 'rgba(201,169,97,0.14)' : 'rgba(255,255,255,0.03)',
              border: isSelected ? '1px solid rgba(201,169,97,0.45)' : '1px solid rgba(255,255,255,0.06)',
              opacity: isDisabled ? 0.4 : 1,
              minHeight: '56px',
            }}
            whileTap={isDisabled ? {} : { scale: 0.97, transition: { duration: 0.1 } }}
          >
            <span className="text-lg flex-shrink-0">{choice.emoji}</span>
            <span className="text-sm flex-1" style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              {choice.text}
            </span>
            {isSelected && (
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
        )
      })}

      {hasOther && (
        <motion.div
          className="w-full px-5 py-4 rounded-xl"
          style={{
            background: isOtherSelected ? 'rgba(201,169,97,0.14)' : 'rgba(255,255,255,0.03)',
            border: isOtherSelected ? '1px solid rgba(201,169,97,0.45)' : '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <button onClick={onToggleOther} className="flex items-center gap-3 w-full text-left cursor-pointer" style={{ minHeight: '28px' }}>
            <span className="text-lg flex-shrink-0">✍️</span>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Autre :</span>
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
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
            />
          )}
        </motion.div>
      )}

      {maxSelections && selected.length > 0 && (
        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          {selected.length}/{maxSelections} sélectionné{selected.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
