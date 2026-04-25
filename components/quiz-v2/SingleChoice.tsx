'use client'

import { useState } from 'react'
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
}

export function SingleChoice({ choices, hasOther, selected, otherText, onSelect, onOtherChange, onSelectOther, isOtherSelected }: Props) {
  return (
    <div className="space-y-3">
      {choices.map((choice, i) => (
        <motion.button
          key={i}
          onClick={() => onSelect(i)}
          className="w-full text-left px-5 py-4 rounded-xl flex items-start gap-3 transition-all cursor-pointer"
          style={{
            background: selected === i ? 'rgba(201,169,97,0.12)' : 'rgba(255,255,255,0.03)',
            border: selected === i ? '1px solid rgba(201,169,97,0.4)' : '1px solid rgba(255,255,255,0.06)',
          }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-lg flex-shrink-0 mt-0.5">{choice.emoji}</span>
          <span className="text-sm" style={{ color: selected === i ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
            {choice.text}
          </span>
        </motion.button>
      ))}

      {hasOther && (
        <motion.div
          className="w-full px-5 py-4 rounded-xl transition-all"
          style={{
            background: isOtherSelected ? 'rgba(201,169,97,0.12)' : 'rgba(255,255,255,0.03)',
            border: isOtherSelected ? '1px solid rgba(201,169,97,0.4)' : '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <button
            onClick={onSelectOther}
            className="flex items-start gap-3 w-full text-left cursor-pointer"
          >
            <span className="text-lg flex-shrink-0 mt-0.5">✍️</span>
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
