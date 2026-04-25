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
      {choices.map((choice, i) => {
        const isSelected = selected.includes(i)
        const isDisabled = atMax && !isSelected

        return (
          <motion.button
            key={i}
            onClick={() => !isDisabled && onToggle(i)}
            className="w-full text-left px-5 py-4 rounded-xl flex items-start gap-3 transition-all cursor-pointer"
            style={{
              background: isSelected ? 'rgba(201,169,97,0.12)' : 'rgba(255,255,255,0.03)',
              border: isSelected ? '1px solid rgba(201,169,97,0.4)' : '1px solid rgba(255,255,255,0.06)',
              opacity: isDisabled ? 0.4 : 1,
            }}
            whileTap={isDisabled ? {} : { scale: 0.98 }}
          >
            <span className="text-lg flex-shrink-0 mt-0.5">{choice.emoji}</span>
            <span className="text-sm flex-1" style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              {choice.text}
            </span>
            {isSelected && (
              <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(201,169,97,0.2)', color: 'var(--gold)' }}>
                ✓
              </span>
            )}
          </motion.button>
        )
      })}

      {hasOther && (
        <motion.div
          className="w-full px-5 py-4 rounded-xl transition-all"
          style={{
            background: isOtherSelected ? 'rgba(201,169,97,0.12)' : 'rgba(255,255,255,0.03)',
            border: isOtherSelected ? '1px solid rgba(201,169,97,0.4)' : '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <button onClick={onToggleOther} className="flex items-start gap-3 w-full text-left cursor-pointer">
            <span className="text-lg flex-shrink-0 mt-0.5">✍️</span>
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

      {maxSelections && (
        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          {selected.length}/{maxSelections} sélectionné{selected.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
