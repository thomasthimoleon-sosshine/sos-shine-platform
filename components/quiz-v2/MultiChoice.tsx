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
    <div className="space-y-2">
      {maxSelections && (
        <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
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
            className="w-full text-left px-4 py-3 rounded-2xl flex items-center gap-3 cursor-pointer"
            style={{
              background: isSelected ? 'rgba(201,169,97,0.1)' : 'rgba(255,255,255,0.035)',
              border: isSelected ? '1.5px solid rgba(201,169,97,0.45)' : '1.5px solid rgba(255,255,255,0.06)',
              opacity: isDisabled ? 0.3 : 1,
              minHeight: '52px',
            }}
            whileTap={isDisabled ? {} : { scale: 0.975, transition: { duration: 0.08 } }}
          >
            <span className="text-base flex-shrink-0 w-7 text-center">{choice.emoji}</span>
            <span className="text-sm font-sans leading-snug flex-1" style={{ color: isSelected ? 'var(--text-primary)' : 'rgba(255,255,255,0.6)' }}>
              {choice.shortText || choice.text}
            </span>
            {isSelected && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.15, ease: 'backOut' }}
                className="flex-shrink-0 w-4 h-4 rounded-md flex items-center justify-center"
                style={{ background: 'var(--brand)' }}
              >
                <span className="text-[8px] font-bold" style={{ color: '#000' }}>✓</span>
              </motion.span>
            )}
          </motion.button>
        )
      })}

      {hasOther && (
        <motion.div
          className="w-full px-4 py-3 rounded-2xl"
          style={{
            background: isOtherSelected ? 'rgba(201,169,97,0.1)' : 'rgba(255,255,255,0.035)',
            border: isOtherSelected ? '1.5px solid rgba(201,169,97,0.45)' : '1.5px solid rgba(255,255,255,0.06)',
          }}
        >
          <button onClick={onToggleOther} className="flex items-center gap-3 w-full text-left cursor-pointer" style={{ minHeight: '28px' }}>
            <span className="text-base flex-shrink-0 w-7 text-center">✍️</span>
            <span className="text-sm font-sans" style={{ color: 'rgba(255,255,255,0.5)' }}>Autre chose…</span>
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
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
            />
          )}
        </motion.div>
      )}

      {maxSelections && selected.length > 0 && (
        <p className="text-[11px] text-center pt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {selected.length}/{maxSelections} sélectionné{selected.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
